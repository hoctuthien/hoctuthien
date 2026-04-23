import { Injectable, Logger } from '@nestjs/common';
import { PaymentRepository } from '../repositories/payment.repository';
import { PaymentEntity, PaymentType } from '../entities/payment.entity';
import { PaymentStatus } from '../../../common/enums/database.enum';
import { SystemConfigService } from '../../system-config/services/system-config.service';
import { VietqrService } from './vietqr.service';
import { ErrorCode } from '../../../common/enums/error-code.enum';

// Key lưu mức phí kích hoạt trong bảng system_config
const ACTIVATION_FEE_CONFIG_KEY = 'activation_fee';
const ACTIVATION_FEE_DEFAULT = 10_000; // VND fallback

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    private readonly paymentRepository: PaymentRepository,
    private readonly systemConfigService: SystemConfigService,
    private readonly vietqrService: VietqrService,
  ) { }

  // ─── Tra cứu ────────────────────────────────────────────────────────────────

  async findOne(id: string): Promise<PaymentEntity> {
    return this.paymentRepository.findByIdOrFail(
      id,
      'Không tìm thấy thông tin thanh toán.',
    );
  }

  // ─── Activation QR ──────────────────────────────────────────────────────────


  /**
   * Tạo mã QR VietQR để user thanh toán phí kích hoạt tài khoản Mentee.
   *
   * Flow:
   *  B1 → Tìm payment PENDING cũ. Nếu còn hạn → trả về luôn.
   *  B2 → Lấy mức phí từ SystemConfig (key: 'activation_fee').
   *  B3 → Sinh transactionCode ngẫu nhiên duy nhất.
   *  B4 → Sinh URL QR qua VietqrService.
   *  B5 → Lưu PaymentEntity mới vào DB.
   *  B6 → Trả về thông tin cần thiết cho FE.
   */
  async generateActivationQr(userId: string): Promise<{
    paymentId: string;
    amount: number;
    transactionCode: string;
    qrUrl: string;
    expiredAt: Date;
  }> {
    // ── B1: Kiểm tra payment PENDING cũ ──────────────────────────────────────
    const existing = await this.paymentRepository.findPendingActivation(userId);
    if (existing) {
      const isStillValid = existing.expiredAt && existing.expiredAt > new Date();

      if (isStillValid) {
        // Còn hạn → trả về luôn, không tạo mới
        this.logger.log(`User ${userId} đã có QR kích hoạt chưa hết hạn.`);
        return {
          paymentId: existing.id,
          amount: Number(existing.amount),
          transactionCode: existing.vietqrPayload?.transactionCode ?? '',
          qrUrl: existing.vietqrQrDataUrl ?? '',
          expiredAt: existing.expiredAt,
        };
      } else {
        // Quá hạn → tự động chuyển trạng thái sang EXPIRED (Lazy Expiry)
        this.logger.log(
          `Payment ${existing.id} của user ${userId} đã hết hạn. Chuyển sang EXPIRED.`,
        );
        await this.paymentRepository.expirePayment(existing.id);
      }
    }

    // ── B2: Lấy mức phí từ SystemConfig ──────────────────────────────────────
    let amount = ACTIVATION_FEE_DEFAULT;
    try {
      const config = await this.systemConfigService.findByKey(ACTIVATION_FEE_CONFIG_KEY);
      if (config && typeof config.configValue === 'number') {
        amount = config.configValue;
      }
    } catch {
      this.logger.warn(
        `Không tìm thấy config key '${ACTIVATION_FEE_CONFIG_KEY}'. Dùng fallback: ${ACTIVATION_FEE_DEFAULT} VND.`,
      );
    }

    // ── B3: Sinh transactionCode ngẫu nhiên ──────────────────────────────────
    const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
    const transactionCode = `KICHHOAT ${userId}${randomStr}`;

    // ── B4: Sinh QR URL ───────────────────────────────────────────────────────
    const qrUrl = this.vietqrService.generateQrUrl(amount, transactionCode);

    // ── B5: Tính thời điểm hết hạn và lưu DB ─────────────────────────────────
    const expiredAt = new Date();
    expiredAt.setMinutes(expiredAt.getMinutes() + 15); // QR hết hạn sau 15 phút

    const payment = await this.paymentRepository.createAndSave({
      userId,
      amount,
      currency: 'VND',
      paymentMethod: PaymentType.ACTIVATION,
      status: PaymentStatus.PENDING,
      description: transactionCode,
      expiredAt,
      vietqrQrDataUrl: qrUrl,
      vietqrPayload: { transactionCode, qrUrl, generatedAt: new Date().toISOString() },
    } as Partial<PaymentEntity>);

    this.logger.log(`Tạo QR kích hoạt thành công cho user ${userId}: ${transactionCode}`);

    // ── B6: Trả về response ───────────────────────────────────────────────────
    return {
      paymentId: payment.id,
      amount: Number(payment.amount),
      transactionCode,
      qrUrl,
      expiredAt,
    };
  }

  // ─── Webhook ─────────────────────────────────────────────────────────────────

  // TODO (Chặng 4): handleWebhook(dto: VietQrWebhookDto)
  //  1. Xác thực signature qua VietqrService.verifyWebhookSignature()
  //  2. Tìm payment theo description (transactionCode)
  //  3. Kiểm tra amount khớp
  //  4. Gọi updatePayment() → PaymentStatus.SUCCESS
  //  5. Cập nhật trạng thái user → 'active'
}

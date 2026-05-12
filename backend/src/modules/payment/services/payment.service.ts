import {
  ForbiddenException,
  Injectable,
  Logger,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PaymentRepository } from '../repositories/payment.repository';
import { PaymentEntity, PaymentType } from '../entities/payment.entity';
import { PaymentStatus } from '../../../common/enums/database.enum';
import { SystemConfigService } from '../../system-config/services/system-config.service';
import { VietqrService } from './vietqr.service';
import { ErrorCode, ErrorMessage } from '../../../common/enums/error-code.enum';

const ACTIVATION_FEE_CONFIG_KEY = 'activation_fee';
const ACTIVATION_FEE_DEFAULT = 10_000;

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    private readonly paymentRepository: PaymentRepository,
    private readonly systemConfigService: SystemConfigService,
    private readonly vietqrService: VietqrService,
  ) { }

  async findOne(id: string): Promise<PaymentEntity> {
    return this.paymentRepository.findByIdOrFail(
      id,
      ErrorMessage[ErrorCode.PAYMENT_NOT_FOUND],
    );
  }

  // Tạo QR VietQR để mentee thanh toán phí kích hoạt tài khoản (hết hạn sau 15 phút)
  async generateActivationQr(userId: string): Promise<{
    paymentId: string;
    amount: number;
    transactionCode: string;
    qrUrl: string;
    expiredAt: Date;
  }> {
    const existing = await this.paymentRepository.findPendingActivation(userId);
    if (existing) {
      const isStillValid =
        existing.expiredAt && existing.expiredAt > new Date();

      if (isStillValid) {
        this.logger.log(`User ${userId} đã có QR kích hoạt chưa hết hạn.`);
        return {
          paymentId: existing.id,
          amount: Number(existing.amount),
          transactionCode: existing.vietqrPayload?.transactionCode ?? '',
          qrUrl: existing.vietqrQrDataUrl ?? '',
          expiredAt: existing.expiredAt,
        };
      }

      // Lazy Expiry: payment PENDING quá hạn → tự động chuyển EXPIRED
      this.logger.log(
        `Payment ${existing.id} đã hết hạn. Chuyển sang EXPIRED.`,
      );
      await this.paymentRepository.expirePayment(existing.id);
    }

    let amount = ACTIVATION_FEE_DEFAULT;
    try {
      const config = await this.systemConfigService.findByKey(
        ACTIVATION_FEE_CONFIG_KEY,
      );
      if (config && typeof config.configValue === 'number') {
        amount = config.configValue;
      }
    } catch {
      this.logger.warn(
        `Không tìm thấy config '${ACTIVATION_FEE_CONFIG_KEY}'. Dùng fallback: ${ACTIVATION_FEE_DEFAULT} VND.`,
      );
    }

    const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
    const transactionCode = `KICHHOAT ${userId}${randomStr}`;
    const qrUrl = this.vietqrService.generateQrUrl(amount, transactionCode);

    const expiredAt = new Date();
    expiredAt.setMinutes(expiredAt.getMinutes() + 15);

    const payment = await this.paymentRepository.createAndSave({
      userId,
      amount,
      currency: 'VND',
      paymentMethod: PaymentType.ACTIVATION,
      status: PaymentStatus.PENDING,
      description: transactionCode,
      expiredAt,
      vietqrQrDataUrl: qrUrl,
      vietqrPayload: {
        transactionCode,
        qrUrl,
        generatedAt: new Date().toISOString(),
      },
    } as Partial<PaymentEntity>);

    this.logger.log(
      `Tạo QR kích hoạt thành công cho user ${userId}: ${transactionCode}`,
    );

    return {
      paymentId: payment.id,
      amount: Number(payment.amount),
      transactionCode,
      qrUrl,
      expiredAt,
    };
  }

  /**
   * User bấm "Kiểm tra trạng thái thanh toán".
   *
   * Hàm này KHÔNG còn gọi TN App API trực tiếp nữa.
   * Cron job (PaymentVerificationService.scanAndReconcile) đã xử lý ngầm và cập nhật DB.
   * Hàm này chỉ đơn thuần đọc trạng thái từ DB và phản hồi cho frontend.
   */
  async verifyActivationPayment(
    userId: string,
    paymentId: string,
  ): Promise<{ activated: boolean; message: string }> {
    const payment = await this.paymentRepository.findByIdOrFail(
      paymentId,
      ErrorMessage[ErrorCode.PAYMENT_NOT_FOUND],
    );

    if (payment.userId !== userId) {
      throw new ForbiddenException(ErrorMessage[ErrorCode.PAYMENT_FORBIDDEN]);
    }

    // Trường hợp 1: Cron đã xác nhận thành công → báo ngay cho frontend
    if (payment.status === PaymentStatus.SUCCESS) {
      this.logger.log(
        `[Poll] Payment ${paymentId} đã SUCCESS. Phản hồi cho user ${userId}.`,
      );
      return {
        activated: true,
        message: ErrorMessage[ErrorCode.PAYMENT_VERIFY_SUCCESS],
      };
    }

    // Trường hợp 2: QR đã hết hạn → yêu cầu tạo mới
    if (!payment.expiredAt || payment.expiredAt <= new Date()) {
      throw new UnprocessableEntityException(
        ErrorMessage[ErrorCode.PAYMENT_QR_EXPIRED],
      );
    }

    // Trường hợp 3: Vẫn đang trong hạn, chưa có giao dịch khớp → báo đang chờ
    // Frontend có thể polling lại sau vài giây (cron chạy mỗi 1 phút)
    return {
      activated: false,
      message: ErrorMessage[ErrorCode.PAYMENT_VERIFY_NOT_FOUND],
    };
  }
}

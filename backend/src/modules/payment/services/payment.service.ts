import {
  ForbiddenException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  ServiceUnavailableException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import type { Redis } from 'ioredis';
import { DataSource } from 'typeorm';
import { REDIS_CLIENT } from '../../redis/redis.module';
import { PaymentRepository } from '../repositories/payment.repository';
import { PaymentEntity, PaymentType } from '../entities/payment.entity';
import { PaymentStatus } from '../../../common/enums/database.enum';
import { SystemConfigService } from '../../system-config/services/system-config.service';
import { VietqrService } from './vietqr.service';
import { TnAppService } from './tn-app.service';
import { ErrorCode, ErrorMessage } from '../../../common/enums/error-code.enum';
import { PAYMENT_LOCK_PREFIX } from './payment-verification.service';
import {
  PAYMENT_SUCCESS_EVENT,
  PaymentSuccessPayload,
} from '../events/payment.events';

const ACTIVATION_FEE_CONFIG_KEY = 'activation_fee';
const ACTIVATION_FEE_DEFAULT = 5_000;

// Lock TTL: 20 giây — đồng bộ với PaymentVerificationService
const LOCK_TTL_MS = 20_000;

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    private readonly paymentRepository: PaymentRepository,
    private readonly systemConfigService: SystemConfigService,
    private readonly vietqrService: VietqrService,
    private readonly tnAppService: TnAppService,
    private readonly dataSource: DataSource,
    private readonly eventEmitter: EventEmitter2,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
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

    let transactionCode = '';
    let isUnique = false;
    while (!isUnique) {
      const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
      transactionCode = `KICHHOAT HTT${randomStr}`;
      const exists = await this.paymentRepository.exists({
        description: transactionCode,
        status: PaymentStatus.PENDING,
      });
      if (!exists) {
        isUnique = true;
      }
    }
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
   * User bấm "Tôi đã chuyển khoản" → Active-Fetch với Redis Lock.
   *
   * Flow:
   * 1. Check idempotency (đã SUCCESS → return true)
   * 2. Check expiry (hết hạn → throw 422)
   * 3. Acquire Redis Lock cho paymentId
   *    - Lock acquired → gọi TN App → update DB → emit event
   *    - Lock NOT acquired (cron đang xử lý) → đọc DB status → return
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

    const transactionCode = payment.vietqrPayload?.transactionCode as
      | string
      | undefined;
    if (!transactionCode) {
      throw new InternalServerErrorException(
        ErrorMessage[ErrorCode.PAYMENT_INVALID_TRANSACTION_CODE],
      );
    }

    // ── Acquire Redis Distributed Lock ──
    const lockKey = `${PAYMENT_LOCK_PREFIX}${paymentId}`;
    const lockAcquired = await this.redis.set(
      lockKey,
      'api',
      'PX',
      LOCK_TTL_MS,
      'NX',
    );

    if (!lockAcquired) {
      // Lock bị chiếm (Cron đang xử lý) → đọc lại DB xem cron đã update chưa
      this.logger.debug(
        `[Verify] Lock bị chiếm cho payment ${paymentId}. Đọc DB status.`,
      );
      const freshPayment = await this.paymentRepository.findByIdOrFail(
        paymentId,
        ErrorMessage[ErrorCode.PAYMENT_NOT_FOUND],
      );
      if (freshPayment.status === PaymentStatus.SUCCESS) {
        return {
          activated: true,
          message: ErrorMessage[ErrorCode.PAYMENT_VERIFY_SUCCESS],
        };
      }
      return {
        activated: false,
        message:
          'Hệ thống đang xử lý giao dịch của bạn. Vui lòng thử lại sau vài giây.',
      };
    }

    // ── Lock acquired — gọi TN App trực tiếp ──
    try {
      // Double-check sau khi có lock (phòng trường hợp cron vừa xử lý xong trước khi ta lấy lock)
      const freshPayment = await this.paymentRepository.findByIdOrFail(
        paymentId,
        ErrorMessage[ErrorCode.PAYMENT_NOT_FOUND],
      );
      if (freshPayment.status === PaymentStatus.SUCCESS) {
        return {
          activated: true,
          message: 'Tài khoản đã được kích hoạt trước đó.',
        };
      }

      const result = await this.tnAppService.findTransactionByCode(
        transactionCode,
        payment.createdAt,
        Number(payment.amount),
      );

      if (result.error) {
        this.logger.error(
          `TN App API lỗi cho payment ${paymentId}: ${result.error}`,
        );
        throw new ServiceUnavailableException(
          ErrorMessage[ErrorCode.PAYMENT_VERIFY_SERVICE_UNAVAILABLE],
        );
      }

      if (!result.found || !result.transaction) {
        return {
          activated: false,
          message: ErrorMessage[ErrorCode.PAYMENT_VERIFY_NOT_FOUND],
        };
      }

      // Cập nhật payment thành SUCCESS trong DB transaction
      const tx = result.transaction;
      await this.dataSource.transaction(async (manager) => {
        await manager.update(
          PaymentEntity,
          { id: paymentId },
          {
            status: PaymentStatus.SUCCESS,
            transactionId: tx.id,
            paidAt: new Date(tx.transactionTime + '+07:00'),
            vietqrPayload: {
              ...payment.vietqrPayload,
              ...(result.rawResponse
                ? { rawResponse: result.rawResponse }
                : {}),
            } as Record<string, any>,
          },
        );
      });

      this.logger.log(
        `[Verify] Payment ${paymentId} SUCCESS. User ${userId} đang được kích hoạt qua event.`,
      );

      // Emit event — UserModule listener sẽ kích hoạt user
      this.eventEmitter.emit(PAYMENT_SUCCESS_EVENT, {
        paymentId,
        transactionId: tx.id,
        userId,
      } satisfies PaymentSuccessPayload);

      return {
        activated: true,
        message: ErrorMessage[ErrorCode.PAYMENT_VERIFY_SUCCESS],
      };
    } finally {
      // ── Luôn release lock dù thành công hay thất bại ──
      await this.redis.del(lockKey).catch(() => { });
    }
  }
}

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
import { PaymentStrategyRegistry } from './payment-strategy.registry';
import { MailService } from '../../mail/services/mail.service';

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
    private readonly paymentStrategyRegistry: PaymentStrategyRegistry,
    private readonly mailService: MailService,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
  ) {}

  async findOne(id: string): Promise<PaymentEntity> {
    return this.paymentRepository.findByIdOrFail(
      id,
      ErrorMessage[ErrorCode.PAYMENT_NOT_FOUND],
    );
  }

  // Luồng tạo QR thanh toán chung (Strategy Pattern)
  async generateGenericQr(
    userId: string,
    paymentType: string,
    referenceId: string,
    customAmount?: number,
  ): Promise<{
    paymentId: string;
    amount: number;
    transactionCode: string;
    qrUrl: string;
    expiredAt: Date;
  }> {
    const strategy = this.paymentStrategyRegistry.get(paymentType);
    const amount = await strategy.resolveAmount(referenceId, customAmount);
    const descriptionPrefix = strategy.resolveDescriptionPrefix(referenceId);

    // Tìm kiếm xem đã có QR PENDING nào cho nghiệp vụ này chưa
    const existing = await this.paymentRepository.findOne({
      userId,
      paymentMethod: paymentType,
      status: PaymentStatus.PENDING,
    });

    if (existing) {
      const isStillValid =
        existing.expiredAt && existing.expiredAt > new Date();
      if (isStillValid) {
        const matchesDescription =
          existing.description?.startsWith(descriptionPrefix);
        if (matchesDescription) {
          this.logger.log(
            `User ${userId} đã có hóa đơn PENDING cho ${paymentType} còn hạn.`,
          );
          return {
            paymentId: existing.id,
            amount: Number(existing.amount),
            transactionCode: existing.vietqrPayload?.transactionCode ?? '',
            qrUrl: existing.vietqrQrDataUrl ?? '',
            expiredAt: existing.expiredAt,
          };
        }
      }
      this.logger.log(
        `Hóa đơn PENDING ${existing.id} đã hết hạn. Chuyển sang EXPIRED.`,
      );
      await this.paymentRepository.expirePayment(existing.id);
    }

    let transactionCode = '';
    let isUnique = false;
    while (!isUnique) {
      const randomStr = Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase();
      transactionCode = `${descriptionPrefix} HTT${randomStr}`;
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
      paymentMethod: paymentType,
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

    // Liên kết thực thể nghiệp vụ thông qua Strategy
    await strategy.onGenerate(payment, referenceId);

    this.logger.log(
      `Tạo QR ${paymentType} thành công cho user ${userId}: ${transactionCode}`,
    );

    // Gửi email báo cáo mã giao dịch (VietQR) cho Ban quản trị
    const adminEmail = this.mailService.getAdminEmail();
    void this.mailService
      .sendPaymentTransactionEmail({
        to: adminEmail,
        paymentType,
        amount,
        transactionCode,
        qrUrl,
      })
      .catch((err) => {
        this.logger.error(
          `Failed to send transaction email to admin: ${err?.message || err}`,
        );
      });

    return {
      paymentId: payment.id,
      amount: Number(payment.amount),
      transactionCode,
      qrUrl,
      expiredAt,
    };
  }

  // Wrapper tương thích ngược cho việc kích hoạt tài khoản
  async generateActivationQr(userId: string): Promise<{
    paymentId: string;
    amount: number;
    transactionCode: string;
    qrUrl: string;
    expiredAt: Date;
  }> {
    return this.generateGenericQr(userId, PaymentType.ACTIVATION, userId);
  }

  // Luồng xác nhận thanh toán chung (Strategy Pattern)
  async verifyPayment(
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

    if (payment.status === PaymentStatus.SUCCESS) {
      this.logger.log(
        `[Poll] Payment ${paymentId} đã SUCCESS. Phản hồi cho user ${userId}.`,
      );
      return {
        activated: true,
        message: ErrorMessage[ErrorCode.PAYMENT_VERIFY_SUCCESS],
      };
    }

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

    const lockKey = `${PAYMENT_LOCK_PREFIX}${paymentId}`;
    const lockAcquired = await this.redis.set(
      lockKey,
      'api',
      'PX',
      LOCK_TTL_MS,
      'NX',
    );

    if (!lockAcquired) {
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

    try {
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
        `[Verify] Payment ${paymentId} SUCCESS. Kích hoạt nghiệp vụ thông qua Strategy.`,
      );

      // Kích hoạt nghiệp vụ cụ thể qua Strategy
      const strategy = this.paymentStrategyRegistry.get(
        payment.paymentMethod || PaymentType.ACTIVATION,
      );
      await strategy.onSuccess(payment);

      // Emit event để tương thích ngược với các listener hiện tại
      this.eventEmitter.emit(PAYMENT_SUCCESS_EVENT, {
        paymentId,
        transactionId: tx.id,
        userId,
        paymentMethod: payment.paymentMethod || PaymentType.ACTIVATION,
      } satisfies PaymentSuccessPayload);

      return {
        activated: true,
        message: ErrorMessage[ErrorCode.PAYMENT_VERIFY_SUCCESS],
      };
    } finally {
      await this.redis.del(lockKey).catch(() => {});
    }
  }

  // Wrapper tương thích ngược cho việc kích hoạt tài khoản
  async verifyActivationPayment(
    userId: string,
    paymentId: string,
  ): Promise<{ activated: boolean; message: string }> {
    return this.verifyPayment(userId, paymentId);
  }
}

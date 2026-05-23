import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { DataSource } from 'typeorm';
import { UserEntity } from '../../user/entities/user.entity';
import {
  PAYMENT_SUCCESS_EVENT,
  PaymentSuccessPayload,
} from '../events/payment.events';

/**
 * Listener decoupled — nằm trong PaymentModule nhưng xử lý nghiệp vụ liên quan đến User.
 *
 * Khi payment được xác nhận SUCCESS (bởi API hoặc Cron), listener này:
 * 1. Kích hoạt tài khoản user (isVerified = true)
 *
 * Mở rộng sau này: gửi notification, email, push... chỉ cần thêm listener mới.
 */
@Injectable()
export class PaymentSuccessListener {
  private readonly logger = new Logger(PaymentSuccessListener.name);

  constructor(private readonly dataSource: DataSource) {}

  @OnEvent(PAYMENT_SUCCESS_EVENT)
  async handlePaymentSuccess(payload: PaymentSuccessPayload): Promise<void> {
    const { paymentId, userId, transactionId } = payload;

    try {
      await this.dataSource
        .createQueryBuilder()
        .update(UserEntity)
        .set({ isVerified: true })
        .where('id = :id', { id: userId })
        .execute();

      this.logger.log(
        `[Event] User ${userId} đã được kích hoạt. Payment: ${paymentId}, Tx: ${transactionId}`,
      );
    } catch (error) {
      // Log lỗi nhưng KHÔNG throw — event listener không được crash caller
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `[Event] Lỗi khi kích hoạt user ${userId}: ${message}`,
        error instanceof Error ? error.stack : undefined,
      );
    }
  }
}

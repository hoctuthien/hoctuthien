import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DataSource } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import type { Redis } from 'ioredis';
import { REDIS_CLIENT } from '../../redis/redis.module';
import { TnAppService, TNTransaction } from './tn-app.service';
import { PaymentRepository } from '../repositories/payment.repository';
import { PaymentEntity } from '../entities/payment.entity';
import { PaymentStatus } from '../../../common/enums/database.enum';
import { parseVNTime } from '../payment.utils';
import {
  PAYMENT_SUCCESS_EVENT,
  PaymentSuccessPayload,
} from '../events/payment.events';

// Key lưu trong Redis: timestamp (ISO string) của lần sync cuối cùng với TN App
const REDIS_LAST_SYNC_KEY = 'tn_last_sync_time';

// Nếu Redis chưa có giá trị, lùi về quá khứ 30 phút để không bỏ sót giao dịch
const FALLBACK_LOOKBACK_MINUTES = 30;

@Injectable()
export class PaymentVerificationService {
  private readonly logger = new Logger(PaymentVerificationService.name);

  constructor(
    private readonly tnAppService: TnAppService,
    private readonly paymentRepository: PaymentRepository,
    private readonly dataSource: DataSource,
    private readonly eventEmitter: EventEmitter2,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
  ) {}

  // ─── Cron Entry Point ──────────────────────────────────────────────────────

  @Cron(CronExpression.EVERY_MINUTE)
  async scanAndReconcile(): Promise<void> {
    this.logger.debug('[Cron] scanAndReconcile bắt đầu...');

    // Bước 1: Expire stale payments — dọn rác trước khi xử lý để tránh đối soát nhầm
    const expiredCount = await this.paymentRepository.expireStaleActivations();
    if (expiredCount > 0) {
      this.logger.log(`[Cron] Đã expire ${expiredCount} payment quá hạn.`);
    }

    // Bước 2: Xác định khoảng thời gian cần fetch từ TN App
    const { fromDate, toDate } = await this.resolveSyncWindow();

    // Bước 3: Fetch toàn bộ giao dịch CREDIT trong khoảng thời gian đó
    const transactions = await this.tnAppService.fetchLatestBatch(fromDate, toDate);
    if (!transactions.length) {
      this.logger.debug('[Cron] Không có giao dịch CREDIT mới. Kết thúc.');
      return;
    }

    // Bước 4: Cập nhật Redis với timestamp của giao dịch mới nhất (để lần sau fetch tiếp)
    await this.updateLastSyncTime(transactions);

    // Bước 5: Query DB lấy tất cả payment đang chờ xác nhận
    const pendingPayments = await this.paymentRepository.findAllPendingActive();
    if (!pendingPayments.length) {
      this.logger.debug('[Cron] Không có payment PENDING. Kết thúc.');
      return;
    }

    this.logger.log(
      `[Cron] Đối soát ${transactions.length} tx với ${pendingPayments.length} payment PENDING...`,
    );

    // Bước 6: Đối soát trong RAM — không cần round-trip DB thêm
    for (const payment of pendingPayments) {
      const transactionCode = payment.vietqrPayload?.transactionCode as string | undefined;
      if (!transactionCode) continue;

      const matchedTx = transactions.find(
        (tx) =>
          tx.narrative.toUpperCase().includes(transactionCode.toUpperCase()) &&
          tx.transactionAmount >= Number(payment.amount),
      );

      if (!matchedTx) continue;

      const success = await this.verifyAndProcessMatchedPayment(payment, matchedTx);
      if (success) {
        this.logger.log(
          `[Cron] Payment ${payment.id} → PAID | Tx: ${matchedTx.id} | User: ${payment.userId}`,
        );
      }
    }
  }

  // ─── Core: Xử lý 1 payment khớp với 1 giao dịch ──────────────────────────

  /**
   * Cập nhật trạng thái payment thành PAID và emit event để nghiệp vụ upstream xử lý.
   *
   * Hàm được tách riêng để có thể test độc lập và gọi thủ công nếu cần.
   *
   * @returns true nếu cập nhật thành công, false nếu giao dịch đã được xử lý trước đó.
   */
  public async verifyAndProcessMatchedPayment(
    payment: PaymentEntity,
    tx: TNTransaction,
  ): Promise<boolean> {
    try {
      await this.dataSource
        .createQueryBuilder()
        .update(PaymentEntity)
        .set({
          status: PaymentStatus.SUCCESS,
          transactionId: tx.id,
          paidAt: parseVNTime(tx.transactionTime),
          // Lưu toàn bộ raw tx vào vietqrPayload để audit sau này
          vietqrPayload: () =>
            `vietqr_payload || '${JSON.stringify({ tnTransaction: tx })}'::jsonb`,
        })
        .where('id = :id', { id: payment.id })
        .execute();
    } catch (error: unknown) {
      // ── Bắt lỗi Unique Constraint vi phạm ──
      // PostgreSQL: error code 23505 (unique_violation)
      // MySQL/MariaDB: error code ER_DUP_ENTRY
      //
      // Điều này xảy ra khi cron chạy song song hoặc race condition:
      // 2 worker cùng match 1 tx.id rồi cùng INSERT → worker thứ 2 bị reject.
      // Đây là hành vi ĐÚNG — transaction đã được xử lý bởi worker đầu tiên.
      const pgCode = (error as { code?: string })?.code;
      const mysqlCode = (error as { code?: string })?.code;

      if (pgCode === '23505' || mysqlCode === 'ER_DUP_ENTRY') {
        this.logger.warn(
          `[Verify] tx.id="${tx.id}" đã tồn tại trong DB (duplicate). Bỏ qua.`,
        );
        return false;
      }

      // Lỗi không mong đợi — log đầy đủ để điều tra, không crash cron
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `[Verify] Lỗi khi update payment ${payment.id}: ${message}`,
        error instanceof Error ? error.stack : undefined,
      );
      return false;
    }

    // Emit event decoupled — UserModule / CourseModule lắng nghe và xử lý nghiệp vụ riêng
    // PaymentVerificationService KHÔNG biết gì về UserEntity hay CourseBookingEntity
    this.eventEmitter.emit(PAYMENT_SUCCESS_EVENT, {
      paymentId: payment.id,
      transactionId: tx.id,
      userId: payment.userId,
    } satisfies PaymentSuccessPayload);

    return true;
  }

  // ─── Private Helpers ──────────────────────────────────────────────────────

  /**
   * Đọc last sync time từ Redis.
   * Nếu chưa có → lùi về FALLBACK_LOOKBACK_MINUTES trước để không bỏ sót giao dịch
   * ngay sau lần khởi động đầu tiên.
   */
  private async resolveSyncWindow(): Promise<{ fromDate: Date; toDate: Date }> {
    const toDate = new Date();
    let fromDate: Date;

    const lastSyncRaw = await this.redis.get(REDIS_LAST_SYNC_KEY);
    if (lastSyncRaw) {
      fromDate = new Date(lastSyncRaw);
      this.logger.debug(`[Cron] fromDate từ Redis: ${fromDate.toISOString()}`);
    } else {
      fromDate = new Date(toDate.getTime() - FALLBACK_LOOKBACK_MINUTES * 60 * 1000);
      this.logger.warn(
        `[Cron] Không có last sync time. Fallback lùi ${FALLBACK_LOOKBACK_MINUTES} phút: ${fromDate.toISOString()}`,
      );
    }

    return { fromDate, toDate };
  }

  /**
   * Tìm timestamp lớn nhất trong batch vừa fetch và lưu vào Redis.
   * Cron lần sau sẽ dùng giá trị này làm fromDate để tránh re-scan lại giao dịch cũ.
   */
  private async updateLastSyncTime(transactions: TNTransaction[]): Promise<void> {
    let maxTime: Date | null = null;

    for (const tx of transactions) {
      const txTime = parseVNTime(tx.transactionTime);
      if (!maxTime || txTime > maxTime) {
        maxTime = txTime;
      }
    }

    if (maxTime) {
      await this.redis.set(REDIS_LAST_SYNC_KEY, maxTime.toISOString());
      this.logger.debug(`[Cron] Cập nhật last sync time → ${maxTime.toISOString()}`);
    }
  }
}

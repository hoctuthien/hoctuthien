/**
 * Unit Tests — PaymentSuccessListener (Kênh 3 — Event Listener)
 *
 * Tổng số test case: 10
 *
 * Nhóm test:
 *  A. Happy path — kích hoạt user (TC-201 → TC-204)
 *  B. Error handling — DB lỗi (TC-205 → TC-208)
 *  C. Payload integrity (TC-209 → TC-210)
 */

import { PaymentSuccessListener } from '../../src/modules/payment/listeners/payment-success.listener';
import { DataSource } from 'typeorm';
import { UserEntity } from '../../src/modules/user/entities/user.entity';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PAYMENT_ID = 'payment-event-001';
const USER_ID = 'user-event-001';
const TX_ID = 'tn-tx-event-001';

function makePayload(overrides = {}) {
  return {
    paymentId: PAYMENT_ID,
    userId: USER_ID,
    transactionId: TX_ID,
    ...overrides,
  };
}

// ─── Mock QueryBuilder ────────────────────────────────────────────────────────

function makeQb(opts: { rejectWith?: unknown } = {}) {
  const qb = {
    update: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    execute: opts.rejectWith
      ? jest.fn().mockRejectedValue(opts.rejectWith)
      : jest.fn().mockResolvedValue({ affected: 1 }),
  };
  return qb;
}

// ─── Test Suite ───────────────────────────────────────────────────────────────

describe('PaymentSuccessListener', () => {
  let listener: PaymentSuccessListener;
  let dataSource: { createQueryBuilder: jest.Mock };

  beforeEach(() => {
    dataSource = {
      createQueryBuilder: jest.fn(),
    };

    listener = new PaymentSuccessListener(dataSource as unknown as DataSource);
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // A. Happy Path
  // ═══════════════════════════════════════════════════════════════════════════

  describe('A. Happy Path — Kích hoạt user', () => {
    /**
     * TC-201: Nhận đúng event → update isVerified = true
     */
    it('TC-201: nên update user.isVerified = true khi nhận payment.success event', async () => {
      const qb = makeQb();
      dataSource.createQueryBuilder.mockReturnValue(qb);

      await listener.handlePaymentSuccess(makePayload());

      expect(qb.set).toHaveBeenCalledWith({ isVerified: true });
      expect(qb.execute).toHaveBeenCalledTimes(1);
    });

    /**
     * TC-202: Update đúng userId trong WHERE clause
     */
    it('TC-202: nên update đúng userId trong WHERE clause', async () => {
      const qb = makeQb();
      dataSource.createQueryBuilder.mockReturnValue(qb);

      await listener.handlePaymentSuccess(makePayload());

      expect(qb.where).toHaveBeenCalledWith('id = :id', { id: USER_ID });
    });

    /**
     * TC-203: Update đúng entity (UserEntity)
     */
    it('TC-203: nên gọi update trên UserEntity', async () => {
      const qb = makeQb();
      dataSource.createQueryBuilder.mockReturnValue(qb);

      await listener.handlePaymentSuccess(makePayload());

      expect(qb.update).toHaveBeenCalledWith(UserEntity);
    });

    /**
     * TC-204: Hàm resolve (không throw) khi thành công
     */
    it('TC-204: nên resolve thành công khi DB update OK', async () => {
      const qb = makeQb();
      dataSource.createQueryBuilder.mockReturnValue(qb);

      await expect(
        listener.handlePaymentSuccess(makePayload()),
      ).resolves.not.toThrow();
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // B. Error Handling — DB lỗi
  // ═══════════════════════════════════════════════════════════════════════════

  describe('B. Error Handling — DB lỗi', () => {
    /**
     * TC-205: DB lỗi → listener KHÔNG ném exception (không crash caller)
     */
    it('TC-205: không được throw exception khi DB lỗi (tránh crash caller/emitter)', async () => {
      const qb = makeQb({ rejectWith: new Error('DB connection lost') });
      dataSource.createQueryBuilder.mockReturnValue(qb);

      await expect(
        listener.handlePaymentSuccess(makePayload()),
      ).resolves.not.toThrow();
    });

    /**
     * TC-206: DB lỗi type violation → vẫn không throw
     */
    it('TC-206: không được throw khi DB báo type violation', async () => {
      const qb = makeQb({
        rejectWith: Object.assign(new Error('invalid input'), { code: '22P02' }),
      });
      dataSource.createQueryBuilder.mockReturnValue(qb);

      await expect(
        listener.handlePaymentSuccess(makePayload()),
      ).resolves.not.toThrow();
    });

    /**
     * TC-207: createQueryBuilder throw → vẫn không crash
     */
    it('TC-207: không được throw khi createQueryBuilder ném exception', async () => {
      dataSource.createQueryBuilder.mockImplementation(() => {
        throw new Error('DataSource not initialized');
      });

      await expect(
        listener.handlePaymentSuccess(makePayload()),
      ).resolves.not.toThrow();
    });

    /**
     * TC-208: DB timeout → không crash
     */
    it('TC-208: không được throw khi DB query timeout', async () => {
      const qb = makeQb({ rejectWith: new Error('Query timeout after 30000ms') });
      dataSource.createQueryBuilder.mockReturnValue(qb);

      await expect(
        listener.handlePaymentSuccess(makePayload()),
      ).resolves.not.toThrow();
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // C. Payload Integrity
  // ═══════════════════════════════════════════════════════════════════════════

  describe('C. Payload Integrity', () => {
    /**
     * TC-209: Nhiều event cùng lúc → gọi execute đúng số lần
     */
    it('TC-209: nên xử lý đúng khi được gọi nhiều lần với payload khác nhau', async () => {
      const qb = makeQb();
      dataSource.createQueryBuilder.mockReturnValue(qb);

      await Promise.all([
        listener.handlePaymentSuccess(makePayload({ userId: 'user-A' })),
        listener.handlePaymentSuccess(makePayload({ userId: 'user-B' })),
        listener.handlePaymentSuccess(makePayload({ userId: 'user-C' })),
      ]);

      expect(qb.execute).toHaveBeenCalledTimes(3);
    });

    /**
     * TC-210: transactionId trong payload không ảnh hưởng đến WHERE clause (chỉ dùng userId)
     */
    it('TC-210: chỉ nên dùng userId để identify user khi update, không dùng transactionId', async () => {
      const qb = makeQb();
      dataSource.createQueryBuilder.mockReturnValue(qb);

      await listener.handlePaymentSuccess(
        makePayload({ transactionId: 'completely-different-tx-id' }),
      );

      // WHERE chỉ dùng userId
      expect(qb.where).toHaveBeenCalledWith('id = :id', { id: USER_ID });
      // set chỉ thay đổi isVerified
      expect(qb.set).toHaveBeenCalledWith({ isVerified: true });
    });
  });
});

/**
 * Unit Tests — PaymentVerificationService (Kênh 2 — Cron Job)
 *
 * Tổng số test case: 30
 *
 * Nhóm test:
 *  A. scanAndReconcile — Expire stale payments (TC-101 → TC-102)
 *  B. scanAndReconcile — Resolve sync window (TC-103 → TC-107)
 *  C. scanAndReconcile — TN App batch fetch (TC-108 → TC-110)
 *  D. scanAndReconcile — Matching logic trong RAM (TC-111 → TC-116)
 *  E. verifyAndProcessMatchedPayment — Redis Lock (TC-117 → TC-120)
 *  F. verifyAndProcessMatchedPayment — DB Update & Event (TC-121 → TC-124)
 *  G. verifyAndProcessMatchedPayment — PG 23505 duplicate (TC-125 → TC-127)
 *  H. updateLastSyncTime (TC-128 → TC-130)
 */

import { EventEmitter2 } from '@nestjs/event-emitter';
import { DataSource } from 'typeorm';
import { PaymentVerificationService, PAYMENT_LOCK_PREFIX } from '../../src/modules/payment/services/payment-verification.service';
import { TnAppService, TNTransaction } from '../../src/modules/payment/services/tn-app.service';
import { PaymentRepository } from '../../src/modules/payment/repositories/payment.repository';
import { PaymentEntity, PaymentType } from '../../src/modules/payment/entities/payment.entity';
import { PaymentStatus } from '../../src/common/enums/database.enum';
import { PAYMENT_SUCCESS_EVENT } from '../../src/modules/payment/events/payment.events';
import { PaymentStrategyRegistry } from '../../src/modules/payment/services/payment-strategy.registry';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PAYMENT_ID = 'payment-uuid-cron-001';
const USER_ID = 'user-cron-001';
const TX_ID = 'tn-tx-cron-001';
const LOCK_KEY = `${PAYMENT_LOCK_PREFIX}${PAYMENT_ID}`;
const REDIS_LAST_SYNC_KEY = 'tn_last_sync_time';

function makePayment(overrides: Partial<PaymentEntity> = {}): PaymentEntity {
  const future = new Date(Date.now() + 10 * 60 * 1000);
  return {
    id: PAYMENT_ID,
    userId: USER_ID,
    amount: 10000,
    currency: 'VND',
    paymentMethod: PaymentType.ACTIVATION,
    status: PaymentStatus.PENDING,
    transactionId: null,
    description: 'KICHHOAT user-cron-001XYZ',
    expiredAt: future,
    vietqrQrDataUrl: null,
    vietqrPayload: {
      transactionCode: 'KICHHOAT user-cron-001XYZ',
    },
    paymentGatewayPayload: {},
    paidAt: null,
    createdAt: new Date('2026-05-20T09:00:00Z'),
    updatedAt: new Date('2026-05-20T09:00:00Z'),
    user: null as any,
    ...overrides,
  } as PaymentEntity;
}

function makeTx(overrides: Partial<TNTransaction> = {}): TNTransaction {
  return {
    id: TX_ID,
    refId: 'ref-cron-001',
    transactionTime: '2026-05-20 09:05:00',
    type: 'CREDIT',
    transactionAmount: 10000,
    otherAccountDisplayName: 'NGUYEN VAN A',
    otherAccountName: 'NGUYEN VAN A',
    narrative: 'KICHHOAT USER-CRON-001XYZ', // uppercase — test case-insensitive
    incognito: false,
    ...overrides,
  };
}

// ─── Mock QueryBuilder chain ──────────────────────────────────────────────────

function makeMockQb(opts: { rejectWith?: unknown } = {}) {
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

describe('PaymentVerificationService', () => {
  let service: PaymentVerificationService;
  let tnAppService: jest.Mocked<TnAppService>;
  let paymentRepository: jest.Mocked<PaymentRepository>;
  let dataSource: { createQueryBuilder: jest.Mock };
  let eventEmitter: jest.Mocked<EventEmitter2>;
  let paymentStrategyRegistry: jest.Mocked<PaymentStrategyRegistry>;
  let redis: { set: jest.Mock; del: jest.Mock; get: jest.Mock };

  beforeEach(() => {
    tnAppService = {
      fetchLatestBatch: jest.fn(),
      findTransactionByCode: jest.fn(),
    } as unknown as jest.Mocked<TnAppService>;

    paymentRepository = {
      expireStalePayments: jest.fn().mockResolvedValue(0),
      findAllPendingActive: jest.fn().mockResolvedValue([]),
    } as unknown as jest.Mocked<PaymentRepository>;

    dataSource = {
      createQueryBuilder: jest.fn(),
    };

    eventEmitter = {
      emit: jest.fn(),
    } as unknown as jest.Mocked<EventEmitter2>;

    paymentStrategyRegistry = {
      get: jest.fn().mockReturnValue({
        onSuccess: jest.fn().mockResolvedValue(undefined),
        resolveAmount: jest.fn().mockResolvedValue(10000),
        resolveDescriptionPrefix: jest.fn().mockReturnValue('KICHHOAT'),
        onGenerate: jest.fn().mockResolvedValue(undefined),
      }),
      register: jest.fn(),
    } as unknown as jest.Mocked<PaymentStrategyRegistry>;

    redis = {
      set: jest.fn().mockResolvedValue('OK'),
      del: jest.fn().mockResolvedValue(1),
      get: jest.fn().mockResolvedValue(null),
    };

    service = new PaymentVerificationService(
      tnAppService,
      paymentRepository,
      dataSource as unknown as DataSource,
      eventEmitter,
      paymentStrategyRegistry,
      redis as any,
    );
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // A. Expire Stale Payments
  // ═══════════════════════════════════════════════════════════════════════════

  describe('A. scanAndReconcile — Expire Stale Payments', () => {
    /**
     * TC-101: Cron luôn gọi expireStalePayments trước tiên
     */
    it('TC-101: nên gọi expireStalePayments ở đầu mỗi chu kỳ cron', async () => {
      tnAppService.fetchLatestBatch.mockResolvedValue([]);

      await service.scanAndReconcile();

      expect(paymentRepository.expireStalePayments).toHaveBeenCalledTimes(1);
    });

    /**
     * TC-102: Nếu không có payment nào expired, cron vẫn tiếp tục
     */
    it('TC-102: nên tiếp tục xử lý dù không có payment nào bị expire', async () => {
      paymentRepository.expireStalePayments.mockResolvedValue(0);
      tnAppService.fetchLatestBatch.mockResolvedValue([]);

      await service.scanAndReconcile();

      // Không throw, vẫn tiếp tục đến bước fetch
      expect(tnAppService.fetchLatestBatch).toHaveBeenCalledTimes(1);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // B. Resolve Sync Window
  // ═══════════════════════════════════════════════════════════════════════════

  describe('B. scanAndReconcile — Resolve Sync Window', () => {
    /**
     * TC-103: Redis có giá trị last_sync → fromDate = giá trị đó
     */
    it('TC-103: nên dùng Redis last_sync_time làm fromDate khi có giá trị', async () => {
      const lastSync = '2026-05-20T09:00:00.000Z';
      redis.get.mockResolvedValue(lastSync);
      tnAppService.fetchLatestBatch.mockResolvedValue([]);

      await service.scanAndReconcile();

      const [fromDate] = tnAppService.fetchLatestBatch.mock.calls[0];
      expect(fromDate.toISOString()).toBe(lastSync);
    });

    /**
     * TC-104: Redis không có last_sync → fallback lùi 30 phút
     */
    it('TC-104: nên fallback lùi 30 phút khi Redis không có last_sync_time', async () => {
      redis.get.mockResolvedValue(null);
      tnAppService.fetchLatestBatch.mockResolvedValue([]);

      const before = Date.now();
      await service.scanAndReconcile();
      const after = Date.now();

      const [fromDate] = tnAppService.fetchLatestBatch.mock.calls[0];
      const diffMs = Date.now() - fromDate.getTime();
      // fromDate phải xấp xỉ 30 phút (1_800_000 ms) trước now, với sai số 5s
      expect(diffMs).toBeGreaterThanOrEqual(30 * 60 * 1000 - 5000);
      expect(diffMs).toBeLessThanOrEqual(30 * 60 * 1000 + 5000);
    });

    /**
     * TC-105: Redis throw error → fallback gracefully, cron không crash
     */
    it('TC-105: nên fallback 30 phút khi Redis throw error (graceful degradation)', async () => {
      redis.get.mockRejectedValue(new Error('Redis ECONNREFUSED'));
      tnAppService.fetchLatestBatch.mockResolvedValue([]);

      await expect(service.scanAndReconcile()).resolves.not.toThrow();
    });

    /**
     * TC-106: fromDate luôn nhỏ hơn toDate
     */
    it('TC-106: fromDate phải luôn nhỏ hơn toDate', async () => {
      redis.get.mockResolvedValue(null);
      tnAppService.fetchLatestBatch.mockResolvedValue([]);

      await service.scanAndReconcile();

      const [fromDate, toDate] = tnAppService.fetchLatestBatch.mock.calls[0];
      expect(fromDate.getTime()).toBeLessThan(toDate.getTime());
    });

    /**
     * TC-107: Redis có last_sync là chuỗi ISO hợp lệ → parse đúng thành Date
     */
    it('TC-107: nên parse ISO string từ Redis thành Date chính xác', async () => {
      const isoStr = '2026-05-20T01:30:00.000Z';
      redis.get.mockResolvedValue(isoStr);
      tnAppService.fetchLatestBatch.mockResolvedValue([]);

      await service.scanAndReconcile();

      const [fromDate] = tnAppService.fetchLatestBatch.mock.calls[0];
      expect(fromDate).toEqual(new Date(isoStr));
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // C. TN App Batch Fetch
  // ═══════════════════════════════════════════════════════════════════════════

  describe('C. scanAndReconcile — TN App Batch Fetch', () => {
    /**
     * TC-108: TN App trả mảng rỗng → kết thúc sớm, không query DB
     */
    it('TC-108: nên kết thúc sớm và không query DB khi TN App không có giao dịch mới', async () => {
      tnAppService.fetchLatestBatch.mockResolvedValue([]);

      await service.scanAndReconcile();

      expect(paymentRepository.findAllPendingActive).not.toHaveBeenCalled();
    });

    /**
     * TC-109: TN App trả lỗi (mảng rỗng do exception bên trong) → không crash cron
     */
    it('TC-109: cron không được crash khi TN App service trả về lỗi', async () => {
      // TnAppService đã xử lý nội bộ, trả mảng rỗng khi lỗi
      tnAppService.fetchLatestBatch.mockResolvedValue([]);

      await expect(service.scanAndReconcile()).resolves.not.toThrow();
    });

    /**
     * TC-110: Có giao dịch → tiếp tục query DB pending payments
     */
    it('TC-110: nên query DB pending payments khi TN App trả về giao dịch', async () => {
      tnAppService.fetchLatestBatch.mockResolvedValue([makeTx()]);
      paymentRepository.findAllPendingActive.mockResolvedValue([]);

      await service.scanAndReconcile();

      expect(paymentRepository.findAllPendingActive).toHaveBeenCalledTimes(1);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // D. Matching Logic trong RAM
  // ═══════════════════════════════════════════════════════════════════════════

  describe('D. scanAndReconcile — Matching Logic', () => {
    beforeEach(() => {
      // Setup dataSource mock
      dataSource.createQueryBuilder.mockReturnValue(makeMockQb() as any);
    });

    /**
     * TC-111: Narrative khớp case-insensitive + amount đủ → match thành công
     */
    it('TC-111: nên match payment khi narrative chứa transactionCode (case-insensitive) và amount đủ', async () => {
      const payment = makePayment();
      const tx = makeTx({
        narrative: 'KICHHOAT USER-CRON-001XYZ - payment transfer', // uppercase
        transactionAmount: 15000, // lớn hơn amount yêu cầu → vẫn match
      });
      tnAppService.fetchLatestBatch.mockResolvedValue([tx]);
      paymentRepository.findAllPendingActive.mockResolvedValue([payment]);

      await service.scanAndReconcile();

      expect(eventEmitter.emit).toHaveBeenCalledWith(
        PAYMENT_SUCCESS_EVENT,
        expect.objectContaining({ paymentId: PAYMENT_ID }),
      );
    });

    /**
     * TC-112: Narrative không chứa transactionCode → không match, skip
     */
    it('TC-112: nên skip payment khi narrative không chứa transactionCode', async () => {
      const payment = makePayment();
      const tx = makeTx({ narrative: 'CHUYEN KHOAN KHAC 12345' });
      tnAppService.fetchLatestBatch.mockResolvedValue([tx]);
      paymentRepository.findAllPendingActive.mockResolvedValue([payment]);

      await service.scanAndReconcile();

      expect(eventEmitter.emit).not.toHaveBeenCalled();
    });

    /**
     * TC-113: Amount giao dịch nhỏ hơn payment.amount → không match
     */
    it('TC-113: nên skip khi transactionAmount nhỏ hơn payment.amount', async () => {
      const payment = makePayment({ amount: 10000 });
      const tx = makeTx({
        narrative: 'KICHHOAT user-cron-001XYZ',
        transactionAmount: 9999, // thiếu 1 đồng
      });
      tnAppService.fetchLatestBatch.mockResolvedValue([tx]);
      paymentRepository.findAllPendingActive.mockResolvedValue([payment]);

      await service.scanAndReconcile();

      expect(eventEmitter.emit).not.toHaveBeenCalled();
    });

    /**
     * TC-114: Amount giao dịch đúng bằng payment.amount → match thành công (boundary)
     */
    it('TC-114: nên match khi transactionAmount đúng bằng payment.amount (boundary)', async () => {
      const payment = makePayment({ amount: 10000 });
      const tx = makeTx({ transactionAmount: 10000 });
      tnAppService.fetchLatestBatch.mockResolvedValue([tx]);
      paymentRepository.findAllPendingActive.mockResolvedValue([payment]);

      await service.scanAndReconcile();

      expect(eventEmitter.emit).toHaveBeenCalled();
    });

    /**
     * TC-115: Payment không có transactionCode → skip
     */
    it('TC-115: nên skip payment khi vietqrPayload không có transactionCode', async () => {
      const payment = makePayment({ vietqrPayload: {} });
      tnAppService.fetchLatestBatch.mockResolvedValue([makeTx()]);
      paymentRepository.findAllPendingActive.mockResolvedValue([payment]);

      await service.scanAndReconcile();

      expect(eventEmitter.emit).not.toHaveBeenCalled();
    });

    /**
     * TC-116: Nhiều payment PENDING, chỉ match 1 → chỉ emit event 1 lần
     */
    it('TC-116: nên chỉ xử lý payment khớp khi có nhiều payment PENDING', async () => {
      const matchingPayment = makePayment({ id: 'payment-match' });
      const nonMatchingPayment = makePayment({
        id: 'payment-no-match',
        vietqrPayload: { transactionCode: 'KICHHOAT totally-different' },
      });
      const tx = makeTx({
        narrative: 'KICHHOAT USER-CRON-001XYZ', // chỉ khớp matchingPayment
      });
      tnAppService.fetchLatestBatch.mockResolvedValue([tx]);
      paymentRepository.findAllPendingActive.mockResolvedValue([
        matchingPayment,
        nonMatchingPayment,
      ]);

      await service.scanAndReconcile();

      expect(eventEmitter.emit).toHaveBeenCalledTimes(1);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // E. verifyAndProcessMatchedPayment — Redis Lock
  // ═══════════════════════════════════════════════════════════════════════════

  describe('E. verifyAndProcessMatchedPayment — Redis Lock', () => {
    /**
     * TC-117: Lock lấy được → tiến hành update DB
     */
    it('TC-117: nên update DB khi lock lấy được', async () => {
      redis.set.mockResolvedValue('OK');
      const qb = makeMockQb();
      dataSource.createQueryBuilder.mockReturnValue(qb as any);

      await service.verifyAndProcessMatchedPayment(makePayment(), makeTx());

      expect(qb.execute).toHaveBeenCalledTimes(1);
    });

    /**
     * TC-118: Lock KHÔNG lấy được (null) → return false, không update DB
     */
    it('TC-118: nên return false và không update DB khi lock bị chiếm', async () => {
      redis.set.mockResolvedValue(null); // Lock thất bại

      const result = await service.verifyAndProcessMatchedPayment(
        makePayment(),
        makeTx(),
      );

      expect(result).toBe(false);
      expect(dataSource.createQueryBuilder).not.toHaveBeenCalled();
    });

    /**
     * TC-119: Lock phải được set với key đúng format
     */
    it('TC-119: nên set Redis lock với key đúng format lock:payment:verify:{id}', async () => {
      redis.set.mockResolvedValue('OK');
      const qb = makeMockQb();
      dataSource.createQueryBuilder.mockReturnValue(qb as any);

      await service.verifyAndProcessMatchedPayment(makePayment(), makeTx());

      expect(redis.set).toHaveBeenCalledWith(
        LOCK_KEY,
        'cron',
        'PX',
        20_000,
        'NX',
      );
    });

    /**
     * TC-120: Lock phải được release sau khi xử lý (kể cả khi DB lỗi)
     */
    it('TC-120: phải release Redis lock trong finally block dù DB lỗi', async () => {
      redis.set.mockResolvedValue('OK');
      const qb = makeMockQb({ rejectWith: new Error('DB error') });
      dataSource.createQueryBuilder.mockReturnValue(qb as any);

      await service.verifyAndProcessMatchedPayment(makePayment(), makeTx());

      expect(redis.del).toHaveBeenCalledWith(LOCK_KEY);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // F. verifyAndProcessMatchedPayment — DB Update & Event
  // ═══════════════════════════════════════════════════════════════════════════

  describe('F. verifyAndProcessMatchedPayment — DB & Event', () => {
    beforeEach(() => {
      redis.set.mockResolvedValue('OK');
    });

    /**
     * TC-121: Thành công → return true
     */
    it('TC-121: nên return true khi update DB và emit event thành công', async () => {
      const qb = makeMockQb();
      dataSource.createQueryBuilder.mockReturnValue(qb as any);

      const result = await service.verifyAndProcessMatchedPayment(
        makePayment(),
        makeTx(),
      );

      expect(result).toBe(true);
    });

    /**
     * TC-122: Emit PAYMENT_SUCCESS_EVENT với đúng payload
     */
    it('TC-122: nên emit PAYMENT_SUCCESS_EVENT với paymentId, transactionId, userId', async () => {
      const qb = makeMockQb();
      dataSource.createQueryBuilder.mockReturnValue(qb as any);
      const tx = makeTx({ id: TX_ID });

      await service.verifyAndProcessMatchedPayment(makePayment(), tx);

      expect(eventEmitter.emit).toHaveBeenCalledWith(PAYMENT_SUCCESS_EVENT, {
        paymentId: PAYMENT_ID,
        transactionId: TX_ID,
        userId: USER_ID,
        paymentMethod: PaymentType.ACTIVATION,
      });
    });

    /**
     * TC-123: Update đúng payment.id trong WHERE clause
     */
    it('TC-123: nên update đúng payment.id trong WHERE clause', async () => {
      const qb = makeMockQb();
      dataSource.createQueryBuilder.mockReturnValue(qb as any);

      await service.verifyAndProcessMatchedPayment(makePayment(), makeTx());

      expect(qb.where).toHaveBeenCalledWith('id = :id', { id: PAYMENT_ID });
    });

    /**
     * TC-124: DB lỗi không phải 23505 → return false, không emit event
     */
    it('TC-124: nên return false và không emit event khi DB lỗi không phải unique violation', async () => {
      const qb = makeMockQb({ rejectWith: new Error('Column not found') });
      dataSource.createQueryBuilder.mockReturnValue(qb as any);

      const result = await service.verifyAndProcessMatchedPayment(
        makePayment(),
        makeTx(),
      );

      expect(result).toBe(false);
      expect(eventEmitter.emit).not.toHaveBeenCalled();
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // G. PostgreSQL 23505 — Duplicate Transaction ID
  // ═══════════════════════════════════════════════════════════════════════════

  describe('G. PG Error 23505 — Duplicate transaction_id', () => {
    beforeEach(() => {
      redis.set.mockResolvedValue('OK');
    });

    /**
     * TC-125: PG 23505 → return false, không crash cron
     */
    it('TC-125: nên return false khi DB báo unique violation (23505)', async () => {
      const pgError = Object.assign(new Error('duplicate key value'), {
        code: '23505',
      });
      const qb = makeMockQb({ rejectWith: pgError });
      dataSource.createQueryBuilder.mockReturnValue(qb as any);

      const result = await service.verifyAndProcessMatchedPayment(
        makePayment(),
        makeTx(),
      );

      expect(result).toBe(false);
    });

    /**
     * TC-126: PG 23505 → không emit event (giao dịch đã được xử lý bởi process khác)
     */
    it('TC-126: không được emit event khi bị PG 23505 (giao dịch đã xử lý)', async () => {
      const pgError = Object.assign(new Error('duplicate key'), { code: '23505' });
      const qb = makeMockQb({ rejectWith: pgError });
      dataSource.createQueryBuilder.mockReturnValue(qb as any);

      await service.verifyAndProcessMatchedPayment(makePayment(), makeTx());

      expect(eventEmitter.emit).not.toHaveBeenCalled();
    });

    /**
     * TC-127: PG 23505 → vẫn release lock
     */
    it('TC-127: phải release Redis lock dù bị PG 23505', async () => {
      const pgError = Object.assign(new Error('duplicate key'), { code: '23505' });
      const qb = makeMockQb({ rejectWith: pgError });
      dataSource.createQueryBuilder.mockReturnValue(qb as any);

      await service.verifyAndProcessMatchedPayment(makePayment(), makeTx());

      expect(redis.del).toHaveBeenCalledWith(LOCK_KEY);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // H. updateLastSyncTime
  // ═══════════════════════════════════════════════════════════════════════════

  describe('H. updateLastSyncTime', () => {
    /**
     * TC-128: Cập nhật Redis với timestamp lớn nhất trong batch
     */
    it('TC-128: nên lưu timestamp lớn nhất vào Redis sau khi fetch batch', async () => {
      const txOld = makeTx({ transactionTime: '2026-05-20 09:00:00' });
      const txNew = makeTx({ transactionTime: '2026-05-20 09:30:00' }); // mới hơn
      tnAppService.fetchLatestBatch.mockResolvedValue([txOld, txNew]);
      paymentRepository.findAllPendingActive.mockResolvedValue([]);

      await service.scanAndReconcile();

      // Redis set phải được gọi để lưu last_sync
      const setCalls = redis.set.mock.calls.filter(
        ([key]: [string]) => key === REDIS_LAST_SYNC_KEY,
      );
      expect(setCalls.length).toBeGreaterThan(0);

      // Giá trị được lưu phải là ISO string của tx mới nhất (UTC+7 → UTC)
      const savedTime = new Date(setCalls[setCalls.length - 1][1] as string);
      // 2026-05-20 09:30:00 UTC+7 = 2026-05-20 02:30:00 UTC
      expect(savedTime.toISOString()).toBe('2026-05-20T02:30:00.000Z');
    });

    /**
     * TC-129: Redis lỗi khi lưu last_sync → cron không crash
     */
    it('TC-129: cron không được crash khi Redis lỗi khi lưu last_sync_time', async () => {
      tnAppService.fetchLatestBatch.mockResolvedValue([makeTx()]);
      paymentRepository.findAllPendingActive.mockResolvedValue([]);

      // set đầu (lock) OK, set thứ 2 (last_sync) lỗi
      redis.set
        .mockResolvedValueOnce('OK') // lock acquire
        .mockRejectedValueOnce(new Error('Redis ECONNREFUSED')); // last_sync set fail

      await expect(service.scanAndReconcile()).resolves.not.toThrow();
    });

    /**
     * TC-130: Batch 1 tx → lastSync = timestamp của tx đó
     */
    it('TC-130: nên lưu đúng timestamp khi batch chỉ có 1 giao dịch', async () => {
      const tx = makeTx({ transactionTime: '2026-05-20 10:00:00' });
      tnAppService.fetchLatestBatch.mockResolvedValue([tx]);
      paymentRepository.findAllPendingActive.mockResolvedValue([]);

      await service.scanAndReconcile();

      const setCalls = redis.set.mock.calls.filter(
        ([key]: [string]) => key === REDIS_LAST_SYNC_KEY,
      );
      expect(setCalls.length).toBeGreaterThan(0);
      const savedTime = new Date(setCalls[setCalls.length - 1][1] as string);
      // 2026-05-20 10:00:00 UTC+7 = 2026-05-20 03:00:00 UTC
      expect(savedTime.toISOString()).toBe('2026-05-20T03:00:00.000Z');
    });
  });
});

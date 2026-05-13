import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DataSource } from 'typeorm';
import { PaymentVerificationService } from '../../src/modules/payment/services/payment-verification.service';
import { TnAppService, TNTransaction } from '../../src/modules/payment/services/tn-app.service';
import { PaymentRepository } from '../../src/modules/payment/repositories/payment.repository';
import { REDIS_CLIENT } from '../../src/modules/redis/redis.module';
import {
  PaymentEntity,
  PaymentType,
} from '../../src/modules/payment/entities/payment.entity';
import { PaymentStatus } from '../../src/common/enums/database.enum';
import {
  PAYMENT_SUCCESS_EVENT,
  PaymentSuccessPayload,
} from '../../src/modules/payment/events/payment.events';

// ─── Test Data Factories ──────────────────────────────────────────────────────

function makePayment(overrides: Partial<PaymentEntity> = {}): PaymentEntity {
  return {
    id: 'payment-1',
    userId: 'user-1',
    amount: 10_000,
    currency: 'VND',
    paymentMethod: PaymentType.ACTIVATION,
    status: PaymentStatus.PENDING,
    transactionId: null,
    description: 'KICHHOAT user-1ABCD',
    expiredAt: new Date(Date.now() + 15 * 60 * 1000),
    vietqrQrDataUrl: null,
    vietqrPayload: { transactionCode: 'KICHHOAT user-1ABCD' },
    paymentGatewayPayload: {},
    paidAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    ...overrides,
  } as PaymentEntity;
}

function makeTx(overrides: Partial<TNTransaction> = {}): TNTransaction {
  return {
    id: 'tx-001',
    refId: 'ref-001',
    transactionTime: '2024-05-09 15:30:00',
    type: 'CREDIT',
    transactionAmount: 10_000,
    otherAccountDisplayName: 'NGUYEN VAN A',
    otherAccountName: 'NGUYEN VAN A',
    narrative: 'KICHHOAT user-1ABCD thanh toan phi kich hoat',
    incognito: false,
    ...overrides,
  };
}

// ─── QueryBuilder Shared Mock ────────────────────────────────────────────────

// Dùng 1 instance duy nhất để inspect .mock.calls sau khi service gọi
const mockQbExecute = jest.fn();
const mockQb = {
  update: jest.fn().mockReturnThis(),
  set: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  execute: mockQbExecute,
};

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockTnAppService = {
  fetchLatestBatch: jest.fn(),
};

const mockPaymentRepository = {
  expireStaleActivations: jest.fn(),
  findAllPendingActive: jest.fn(),
};

const mockEventEmitter = {
  emit: jest.fn(),
};

const mockRedis = {
  get: jest.fn(),
  set: jest.fn(),
};

// DataSource trả về shared mockQb để inspect sau
const mockDataSource = {
  createQueryBuilder: jest.fn(() => mockQb),
};

// ─── Test Suite ──────────────────────────────────────────────────────────────

describe('PaymentVerificationService', () => {
  let service: PaymentVerificationService;

  beforeEach(async () => {
    jest.clearAllMocks();
    // Reset execute mock trả về success mặc định
    mockQbExecute.mockResolvedValue({ affected: 1 });
    // Đảm bảo các chained methods trả về this sau clearAllMocks
    mockQb.update.mockReturnThis();
    mockQb.set.mockReturnThis();
    mockQb.where.mockReturnThis();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentVerificationService,
        { provide: TnAppService, useValue: mockTnAppService },
        { provide: PaymentRepository, useValue: mockPaymentRepository },
        { provide: DataSource, useValue: mockDataSource },
        { provide: EventEmitter2, useValue: mockEventEmitter },
        { provide: REDIS_CLIENT, useValue: mockRedis },
      ],
    }).compile();

    service = module.get<PaymentVerificationService>(PaymentVerificationService);
  });

  // ─── verifyAndProcessMatchedPayment() ───────────────────────────────────────

  describe('verifyAndProcessMatchedPayment(payment, tx)', () => {
    it('cập nhật status → SUCCESS và emit PAYMENT_SUCCESS_EVENT', async () => {
      const payment = makePayment();
      const tx = makeTx();

      const result = await service.verifyAndProcessMatchedPayment(payment, tx);

      expect(result).toBe(true);

      // Kiểm tra UPDATE query được gọi đúng
      expect(mockQb.update).toHaveBeenCalledWith(expect.anything());
      expect(mockQb.set).toHaveBeenCalledWith(
        expect.objectContaining({
          status: PaymentStatus.SUCCESS,
          transactionId: tx.id,
        }),
      );
      expect(mockQb.where).toHaveBeenCalledWith('id = :id', { id: payment.id });
      expect(mockQbExecute).toHaveBeenCalledTimes(1);

      // Kiểm tra event được emit đúng payload
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        PAYMENT_SUCCESS_EVENT,
        {
          paymentId: payment.id,
          transactionId: tx.id,
          userId: payment.userId,
        } satisfies PaymentSuccessPayload,
      );
    });

    it('trả về false và KHÔNG emit event khi lỗi duplicate (PostgreSQL 23505)', async () => {
      const payment = makePayment();
      const tx = makeTx();
      const dupError = Object.assign(new Error('duplicate key'), { code: '23505' });
      mockQbExecute.mockRejectedValue(dupError);

      const result = await service.verifyAndProcessMatchedPayment(payment, tx);

      expect(result).toBe(false);
      expect(mockEventEmitter.emit).not.toHaveBeenCalled();
    });

    it('trả về false và KHÔNG emit event khi lỗi MySQL ER_DUP_ENTRY', async () => {
      const payment = makePayment();
      const tx = makeTx();
      const dupError = Object.assign(new Error('dup entry'), {
        code: 'ER_DUP_ENTRY',
      });
      mockQbExecute.mockRejectedValue(dupError);

      const result = await service.verifyAndProcessMatchedPayment(payment, tx);

      expect(result).toBe(false);
      expect(mockEventEmitter.emit).not.toHaveBeenCalled();
    });

    it('trả về false khi có lỗi không xác định (không crash cron)', async () => {
      const payment = makePayment();
      const tx = makeTx();
      mockQbExecute.mockRejectedValue(new Error('Connection lost'));

      const result = await service.verifyAndProcessMatchedPayment(payment, tx);

      expect(result).toBe(false);
      expect(mockEventEmitter.emit).not.toHaveBeenCalled();
    });

    it('paidAt được set đúng từ tx.transactionTime (giờ VN +07)', async () => {
      const payment = makePayment();
      const tx = makeTx({ transactionTime: '2024-05-09 15:30:00' });

      await service.verifyAndProcessMatchedPayment(payment, tx);

      // Lấy argument từ shared mockQb.set
      const setArg = mockQb.set.mock.calls[0][0];
      // paidAt phải là Date parsed từ '2024-05-09 15:30:00+07:00' = 08:30 UTC
      expect(setArg.paidAt.toISOString()).toBe('2024-05-09T08:30:00.000Z');
    });
  });

  // ─── scanAndReconcile() ─────────────────────────────────────────────────────

  describe('scanAndReconcile()', () => {
    it('kết thúc sớm nếu TN App không có giao dịch mới', async () => {
      mockPaymentRepository.expireStaleActivations.mockResolvedValue(0);
      mockRedis.get.mockResolvedValue(null);
      mockTnAppService.fetchLatestBatch.mockResolvedValue([]);

      await service.scanAndReconcile();

      // Không cần query DB để tìm pending payments
      expect(mockPaymentRepository.findAllPendingActive).not.toHaveBeenCalled();
    });

    it('kết thúc sớm nếu không có payment PENDING nào', async () => {
      mockPaymentRepository.expireStaleActivations.mockResolvedValue(0);
      mockRedis.get.mockResolvedValue(null);
      mockTnAppService.fetchLatestBatch.mockResolvedValue([makeTx()]);
      mockPaymentRepository.findAllPendingActive.mockResolvedValue([]);

      await service.scanAndReconcile();

      // Không cần chạy reconcile loop
      expect(mockQbExecute).not.toHaveBeenCalled();
    });

    it('match đúng payment khi narrative chứa transactionCode (case-insensitive)', async () => {
      const payment = makePayment({
        vietqrPayload: { transactionCode: 'KICHHOAT user-1ABCD' },
        amount: 10_000,
      });
      const tx = makeTx({
        narrative: 'kichhoat user-1abcd thanh toan',  // lowercase
        transactionAmount: 10_000,
      });

      mockPaymentRepository.expireStaleActivations.mockResolvedValue(0);
      mockRedis.get.mockResolvedValue(null);
      mockTnAppService.fetchLatestBatch.mockResolvedValue([tx]);
      mockPaymentRepository.findAllPendingActive.mockResolvedValue([payment]);

      await service.scanAndReconcile();

      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        PAYMENT_SUCCESS_EVENT,
        expect.objectContaining({ paymentId: payment.id, transactionId: tx.id }),
      );
    });

    it('KHÔNG match nếu transactionAmount < payment.amount', async () => {
      const payment = makePayment({ amount: 10_000 });
      const tx = makeTx({ transactionAmount: 5_000 }); // thiếu tiền

      mockPaymentRepository.expireStaleActivations.mockResolvedValue(0);
      mockRedis.get.mockResolvedValue(null);
      mockTnAppService.fetchLatestBatch.mockResolvedValue([tx]);
      mockPaymentRepository.findAllPendingActive.mockResolvedValue([payment]);

      await service.scanAndReconcile();

      expect(mockEventEmitter.emit).not.toHaveBeenCalled();
    });

    it('KHÔNG match nếu narrative không chứa transactionCode', async () => {
      const payment = makePayment({
        vietqrPayload: { transactionCode: 'KICHHOAT user-1ABCD' },
        amount: 10_000,
      });
      const tx = makeTx({
        narrative: 'chuyen tien lan 1',
        transactionAmount: 10_000,
      });

      mockPaymentRepository.expireStaleActivations.mockResolvedValue(0);
      mockRedis.get.mockResolvedValue(null);
      mockTnAppService.fetchLatestBatch.mockResolvedValue([tx]);
      mockPaymentRepository.findAllPendingActive.mockResolvedValue([payment]);

      await service.scanAndReconcile();

      expect(mockEventEmitter.emit).not.toHaveBeenCalled();
    });

    it('bỏ qua payment không có transactionCode trong vietqrPayload', async () => {
      const payment = makePayment({ vietqrPayload: {} }); // không có transactionCode
      const tx = makeTx({ narrative: 'KICHHOAT user-1ABCD', transactionAmount: 10_000 });

      mockPaymentRepository.expireStaleActivations.mockResolvedValue(0);
      mockRedis.get.mockResolvedValue(null);
      mockTnAppService.fetchLatestBatch.mockResolvedValue([tx]);
      mockPaymentRepository.findAllPendingActive.mockResolvedValue([payment]);

      await service.scanAndReconcile();

      expect(mockEventEmitter.emit).not.toHaveBeenCalled();
    });

    it('gọi expireStaleActivations để dọn rác trước khi reconcile', async () => {
      mockPaymentRepository.expireStaleActivations.mockResolvedValue(3);
      mockRedis.get.mockResolvedValue(null);
      mockTnAppService.fetchLatestBatch.mockResolvedValue([]);

      await service.scanAndReconcile();

      expect(mockPaymentRepository.expireStaleActivations).toHaveBeenCalledTimes(1);
    });

    it('chấp nhận giao dịch chuyển nhiều hơn số tiền quy định (>= amount)', async () => {
      const payment = makePayment({ amount: 10_000 });
      const tx = makeTx({
        narrative: 'KICHHOAT user-1ABCD du tien',
        transactionAmount: 50_000, // nhiều hơn 10k → vẫn hợp lệ
      });

      mockPaymentRepository.expireStaleActivations.mockResolvedValue(0);
      mockRedis.get.mockResolvedValue(null);
      mockTnAppService.fetchLatestBatch.mockResolvedValue([tx]);
      mockPaymentRepository.findAllPendingActive.mockResolvedValue([payment]);

      await service.scanAndReconcile();

      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        PAYMENT_SUCCESS_EVENT,
        expect.objectContaining({ paymentId: payment.id }),
      );
    });

    it('cập nhật Redis last sync time sau khi fetch transactions', async () => {
      const tx1 = makeTx({ transactionTime: '2024-05-09 10:00:00' });
      const tx2 = makeTx({ id: 'tx-002', transactionTime: '2024-05-09 15:30:00' });

      mockPaymentRepository.expireStaleActivations.mockResolvedValue(0);
      mockRedis.get.mockResolvedValue(null);
      mockTnAppService.fetchLatestBatch.mockResolvedValue([tx1, tx2]);
      mockPaymentRepository.findAllPendingActive.mockResolvedValue([]);

      await service.scanAndReconcile();

      // Phải lưu timestamp lớn nhất (tx2) vào Redis
      expect(mockRedis.set).toHaveBeenCalledWith(
        'tn_last_sync_time',
        // tx2 transactionTime: '2024-05-09 15:30:00' +07 = '2024-05-09T08:30:00.000Z'
        '2024-05-09T08:30:00.000Z',
      );
    });

    it('dùng last sync time từ Redis làm fromDate nếu có', async () => {
      const lastSync = '2024-05-09T08:00:00.000Z';
      mockRedis.get.mockResolvedValue(lastSync);
      mockPaymentRepository.expireStaleActivations.mockResolvedValue(0);
      mockTnAppService.fetchLatestBatch.mockResolvedValue([]);

      await service.scanAndReconcile();

      const [fromDate] = mockTnAppService.fetchLatestBatch.mock.calls[0];
      expect(fromDate.toISOString()).toBe(lastSync);
    });

    it('fallback 30 phút ngược khi Redis chưa có last sync time', async () => {
      mockRedis.get.mockResolvedValue(null);
      mockPaymentRepository.expireStaleActivations.mockResolvedValue(0);
      mockTnAppService.fetchLatestBatch.mockResolvedValue([]);

      const before = Date.now();
      await service.scanAndReconcile();

      const [fromDate] = mockTnAppService.fetchLatestBatch.mock.calls[0];
      const diffMs = before - fromDate.getTime();

      // fromDate phải nằm trong khoảng 29-31 phút trước now
      expect(diffMs).toBeGreaterThan(29 * 60 * 1000);
      expect(diffMs).toBeLessThan(31 * 60 * 1000);
    });
  });
});

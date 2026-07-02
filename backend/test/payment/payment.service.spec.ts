/**
 * Unit Tests — PaymentService
 *
 * Tập trung vào luồng verifyActivationPayment (Kênh 1 — API thủ công).
 * Tổng số test case: 25
 *
 * Nhóm test:
 *  A. Validation & Authorization (TC-001 → TC-005)
 *  B. Idempotency (TC-006 → TC-007)
 *  C. Expiry Check (TC-008 → TC-010)
 *  D. Redis Distributed Lock — Lock bị chiếm (TC-011 → TC-013)
 *  E. Redis Distributed Lock — Lock acquired (TC-014 → TC-015)
 *  F. TN App Integration (TC-016 → TC-019)
 *  G. DB Transaction & Event Emit (TC-020 → TC-022)
 *  H. Lock Release (TC-023 → TC-025)
 */

import {
  ForbiddenException,
  InternalServerErrorException,
  ServiceUnavailableException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DataSource } from 'typeorm';
import { PaymentService } from '../../src/modules/payment/services/payment.service';
import { PaymentRepository } from '../../src/modules/payment/repositories/payment.repository';
import {
  PaymentEntity,
  PaymentType,
} from '../../src/modules/payment/entities/payment.entity';
import { PaymentStatus } from '../../src/common/enums/database.enum';
import { SystemConfigService } from '../../src/modules/system-config/services/system-config.service';
import { VietqrService } from '../../src/modules/payment/services/vietqr.service';
import { TnAppService } from '../../src/modules/payment/services/tn-app.service';
import {
  ErrorCode,
  ErrorMessage,
} from '../../src/common/enums/error-code.enum';
import { PAYMENT_SUCCESS_EVENT } from '../../src/modules/payment/events/payment.events';
import { PAYMENT_LOCK_PREFIX } from '../../src/modules/payment/services/payment-verification.service';
import { PaymentStrategyRegistry } from '../../src/modules/payment/services/payment-strategy.registry';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const USER_ID = 'user-001';
const OTHER_USER_ID = 'user-002';
const PAYMENT_ID = 'payment-uuid-001';
const TRANSACTION_ID = 'tn-tx-001';
const LOCK_KEY = `${PAYMENT_LOCK_PREFIX}${PAYMENT_ID}`;

/**
 * Tạo một PaymentEntity mẫu với các giá trị mặc định hợp lệ.
 * Override bất kỳ field nào để test các edge case.
 */
function makePayment(overrides: Partial<PaymentEntity> = {}): PaymentEntity {
  const future = new Date(Date.now() + 10 * 60 * 1000); // +10 phút
  return {
    id: PAYMENT_ID,
    userId: USER_ID,
    amount: 10000,
    currency: 'VND',
    paymentMethod: PaymentType.ACTIVATION,
    status: PaymentStatus.PENDING,
    transactionId: null,
    description: 'KICHHOAT user-001ABC',
    expiredAt: future,
    vietqrQrDataUrl: 'https://qr.example.com',
    vietqrPayload: {
      transactionCode: 'KICHHOAT user-001ABC',
      qrUrl: 'https://qr.example.com',
      generatedAt: new Date().toISOString(),
    },
    paymentGatewayPayload: {},
    paidAt: null,
    createdAt: new Date('2026-05-20T09:00:00Z'),
    updatedAt: new Date('2026-05-20T09:00:00Z'),
    user: null as any,
    ...overrides,
  } as PaymentEntity;
}

/**
 * Tạo mock transaction từ TN App.
 */
function makeTnTransaction(overrides = {}) {
  return {
    id: TRANSACTION_ID,
    refId: 'ref-001',
    transactionTime: '2026-05-20 09:05:00',
    type: 'CREDIT' as const,
    transactionAmount: 10000,
    otherAccountDisplayName: 'NGUYEN VAN A',
    otherAccountName: 'NGUYEN VAN A',
    narrative: 'KICHHOAT user-001ABC',
    incognito: false,
    ...overrides,
  };
}

// ─── Mock Setup ───────────────────────────────────────────────────────────────

describe('PaymentService — verifyActivationPayment', () => {
  let service: PaymentService;

  // Mocks
  let paymentRepository: jest.Mocked<PaymentRepository>;
  let systemConfigService: jest.Mocked<SystemConfigService>;
  let vietqrService: jest.Mocked<VietqrService>;
  let tnAppService: jest.Mocked<TnAppService>;
  let dataSource: jest.Mocked<DataSource>;
  let eventEmitter: jest.Mocked<EventEmitter2>;
  let paymentStrategyRegistry: jest.Mocked<PaymentStrategyRegistry>;
  let mailService: {
    getAdminEmail: jest.Mock;
    sendPaymentTransactionEmail: jest.Mock;
  };
  let redis: {
    set: jest.Mock;
    del: jest.Mock;
    get: jest.Mock;
  };

  beforeEach(() => {
    paymentRepository = {
      findByIdOrFail: jest.fn(),
      findPendingActivation: jest.fn(),
      createAndSave: jest.fn(),
      expirePayment: jest.fn(),
      expireStaleActivations: jest.fn(),
      findAllPendingActive: jest.fn(),
    } as unknown as jest.Mocked<PaymentRepository>;

    systemConfigService = {
      findByKey: jest.fn(),
    } as unknown as jest.Mocked<SystemConfigService>;

    vietqrService = {
      generateQrUrl: jest.fn().mockReturnValue('https://qr.example.com'),
    } as unknown as jest.Mocked<VietqrService>;

    tnAppService = {
      findTransactionByCode: jest.fn(),
      fetchLatestBatch: jest.fn(),
    } as unknown as jest.Mocked<TnAppService>;

    // Mock DataSource với transaction callback
    const mockManager = {
      update: jest.fn().mockResolvedValue({}),
    };
    dataSource = {
      transaction: jest
        .fn()
        .mockImplementation(
          async (cb: (manager: typeof mockManager) => Promise<void>) => {
            await cb(mockManager);
          },
        ),
    } as unknown as jest.Mocked<DataSource>;

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

    mailService = {
      getAdminEmail: jest.fn().mockReturnValue('hoctuthien@gmail.com'),
      sendPaymentTransactionEmail: jest.fn().mockResolvedValue(undefined),
    };

    redis = {
      set: jest.fn(),
      del: jest.fn().mockResolvedValue(1),
      get: jest.fn(),
    };

    service = new PaymentService(
      paymentRepository,
      systemConfigService,
      vietqrService,
      tnAppService,
      dataSource,
      eventEmitter,
      paymentStrategyRegistry,
      mailService as any,
      redis as any,
    );
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // A. Validation & Authorization
  // ═══════════════════════════════════════════════════════════════════════════

  describe('A. Validation & Authorization', () => {
    /**
     * TC-001: Payment không tồn tại → NotFoundException (được ném bởi repository)
     */
    it('TC-001: nên ném NotFoundException khi paymentId không tồn tại', async () => {
      paymentRepository.findByIdOrFail.mockRejectedValue(
        new Error('Không tìm thấy thông tin thanh toán.'),
      );

      await expect(
        service.verifyActivationPayment(USER_ID, 'non-existent-id'),
      ).rejects.toThrow('Không tìm thấy thông tin thanh toán.');
    });

    /**
     * TC-002: Payment tồn tại nhưng thuộc user khác → ForbiddenException
     */
    it('TC-002: nên ném ForbiddenException khi payment thuộc user khác', async () => {
      paymentRepository.findByIdOrFail.mockResolvedValue(
        makePayment({ userId: OTHER_USER_ID }),
      );

      await expect(
        service.verifyActivationPayment(USER_ID, PAYMENT_ID),
      ).rejects.toThrow(ForbiddenException);
    });

    /**
     * TC-003: ForbiddenException phải mang đúng error message
     */
    it('TC-003: ForbiddenException phải chứa đúng error message', async () => {
      paymentRepository.findByIdOrFail.mockResolvedValue(
        makePayment({ userId: OTHER_USER_ID }),
      );

      await expect(
        service.verifyActivationPayment(USER_ID, PAYMENT_ID),
      ).rejects.toThrow(ErrorMessage[ErrorCode.PAYMENT_FORBIDDEN]);
    });

    /**
     * TC-004: Gọi findByIdOrFail đúng 1 lần với đúng paymentId khi validate
     */
    it('TC-004: nên gọi findByIdOrFail với đúng paymentId', async () => {
      paymentRepository.findByIdOrFail.mockResolvedValue(
        makePayment({ userId: OTHER_USER_ID }),
      );

      await service
        .verifyActivationPayment(USER_ID, PAYMENT_ID)
        .catch(() => {});

      expect(paymentRepository.findByIdOrFail).toHaveBeenCalledWith(
        PAYMENT_ID,
        ErrorMessage[ErrorCode.PAYMENT_NOT_FOUND],
      );
    });

    /**
     * TC-005: Không gọi Redis/TN App khi authorization thất bại
     */
    it('TC-005: không nên gọi Redis hay TN App khi bị từ chối quyền truy cập', async () => {
      paymentRepository.findByIdOrFail.mockResolvedValue(
        makePayment({ userId: OTHER_USER_ID }),
      );

      await service
        .verifyActivationPayment(USER_ID, PAYMENT_ID)
        .catch(() => {});

      expect(redis.set).not.toHaveBeenCalled();
      expect(tnAppService.findTransactionByCode).not.toHaveBeenCalled();
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // B. Idempotency — Payment đã SUCCESS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('B. Idempotency', () => {
    /**
     * TC-006: Payment đã SUCCESS → trả về activated: true ngay lập tức
     */
    it('TC-006: nên trả về activated=true ngay lập tức khi payment đã SUCCESS', async () => {
      paymentRepository.findByIdOrFail.mockResolvedValue(
        makePayment({ status: PaymentStatus.SUCCESS }),
      );

      const result = await service.verifyActivationPayment(USER_ID, PAYMENT_ID);

      expect(result.activated).toBe(true);
    });

    /**
     * TC-007: Idempotency path không gọi Redis, TN App, hay EventEmitter
     */
    it('TC-007: idempotency path không được gọi Redis, TN App hay EventEmitter', async () => {
      paymentRepository.findByIdOrFail.mockResolvedValue(
        makePayment({ status: PaymentStatus.SUCCESS }),
      );

      await service.verifyActivationPayment(USER_ID, PAYMENT_ID);

      expect(redis.set).not.toHaveBeenCalled();
      expect(tnAppService.findTransactionByCode).not.toHaveBeenCalled();
      expect(eventEmitter.emit).not.toHaveBeenCalled();
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // C. Expiry Check
  // ═══════════════════════════════════════════════════════════════════════════

  describe('C. Expiry Check', () => {
    /**
     * TC-008: QR hết hạn → UnprocessableEntityException
     */
    it('TC-008: nên ném UnprocessableEntityException khi QR đã hết hạn', async () => {
      const pastDate = new Date(Date.now() - 60_000); // 1 phút trước
      paymentRepository.findByIdOrFail.mockResolvedValue(
        makePayment({ expiredAt: pastDate }),
      );

      await expect(
        service.verifyActivationPayment(USER_ID, PAYMENT_ID),
      ).rejects.toThrow(UnprocessableEntityException);
    });

    /**
     * TC-009: QR hết hạn đúng lúc này (expiredAt = now) → cũng ném exception
     */
    it('TC-009: nên ném exception khi expiredAt <= now (boundary)', async () => {
      // expiredAt = thời điểm hiện tại (đúng bằng now) → vẫn hết hạn
      const now = new Date();
      paymentRepository.findByIdOrFail.mockResolvedValue(
        makePayment({ expiredAt: now }),
      );

      await expect(
        service.verifyActivationPayment(USER_ID, PAYMENT_ID),
      ).rejects.toThrow(UnprocessableEntityException);
    });

    /**
     * TC-010: expiredAt = null → cũng ném exception (không có hạn = hết hạn)
     */
    it('TC-010: nên ném exception khi expiredAt là null', async () => {
      paymentRepository.findByIdOrFail.mockResolvedValue(
        makePayment({ expiredAt: null }),
      );

      await expect(
        service.verifyActivationPayment(USER_ID, PAYMENT_ID),
      ).rejects.toThrow(UnprocessableEntityException);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // D. Redis Lock bị chiếm (Cron đang xử lý)
  // ═══════════════════════════════════════════════════════════════════════════

  describe('D. Redis Lock — bị chiếm bởi Cron', () => {
    beforeEach(() => {
      // Lock KHÔNG lấy được (redis.set trả null)
      redis.set.mockResolvedValue(null);
    });

    /**
     * TC-011: Lock bị chiếm, Cron chưa xong → activated: false + message "đang xử lý"
     */
    it('TC-011: nên trả về activated=false khi lock bị chiếm và cron chưa xử lý xong', async () => {
      paymentRepository.findByIdOrFail
        .mockResolvedValueOnce(makePayment()) // lần 1: fetch payment gốc
        .mockResolvedValueOnce(makePayment()); // lần 2: re-read sau khi lock bị chiếm

      const result = await service.verifyActivationPayment(USER_ID, PAYMENT_ID);

      expect(result.activated).toBe(false);
      expect(result.message).toContain('đang xử lý');
    });

    /**
     * TC-012: Lock bị chiếm nhưng Cron đã xử lý xong → re-read DB thấy SUCCESS → activated: true
     */
    it('TC-012: nên trả về activated=true khi lock bị chiếm nhưng cron đã SUCCESS', async () => {
      paymentRepository.findByIdOrFail
        .mockResolvedValueOnce(makePayment()) // lần 1: fetch payment gốc
        .mockResolvedValueOnce(makePayment({ status: PaymentStatus.SUCCESS })); // lần 2: cron đã xong

      const result = await service.verifyActivationPayment(USER_ID, PAYMENT_ID);

      expect(result.activated).toBe(true);
    });

    /**
     * TC-013: Lock bị chiếm → không gọi TN App
     */
    it('TC-013: không được gọi TN App khi lock bị chiếm', async () => {
      paymentRepository.findByIdOrFail.mockResolvedValue(makePayment());

      await service.verifyActivationPayment(USER_ID, PAYMENT_ID);

      expect(tnAppService.findTransactionByCode).not.toHaveBeenCalled();
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // E. Redis Lock acquired — Double-check
  // ═══════════════════════════════════════════════════════════════════════════

  describe('E. Redis Lock — acquired, double-check', () => {
    beforeEach(() => {
      redis.set.mockResolvedValue('OK'); // Lock lấy được
    });

    /**
     * TC-014: Sau khi lấy lock, double-check DB thấy SUCCESS (cron vừa xong) → return true, không gọi TN App
     */
    it('TC-014: nên return activated=true ngay và không gọi TN App nếu double-check thấy SUCCESS', async () => {
      paymentRepository.findByIdOrFail
        .mockResolvedValueOnce(makePayment()) // lần 1: check ban đầu
        .mockResolvedValueOnce(makePayment({ status: PaymentStatus.SUCCESS })); // lần 2: double-check sau lock

      const result = await service.verifyActivationPayment(USER_ID, PAYMENT_ID);

      expect(result.activated).toBe(true);
      expect(tnAppService.findTransactionByCode).not.toHaveBeenCalled();
    });

    /**
     * TC-015: Double-check không thấy SUCCESS → tiến hành gọi TN App
     */
    it('TC-015: nên gọi TN App khi double-check thấy payment vẫn PENDING', async () => {
      paymentRepository.findByIdOrFail.mockResolvedValue(makePayment());
      tnAppService.findTransactionByCode.mockResolvedValue({
        found: false,
        transaction: null,
      });

      await service.verifyActivationPayment(USER_ID, PAYMENT_ID);

      expect(tnAppService.findTransactionByCode).toHaveBeenCalledTimes(1);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // F. TN App Integration
  // ═══════════════════════════════════════════════════════════════════════════

  describe('F. TN App Integration', () => {
    beforeEach(() => {
      redis.set.mockResolvedValue('OK');
      paymentRepository.findByIdOrFail.mockResolvedValue(makePayment());
    });

    /**
     * TC-016: TN App trả lỗi → ServiceUnavailableException (503)
     */
    it('TC-016: nên ném ServiceUnavailableException khi TN App trả về error', async () => {
      tnAppService.findTransactionByCode.mockResolvedValue({
        found: false,
        transaction: null,
        error: 'Connection timeout',
      });

      await expect(
        service.verifyActivationPayment(USER_ID, PAYMENT_ID),
      ).rejects.toThrow(ServiceUnavailableException);
    });

    /**
     * TC-017: TN App không tìm thấy giao dịch khớp → activated: false
     */
    it('TC-017: nên trả về activated=false khi TN App không tìm thấy giao dịch', async () => {
      tnAppService.findTransactionByCode.mockResolvedValue({
        found: false,
        transaction: null,
      });

      const result = await service.verifyActivationPayment(USER_ID, PAYMENT_ID);

      expect(result.activated).toBe(false);
      expect(result.message).toBe(
        ErrorMessage[ErrorCode.PAYMENT_VERIFY_NOT_FOUND],
      );
    });

    /**
     * TC-018: TN App tìm thấy giao dịch → update DB + emit event + activated: true
     */
    it('TC-018: nên update DB và emit event khi TN App tìm thấy giao dịch', async () => {
      const tx = makeTnTransaction();
      tnAppService.findTransactionByCode.mockResolvedValue({
        found: true,
        transaction: tx,
        rawResponse: '{}',
      });

      const result = await service.verifyActivationPayment(USER_ID, PAYMENT_ID);

      expect(result.activated).toBe(true);
      expect(dataSource.transaction).toHaveBeenCalledTimes(1);
    });

    /**
     * TC-019: Gọi findTransactionByCode với đúng tham số
     */
    it('TC-019: nên gọi TN App với đúng transactionCode và amount', async () => {
      const payment = makePayment();
      paymentRepository.findByIdOrFail.mockResolvedValue(payment);
      tnAppService.findTransactionByCode.mockResolvedValue({
        found: false,
        transaction: null,
      });

      await service.verifyActivationPayment(USER_ID, PAYMENT_ID);

      expect(tnAppService.findTransactionByCode).toHaveBeenCalledWith(
        payment.vietqrPayload.transactionCode,
        payment.createdAt,
        Number(payment.amount),
      );
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // G. DB Transaction & Event Emit
  // ═══════════════════════════════════════════════════════════════════════════

  describe('G. DB Transaction & Event Emit', () => {
    beforeEach(() => {
      redis.set.mockResolvedValue('OK');
      paymentRepository.findByIdOrFail.mockResolvedValue(makePayment());
    });

    /**
     * TC-020: Sau khi SUCCESS, emit đúng event với đúng payload
     */
    it('TC-020: nên emit PAYMENT_SUCCESS_EVENT với đúng payload sau khi verify thành công', async () => {
      const tx = makeTnTransaction();
      tnAppService.findTransactionByCode.mockResolvedValue({
        found: true,
        transaction: tx,
      });

      await service.verifyActivationPayment(USER_ID, PAYMENT_ID);

      expect(eventEmitter.emit).toHaveBeenCalledWith(PAYMENT_SUCCESS_EVENT, {
        paymentId: PAYMENT_ID,
        transactionId: TRANSACTION_ID,
        userId: USER_ID,
        paymentMethod: PaymentType.ACTIVATION,
      });
    });

    /**
     * TC-021: Không emit event khi TN App không tìm thấy giao dịch
     */
    it('TC-021: không được emit event khi giao dịch chưa được tìm thấy', async () => {
      tnAppService.findTransactionByCode.mockResolvedValue({
        found: false,
        transaction: null,
      });

      await service.verifyActivationPayment(USER_ID, PAYMENT_ID);

      expect(eventEmitter.emit).not.toHaveBeenCalled();
    });

    /**
     * TC-022: Không emit event khi TN App trả lỗi (ServiceUnavailable)
     */
    it('TC-022: không được emit event khi TN App trả lỗi', async () => {
      tnAppService.findTransactionByCode.mockResolvedValue({
        found: false,
        transaction: null,
        error: 'Service down',
      });

      await service
        .verifyActivationPayment(USER_ID, PAYMENT_ID)
        .catch(() => {});

      expect(eventEmitter.emit).not.toHaveBeenCalled();
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // H. Lock Release (finally block)
  // ═══════════════════════════════════════════════════════════════════════════

  describe('H. Lock Release — finally block', () => {
    beforeEach(() => {
      redis.set.mockResolvedValue('OK');
      paymentRepository.findByIdOrFail.mockResolvedValue(makePayment());
    });

    /**
     * TC-023: Lock phải được release dù verify thành công
     */
    it('TC-023: phải release Redis lock sau khi verify thành công', async () => {
      tnAppService.findTransactionByCode.mockResolvedValue({
        found: true,
        transaction: makeTnTransaction(),
      });

      await service.verifyActivationPayment(USER_ID, PAYMENT_ID);

      expect(redis.del).toHaveBeenCalledWith(LOCK_KEY);
    });

    /**
     * TC-024: Lock phải được release dù TN App trả lỗi (ServiceUnavailable)
     */
    it('TC-024: phải release Redis lock ngay cả khi TN App lỗi', async () => {
      tnAppService.findTransactionByCode.mockResolvedValue({
        found: false,
        transaction: null,
        error: 'Timeout',
      });

      await service
        .verifyActivationPayment(USER_ID, PAYMENT_ID)
        .catch(() => {});

      expect(redis.del).toHaveBeenCalledWith(LOCK_KEY);
    });

    /**
     * TC-025: Lock phải được release dù DB transaction throw error
     */
    it('TC-025: phải release Redis lock ngay cả khi DB transaction throw', async () => {
      tnAppService.findTransactionByCode.mockResolvedValue({
        found: true,
        transaction: makeTnTransaction(),
      });
      dataSource.transaction = jest
        .fn()
        .mockRejectedValue(new Error('DB connection lost'));

      await service
        .verifyActivationPayment(USER_ID, PAYMENT_ID)
        .catch(() => {});

      expect(redis.del).toHaveBeenCalledWith(LOCK_KEY);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // I. transactionCode bị thiếu
  // ═══════════════════════════════════════════════════════════════════════════

  describe('I. Missing transactionCode', () => {
    /**
     * TC-026: vietqrPayload không có transactionCode → InternalServerErrorException
     */
    it('TC-026: nên ném InternalServerErrorException khi không có transactionCode trong vietqrPayload', async () => {
      paymentRepository.findByIdOrFail.mockResolvedValue(
        makePayment({ vietqrPayload: {} }), // không có transactionCode
      );
      redis.set.mockResolvedValue('OK');

      await expect(
        service.verifyActivationPayment(USER_ID, PAYMENT_ID),
      ).rejects.toThrow(InternalServerErrorException);
    });

    /**
     * TC-027: transactionCode rỗng → InternalServerErrorException
     */
    it('TC-027: nên ném InternalServerErrorException khi transactionCode là chuỗi rỗng', async () => {
      paymentRepository.findByIdOrFail.mockResolvedValue(
        makePayment({ vietqrPayload: { transactionCode: '' } }),
      );
      redis.set.mockResolvedValue('OK');

      await expect(
        service.verifyActivationPayment(USER_ID, PAYMENT_ID),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });
});

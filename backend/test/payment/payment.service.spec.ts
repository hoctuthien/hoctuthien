import { Test, TestingModule } from '@nestjs/testing';
import {
  ForbiddenException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PaymentService } from '../../src/modules/payment/services/payment.service';
import { PaymentRepository } from '../../src/modules/payment/repositories/payment.repository';
import { SystemConfigService } from '../../src/modules/system-config/services/system-config.service';
import { VietqrService } from '../../src/modules/payment/services/vietqr.service';
import {
  PaymentEntity,
  PaymentType,
} from '../../src/modules/payment/entities/payment.entity';
import { PaymentStatus } from '../../src/common/enums/database.enum';
import {
  ErrorCode,
  ErrorMessage,
} from '../../src/common/enums/error-code.enum';

// ─── Test Data Factory ────────────────────────────────────────────────────────

function makePayment(overrides: Partial<PaymentEntity> = {}): PaymentEntity {
  return {
    id: 'payment-uuid-1',
    userId: 'user-1',
    amount: 10_000,
    currency: 'VND',
    paymentMethod: PaymentType.ACTIVATION,
    status: PaymentStatus.PENDING,
    transactionId: null,
    description: 'KICHHOAT user-1ABC',
    expiredAt: new Date(Date.now() + 15 * 60 * 1000), // còn 15 phút
    vietqrQrDataUrl: 'https://img.vietqr.io/existing-qr',
    vietqrPayload: { transactionCode: 'KICHHOAT user-1ABC' },
    paymentGatewayPayload: {},
    paidAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    ...overrides,
  } as PaymentEntity;
}

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockPaymentRepository = {
  findByIdOrFail: jest.fn(),
  findPendingActivation: jest.fn(),
  expirePayment: jest.fn(),
  createAndSave: jest.fn(),
};

const mockSystemConfigService = {
  findByKey: jest.fn(),
};

const mockVietqrService = {
  generateQrUrl: jest.fn().mockReturnValue('https://img.vietqr.io/new-qr'),
};

// ─── Test Suite ──────────────────────────────────────────────────────────────

describe('PaymentService', () => {
  let service: PaymentService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentService,
        { provide: PaymentRepository, useValue: mockPaymentRepository },
        { provide: SystemConfigService, useValue: mockSystemConfigService },
        { provide: VietqrService, useValue: mockVietqrService },
      ],
    }).compile();

    service = module.get<PaymentService>(PaymentService);
  });

  // ─── findOne() ─────────────────────────────────────────────────────────────

  describe('findOne(id)', () => {
    it('trả về PaymentEntity khi tìm thấy', async () => {
      const payment = makePayment();
      mockPaymentRepository.findByIdOrFail.mockResolvedValue(payment);

      const result = await service.findOne('payment-uuid-1');

      expect(result).toBe(payment);
      expect(mockPaymentRepository.findByIdOrFail).toHaveBeenCalledWith(
        'payment-uuid-1',
        ErrorMessage[ErrorCode.PAYMENT_NOT_FOUND],
      );
    });

    it('ném NotFoundException khi payment không tồn tại', async () => {
      mockPaymentRepository.findByIdOrFail.mockRejectedValue(
        new NotFoundException(ErrorMessage[ErrorCode.PAYMENT_NOT_FOUND]),
      );

      await expect(service.findOne('bad-id')).rejects.toThrow(NotFoundException);
    });
  });

  // ─── generateActivationQr() ───────────────────────────────────────────────

  describe('generateActivationQr(userId)', () => {
    describe('khi đã tồn tại payment PENDING còn trong hạn', () => {
      it('reuse QR cũ, KHÔNG tạo payment mới', async () => {
        const existing = makePayment({
          expiredAt: new Date(Date.now() + 10 * 60 * 1000), // còn 10 phút
        });
        mockPaymentRepository.findPendingActivation.mockResolvedValue(existing);

        const result = await service.generateActivationQr('user-1');

        expect(result).toMatchObject({
          paymentId: existing.id,
          amount: Number(existing.amount),
          transactionCode: existing.vietqrPayload.transactionCode,
          qrUrl: existing.vietqrQrDataUrl,
          expiredAt: existing.expiredAt,
        });
        expect(mockPaymentRepository.createAndSave).not.toHaveBeenCalled();
        expect(mockPaymentRepository.expirePayment).not.toHaveBeenCalled();
      });
    });

    describe('khi payment PENDING đã hết hạn', () => {
      it('expire payment cũ trước, rồi tạo mới', async () => {
        const expired = makePayment({
          expiredAt: new Date(Date.now() - 1_000), // đã quá 1 giây
        });
        const newPayment = makePayment({ id: 'payment-new' });

        mockPaymentRepository.findPendingActivation.mockResolvedValue(expired);
        mockPaymentRepository.expirePayment.mockResolvedValue(undefined);
        mockSystemConfigService.findByKey.mockResolvedValue({ configValue: 10_000 });
        mockPaymentRepository.createAndSave.mockResolvedValue(newPayment);

        const result = await service.generateActivationQr('user-1');

        // Phải expire payment cũ trước
        expect(mockPaymentRepository.expirePayment).toHaveBeenCalledWith(expired.id);
        // Phải tạo payment mới
        expect(mockPaymentRepository.createAndSave).toHaveBeenCalledTimes(1);
        expect(result.paymentId).toBe(newPayment.id);
      });
    });

    describe('khi không có payment PENDING nào', () => {
      beforeEach(() => {
        mockPaymentRepository.findPendingActivation.mockResolvedValue(null);
        mockSystemConfigService.findByKey.mockResolvedValue({ configValue: 10_000 });
        mockPaymentRepository.createAndSave.mockImplementation(async (data) => ({
          ...makePayment(),
          ...data,
          id: 'payment-created',
        }));
      });

      it('tạo payment mới với đúng paymentMethod và status', async () => {
        await service.generateActivationQr('user-1');

        const savedArg = mockPaymentRepository.createAndSave.mock.calls[0][0];
        expect(savedArg.status).toBe(PaymentStatus.PENDING);
        expect(savedArg.paymentMethod).toBe(PaymentType.ACTIVATION);
        expect(savedArg.currency).toBe('VND');
      });

      it('transactionCode bắt đầu bằng "KICHHOAT {userId}"', async () => {
        await service.generateActivationQr('user-42');

        const savedArg = mockPaymentRepository.createAndSave.mock.calls[0][0];
        expect(savedArg.description).toMatch(/^KICHHOAT user-42/);
      });

      it('expiredAt nằm trong khoảng 14–16 phút kể từ bây giờ', async () => {
        const before = Date.now();
        await service.generateActivationQr('user-1');

        const savedArg = mockPaymentRepository.createAndSave.mock.calls[0][0];
        const diffMs = savedArg.expiredAt.getTime() - before;

        expect(diffMs).toBeGreaterThan(14 * 60 * 1000);
        expect(diffMs).toBeLessThan(16 * 60 * 1000);
      });

      it('lưu qrUrl vào vietqrQrDataUrl và vietqrPayload', async () => {
        mockVietqrService.generateQrUrl.mockReturnValue('https://img.vietqr.io/test-qr');
        await service.generateActivationQr('user-1');

        const savedArg = mockPaymentRepository.createAndSave.mock.calls[0][0];
        expect(savedArg.vietqrQrDataUrl).toBe('https://img.vietqr.io/test-qr');
        expect(savedArg.vietqrPayload.qrUrl).toBe('https://img.vietqr.io/test-qr');
      });

      it('amount lấy từ system config', async () => {
        mockSystemConfigService.findByKey.mockResolvedValue({ configValue: 50_000 });
        mockPaymentRepository.createAndSave.mockImplementation(async (data) => ({
          ...makePayment({ amount: data.amount }),
          ...data,
          id: 'payment-created',
        }));

        const result = await service.generateActivationQr('user-1');

        expect(result.amount).toBe(50_000);
      });
    });

    describe('khi system config lỗi (không tìm thấy key)', () => {
      it('fallback về 10.000 VND mặc định', async () => {
        mockPaymentRepository.findPendingActivation.mockResolvedValue(null);
        mockSystemConfigService.findByKey.mockRejectedValue(new Error('Config not found'));
        mockPaymentRepository.createAndSave.mockImplementation(async (data) => ({
          ...makePayment({ amount: data.amount }),
          ...data,
          id: 'payment-fallback',
        }));

        const result = await service.generateActivationQr('user-1');

        const savedArg = mockPaymentRepository.createAndSave.mock.calls[0][0];
        expect(savedArg.amount).toBe(10_000);
        expect(result.amount).toBe(10_000);
      });
    });
  });

  // ─── verifyActivationPayment() ────────────────────────────────────────────

  describe('verifyActivationPayment(userId, paymentId)', () => {
    describe('Trường hợp 1: payment đã SUCCESS (cron đã xử lý)', () => {
      it('trả về { activated: true } và message thành công', async () => {
        const payment = makePayment({ status: PaymentStatus.SUCCESS });
        mockPaymentRepository.findByIdOrFail.mockResolvedValue(payment);

        const result = await service.verifyActivationPayment(
          'user-1',
          'payment-uuid-1',
        );

        expect(result).toEqual({
          activated: true,
          message: ErrorMessage[ErrorCode.PAYMENT_VERIFY_SUCCESS],
        });
      });
    });

    describe('Trường hợp 2: QR hết hạn', () => {
      it('ném UnprocessableEntityException khi expiredAt đã qua', async () => {
        const payment = makePayment({
          status: PaymentStatus.PENDING,
          expiredAt: new Date(Date.now() - 1_000),
        });
        mockPaymentRepository.findByIdOrFail.mockResolvedValue(payment);

        await expect(
          service.verifyActivationPayment('user-1', 'payment-uuid-1'),
        ).rejects.toThrow(UnprocessableEntityException);
      });

      it('ném UnprocessableEntityException khi expiredAt là null', async () => {
        const payment = makePayment({
          status: PaymentStatus.PENDING,
          expiredAt: null,
        });
        mockPaymentRepository.findByIdOrFail.mockResolvedValue(payment);

        await expect(
          service.verifyActivationPayment('user-1', 'payment-uuid-1'),
        ).rejects.toThrow(UnprocessableEntityException);
      });
    });

    describe('Trường hợp 3: PENDING còn trong hạn (đang chờ cron)', () => {
      it('trả về { activated: false } và message chờ đợi', async () => {
        const payment = makePayment({
          status: PaymentStatus.PENDING,
          expiredAt: new Date(Date.now() + 5 * 60 * 1000),
        });
        mockPaymentRepository.findByIdOrFail.mockResolvedValue(payment);

        const result = await service.verifyActivationPayment(
          'user-1',
          'payment-uuid-1',
        );

        expect(result).toEqual({
          activated: false,
          message: ErrorMessage[ErrorCode.PAYMENT_VERIFY_NOT_FOUND],
        });
      });
    });

    describe('Kiểm tra quyền sở hữu payment', () => {
      it('ném ForbiddenException khi userId không phải chủ sở hữu', async () => {
        const payment = makePayment({ userId: 'user-99' });
        mockPaymentRepository.findByIdOrFail.mockResolvedValue(payment);

        await expect(
          service.verifyActivationPayment('user-1', 'payment-uuid-1'),
        ).rejects.toThrow(ForbiddenException);
      });

      it('KHÔNG ném lỗi khi userId khớp với payment.userId', async () => {
        const payment = makePayment({
          userId: 'user-1',
          status: PaymentStatus.PENDING,
          expiredAt: new Date(Date.now() + 5 * 60 * 1000),
        });
        mockPaymentRepository.findByIdOrFail.mockResolvedValue(payment);

        await expect(
          service.verifyActivationPayment('user-1', 'payment-uuid-1'),
        ).resolves.not.toThrow();
      });
    });

    describe('Payment không tồn tại', () => {
      it('ném NotFoundException khi paymentId không hợp lệ', async () => {
        mockPaymentRepository.findByIdOrFail.mockRejectedValue(
          new NotFoundException(ErrorMessage[ErrorCode.PAYMENT_NOT_FOUND]),
        );

        await expect(
          service.verifyActivationPayment('user-1', 'nonexistent-id'),
        ).rejects.toThrow(NotFoundException);
      });
    });
  });
});

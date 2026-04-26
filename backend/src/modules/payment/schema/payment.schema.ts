import { z } from 'zod';
import { PaymentStatus } from '../../../common/enums/database.enum';

// ─── Schema đầy đủ (dùng để parse response trả về client) ───────────────────

export const paymentSchema = z.object({
  id: z.string(),
  userId: z.string(),
  amount: z.number(),
  currency: z.string().max(10).default('VND'),
  paymentMethod: z.string().max(100).nullable().optional(),
  transactionId: z.string().max(255).nullable().optional(),

  // VietQR fields
  description: z.string().max(500).nullable().optional(),
  expiredAt: z.date().nullable().optional(),
  vietqrQrDataUrl: z.string().nullable().optional(),
  vietqrPayload: z.record(z.string(), z.any()).default({}),

  // Generic gateway payload (giữ lại để backward-compatible)
  paymentGatewayPayload: z.record(z.string(), z.any()).default({}),

  paidAt: z.date().nullable().optional(),
  status: z.nativeEnum(PaymentStatus).default(PaymentStatus.PENDING),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable().optional(),
});

// ─── Schema tạo mới payment ──────────────────────────────────────────────────

export const createPaymentSchema = z.object({
  userId: z.string(),
  amount: z.number().positive('Số tiền phải lớn hơn 0'),
  currency: z.string().max(10).optional(),
  paymentMethod: z.string().max(100).optional(),
  description: z.string().max(500).optional(),
  expiredAt: z.date().optional(),
  paymentGatewayPayload: z.record(z.string(), z.any()).optional(),
  vietqrPayload: z.record(z.string(), z.any()).optional(),
  status: z.nativeEnum(PaymentStatus).optional(),
});

// ─── Schema cập nhật payment (tất cả field là optional) ─────────────────────

export const updatePaymentSchema = createPaymentSchema.partial().extend({
  transactionId: z.string().max(255).optional(),
  vietqrQrDataUrl: z.string().optional(),
  paidAt: z.date().optional(),
  status: z.nativeEnum(PaymentStatus).optional(),
});

import { z } from 'zod';
import { PaymentStatus } from '../entities/payment.entity';

export const paymentSchema = z.object({
  id: z.string(),
  userId: z.string(),
  amount: z.number(),
  currency: z.string().max(10).default('VND'),
  paymentMethod: z.string().max(100).nullable().optional(),
  transactionId: z.string().max(255).nullable().optional(),
  paymentGatewayPayload: z.record(z.string(), z.any()).default({}),
  paidAt: z.date().nullable().optional(),
  status: z.nativeEnum(PaymentStatus).default(PaymentStatus.PENDING),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable().optional(),
});

export const createPaymentSchema = z.object({
  userId: z.string(),
  amount: z.number(),
  currency: z.string().max(10).optional(),
  paymentMethod: z.string().max(100).optional(),
  paymentGatewayPayload: z.record(z.string(), z.any()).optional(),
  status: z.nativeEnum(PaymentStatus).optional(),
});

export const updatePaymentSchema = createPaymentSchema.partial().extend({
  transactionId: z.string().max(255).optional(),
  paidAt: z.date().optional(),
});

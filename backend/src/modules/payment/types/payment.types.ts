import { z } from 'zod';
import {
  paymentSchema,
  createPaymentSchema,
  updatePaymentSchema,
} from '../schema/payment.schema';

export type Payment = z.infer<typeof paymentSchema>;
export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;
export type UpdatePaymentInput = z.infer<typeof updatePaymentSchema>;

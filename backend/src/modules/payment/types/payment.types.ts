import { z } from 'zod';
import {
  paymentSchema,
  createPaymentSchema,
  updatePaymentSchema,
} from '../schema/payment.schema';

// ─── Inferred TypeScript types từ Zod schema ────────────────────────────────

/** Shape đầy đủ của một payment record (response) */
export type Payment = z.infer<typeof paymentSchema>;

/** Input để tạo mới payment */
export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;

/** Input để cập nhật một payment (tất cả field optional) */
export type UpdatePaymentInput = z.infer<typeof updatePaymentSchema>;

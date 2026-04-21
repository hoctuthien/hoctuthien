import { z } from 'zod';
import {
  authEntitySchema,
  createAuthInputSchema,
  updateAuthInputSchema,
} from '../schema/auth.schema';

export type AuthData = z.infer<typeof authEntitySchema>;
export type CreateAuthDataInput = z.infer<typeof createAuthInputSchema>;
export type UpdateAuthDataInput = z.infer<typeof updateAuthInputSchema>;

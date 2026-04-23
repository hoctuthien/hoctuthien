import { z } from 'zod';
import {
  userSessionSchema,
  createUserSessionSchema,
  updateUserSessionSchema,
} from '../schema/user-session.schema';

export type UserSession = z.infer<typeof userSessionSchema>;
export type CreateUserSessionInput = z.infer<typeof createUserSessionSchema>;
export type UpdateUserSessionInput = z.infer<typeof updateUserSessionSchema>;

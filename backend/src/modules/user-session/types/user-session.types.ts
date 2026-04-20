import { z } from 'zod';
import {
  createUserSessionSchema,
  updateUserSessionSchema,
  userSessionSchema,
  userSessionStatusSchema,
} from '../schema/user-session.schema';

export type UserSession = z.infer<typeof userSessionSchema>;
export type CreateUserSessionInput = z.infer<typeof createUserSessionSchema>;
export type UpdateUserSessionInput = z.infer<typeof updateUserSessionSchema>;
export type UserSessionStatus = z.infer<typeof userSessionStatusSchema>;
export type UserSessionId = string;

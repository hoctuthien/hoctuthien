import { z } from 'zod';
import {
  userSchema,
  publicUserSchema,
  createUserSchema,
  updateUserSchema,
} from '../schema/user.schema';

export type User = z.infer<typeof userSchema>;
export type PublicUser = z.infer<typeof publicUserSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;

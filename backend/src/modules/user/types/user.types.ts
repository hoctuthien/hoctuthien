import { z } from 'zod';
import {
  createUserSchema,
  googleUserProfileSchema,
  updateUserSchema,
  userRoleSchema,
  userSchema,
  userStatusSchema,
} from '../schema/user.schema';

export type User = z.infer<typeof userSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type GoogleUserProfile = z.infer<typeof googleUserProfileSchema>;

export type UserRole = z.infer<typeof userRoleSchema>;
export type UserStatus = z.infer<typeof userStatusSchema>;

export type UserId = string;

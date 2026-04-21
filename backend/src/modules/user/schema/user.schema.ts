import { z } from 'zod';
import { UserRole } from '../entities/user.entity';

export const userSchema = z.object({
  id: z.string(),
  googleId: z.string().max(255).nullable().optional(),
  name: z.string().max(255),
  email: z.string().email().max(255),
  passwordHash: z.string().max(255).nullable().optional(),
  phone: z.string().max(50).nullable().optional(),
  avatarUrl: z.string().max(500).nullable().optional(),
  dayOfBirth: z.string().nullable().optional(),
  gender: z.string().max(50).nullable().optional(),
  timezone: z.string().max(50).default('UTC'),
  role: z.nativeEnum(UserRole).default(UserRole.MENTEE),
  points: z.number().default(0),
  isVerified: z.boolean().default(false),
  preferences: z.record(z.string(), z.any()).default({}),
  metadata: z.record(z.string(), z.any()).default({}),
  status: z.string().max(50).default('active'),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable().optional(),
});

export const createUserSchema = z.object({
  name: z.string().min(1).max(255),
  email: z.string().email().max(255),
  password: z.string().min(6).max(255).optional(),
  googleId: z.string().max(255).optional(),
  phone: z.string().max(50).optional(),
  avatarUrl: z.string().max(500).optional(),
  dayOfBirth: z.string().optional(),
  gender: z.string().optional(),
  role: z.nativeEnum(UserRole).optional(),
  status: z.string().optional(),
});

export const updateUserSchema = createUserSchema.partial().omit({ password: true }).extend({
  isVerified: z.boolean().optional(),
  points: z.number().optional(),
  preferences: z.record(z.string(), z.any()).optional(),
  metadata: z.record(z.string(), z.any()).optional(),
  timezone: z.string().optional(),
});

import { z } from 'zod';

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
  timezone: z.string().max(50).nullable().optional(),
  role: z.string().max(50),
  points: z.number(),
  isVerified: z.boolean(),
  preferences: z.record(z.string(), z.any()).nullable().optional(),
  metadata: z.record(z.string(), z.any()).nullable().optional(),
  status: z.string().max(50),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable().optional(),
});

export const createUserSchema = z.object({
  name: z.string().min(1).max(255),
  email: z.string().email().max(255),
  password: z.string().min(6).max(255).optional(),
  role: z.string().max(50).default('mentee'),
  status: z.string().max(50).default('active'),
});

export const updateUserSchema = createUserSchema.partial().omit({ password: true }).extend({
  googleId: z.string().max(255).nullable().optional(),
  phone: z.string().max(50).nullable().optional(),
  avatarUrl: z.string().max(500).nullable().optional(),
  dayOfBirth: z.string().nullable().optional(),
  gender: z.string().max(50).nullable().optional(),
  timezone: z.string().max(50).nullable().optional(),
  points: z.number().optional(),
  isVerified: z.boolean().optional(),
  preferences: z.record(z.string(), z.any()).nullable().optional(),
  metadata: z.record(z.string(), z.any()).nullable().optional(),
});

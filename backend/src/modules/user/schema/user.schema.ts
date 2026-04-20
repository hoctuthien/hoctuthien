import { z } from 'zod';

export const userRoleSchema = z.enum(['admin', 'mentor', 'mentee']);
export const userStatusSchema = z.enum(['active', 'inactive', 'banned']);

export const userSchema = z.object({
  id: z.string(),
  googleId: z.string().max(255).nullable().optional(),
  name: z.string().min(1).max(255),
  email: z.email().max(255),
  passwordHash: z.string().max(255).nullable().optional(),
  phone: z.string().max(50).nullable().optional(),
  avatarUrl: z.string().max(500).nullable().optional(),
  dayOfBirth: z.string().nullable().optional(),
  gender: z.string().max(50).nullable().optional(),
  timezone: z.string().max(50).nullable().optional(),
  role: userRoleSchema.default('mentee'),
  points: z.number().int().nonnegative().default(0),
  isVerified: z.boolean().default(false),
  preferences: z.record(z.string(), z.unknown()).nullable().optional(),
  metadata: z.record(z.string(), z.unknown()).nullable().optional(),
  status: userStatusSchema.default('active'),
});

export const createUserSchema = z.object({
  googleId: z.string().max(255).optional(),
  name: z.string().min(1).max(255),
  email: z.email().max(255),
  passwordHash: z.string().max(255).nullable().optional(),
  avatarUrl: z.string().max(500).optional(),
  role: userRoleSchema.optional(),
  isVerified: z.boolean().optional(),
  status: userStatusSchema.optional(),
});

export const updateUserSchema = z
  .object({
    googleId: z.string().max(255),
    name: z.string().min(1).max(255),
    email: z.email().max(255),
    phone: z.string().max(50),
    avatarUrl: z.string().max(500),
    dayOfBirth: z.string(),
    gender: z.string().max(50),
    timezone: z.string().max(50),
    role: userRoleSchema,
    points: z.number().int().nonnegative(),
    isVerified: z.boolean(),
    preferences: z.record(z.string(), z.unknown()),
    metadata: z.record(z.string(), z.unknown()),
    status: userStatusSchema,
  })
  .partial();

export const googleUserProfileSchema = z.object({
  sub: z.string().min(1),
  email: z.email(),
  name: z.string().min(1).max(255),
  picture: z.string().url().optional(),
});


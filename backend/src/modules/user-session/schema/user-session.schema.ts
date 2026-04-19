import { z } from 'zod';

export const userSessionStatusSchema = z.enum(['active', 'revoked']);

export const userSessionSchema = z.object({
  id: z.string(),
  userId: z.string(),
  refreshToken: z.string().max(255),
  deviceName: z.string().max(255).nullable().optional(),
  deviceType: z.string().max(100).nullable().optional(),
  userAgent: z.string().nullable().optional(),
  ipAddress: z.string().nullable().optional(),
  refreshTokenExpiresAt: z.coerce.date(),
  lastUsedAt: z.coerce.date().nullable().optional(),
  revokedAt: z.coerce.date().nullable().optional(),
  metadata: z.record(z.string(), z.unknown()).default({}),
  status: userSessionStatusSchema.default('active'),
});

export const createUserSessionSchema = z.object({
  userId: z.string().min(1),
  refreshToken: z.string().max(255),
  deviceName: z.string().max(255).optional(),
  deviceType: z.string().max(100).optional(),
  userAgent: z.string().optional(),
  ipAddress: z.string().optional(),
  refreshTokenExpiresAt: z.coerce.date(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  status: userSessionStatusSchema.optional(),
});

export const updateUserSessionSchema = z.object({
  refreshToken: z.string().max(255).optional(),
  deviceName: z.string().max(255).nullable().optional(),
  deviceType: z.string().max(100).nullable().optional(),
  userAgent: z.string().nullable().optional(),
  ipAddress: z.string().nullable().optional(),
  refreshTokenExpiresAt: z.coerce.date().optional(),
  lastUsedAt: z.coerce.date().nullable().optional(),
  revokedAt: z.coerce.date().nullable().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  status: userSessionStatusSchema.optional(),
});

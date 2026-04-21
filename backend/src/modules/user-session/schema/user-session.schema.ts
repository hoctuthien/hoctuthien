import { z } from 'zod';

export const userSessionSchema = z.object({
  id: z.string(),
  userId: z.string(),
  refreshToken: z.string(),
  deviceName: z.string().max(255).nullable().optional(),
  deviceType: z.string().max(100).nullable().optional(),
  userAgent: z.string().nullable().optional(),
  ipAddress: z.string().nullable().optional(),
  refreshTokenExpiresAt: z.date(),
  lastUsedAt: z.date().nullable().optional(),
  revokedAt: z.date().nullable().optional(),
  metadata: z.record(z.string(), z.any()).default({}),
  status: z.string().max(50).default('active'),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable().optional(),
});

export const createUserSessionSchema = z.object({
  userId: z.string(),
  refreshToken: z.string(),
  deviceName: z.string().max(255).optional(),
  deviceType: z.string().max(100).optional(),
  userAgent: z.string().optional(),
  ipAddress: z.string().optional(),
  refreshTokenExpiresAt: z.date(),
  metadata: z.record(z.string(), z.any()).optional(),
  status: z.string().optional(),
});

export const updateUserSessionSchema = createUserSessionSchema.partial().extend({
  lastUsedAt: z.date().optional(),
  revokedAt: z.date().optional(),
});

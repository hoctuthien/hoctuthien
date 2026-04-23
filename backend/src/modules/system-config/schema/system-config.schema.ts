import { z } from 'zod';

export const systemConfigSchema = z.object({
  id: z.string(),
  configKey: z.string().max(255),
  configValue: z.any(),
  description: z.string().nullable().optional(),
  createdBy: z.string().nullable().optional(),
  status: z.string().max(50).default('active'),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable().optional(),
});

export const createSystemConfigSchema = z.object({
  configKey: z.string().min(1).max(255),
  configValue: z.any(),
  description: z.string().optional(),
  createdBy: z.string().optional(),
  status: z.string().optional(),
});

export const updateSystemConfigSchema = createSystemConfigSchema.partial();

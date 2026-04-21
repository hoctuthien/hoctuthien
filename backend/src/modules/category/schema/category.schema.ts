import { z } from 'zod';

export const categorySchema = z.object({
  id: z.string(),
  name: z.string().max(255),
  slug: z.string().max(255).nullable().optional(),
  iconUrl: z.string().max(500).nullable().optional(),
  metadata: z.record(z.string(), z.any()).default({}),
  status: z.string().max(50).default('active'),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable().optional(),
});

export const createCategorySchema = z.object({
  name: z.string().min(1).max(255),
  slug: z.string().max(255).optional(),
  iconUrl: z.string().max(500).optional(),
  metadata: z.record(z.string(), z.any()).optional(),
  status: z.string().optional(),
});

export const updateCategorySchema = createCategorySchema.partial();

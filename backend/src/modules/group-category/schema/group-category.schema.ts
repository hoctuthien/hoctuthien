import { z } from 'zod';
import { categorySchema } from '../../category/schema/category.schema';

export const groupCategorySchema = z.object({
  id: z.string().uuid(),
  name: z.string().max(255),
  slug: z.string().max(255).nullable().optional(),
  status: z.string().max(50).default('ACTIVE'),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable().optional(),
  categories: z.array(categorySchema).optional(),
});

export const createGroupCategorySchema = z.object({
  name: z.string().min(1).max(255),
  slug: z.string().max(255).optional(),
  status: z.string().optional(),
});

export const updateGroupCategorySchema = createGroupCategorySchema.partial();

export const findGroupCategoriesQuerySchema = z.object({
  name: z.string().optional(),
  slug: z.string().optional(),
  status: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

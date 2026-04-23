import { z } from 'zod';

export const courseCategorySchema = z.object({
  id: z.string(),
  courseId: z.string(),
  categoryId: z.string(),
  status: z.string().max(50).default('active'),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable().optional(),
});

export const createCourseCategorySchema = z.object({
  courseId: z.string(),
  categoryId: z.string(),
  status: z.string().optional(),
});

export const updateCourseCategorySchema = createCourseCategorySchema.partial();

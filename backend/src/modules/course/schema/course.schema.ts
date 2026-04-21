import { z } from 'zod';

export const courseSchema = z.object({
  id: z.string(),
  name: z.string().max(255),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable().optional(),
});

export const createCourseSchema = z.object({
  name: z.string().min(1).max(255),
});

export const updateCourseSchema = createCourseSchema.partial();

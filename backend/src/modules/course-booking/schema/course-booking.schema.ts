import { z } from 'zod';

export const courseBookingSchema = z.object({
  id: z.string(),
  name: z.string().max(255),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable().optional(),
});

export const createCourseBookingSchema = z.object({
  name: z.string().min(1).max(255),
});

export const updateCourseBookingSchema = createCourseBookingSchema.partial();

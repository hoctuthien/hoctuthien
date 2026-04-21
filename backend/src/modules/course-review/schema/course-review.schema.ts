import { z } from 'zod';

export const courseReviewSchema = z.object({
  id: z.string(),
  courseBookingId: z.string(),
  courseId: z.string(),
  reviewerId: z.string(),
  rating: z.number().min(1).max(5),
  comment: z.string().nullable().optional(),
  metadata: z.record(z.string(), z.any()).default({}),
  status: z.string().max(50).default('active'),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable().optional(),
});

export const createCourseReviewSchema = z.object({
  courseBookingId: z.string(),
  courseId: z.string(),
  reviewerId: z.string(),
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
  status: z.string().optional(),
});

export const updateCourseReviewSchema = createCourseReviewSchema.partial();

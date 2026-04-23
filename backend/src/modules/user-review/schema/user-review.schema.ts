import { z } from 'zod';

export const userReviewSchema = z.object({
  id: z.string(),
  courseBookingId: z.string(),
  reviewerId: z.string(),
  reviewedId: z.string(),
  rating: z.number().min(1).max(5),
  comment: z.string().nullable().optional(),
  type: z.string().max(50).nullable().optional(),
  status: z.string().max(50).default('active'),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable().optional(),
});

export const createUserReviewSchema = z.object({
  courseBookingId: z.string(),
  reviewerId: z.string(),
  reviewedId: z.string(),
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
  type: z.string().max(50).optional(),
  status: z.string().optional(),
});

export const updateUserReviewSchema = createUserReviewSchema.partial();

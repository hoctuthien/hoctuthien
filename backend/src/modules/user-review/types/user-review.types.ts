import { z } from 'zod';
import {
  userReviewSchema,
  createUserReviewSchema,
  updateUserReviewSchema,
} from '../schema/user-review.schema';

export type UserReview = z.infer<typeof userReviewSchema>;
export type CreateUserReviewInput = z.infer<typeof createUserReviewSchema>;
export type UpdateUserReviewInput = z.infer<typeof updateUserReviewSchema>;

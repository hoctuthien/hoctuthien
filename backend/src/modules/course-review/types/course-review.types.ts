import { z } from 'zod';
import {
  courseReviewSchema,
  createCourseReviewSchema,
  updateCourseReviewSchema,
} from '../schema/course-review.schema';

export type CourseReview = z.infer<typeof courseReviewSchema>;
export type CreateCourseReviewInput = z.infer<typeof createCourseReviewSchema>;
export type UpdateCourseReviewInput = z.infer<typeof updateCourseReviewSchema>;

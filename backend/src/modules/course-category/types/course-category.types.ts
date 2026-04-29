import { z } from 'zod';
import {
  courseCategorySchema,
  createCourseCategorySchema,
  updateCourseCategorySchema,
} from '../schema/course-category.schema';

export type CourseCategory = z.infer<typeof courseCategorySchema>;
export type CreateCourseCategoryInput = z.infer<
  typeof createCourseCategorySchema
>;
export type UpdateCourseCategoryInput = z.infer<
  typeof updateCourseCategorySchema
>;

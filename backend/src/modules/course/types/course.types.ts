import { z } from 'zod';
import {
  courseSchema,
  createCourseSchema,
  updateCourseSchema,
  approveCourseSchema,
  FindCoursesQuery,
} from '../schema/course.schema';

export type Course = z.infer<typeof courseSchema>;
export type CreateCourseInput = z.infer<typeof createCourseSchema>;
export type UpdateCourseInput = z.infer<typeof updateCourseSchema>;
export type ApproveCourseInput = z.infer<typeof approveCourseSchema>;
export type { FindCoursesQuery };

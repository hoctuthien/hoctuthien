import { z } from 'zod';
import {
  courseBookingSchema,
  createCourseBookingSchema,
  updateCourseBookingSchema,
} from '../schema/course-booking.schema';

export type CourseBooking = z.infer<typeof courseBookingSchema>;
export type CreateCourseBookingInput = z.infer<typeof createCourseBookingSchema>;
export type UpdateCourseBookingInput = z.infer<typeof updateCourseBookingSchema>;

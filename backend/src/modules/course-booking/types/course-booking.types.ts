import { z } from 'zod';
import {
  courseBookingSchema,
  createCourseBookingSchema,
  updateCourseBookingSchema,
  updateCourseBookingByMenteeSchema,
  findCourseBookingsQuerySchema,
} from '../schema/course-booking.schema';

export type CourseBooking = z.infer<typeof courseBookingSchema>;
export type CreateCourseBookingInput = z.infer<
  typeof createCourseBookingSchema
>;
export type UpdateCourseBookingInput = z.infer<
  typeof updateCourseBookingSchema
>;
export type UpdateCourseBookingByMenteeInput = z.infer<
  typeof updateCourseBookingByMenteeSchema
>;
export type FindCourseBookingsQuery = z.infer<
  typeof findCourseBookingsQuerySchema
>;

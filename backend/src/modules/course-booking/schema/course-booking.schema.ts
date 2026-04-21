import { z } from 'zod';
import { BookingStatus } from '../entities/course-booking.entity';

export const courseBookingSchema = z.object({
  id: z.string(),
  courseId: z.string(),
  menteeId: z.string(),
  meetingTime: z.date(),
  googleMeetUrl: z.string().max(500).nullable().optional(),
  calendarEventId: z.string().max(255).nullable().optional(),
  notesForMentor: z.string().nullable().optional(),
  cancellationReason: z.string().nullable().optional(),
  metadata: z.record(z.string(), z.any()).default({}),
  status: z.nativeEnum(BookingStatus).default(BookingStatus.PENDING),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable().optional(),
});

export const createCourseBookingSchema = z.object({
  courseId: z.string(),
  menteeId: z.string(),
  meetingTime: z.date(),
  notesForMentor: z.string().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
  status: z.nativeEnum(BookingStatus).optional(),
});

export const updateCourseBookingSchema = createCourseBookingSchema.partial().extend({
  googleMeetUrl: z.string().max(500).optional(),
  calendarEventId: z.string().max(255).optional(),
  cancellationReason: z.string().optional(),
});

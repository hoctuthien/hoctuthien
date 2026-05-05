import { z } from 'zod';
import { BookingStatus } from '../entities/course-booking.entity';

export const courseBookingSchema = z.object({
  id: z.string(),
  courseId: z.string(),
  menteeId: z.string(),
  paymentId: z.string().nullable().optional(),
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

// menteeId lấy từ JWT, không cho client tự truyền
export const createCourseBookingSchema = z.object({
  courseId: z.string(),
  meetingTime: z.coerce.date(),
  notesForMentor: z.string().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

// MENTEE chỉ được cập nhật notes và cancel
export const updateCourseBookingByMenteeSchema = z.object({
  notesForMentor: z.string().optional(),
  cancellationReason: z.string().optional(),
  status: z.enum([BookingStatus.CANCELLED]).optional(),
});

// MENTOR/ADMIN được cập nhật đầy đủ hơn
export const updateCourseBookingSchema = z.object({
  meetingTime: z.coerce.date().optional(),
  googleMeetUrl: z.string().max(500).optional(),
  calendarEventId: z.string().max(255).optional(),
  notesForMentor: z.string().optional(),
  cancellationReason: z.string().optional(),
  paymentId: z.string().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
  status: z.nativeEnum(BookingStatus).optional(),
});

export const findCourseBookingsQuerySchema = z.object({
  courseId: z.string().optional(),
  menteeId: z.string().optional(),
  status: z.nativeEnum(BookingStatus).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

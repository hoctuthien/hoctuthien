import { z } from 'zod';
import { BookingStatus } from '../entities/course-booking.entity';

export const courseBookingSchema = z.object({
  id: z.string(),
  courseId: z.string(),
  menteeId: z.string(),
  paymentId: z.string().nullable().optional(),
  meetingTime: z.coerce.date(),
  googleMeetUrl: z.string().max(500).nullable().optional(),
  calendarEventId: z.string().max(255).nullable().optional(),
  notesForMentor: z.string().nullable().optional(),
  cancellationReason: z.string().nullable().optional(),
  metadata: z.record(z.string(), z.any()).default({}),
  status: z.nativeEnum(BookingStatus).default(BookingStatus.PENDING),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  deletedAt: z.coerce.date().nullable().optional(),
  
  // Relations mapped optionally
  course: z.object({
    id: z.string(),
    title: z.string(),
    thumbnailUrl: z.string().nullable().optional(),
    price: z.coerce.number().optional(),
    mentorId: z.string().optional(),
    mentor: z.object({
      id: z.string(),
      name: z.string(),
      email: z.string().optional(),
      avatarUrl: z.string().nullable().optional(),
    }).optional(),
  }).optional(),
  
  mentee: z.object({
    id: z.string(),
    name: z.string(),
    email: z.string().optional(),
    avatarUrl: z.string().nullable().optional(),
  }).optional(),
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
  notesForMentor: z.string().nullable().optional(),
  cancellationReason: z.string().nullable().optional(),
  status: z.enum([BookingStatus.CANCELLED]).optional(),
});

// MENTOR/ADMIN được cập nhật đầy đủ hơn
export const updateCourseBookingSchema = z.object({
  meetingTime: z.coerce.date().optional(),
  googleMeetUrl: z.string().max(500).nullable().optional(),
  calendarEventId: z.string().max(255).nullable().optional(),
  notesForMentor: z.string().nullable().optional(),
  cancellationReason: z.string().nullable().optional(),
  paymentId: z.string().nullable().optional(),
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

export const checkConflictQuerySchema = z.object({
  meetingTime: z.coerce.date(),
  courseId: z.string(),
});

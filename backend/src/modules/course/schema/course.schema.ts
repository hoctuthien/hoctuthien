import { z } from 'zod';
import { CourseStatus } from '../enums/course-status.enum';

export const courseSchema = z.object({
  id: z.string(),
  mentorId: z.string(),
  approvedBy: z.string().nullable().optional(),
  title: z.string().max(255),
  description: z.string().nullable().optional(),
  thumbnailUrl: z.string().max(500).nullable().optional(),
  price: z.number(),
  durationMinutes: z.number().default(60),
  prerequisites: z.array(z.string()).default([]),
  metadata: z.record(z.string(), z.any()).default({}),
  status: z.nativeEnum(CourseStatus).default(CourseStatus.DRAFT),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable().optional(),
});

export const createCourseSchema = z.object({
  title: z.string().min(1).max(255),
  price: z.number().min(0),
  durationMinutes: z.number().min(15).optional(),

  // Logic Lịch Dạy (Slot) được bổ sung:
  metadata: z.record(z.string(), z.any()).optional(),
  status: z.nativeEnum(CourseStatus).optional(),
  categoryIds: z.array(z.string()).optional(),
});

// Schema cho Mentor cập nhật khóa học - không cho phép tự set approvedBy
export const updateCourseSchema = createCourseSchema.partial();

// Schema riêng chỉ dành cho ADMIN duyệt khóa học
export const approveCourseSchema = z.object({
  approvedBy: z.string(),
  status: z.nativeEnum(CourseStatus),
});

// Schema truy vấn danh sách khóa học có phân trang & bộ lọc
import { paginationQuerySchema } from '../../../common/utils/pagination.util';

export const findCoursesQuerySchema = paginationQuerySchema.extend({
  title: z.string().optional(),
  status: z.nativeEnum(CourseStatus).optional(),
  mentorId: z.string().optional(),
});

export type CreateCourseInput = z.infer<typeof createCourseSchema>;
export type UpdateCourseInput = z.infer<typeof updateCourseSchema>;
export type ApproveCourseInput = z.infer<typeof approveCourseSchema>;
export type FindCoursesQuery = z.infer<typeof findCoursesQuerySchema>;

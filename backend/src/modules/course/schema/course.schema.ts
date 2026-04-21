import { z } from 'zod';

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
  status: z.string().max(50).default('active'),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable().optional(),
});

export const createCourseSchema = z.object({
  mentorId: z.string(),
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  thumbnailUrl: z.string().max(500).optional(),
  price: z.number(),
  durationMinutes: z.number().optional(),
  prerequisites: z.array(z.string()).optional(),
  metadata: z.record(z.string(), z.any()).optional(),
  status: z.string().optional(),
});

export const updateCourseSchema = createCourseSchema.partial().extend({
  approvedBy: z.string().optional(),
});

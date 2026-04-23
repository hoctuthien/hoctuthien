import { z } from 'zod';

export const mentorAvailabilitySchema = z.object({
  id: z.string(),
  mentorId: z.string(),
  approvedBy: z.string().nullable().optional(),
  dayOfWeek: z.number().min(0).max(6),
  startTime: z.string(),
  endTime: z.string(),
  isActive: z.boolean().default(true),
  status: z.string().max(50).default('active'),
  note: z.string().max(500).nullable().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable().optional(),
});

export const createMentorAvailabilitySchema = z.object({
  mentorId: z.string(),
  dayOfWeek: z.number().min(0).max(6),
  startTime: z.string(),
  endTime: z.string(),
  isActive: z.boolean().optional(),
  note: z.string().max(500).optional(),
  status: z.string().optional(),
});

export const updateMentorAvailabilitySchema = createMentorAvailabilitySchema.partial().extend({
  approvedBy: z.string().optional(),
});

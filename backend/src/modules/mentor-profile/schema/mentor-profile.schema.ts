import { z } from 'zod';

export const mentorProfileSchema = z.object({
  id: z.string(),
  userId: z.string(),
  jobTitle: z.string().max(255).nullable().optional(),
  company: z.string().max(255).nullable().optional(),
  bio: z.string().nullable().optional(),
  linkedinUrl: z.string().max(500).nullable().optional(),
  yearsOfExperience: z.number().nullable().optional(),
  skills: z.array(z.string()).default([]),
  averageRating: z.number().default(0),
  totalStudents: z.number().default(0),
  isApproved: z.boolean().default(false),
  approvedBy: z.string().nullable().optional(),
  metadata: z.record(z.string(), z.any()).default({}),
  status: z.string().max(50).default('active'),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable().optional(),
});

export const createMentorProfileSchema = z.object({
  userId: z.string(),
  jobTitle: z.string().max(255).optional(),
  company: z.string().max(255).optional(),
  bio: z.string().optional(),
  linkedinUrl: z.string().max(500).optional(),
  yearsOfExperience: z.number().optional(),
  skills: z.array(z.string()).optional(),
  metadata: z.record(z.string(), z.any()).optional(),
  status: z.string().optional(),
});

export const updateMentorProfileSchema = createMentorProfileSchema
  .partial()
  .extend({
    isApproved: z.boolean().optional(),
    approvedBy: z.string().optional(),
    averageRating: z.number().optional(),
    totalStudents: z.number().optional(),
  });

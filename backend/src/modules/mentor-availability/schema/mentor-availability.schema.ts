import { z } from 'zod';

import { MentorAvailabilityStatus } from '../../../common/enums/mentor-availability-status.enum';

export const mentorAvailabilitySchema = z.object({
  id: z.string(),
  mentorId: z.string(),
  approvedBy: z.string().nullable().optional(),
  jobTitle: z.string().max(255).nullable().optional(),
  company: z.string().max(255).nullable().optional(),
  bio: z.string().nullable().optional(),
  linkedinUrl: z.string().max(500).nullable().optional(),
  yearsOfExperience: z.number().nullable().optional(),
  skills: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
  metadata: z.record(z.string(), z.any()).default({}),
  status: z
    .nativeEnum(MentorAvailabilityStatus)
    .default(MentorAvailabilityStatus.PENDING),
  note: z.string().max(500).nullable().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable().optional(),
});

export const createMentorAvailabilitySchema = z.object({
  jobTitle: z.string().max(255).optional(),
  company: z.string().max(255).optional(),
  bio: z.string().optional(),
  linkedinUrl: z.string().max(500).optional(),
  yearsOfExperience: z.number().optional(),
  skills: z.array(z.string()).optional(),
  metadata: z.object({
    certificates: z.array(
      z.object({
        name: z.string(),
        issuedBy: z.string().optional(),
        imageUrl: z.string().url('Certificate image URL is required'),
      }),
    ),
    degrees: z.array(
      z.object({
        name: z.string(),
        university: z.string().optional(),
        imageUrl: z.string().url('Degree image URL is required'),
      }),
    ),
  }),
  note: z.string().max(500).optional(),
});

export const updateMentorAvailabilitySchema = createMentorAvailabilitySchema
  .partial()
  .extend({
    status: z.nativeEnum(MentorAvailabilityStatus).optional(),
    approvedBy: z.string().optional(),
    isActive: z.boolean().optional(),
  });

export const updateMentorAvailabilityStatusSchema = z.object({
  status: z.enum([
    MentorAvailabilityStatus.IN_PROGRESS,
    MentorAvailabilityStatus.APPROVED,
    MentorAvailabilityStatus.REJECTED,
    MentorAvailabilityStatus.CANCEL,
  ]),
  note: z.string().max(500).optional(),
});

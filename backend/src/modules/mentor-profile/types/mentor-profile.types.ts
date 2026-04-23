import { z } from 'zod';
import {
  mentorProfileSchema,
  createMentorProfileSchema,
  updateMentorProfileSchema,
} from '../schema/mentor-profile.schema';

export type MentorProfile = z.infer<typeof mentorProfileSchema>;
export type CreateMentorProfileInput = z.infer<typeof createMentorProfileSchema>;
export type UpdateMentorProfileInput = z.infer<typeof updateMentorProfileSchema>;

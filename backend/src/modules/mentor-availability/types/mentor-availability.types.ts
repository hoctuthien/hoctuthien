import { z } from 'zod';
import {
  mentorAvailabilitySchema,
  createMentorAvailabilitySchema,
  updateMentorAvailabilitySchema,
} from '../schema/mentor-availability.schema';

export type MentorAvailability = z.infer<typeof mentorAvailabilitySchema>;
export type CreateMentorAvailabilityInput = z.infer<typeof createMentorAvailabilitySchema>;
export type UpdateMentorAvailabilityInput = z.infer<typeof updateMentorAvailabilitySchema>;

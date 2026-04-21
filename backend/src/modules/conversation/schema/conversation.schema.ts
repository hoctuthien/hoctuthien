import { z } from 'zod';

export const conversationSchema = z.object({
  id: z.string(),
  mentorId: z.string(),
  menteeId: z.string(),
  metadata: z.record(z.string(), z.any()).default({}),
  status: z.string().max(50).default('active'),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable().optional(),
});

export const createConversationSchema = z.object({
  mentorId: z.string(),
  menteeId: z.string(),
  metadata: z.record(z.string(), z.any()).optional(),
  status: z.string().optional(),
});

export const updateConversationSchema = createConversationSchema.partial();

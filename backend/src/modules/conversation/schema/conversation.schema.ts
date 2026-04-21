import { z } from 'zod';

export const conversationSchema = z.object({
  id: z.string(),
  name: z.string().max(255),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable().optional(),
});

export const createConversationSchema = z.object({
  name: z.string().min(1).max(255),
});

export const updateConversationSchema = createConversationSchema.partial();

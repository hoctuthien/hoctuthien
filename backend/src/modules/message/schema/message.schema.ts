import { z } from 'zod';

export const messageSchema = z.object({
  id: z.string(),
  conversationId: z.string(),
  senderId: z.string(),
  content: z.string(),
  attachments: z.array(z.any()).default([]),
  isRead: z.boolean().default(false),
  status: z.string().max(50).default('active'),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable().optional(),
});

export const createMessageSchema = z.object({
  conversationId: z.string(),
  senderId: z.string(),
  content: z.string().min(1),
  attachments: z.array(z.any()).optional(),
  status: z.string().optional(),
});

export const updateMessageSchema = z.object({
  isRead: z.boolean().optional(),
  status: z.string().optional(),
});

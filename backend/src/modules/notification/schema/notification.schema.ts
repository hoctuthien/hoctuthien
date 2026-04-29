import { z } from 'zod';

export const notificationSchema = z.object({
  id: z.string(),
  userId: z.string(),
  title: z.string().max(255),
  content: z.string(),
  type: z.string().max(100),
  actionLink: z.string().max(500).nullable().optional(),
  payload: z.record(z.string(), z.any()).default({}),
  isRead: z.boolean().default(false),
  status: z.string().max(50).default('active'),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable().optional(),
});

export const createNotificationSchema = z.object({
  userId: z.string(),
  title: z.string().min(1).max(255),
  content: z.string().min(1),
  type: z.string().max(100),
  actionLink: z.string().max(500).optional(),
  payload: z.record(z.string(), z.any()).optional(),
  status: z.string().optional(),
});

export const updateNotificationSchema = createNotificationSchema
  .partial()
  .extend({
    isRead: z.boolean().optional(),
  });

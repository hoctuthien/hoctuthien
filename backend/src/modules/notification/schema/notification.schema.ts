import { z } from 'zod';

export const notificationSchema = z.object({
  id: z.string(),
  name: z.string().max(255),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable().optional(),
});

export const createNotificationSchema = z.object({
  name: z.string().min(1).max(255),
});

export const updateNotificationSchema = createNotificationSchema.partial();

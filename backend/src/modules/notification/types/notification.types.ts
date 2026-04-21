import { z } from 'zod';
import {
  notificationSchema,
  createNotificationSchema,
  updateNotificationSchema,
} from '../schema/notification.schema';

export type Notification = z.infer<typeof notificationSchema>;
export type CreateNotificationInput = z.infer<typeof createNotificationSchema>;
export type UpdateNotificationInput = z.infer<typeof updateNotificationSchema>;

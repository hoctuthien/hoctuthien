import { z } from 'zod';
import {
  messageSchema,
  createMessageSchema,
  updateMessageSchema,
} from '../schema/message.schema';

export type Message = z.infer<typeof messageSchema>;
export type CreateMessageInput = z.infer<typeof createMessageSchema>;
export type UpdateMessageInput = z.infer<typeof updateMessageSchema>;

import { z } from 'zod';
import {
  conversationSchema,
  createConversationSchema,
  updateConversationSchema,
} from '../schema/conversation.schema';

export type Conversation = z.infer<typeof conversationSchema>;
export type CreateConversationInput = z.infer<typeof createConversationSchema>;
export type UpdateConversationInput = z.infer<typeof updateConversationSchema>;

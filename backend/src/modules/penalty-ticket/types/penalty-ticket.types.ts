import { z } from 'zod';
import {
  penaltyTicketSchema,
  createPenaltyTicketSchema,
  updatePenaltyTicketSchema,
} from '../schema/penalty-ticket.schema';

export type PenaltyTicket = z.infer<typeof penaltyTicketSchema>;
export type CreatePenaltyTicketInput = z.infer<
  typeof createPenaltyTicketSchema
>;
export type UpdatePenaltyTicketInput = z.infer<
  typeof updatePenaltyTicketSchema
>;

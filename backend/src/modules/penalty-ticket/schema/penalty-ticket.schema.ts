import { z } from 'zod';

export const penaltyTicketSchema = z.object({
  id: z.string(),
  userId: z.string(),
  reason: z.string(),
  pointsDeducted: z.number().default(0),
  evidenceUrl: z.string().max(500).nullable().optional(),
  metadata: z.record(z.string(), z.any()).default({}),
  status: z.string().max(50).default('active'),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable().optional(),
});

export const createPenaltyTicketSchema = z.object({
  userId: z.string(),
  reason: z.string().min(1),
  pointsDeducted: z.number().optional(),
  evidenceUrl: z.string().max(500).optional(),
  metadata: z.record(z.string(), z.any()).optional(),
  status: z.string().optional(),
});

export const updatePenaltyTicketSchema = createPenaltyTicketSchema.partial();

import { z } from 'zod';
import { PenaltyTicketStatus } from '../entities/penalty-ticket.entity';

export const penaltyTicketSchema = z.object({
  id: z.string(),
  userId: z.string(),
  reportedById: z.string().nullable().optional(),
  updatedBy: z.string().nullable().optional(),
  reason: z.string(),
  pointsDeducted: z.number().default(0),
  evidenceUrl: z.string().max(500).nullable().optional(),
  metadata: z.record(z.string(), z.any()).default({}),
  status: z.nativeEnum(PenaltyTicketStatus).default(PenaltyTicketStatus.PENDING),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable().optional(),
});

export const createPenaltyTicketSchema = z.object({
  userId: z.string(),
  reportedById: z.string().optional(),
  reason: z.string().min(1),
  pointsDeducted: z.number().optional(),
  evidenceUrl: z.string().max(500).optional(),
  metadata: z.record(z.string(), z.any()).optional(),
  status: z.nativeEnum(PenaltyTicketStatus).optional(),
});

export const updatePenaltyTicketSchema = z.object({
  userId: z.string().optional(),
  reportedById: z.string().optional(),
  updatedBy: z.string().optional(),
  reason: z.string().min(1).optional(),
  pointsDeducted: z.number().optional(),
  evidenceUrl: z.string().max(500).optional(),
  metadata: z.record(z.string(), z.any()).optional(),
  status: z.nativeEnum(PenaltyTicketStatus).optional(),
});

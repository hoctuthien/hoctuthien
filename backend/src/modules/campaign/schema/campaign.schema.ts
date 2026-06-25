import { z } from 'zod';
import { CampaignStatus } from '../entities/campaign.entity';

export const campaignSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable().optional(),
  thumbnailUrl: z.string().nullable().optional(),
  targetAmount: z.coerce.number(),
  raisedAmount: z.coerce.number(),
  startDate: z.coerce.date().nullable().optional(),
  endDate: z.coerce.date().nullable().optional(),
  createdBy: z.string().nullable().optional(),
  metadata: z.record(z.string(), z.any()).default({}),
  status: z.nativeEnum(CampaignStatus),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  deletedAt: z.coerce.date().nullable().optional(),
});

export const createCampaignSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().nullable().optional(),
  thumbnailUrl: z.string().max(500).nullable().optional(),
  targetAmount: z.number().min(0).default(0),
  startDate: z.coerce.date().nullable().optional(),
  endDate: z.coerce.date().nullable().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
  status: z.nativeEnum(CampaignStatus).optional(),
});

export const updateCampaignSchema = createCampaignSchema.partial().extend({
  raisedAmount: z.number().min(0).optional(),
});

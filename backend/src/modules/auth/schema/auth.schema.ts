import { z } from 'zod';

export const authEntitySchema = z.object({
  id: z.string(),
  name: z.string().max(255),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable().optional(),
});

export const createAuthInputSchema = z.object({
  name: z.string().min(1).max(255),
});

export const updateAuthInputSchema = createAuthInputSchema.partial();

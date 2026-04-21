import { z } from 'zod';
import {
  systemConfigSchema,
  createSystemConfigSchema,
  updateSystemConfigSchema,
} from '../schema/system-config.schema';

export type SystemConfig = z.infer<typeof systemConfigSchema>;
export type CreateSystemConfigInput = z.infer<typeof createSystemConfigSchema>;
export type UpdateSystemConfigInput = z.infer<typeof updateSystemConfigSchema>;

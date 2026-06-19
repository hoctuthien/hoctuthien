import { z } from 'zod';
import {
  bugReportSchema,
  createBugReportSchema,
  updateBugReportSchema,
} from '../schema/bug-report.schema';

export type BugReport = z.infer<typeof bugReportSchema>;
export type CreateBugReportInput = z.infer<typeof createBugReportSchema>;
export type UpdateBugReportInput = z.infer<typeof updateBugReportSchema>;

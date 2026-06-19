import { z } from 'zod';
import { BugReportSeverity, BugReportStatus } from '../entities/bug-report.entity';

export const bugReportSchema = z.object({
  id: z.string(),
  userId: z.string().nullable().optional(),
  title: z.string().min(1).max(255),
  description: z.string().min(1),
  stepsToReproduce: z.string().nullable().optional(),
  severity: z.nativeEnum(BugReportSeverity).default(BugReportSeverity.MEDIUM),
  status: z.nativeEnum(BugReportStatus).default(BugReportStatus.OPEN),
  deviceInfo: z.record(z.string(), z.any()).nullable().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  deletedAt: z.coerce.date().nullable().optional(),
});

export const createBugReportSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().min(1),
  stepsToReproduce: z.string().optional(),
  severity: z.nativeEnum(BugReportSeverity).optional(),
  deviceInfo: z.record(z.string(), z.any()).optional(),
});

export const updateBugReportSchema = z.object({
  severity: z.nativeEnum(BugReportSeverity).optional(),
  status: z.nativeEnum(BugReportStatus).optional(),
});

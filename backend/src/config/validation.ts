import { z } from 'zod';

const envSchema = z
  .object({
    NODE_ENV: z
      .enum(['development', 'production', 'test'])
      .default('development'),
    PORT: z.coerce.number().default(3000),
    API_PREFIX: z.string().default('/api/v1'),

    DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

    REDIS_HOST: z.string().optional(),
    REDIS_PORT: z.coerce.number().default(6379),
    REDIS_PASSWORD: z.string().optional(),
    REDIS_URL: z.string().min(1, 'REDIS_URL is required'),

    JWT_ACCESS_SECRET: z
      .string()
      .min(32, 'JWT_ACCESS_SECRET must be at least 32 chars'),
    JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
    JWT_REFRESH_SECRET: z
      .string()
      .min(32, 'JWT_REFRESH_SECRET must be at least 32 chars'),
    JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
    DB_SYNCHRONIZE: z.string().optional(),
    GOOGLE_CLIENT_ID: z.string().optional(),
    GOOGLE_CLIENT_SECRET: z.string().optional(),
    GOOGLE_CALLBACK_URL: z.string().optional(),
    MINIO_ENDPOINT: z.string().optional(),
    MINIO_ACCESS_KEY: z.string().optional(),
    MINIO_SECRET_KEY: z.string().optional(),
    MINIO_BUCKET_NAME: z.string().default('hoctuthien-media'),
    MAIL_ENABLED: z.enum(['true', 'false']).default('false'),
    MAIL_HOST: z.string().optional(),
    MAIL_PORT: z.coerce.number().default(587),
    MAIL_SECURE: z.enum(['true', 'false']).default('false'),
    MAIL_USER: z.string().optional(),
    MAIL_PASS: z.string().optional(),
    MAIL_FROM_NAME: z.string().default('HocTuThien'),
    MAIL_FROM_EMAIL: z.string().optional(),
    MAIL_REPLY_TO: z.string().optional(),
    FRONTEND_BASE_URL: z.string().optional(),
    PUBLIC_ASSET_BASE_URL: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.MAIL_ENABLED !== 'true') {
      return;
    }

    const requiredFields = [
      ['MAIL_HOST', data.MAIL_HOST],
      ['MAIL_USER', data.MAIL_USER],
      ['MAIL_PASS', data.MAIL_PASS],
      ['MAIL_FROM_EMAIL', data.MAIL_FROM_EMAIL],
      ['FRONTEND_BASE_URL', data.FRONTEND_BASE_URL],
    ] as const;

    for (const [field, value] of requiredFields) {
      if (!value?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [field],
          message: `${field} is required when MAIL_ENABLED=true`,
        });
      }
    }

    if (data.MAIL_FROM_EMAIL && !z.email().safeParse(data.MAIL_FROM_EMAIL).success) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['MAIL_FROM_EMAIL'],
        message: 'MAIL_FROM_EMAIL must be a valid email',
      });
    }

    if (data.MAIL_REPLY_TO && !z.email().safeParse(data.MAIL_REPLY_TO).success) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['MAIL_REPLY_TO'],
        message: 'MAIL_REPLY_TO must be a valid email',
      });
    }

    if (
      data.FRONTEND_BASE_URL &&
      !z.url().safeParse(data.FRONTEND_BASE_URL).success
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['FRONTEND_BASE_URL'],
        message: 'FRONTEND_BASE_URL must be a valid URL',
      });
    }

    if (
      data.PUBLIC_ASSET_BASE_URL &&
      !z.url().safeParse(data.PUBLIC_ASSET_BASE_URL).success
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['PUBLIC_ASSET_BASE_URL'],
        message: 'PUBLIC_ASSET_BASE_URL must be a valid URL',
      });
    }
  });

export const validateEnv = (config: Record<string, unknown>) => {
  const result = envSchema.safeParse(config);

  if (!result.success) {
    throw new Error(`Environment validation failed: ${result.error.message}`);
  }

  return result.data;
};

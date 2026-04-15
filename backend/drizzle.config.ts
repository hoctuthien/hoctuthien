import type { Config } from 'drizzle-kit';

const databaseUrl = process.env.DATABASE_URL ?? 'postgres://user:pass@localhost:5432/db';

export default {
  schema: './src/infrastructure/database/drizzle/schema.ts',
  out: './src/infrastructure/database/drizzle/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: databaseUrl,
  },
} satisfies Config;

import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    // Keep generate commands working in environments where DATABASE_URL is not set.
    url: process.env.DATABASE_URL ?? '',
  },
});

import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

function getDatabaseUrl(): string {
  const databaseUrl = process.env.DATABASE_URL?.trim();
  if (!databaseUrl) {
    throw new Error(
      'DATABASE_URL environment variable is required for Prisma.',
    );
  }

  return databaseUrl;
}

export function createPrismaClientOptions(): ConstructorParameters<
  typeof PrismaClient
>[0] {
  return {
    adapter: new PrismaPg({ connectionString: getDatabaseUrl() }),
  };
}

export function createPrismaClient(): PrismaClient {
  return new PrismaClient(createPrismaClientOptions());
}

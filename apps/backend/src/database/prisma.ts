import { PrismaClient } from '@prisma/client';

// Ensure DB connection pooling for performance (MED-001)
let dbUrl = process.env.DATABASE_URL || '';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: dbUrl,
    },
  },
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

export default prisma;

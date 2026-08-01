const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  try {
    console.log('Connecting to database...');
    const users = await prisma.user.findMany({ take: 1 });
    console.log('Success! Users found:', users.length);
  } catch (e) {
    console.error('Database connection failed:', e);
  } finally {
    await prisma.$disconnect();
  }
}

test();

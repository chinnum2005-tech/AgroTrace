const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const farms = await prisma.farm.findMany();
  console.log(JSON.stringify(farms, null, 2));
}

run()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

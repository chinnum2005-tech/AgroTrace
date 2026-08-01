const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const events = await prisma.supplyChainEvent.findMany();
  console.log('Total events:', events.length);
  const counts = {};
  events.forEach(e => counts[e.eventType] = (counts[e.eventType] || 0) + 1);
  console.log(counts);
}

main().catch(console.error).finally(() => prisma.$disconnect());

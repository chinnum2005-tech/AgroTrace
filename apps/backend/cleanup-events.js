const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function deleteOrphanedEvents() {
  try {
    const events = await prisma.supplyChainEvent.findMany();
    const users = await prisma.user.findMany({ select: { id: true } });
    const userIds = new Set(users.map(u => u.id));

    let deletedCount = 0;
    for (const event of events) {
      if (!userIds.has(event.actorId)) {
        console.log(`Deleting orphaned event: ${event.id} (actorId: ${event.actorId})`);
        await prisma.supplyChainEvent.delete({ where: { id: event.id } });
        deletedCount++;
      }
    }
    console.log(`Deleted ${deletedCount} orphaned events.`);
  } catch (err) {
    console.error('Error cleaning up:', err);
  } finally {
    await prisma.$disconnect();
  }
}

deleteOrphanedEvents();

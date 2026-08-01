import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function backfillLegacyHashes() {
  console.log('Starting backfill of legacy SupplyChainEvent hashes...');

  // 1. Define the deployment cutoff date. Any event before this is guaranteed legacy.
  // Using a date just slightly in the past (before we added blockchainService.ts)
  const deployDate = new Date('2026-07-30T19:27:00.000Z'); // Roughly when Phase 4 started

  // 2. Fetch all events that might be legacy
  // Criteria: chainStatus is null/PENDING/missing OR createdAt is before deployDate
  const allEvents = await prisma.supplyChainEvent.findMany({
    where: {
      transactionHash: { not: null }
    }
  });

  let updatedCount = 0;

  for (const event of allEvents) {
    if (!event.transactionHash) continue;

    // Check if it matches the legacy format (often 40 chars or missing 0x prefix for real tx, though we faked '0x' + 40 chars)
    // A real Polygon tx hash is 66 characters long ('0x' + 64 hex chars)
    const isStandardLength = event.transactionHash.length === 66;
    const isLegacyFormat = event.transactionHash.length !== 66;
    
    // Check if it's before our real blockchain deploy
    const isBeforeDeploy = event.createdAt < deployDate;

    // If it's the old fake format OR it was created before we deployed the real blockchain service
    if (isLegacyFormat || isBeforeDeploy) {
      await prisma.supplyChainEvent.update({
        where: { id: event.id },
        data: {
          chainStatus: 'LEGACY_SIMULATED'
        }
      });
      updatedCount++;
      console.log(`Updated event ${event.id} to LEGACY_SIMULATED`);
    }
  }

  console.log(`\nBackfill complete! Updated ${updatedCount} legacy events.`);
}

backfillLegacyHashes()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

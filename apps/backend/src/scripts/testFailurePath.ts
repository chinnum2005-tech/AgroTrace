import prisma from '../database/prisma';
import { blockchainService } from '../services/blockchain.service';

async function testFailurePath() {
  console.log('Testing blockchain failure path...');

  // Create a pending event
  const scEvent = await prisma.supplyChainEvent.create({
    data: {
      eventType: 'QUALITY_CHECK',
      timestamp: new Date(),
      actorId: '000000000000000000000000', // Mock ObjectId
      metadata: JSON.stringify({ test: 'failure' }),
      chainStatus: 'PENDING',
    },
  });
  console.log(`Created PENDING event ${scEvent.id}`);

  // Intentionally cause a failure (e.g., using an unfunded wallet on Amoy)
  try {
    const result = await blockchainService.recordEvent(
      'mock_product_id',
      'QUALITY_CHECK',
      { test: 'failure' }
    );
    // If it succeeds (because we're still pointing to local hardhat), update to CONFIRMED
    await prisma.supplyChainEvent.update({
      where: { id: scEvent.id },
      data: {
        transactionHash: result.txHash,
        chainStatus: 'CONFIRMED'
      }
    });
    console.log(`Unexpected SUCCESS. TxHash: ${result.txHash}`);
  } catch (err: any) {
    console.error('Expected blockchain error caught:', err.message);
    await prisma.supplyChainEvent.update({
      where: { id: scEvent.id },
      data: { chainStatus: 'FAILED' }
    });
    console.log(`Updated event ${scEvent.id} to FAILED state.`);
  }

  // Verify final state
  const finalEvent = await prisma.supplyChainEvent.findUnique({
    where: { id: scEvent.id }
  });
  console.log(`Final chainStatus in DB: ${finalEvent?.chainStatus}`);
}

testFailurePath()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });

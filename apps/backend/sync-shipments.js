const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixShipmentStatus() {
  const result = await prisma.shipment.updateMany({
    where: {
      order: {
        status: 'ASSIGNED'
      },
      status: 'PENDING_FARMER'
    },
    data: {
      status: 'ASSIGNED'
    }
  });
  
  console.log(`Updated ${result.count} stuck shipments!`);
}

fixShipmentStatus().catch(console.error).finally(() => prisma.$disconnect());

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkShipments() {
  const shipments = await prisma.shipment.findMany({
    include: { order: { include: { items: { include: { product: { include: { crop: { include: { farm: true } } } } } } } } }
  });
  
  console.log(JSON.stringify(shipments, null, 2));
}

checkShipments().catch(console.error).finally(() => prisma.$disconnect());

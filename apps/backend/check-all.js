const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAllShipments() {
  const shipments = await prisma.shipment.findMany();
  console.log(JSON.stringify(shipments, null, 2));
}

checkAllShipments().catch(console.error).finally(() => prisma.$disconnect());

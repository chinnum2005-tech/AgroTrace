const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testGetAvailableShipments() {
  try {
    const shipments = await prisma.shipment.findMany({
      where: {
        status: 'ASSIGNED',
        distributorId: null, // Not yet assigned to a distributor
      },
      include: {
        order: {
          include: {
            items: {
              include: {
                product: {
                  include: {
                    crop: {
                      include: {
                        farm: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    console.log(`Found ${shipments.length} raw shipments`);

    const formattedShipments = shipments.map(shipment => ({
      id: shipment.id,
      pickupLocation: shipment.order.shippingAddress.split('to')[0]?.trim() || 'Unknown',
      deliveryLocation: shipment.order.shippingAddress,
      estimatedDelivery: shipment.estimatedDelivery,
      order: {
        id: shipment.order.id,
        totalPrice: shipment.order.totalPrice,
        items: shipment.order.items.map(item => ({
          name: item.product?.name || 'Unknown',
          quantity: item.quantity,
          farmName: item.product?.crop?.farm?.name || 'Unknown Farm',
        })),
      },
    }));

    console.log('Formatted:', JSON.stringify(formattedShipments, null, 2));
  } catch (error) {
    console.error('Error during formatting:', error);
  }
}

testGetAvailableShipments().catch(console.error).finally(() => prisma.$disconnect());

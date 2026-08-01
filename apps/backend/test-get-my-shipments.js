const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testGetMyShipments() {
  try {
    const shipments = await prisma.shipment.findMany({
      where: { distributorId: '6a6a6c65af0544c6f4777bbb' },
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
            consumer: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
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
      status: shipment.status,
      currentLocation: shipment.currentLocation,
      estimatedDelivery: shipment.estimatedDelivery,
      actualDelivery: shipment.actualDelivery,
      order: {
        id: shipment.order.id,
        totalPrice: shipment.order.totalPrice,
        shippingAddress: shipment.order.shippingAddress,
        consumerName: `${shipment.order.consumer.firstName} ${shipment.order.consumer.lastName}`,
        items: shipment.order.items.map(item => ({
          name: item.product?.name,
          quantity: item.quantity,
          farmName: item.product?.crop?.farm?.name,
        })),
      },
    }));

    console.log('Formatted:', JSON.stringify(formattedShipments, null, 2));

  } catch (err) {
    console.error('Error fetching or mapping:', err);
  }
}

testGetMyShipments().catch(console.error).finally(() => prisma.$disconnect());

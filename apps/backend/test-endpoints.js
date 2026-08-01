const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testEndpoints() {
  try {
    const s = await prisma.shipment.findMany({
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
    console.log('Shipments raw:', s.length);

    const e = await prisma.supplyChainEvent.findMany({
      take: 10,
      include: {
        product: {
          include: {
            crop: {
              include: {
                farm: true,
              }
            }
          }
        },
        actor: {
          select: {
            firstName: true,
            lastName: true,
          }
        }
      },
      orderBy: { timestamp: 'desc' },
    });
    console.log('Events raw:', e.length);
  } catch (err) {
    console.error('Error fetching:', err);
  } finally {
    await prisma.$disconnect();
  }
}

testEndpoints();

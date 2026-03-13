import { Response } from 'express';
import prisma from '../database/prisma';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

/**
 * Get all shipments assigned to distributor
 */
export const getMyShipments = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const shipments = await prisma.shipment.findMany({
      where: { distributorId: userId },
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
          name: item.product.name,
          quantity: item.quantity,
          farmName: item.product.crop.farm.name,
        })),
      },
    }));

    res.json({
      success: true,
      data: formattedShipments,
    });
  } catch (error) {
    throw new AppError('Failed to fetch shipments', 500);
  }
};

/**
 * Update shipment status
 */
export const updateShipmentStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { shipmentId, status, currentLocation } = req.body;

    if (!shipmentId || !status) {
      throw new AppError('Shipment ID and status are required', 400);
    }

    // Validate status
    const validStatuses = ['ASSIGNED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED'];
    if (!validStatuses.includes(status)) {
      throw new AppError('Invalid shipment status', 400);
    }

    const shipment = await prisma.shipment.update({
      where: { id: shipmentId },
      data: {
        status,
        currentLocation: currentLocation || null,
        actualDelivery: status === 'DELIVERED' ? new Date() : null,
      },
    });

    // Also update order status if shipment is delivered
    if (status === 'DELIVERED') {
      await prisma.order.update({
        where: { id: shipment.orderId },
        data: { status: 'DELIVERED' },
      });

      // Record supply chain event
      const order = await prisma.order.findUnique({
        where: { id: shipment.orderId },
        include: { items: true },
      });

      if (order) {
        for (const item of order.items) {
          await prisma.supplyChainEvent.create({
            data: {
              productId: item.productId,
              eventType: 'RECEIVED',
              timestamp: new Date(),
              actorId: req.user!.id,
              location: currentLocation || order.shippingAddress,
              metadata: JSON.stringify({
                orderId: order.id,
                deliveredAt: new Date().toISOString(),
              }),
            },
          });
        }
      }
    }

    res.json({
      success: true,
      message: 'Shipment status updated successfully',
      data: shipment,
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to update shipment status', 500);
  }
};

/**
 * Get all available shipments (for distributors to claim)
 */
export const getAvailableShipments = async (req: AuthRequest, res: Response) => {
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

    const formattedShipments = shipments.map(shipment => ({
      id: shipment.id,
      pickupLocation: shipment.order.shippingAddress.split('to')[0]?.trim() || 'Unknown',
      deliveryLocation: shipment.order.shippingAddress,
      estimatedDelivery: shipment.estimatedDelivery,
      order: {
        id: shipment.order.id,
        totalPrice: shipment.order.totalPrice,
        items: shipment.order.items.map(item => ({
          name: item.product.name,
          quantity: item.quantity,
          farmName: item.product.crop.farm.name,
        })),
      },
    }));

    res.json({
      success: true,
      data: formattedShipments,
    });
  } catch (error) {
    throw new AppError('Failed to fetch available shipments', 500);
  }
};

/**
 * Claim a shipment (assign to current distributor)
 */
export const claimShipment = async (req: AuthRequest, res: Response) => {
  try {
    const { shipmentId } = req.body;
    const userId = req.user!.id;

    const shipment = await prisma.shipment.update({
      where: { id: shipmentId },
      data: { distributorId: userId },
    });

    res.json({
      success: true,
      message: 'Shipment claimed successfully',
      data: shipment,
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to claim shipment', 500);
  }
};

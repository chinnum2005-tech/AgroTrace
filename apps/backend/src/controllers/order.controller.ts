import { Response } from 'express';
import prisma from '../database/prisma';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

/**
 * Create order from cart
 */
export const createOrder = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { shippingAddress } = req.body;

    if (!shippingAddress) {
      throw new AppError('Shipping address is required', 400);
    }

    // Get user's cart with items
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      throw new AppError('Cart is empty', 400);
    }

    // Calculate total price
    let totalPrice = 0;
    for (const item of cart.items) {
      const itemPrice = parseFloat((item.product.quantity * 0.85).toFixed(2));
      totalPrice += itemPrice * item.quantity;
    }

    // Create order
    const order = await prisma.order.create({
      data: {
        consumerId: userId,
        status: 'PENDING',
        totalPrice,
        shippingAddress,
        items: {
          create: cart.items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: parseFloat((item.product.quantity * 0.85).toFixed(2)),
          })),
        },
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                crop: {
                  include: {
                    farm: {
                      include: {
                        user: {
                          select: {
                            firstName: true,
                            lastName: true,
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    // Create shipment record
    await prisma.shipment.create({
      data: {
        orderId: order.id,
        status: 'ASSIGNED',
      },
    });

    // Record supply chain event for the order
    for (const item of order.items) {
      await prisma.supplyChainEvent.create({
        data: {
          productId: item.productId,
          eventType: 'SOLD',
          timestamp: new Date(),
          actorId: userId,
          location: shippingAddress,
          metadata: JSON.stringify({
            orderId: order.id,
            quantity: item.quantity,
            amount: item.price * item.quantity,
          }),
        },
      });
    }

    // Clear cart after successful order
    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: order,
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to create order', 500);
  }
};

/**
 * Get consumer's orders
 */
export const getMyOrders = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const orders = await prisma.order.findMany({
      where: { consumerId: userId },
      include: {
        items: {
          include: {
            product: {
              include: {
                crop: {
                  include: {
                    farm: {
                      include: {
                        user: {
                          select: {
                            firstName: true,
                            lastName: true,
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        shipment: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const formattedOrders = orders.map(order => ({
      id: order.id,
      status: order.status,
      totalPrice: order.totalPrice,
      shippingAddress: order.shippingAddress,
      createdAt: order.createdAt,
      items: order.items.map(item => ({
        name: item.product.name,
        quantity: item.quantity,
        price: item.price,
        farmName: `${item.product.crop.farm.user.firstName} ${item.product.crop.farm.user.lastName}'s Farm`,
        image: getEmojiForCrop(item.product.crop.type),
      })),
      shipment: order.shipment ? {
        status: order.shipment.status,
        currentLocation: order.shipment.currentLocation,
        estimatedDelivery: order.shipment.estimatedDelivery,
      } : null,
    }));

    res.json({
      success: true,
      data: formattedOrders,
    });
  } catch (error) {
    throw new AppError('Failed to fetch orders', 500);
  }
};

/**
 * Get farmer's orders (orders containing their products)
 */
export const getFarmerOrders = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    // Find all products belonging to this farmer
    const farmerProducts = await prisma.product.findMany({
      where: {
        crop: {
          farm: {
            userId,
          },
        },
      },
      select: { id: true },
    });

    const productIds = farmerProducts.map(p => p.id);

    if (productIds.length === 0) {
      return res.json({
        success: true,
        data: [],
      });
    }

    // Get all orders containing these products
    const orders = await prisma.order.findMany({
      where: {
        items: {
          some: {
            productId: { in: productIds },
          },
        },
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                crop: true,
              }
            }
          }
        },
        consumer: {
          select: {
            firstName: true,
            lastName: true,
          }
        },
        shipment: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const formattedOrders = orders.map(order => ({
      id: order.id,
      status: order.status,
      totalPrice: order.totalPrice,
      createdAt: order.createdAt,
      consumerName: `${order.consumer.firstName} ${order.consumer.lastName}`,
      items: order.items
        .filter(item => productIds.includes(item.productId))
        .map(item => ({
          name: item.product.name,
          quantity: item.quantity,
          price: item.price,
        })),
      shipment: order.shipment ? {
        status: order.shipment.status,
        currentLocation: order.shipment.currentLocation,
      } : null,
    }));

    res.json({
      success: true,
      data: formattedOrders,
    });
  } catch (error) {
    throw new AppError('Failed to fetch farmer orders', 500);
  }
};

/**
 * Update order status
 */
export const updateOrderStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { orderId, status } = req.body;

    if (!orderId || !status) {
      throw new AppError('Order ID and status are required', 400);
    }

    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status },
    });

    res.json({
      success: true,
      message: 'Order status updated',
      data: order,
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to update order status', 500);
  }
};

// Helper function to get emoji for crop type
function getEmojiForCrop(cropType: string): string {
  const emojis: Record<string, string> = {
    RICE: '🌾',
    WHEAT: '🌾',
    CORN: '🌽',
    SOYBEANS: '🫘',
    BARLEY: '🌾',
    OATS: '🌾',
    CANOLA: '🌻',
    SORGHUM: '🌾',
    OTHER: '🥬',
  };
  return emojis[cropType] || '🥬';
}

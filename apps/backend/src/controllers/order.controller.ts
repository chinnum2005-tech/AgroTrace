import { Response } from 'express';
import prisma from '../database/prisma';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { blockchainService } from '../services/blockchain.service';

/**
 * Create order from cart
 */
export const createOrder = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { shippingAddress, productId, quantity } = req.body;

    if (!shippingAddress) {
      throw new AppError('Shipping address is required', 400);
    }

    let itemsToProcess: any[] = [];
    let cartId: string | null = null;

    if (productId && quantity) {
      // Direct buy flow
      const product = await prisma.product.findUnique({ where: { id: productId } });
      if (!product) throw new AppError('Product not found', 404);
      if (product.quantity < quantity) throw new AppError(`Insufficient stock. Only ${product.quantity}kg available.`, 400);
      
      itemsToProcess = [{
        productId: product.id,
        quantity: quantity,
        product: product
      }];
    } else {
      // Cart flow
      const cart = await prisma.cart.findUnique({
        where: { userId },
        include: { items: { include: { product: true } } },
      });

      if (!cart || cart.items.length === 0) {
        throw new AppError('Cart is empty', 400);
      }
      cartId = cart.id;
      itemsToProcess = cart.items;

      // Check stock for all items
      for (const item of itemsToProcess) {
        if (item.product.quantity < item.quantity) {
          throw new AppError(`Insufficient stock for ${item.product.name}`, 400);
        }
      }
    }

    // Calculate total price
    let totalPrice = 0;
    for (const item of itemsToProcess) {
      // Base price + 5% distributor commission
      const itemPrice = parseFloat((item.product.price * 1.05).toFixed(2));
      totalPrice += itemPrice * item.quantity;
    }

    // Create order, decrease stock, and create shipment in a transaction
    const order = await prisma.$transaction(async (tx) => {
      // Create the order
      const newOrder = await tx.order.create({
        data: {
          consumerId: userId,
          status: 'PENDING',
          totalPrice,
          shippingAddress,
          items: {
            create: itemsToProcess.map(item => ({
              productId: item.productId,
              quantity: item.quantity,
              price: parseFloat((item.product.price * 1.05).toFixed(2)),
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
                        include: { user: { select: { firstName: true, lastName: true } } }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      });

      // Decrease stock for each item
      for (const item of itemsToProcess) {
        await tx.product.update({
          where: { id: item.productId },
          data: { quantity: { decrement: item.quantity } }
        });
      }

      // Create shipment record
      await tx.shipment.create({
        data: {
          orderId: newOrder.id,
          status: 'PENDING_FARMER', // Farmer must dispatch it first
        },
      });

      // Clear cart if it was a cart flow
      if (cartId) {
        await tx.cartItem.deleteMany({
          where: { cartId: cartId },
        });
      }

      return newOrder;
    });

    // Record supply chain event for the order (outside transaction since it talks to blockchain)
    for (const item of order.items) {
      const metadata = {
        orderId: order.id,
        quantity: item.quantity,
        amount: item.price * item.quantity,
      };

      // Create pending event in DB
      const scEvent = await prisma.supplyChainEvent.create({
        data: {
          productId: item.productId,
          eventType: 'SOLD',
          timestamp: new Date(),
          actorId: userId,
          location: shippingAddress,
          metadata: JSON.stringify(metadata),
          chainStatus: 'PENDING',
          transactionHash: `pending-${Date.now()}-${Math.random().toString(36).substring(7)}`, // Temporary unique hash to satisfy MongoDB unique constraint
        },
      });

      // Fire off blockchain transaction asynchronously
      blockchainService.recordEvent(
        item.productId, 
        'SOLD', 
        metadata
      ).then(async (result) => {
        await prisma.supplyChainEvent.update({
          where: { id: scEvent.id },
          data: {
            transactionHash: result.txHash,
            chainStatus: result.simulated ? 'SIMULATED_FALLBACK' : 'CONFIRMED'
          }
        });
      }).catch(err => {
        console.error('Failed to anchor SOLD event to blockchain', err);
        prisma.supplyChainEvent.update({
          where: { id: scEvent.id },
          data: { chainStatus: 'FAILED' }
        }).catch(console.error);
      });
    }

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: order,
    });
  } catch (error: any) {
    console.error('Order creation error:', error);
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to create order: ' + error.message, 500);
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
        productId: item.productId,
        name: item.product?.name || 'Unknown Product',
        quantity: item.quantity,
        price: item.price,
        farmName: item.product?.crop?.farm?.user ? `${item.product.crop.farm.user.firstName} ${item.product.crop.farm.user.lastName}'s Farm` : 'Unknown Farm',
        image: getEmojiForCrop(item.product?.crop?.type || 'OTHER'),
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
        id: order.shipment.id,
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
    const orderId = req.params.orderId || req.body.orderId;
    const { status, version } = req.body;

    if (!orderId || !status) {
      throw new AppError('Order ID and status are required', 400);
    }

    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId }
    });

    if (!existingOrder) {
      throw new AppError('Order not found', 404);
    }

    if (existingOrder.consumerId !== req.user!.id && !['ADMIN', 'FARMER', 'DISTRIBUTOR'].includes(req.user!.role)) {
      throw new AppError('Unauthorized to update this order', 403);
    }

    // Optimistic locking check
    if (version !== undefined && existingOrder.version !== version) {
      throw new AppError('Conflict detected. Order has been modified by another transaction. Please refresh and try again.', 409, existingOrder);
    }

    const order = await prisma.order.update({
      where: { id: orderId },
      data: { 
        status,
        version: { increment: 1 } 
      },
    });

    // Sync the shipment status with the order status
    // If the order is dispatched (ASSIGNED), the shipment becomes ASSIGNED (available for distributors)
    await prisma.shipment.updateMany({
      where: { orderId: order.id },
      data: { status: status }
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

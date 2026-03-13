import { Response } from 'express';
import prisma from '../database/prisma';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

/**
 * Get current user's cart
 */
export const getMyCart = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    let cart = await prisma.cart.findUnique({
      where: { userId },
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

    // Create cart if it doesn't exist
    if (!cart) {
      cart = await prisma.cart.create({
        data: {
          userId,
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
    }

    // Format cart items for frontend
    const formattedItems = cart.items.map(item => ({
      id: item.id,
      productId: item.product.id,
      name: item.product.name,
      price: parseFloat((item.product.quantity * 0.85).toFixed(2)), // Mock pricing
      quantity: item.quantity,
      image: getEmojiForCrop(item.product.crop.type),
      farmName: `${item.product.crop.farm.user.firstName} ${item.product.crop.farm.user.lastName}'s Farm`,
      unit: `${item.product.quantity}kg`,
    }));

    res.json({
      success: true,
      data: {
        id: cart.id,
        items: formattedItems,
        totalItems: cart.items.reduce((sum, item) => sum + item.quantity, 0),
      },
    });
  } catch (error) {
    throw new AppError('Failed to fetch cart', 500);
  }
};

/**
 * Add item to cart
 */
export const addToCart = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { productId, quantity } = req.body;

    if (!productId || !quantity) {
      throw new AppError('Product ID and quantity are required', 400);
    }

    // Verify product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    // Check if enough quantity available
    if (product.quantity < quantity) {
      throw new AppError('Insufficient quantity available', 400);
    }

    // Get or create cart
    let cart = await prisma.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId },
      });
    }

    // Check if item already in cart
    const existingItem = await prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId,
        },
      },
    });

    if (existingItem) {
      // Update quantity
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
      });
    } else {
      // Add new item
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity,
        },
      });
    }

    res.json({
      success: true,
      message: 'Added to cart successfully',
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to add item to cart', 500);
  }
};

/**
 * Remove item from cart
 */
export const removeFromCart = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { productId } = req.body;

    if (!productId) {
      throw new AppError('Product ID is required', 400);
    }

    const cart = await prisma.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      throw new AppError('Cart not found', 404);
    }

    await prisma.cartItem.deleteMany({
      where: {
        cartId: cart.id,
        productId,
      },
    });

    res.json({
      success: true,
      message: 'Item removed from cart',
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to remove item from cart', 500);
  }
};

/**
 * Update cart item quantity
 */
export const updateCartItem = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { productId, quantity } = req.body;

    if (!productId || !quantity) {
      throw new AppError('Product ID and quantity are required', 400);
    }

    const cart = await prisma.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      throw new AppError('Cart not found', 404);
    }

    const cartItem = await prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId,
        },
      },
    });

    if (!cartItem) {
      throw new AppError('Item not found in cart', 404);
    }

    await prisma.cartItem.update({
      where: { id: cartItem.id },
      data: { quantity },
    });

    res.json({
      success: true,
      message: 'Cart updated successfully',
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to update cart item', 500);
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

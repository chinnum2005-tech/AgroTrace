import { Response } from 'express';
import prisma from '../database/prisma';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { generateQRCode } from '../services/qrService';

// Get all products (for marketplace)
export const getAllProducts = async (req: AuthRequest, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      where: {
        status: 'ACTIVE',
      },
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
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Format products for marketplace
    const formattedProducts = products.map(product => ({
      id: product.id,
      name: product.name,
      farmName: `${product.crop.farm.user.firstName} ${product.crop.farm.user.lastName}'s Farm`,
      price: parseFloat((product.quantity * 0.85).toFixed(2)), // Mock pricing
      unit: `${product.quantity}kg`,
      rating: 4.5, // Would be calculated from reviews
      image: getEmojiForCrop(product.crop.type),
      certified: product.crop.farm.certification ? true : false,
      location: product.storageLocation || 'Available now',
      cropType: product.crop.type,
      batchNumber: product.batchNumber,
    }));

    res.json({
      success: true,
      data: formattedProducts,
    });
  } catch (error) {
    throw new AppError('Failed to fetch products', 500);
  }
};

// Create a new product (from harvested crop)
export const createProduct = async (req: AuthRequest, res: Response) => {
  try {
    const { name, cropId, quantity, batchNumber, expiryDate, storageLocation } = req.body;

    // Verify crop belongs to user
    const crop = await prisma.crop.findUnique({
      where: { id: cropId },
      include: { farm: true }
    });

    if (!crop) {
      throw new AppError('Crop not found', 404);
    }

    if (crop.farm.userId !== req.user?.id) {
      throw new AppError('Unauthorized to create product from this crop', 403);
    }

    // Generate SKU
    const sku = `PROD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Generate verification URL for QR code
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const verificationUrl = `${frontendUrl}/verify/${cropId}`;

    // Generate QR code as base64
    const qrCode = await generateQRCode(verificationUrl, {
      width: 400,
      margin: 2,
      errorCorrectionLevel: 'H',
    });

    const product = await prisma.product.create({
      data: {
        name,
        sku,
        cropId,
        quantity,
        packagingDate: new Date(),
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        batchNumber,
        storageLocation,
        status: 'ACTIVE',
        // Store QR code in metadata (you can add this field to schema if needed)
      },
      include: {
        crop: true
      }
    });

    res.status(201).json({
      success: true,
      message: 'Product created with QR code',
      data: {
        ...product,
        qrCode,
        verificationUrl,
      },
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to create product', 500);
  }
};

// Get farmer's products
export const getMyProducts = async (req: AuthRequest, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      where: {
        crop: {
          farm: {
            userId: req.user?.id
          }
        }
      },
      include: {
        crop: {
          include: {
            farm: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({
      success: true,
      data: products,
    });
  } catch (error) {
    throw new AppError('Failed to fetch your products', 500);
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

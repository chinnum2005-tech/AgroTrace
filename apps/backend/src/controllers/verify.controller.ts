import { Response } from 'express';
import QRCode from 'qrcode';
import prisma from '../database/prisma';
import { AppError } from '../middleware/errorHandler';

// Verify product by QR code (public endpoint)
export const verifyProduct = async (req: any, res: Response) => {
  try {
    const { qrCode } = req.params;

    // Find crop by QR code
    const crop = await prisma.crop.findUnique({
      where: { qrCode },
      include: {
        farm: {
          include: { 
            user: {
              select: {
                firstName: true,
                lastName: true,
              }
            }
          },
        },
        predictions: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        supplyChainEvents: {
          include: { 
            actor: {
              select: {
                firstName: true,
                lastName: true,
                role: true,
              }
            }
          },
          orderBy: { timestamp: 'asc' },
        },
      },
    });

    if (!crop) {
      throw new AppError('Product not found or invalid QR code', 404);
    }

    res.json({
      success: true,
      data: {
        crop: {
          id: crop.id,
          name: crop.name,
          type: crop.type,
          variety: crop.variety,
          plantingDate: crop.plantingDate,
          growthStage: crop.growthStage,
          estimatedYield: crop.estimatedYield,
          actualYield: crop.actualYield,
        },
        farm: {
          name: crop.farm.name,
          location: crop.farm.location,
          size: crop.farm.size,
          certification: crop.farm.certification,
          farmer: {
            firstName: crop.farm.user.firstName,
            lastName: crop.farm.user.lastName,
          },
        },
        predictions: crop.predictions[0] || null,
        supplyChainEvents: crop.supplyChainEvents,
      },
      message: 'Product verified successfully',
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to verify product', 500);
  }
};

// Generate QR code for a crop
export const generateQRCode = async (req: any, res: Response) => {
  try {
    const { cropId } = req.params;

    const crop = await prisma.crop.findUnique({ 
      where: { id: cropId },
      include: { farm: true }
    });
    
    if (!crop) {
      throw new AppError('Crop not found', 404);
    }

    // Generate unique QR code data
    const qrData = `AGRITRACE-${cropId}-${Date.now()}`;

    // Generate QR code image as base64
    const qrCodeImage = await QRCode.toDataURL(qrData);

    // Update crop with QR code
    await prisma.crop.update({
      where: { id: cropId },
      data: { qrCode: qrData },
    });

    res.json({
      success: true,
      data: {
        qrCode: qrData,
        qrCodeImage,
        cropId: crop.id,
        cropName: crop.name,
      },
      message: 'QR code generated successfully',
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to generate QR code', 500);
  }
};

import { Response } from 'express';
import QRCode from 'qrcode';
import prisma from '../database/prisma';
import { AppError } from '../middleware/errorHandler';
import crypto from 'crypto';

// Verify product by QR code (public endpoint)
export const verifyProduct = async (req: any, res: Response) => {
  try {
    const { qrCode } = req.params;

    const isObjectId = /^[0-9a-fA-F]{24}$/.test(qrCode);
    
    // 1. First, try to find a Product directly
    let product = null;
    let crop = null;

    if (isObjectId) {
      product = await prisma.product.findUnique({
        where: { id: qrCode },
        include: { crop: true }
      });
    }

    // 2. If no product found, look for Crop by id or qrCode
    if (product) {
      crop = product.crop;
    } else {
      crop = await prisma.crop.findFirst({
        where: {
          OR: [
            { qrCode },
            ...(isObjectId ? [{ id: qrCode }] : [])
          ]
        },
      });
    }

    if (!crop) {
      throw new AppError('Product not found or invalid QR code', 404);
    }

    // Reload crop with all necessary relations
    const fullCrop = await prisma.crop.findUnique({
      where: { id: crop.id },
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
      },
    });

    if (!fullCrop) {
      throw new AppError('Crop not found', 404);
    }

    // 3. Fetch all Supply Chain Events related to either the Crop OR its Products
    const productsForCrop = await prisma.product.findMany({ where: { cropId: crop.id }, select: { id: true } });
    const productIds = productsForCrop.map(p => p.id);

    const supplyChainEvents = await prisma.supplyChainEvent.findMany({
      where: {
        OR: [
          { cropId: crop.id },
          { productId: { in: productIds } }
        ]
      },
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
    });

    res.json({
      success: true,
      data: {
        crop: {
          id: fullCrop.id,
          name: fullCrop.name,
          type: fullCrop.type,
          variety: fullCrop.variety,
          plantingDate: fullCrop.plantingDate,
          growthStage: fullCrop.growthStage,
          estimatedYield: fullCrop.estimatedYield,
          actualYield: fullCrop.actualYield,
        },
        farm: {
          name: fullCrop.farm.name,
          location: fullCrop.farm.location,
          size: fullCrop.farm.size,
          certification: fullCrop.farm.certification,
          farmer: {
            firstName: fullCrop.farm.user.firstName,
            lastName: fullCrop.farm.user.lastName,
          },
        },
        predictions: fullCrop.predictions[0] || null,
        supplyChainEvents: supplyChainEvents.map(evt => {
          let metadataObj = null;
          try {
            if (evt.metadata) metadataObj = JSON.parse(evt.metadata);
          } catch (e) {}
          
          return {
            id: evt.id,
            eventType: evt.eventType,
            title: evt.eventType.replace('_', ' '),
            description: metadataObj?.description || '',
            location: evt.location || 'Unknown',
            timestamp: evt.timestamp,
            date: evt.timestamp,
            actor: evt.actor ? `${evt.actor.firstName} ${evt.actor.lastName}` : 'System',
            actorRole: evt.actor ? evt.actor.role : 'System',
            verified: evt.verified,
            chainStatus: evt.chainStatus,
            transactionHash: evt.transactionHash,
            blockNumber: evt.blockNumber,
            metadata: metadataObj,
          };
        }),
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

    // Generate unique, unpredictable QR code data (MED-002)
    const qrData = crypto.randomBytes(16).toString('hex');

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

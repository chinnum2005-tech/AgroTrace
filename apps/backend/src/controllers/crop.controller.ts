import { Response } from 'express';
import prisma from '../database/prisma';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { CreateCropInput, UpdateCropStageInput } from '../validators/schemas';

// Get all crops (admin only)
export const getAllCrops = async (req: AuthRequest, res: Response) => {
  try {
    const crops = await prisma.crop.findMany({
      include: { 
        farm: {
          select: {
            id: true,
            name: true,
            user: {
              select: {
                firstName: true,
                lastName: true,
              }
            }
          }
        },
        predictions: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        }
      },
    });
    
    res.json({ 
      success: true, 
      data: crops,
      count: crops.length
    });
  } catch (error) {
    throw new AppError('Failed to fetch crops', 500);
  }
};

// Get farmer's crops
export const getMyCrops = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      throw new AppError('User ID not found', 401);
    }

    // Get farmer's farm
    const farm = await prisma.farm.findUnique({ 
      where: { userId: req.user.id },
      select: { id: true }
    });
    
    if (!farm) {
      throw new AppError('No farm found for this user. Please register a farm first.', 404);
    }

    const crops = await prisma.crop.findMany({
      where: { farmId: farm.id },
      include: { 
        predictions: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        }
      },
    });

    res.json({ success: true, data: crops });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to fetch crops', 500);
  }
};

// Create crop (farmer only)
export const createCrop = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      throw new AppError('User ID not found', 401);
    }

    const { name, type, variety, plantingDate, expectedHarvest, area }: CreateCropInput = req.body;

    // Get farmer's farm
    const farm = await prisma.farm.findUnique({ 
      where: { userId: req.user.id },
      select: { id: true }
    });
    
    if (!farm) {
      throw new AppError('No farm found for this user. Please register a farm first.', 404);
    }

    const crop = await prisma.crop.create({
      data: {
        name,
        type,
        variety,
        plantingDate,
        expectedHarvest,
        area,
        farmId: farm.id,
      },
    });

    res.status(201).json({ 
      success: true, 
      data: crop,
      message: 'Crop created successfully'
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to create crop', 500);
  }
};

// Update crop growth stage
export const updateCropStage = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      throw new AppError('User ID not found', 401);
    }

    const { id } = req.params;
    const { growthStage }: UpdateCropStageInput = req.body;

    const crop = await prisma.crop.findUnique({ 
      where: { id },
      include: { farm: true }
    });
    
    if (!crop) {
      throw new AppError('Crop not found', 404);
    }

    // Verify ownership
    if (crop.farm.userId !== req.user.id) {
      throw new AppError('Unauthorized to update this crop', 403);
    }

    const updatedCrop = await prisma.crop.update({
      where: { id },
      data: { growthStage },
    });

    res.json({ 
      success: true, 
      data: updatedCrop,
      message: `Crop stage updated to ${growthStage}`
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to update crop stage', 500);
  }
};

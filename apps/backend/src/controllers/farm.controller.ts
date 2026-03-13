import { Response } from 'express';
import prisma from '../database/prisma';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { CreateFarmInput } from '../validators/schemas';

// Get all farms (admin only)
export const getAllFarms = async (req: AuthRequest, res: Response) => {
  try {
    const farms = await prisma.farm.findMany({
      include: { 
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          }
        }
      },
    });
    
    res.json({ 
      success: true, 
      data: farms,
      count: farms.length
    });
  } catch (error) {
    throw new AppError('Failed to fetch farms', 500);
  }
};

// Get farmer's own farm
export const getMyFarm = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      throw new AppError('User ID not found', 401);
    }

    const farm = await prisma.farm.findUnique({
      where: { userId: req.user.id },
      include: { 
        crops: {
          select: {
            id: true,
            name: true,
            type: true,
            growthStage: true,
            area: true,
            plantingDate: true,
          }
        } 
      },
    });
    
    if (!farm) {
      return res.json({ 
        success: true, 
        message: 'No farm registered yet',
        data: null 
      });
    }

    res.json({ success: true, data: farm });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to fetch farm', 500);
  }
};

// Create farm (farmer only)
export const createFarm = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      throw new AppError('User ID not found', 401);
    }

    const { name, description, location, size, certification }: CreateFarmInput = req.body;

    // Check if user already has a farm
    const existingFarm = await prisma.farm.findUnique({
      where: { userId: req.user.id },
    });

    if (existingFarm) {
      throw new AppError('User already has a registered farm', 400);
    }

    const farm = await prisma.farm.create({
      data: {
        name,
        description,
        location,
        size,
        certification,
        userId: req.user.id,
      },
    });

    res.status(201).json({ 
      success: true, 
      data: farm,
      message: 'Farm created successfully'
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to create farm', 500);
  }
};

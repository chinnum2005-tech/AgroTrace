import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../database/prisma';
import { AppError } from '../middleware/errorHandler';
import { triggerFieldDataIngestion } from '../services/ingestion.service';

/**
 * Creates a new field under the user's farm
 */
export const createField = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { name, polygon } = req.body;
    
    if (!name || !polygon) {
      throw new AppError('Field name and polygon are required', 400);
    }

    const farm = await prisma.farm.findUnique({
      where: { userId: req.user?.id }
    });

    if (!farm) {
      throw new AppError('Farm not found. Please create a farm first.', 404);
    }

    const field = await prisma.field.create({
      data: {
        farmId: farm.id,
        name,
        polygon
      }
    });

    // Fire & Forget background job to ingest weather & NDVI data
    triggerFieldDataIngestion(field.id, polygon);

    res.status(201).json({
      success: true,
      data: { field }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Records a new soil reading for a specific field
 */
export const addSoilReading = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { fieldId } = req.params;
    const { N, P, K, pH } = req.body;

    if (N === undefined || P === undefined || K === undefined || pH === undefined) {
      throw new AppError('N, P, K, and pH values are required', 400);
    }

    // Verify ownership
    const field = await prisma.field.findUnique({
      where: { id: fieldId },
      include: { farm: true }
    });

    if (!field || field.farm.userId !== req.user?.id) {
      throw new AppError('Field not found or unauthorized', 404);
    }

    const soilReading = await prisma.soilReading.create({
      data: {
        fieldId,
        N: Number(N),
        P: Number(P),
        K: Number(K),
        pH: Number(pH),
        moisture: 35.0, // Default for now
        recordedAt: new Date()
      }
    });

    // Update field's lastSoilTestAt
    await prisma.field.update({
      where: { id: fieldId },
      data: { lastSoilTestAt: new Date(), soilType: 'Loamy' } // Mocking soil type
    });

    res.status(201).json({
      success: true,
      data: { soilReading }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Gets all fields for the user's farm, including latest readings
 */
export const getMyFields = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const farm = await prisma.farm.findUnique({
      where: { userId: req.user?.id }
    });

    if (!farm) {
      return res.json({ success: true, data: { fields: [] } });
    }

    const fields = await prisma.field.findMany({
      where: { farmId: farm.id },
      include: {
        soilReadings: {
          orderBy: { recordedAt: 'desc' },
          take: 1
        },
        weatherSnapshots: {
          orderBy: { recordedAt: 'desc' },
          take: 1
        }
      }
    });

    res.json({
      success: true,
      data: { fields }
    });
  } catch (error) {
    next(error);
  }
};

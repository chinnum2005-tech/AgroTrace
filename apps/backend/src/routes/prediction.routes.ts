import { Router, Response } from 'express';
import axios from 'axios';
import prisma from '../database/prisma';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

const router = Router();
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

// Get yield prediction for a crop
router.get('/crop/:cropId', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { cropId } = req.params;

    // Get crop details
    const crop = await prisma.crop.findUnique({
      where: { id: cropId },
      include: { farm: true },
    });

    if (!crop) {
      throw new AppError('Crop not found', 404);
    }

    // Call AI service for prediction
    const response = await axios.post(`${AI_SERVICE_URL}/predict/yield`, {
      cropType: crop.type,
      area: crop.area,
      plantingDate: crop.plantingDate,
      location: crop.farm.location,
    });

    const { predictedYield, confidence, factors } = response.data;

    // Save prediction to database
    const prediction = await prisma.aIPrediction.create({
      data: {
        cropId,
        predictedYield,
        confidence,
        factors,
      },
    });

    res.json({
      success: true,
      data: {
        prediction,
        message: 'Yield prediction generated successfully',
      },
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    if (axios.isAxiosError(error)) {
      throw new AppError('AI service unavailable', 503);
    }
    throw new AppError('Failed to generate prediction', 500);
  }
});

export default router;

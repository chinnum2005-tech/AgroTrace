import { Router, Response, NextFunction } from 'express';
import axios from 'axios';
import prisma from '../database/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { computePredictionHash, anchorPrediction } from '../services/provenance.service';

const router = Router();
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

/**
 * Get crop recommendation based on latest soil and weather readings
 */
router.post('/crop', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { fieldId } = req.body;
    if (!fieldId) {
      throw new AppError('fieldId is required', 400);
    }
    
    const token = req.headers.authorization || `Bearer ${req.cookies.token}`;
    
    // Check if field exists
    const field = await prisma.field.findUnique({
      where: { id: fieldId }
    });
    if (!field) {
      throw new AppError('Field not found', 404);
    }
    
    // Get latest soil and weather readings
    const latestSoil = await prisma.soilReading.findFirst({
      where: { fieldId },
      orderBy: { recordedAt: 'desc' }
    });
    
    const latestWeather = await prisma.weatherSnapshot.findFirst({
      where: { fieldId },
      orderBy: { recordedAt: 'desc' }
    });
    
    // Fail-Closed Validation (No Dummy Data)
    if (!latestSoil || !latestWeather) {
      throw new AppError('Cannot recommend crop: no soil or weather data recorded for this field.', 400);
    }
    
    // Query AI service
    const response = await axios.post(
      `${AI_SERVICE_URL}/predict/crop`,
      {
        N: latestSoil.N,
        P: latestSoil.P,
        K: latestSoil.K,
        ph: latestSoil.pH,
        temperature: latestWeather.temperature,
        humidity: latestWeather.humidity || 65.0,
        rainfall: latestWeather.rainfall
      },
      {
        headers: { Authorization: token }
      }
    );
    
    const { recommendedCrop, alternatives, confidence, modelVersion } = response.data;
    
    const inputSnapshot = {
      N: latestSoil.N,
      P: latestSoil.P,
      K: latestSoil.K,
      ph: latestSoil.pH,
      temperature: latestWeather.temperature,
      humidity: latestWeather.humidity || 65.0,
      rainfall: latestWeather.rainfall
    };
    
    const predictionHash = computePredictionHash(inputSnapshot, modelVersion, recommendedCrop);
    
    // Save recommendation to database
    const cropRec = await prisma.cropRecommendation.create({
      data: {
        fieldId,
        inputSnapshot,
        recommendedCrop,
        alternatives,
        confidence,
        modelVersion,
        predictionHash,
        provenanceStatus: 'PENDING'
      }
    });
    
    // Anchor to blockchain asynchronously
    anchorPrediction(cropRec.id, predictionHash, 'CROP').then(async (txHash) => {
      if (txHash) {
        await prisma.cropRecommendation.update({
          where: { id: cropRec.id },
          data: { txHash, provenanceStatus: 'CONFIRMED' }
        });
      }
    }).catch(err => {
      console.error('Blockchain anchoring failed for crop recommendation:', err);
    });
    
    res.status(200).json({
      success: true,
      data: cropRec
    });
    
  } catch (error) {
    next(error);
  }
});

/**
 * Get fertilizer recommendation based on crop and soil nutrients
 */
router.post('/fertilizer', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { fieldId, cropType, growthStage } = req.body;
    if (!fieldId || !cropType || !growthStage) {
      throw new AppError('fieldId, cropType, and growthStage are required', 400);
    }
    
    const token = req.headers.authorization || `Bearer ${req.cookies.token}`;
    
    // Check if field exists
    const field = await prisma.field.findUnique({
      where: { id: fieldId }
    });
    if (!field) {
      throw new AppError('Field not found', 404);
    }
    
    // Get latest soil reading
    const latestSoil = await prisma.soilReading.findFirst({
      where: { fieldId },
      orderBy: { recordedAt: 'desc' }
    });
    
    if (!latestSoil) {
      throw new AppError('Cannot recommend fertilizer: no soil data recorded for this field.', 400);
    }
    
    // Query AI service
    const response = await axios.post(
      `${AI_SERVICE_URL}/predict/fertilizer`,
      {
        N: latestSoil.N,
        P: latestSoil.P,
        K: latestSoil.K,
        ph: latestSoil.pH,
        cropType,
        growthStage
      },
      {
        headers: { Authorization: token }
      }
    );
    
    const { recommendedFertilizer, quantity, timingWindow } = response.data;
    
    // Save to database
    const fertRec = await prisma.fertilizerRecommendation.create({
      data: {
        fieldId,
        recommendedFertilizer,
        quantity,
        timingWindow
      }
    });
    
    res.status(200).json({
      success: true,
      data: fertRec
    });
    
  } catch (error) {
    next(error);
  }
});

export default router;

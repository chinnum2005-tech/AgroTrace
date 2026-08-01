import { Router, Response, NextFunction } from 'express';
import axios from 'axios';
import prisma from '../database/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { computePredictionHash, anchorPrediction } from '../services/provenance.service';

const router = Router();
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

/**
 * Helper to process fusion reforecasting logic
 */
async function processFusionReforecast(
  fieldId: string,
  ndviReadingId: string,
  ndviScore: number,
  stressFlag: boolean,
  ndviProvider: string,
  token: string
) {
  let fusionTriggered = false;
  let newPrediction = null;

  if (stressFlag) {
    const activeCrop = await prisma.crop.findFirst({
      where: {
        fieldId,
        growthStage: { not: 'HARVESTED' }
      }
    });

    if (activeCrop) {
      // Debounce check: max once per 48 hours per field for NDVI_FUSION triggers
      const debounceCutoff = new Date(Date.now() - 48 * 60 * 60 * 1000);
      const recentPrediction = await prisma.yieldPrediction.findFirst({
        where: {
          fieldId,
          triggeredBy: 'NDVI_FUSION',
          createdAt: { gte: debounceCutoff }
        }
      });

      if (!recentPrediction) {
        // Fetch latest soil and weather records
        const latestSoil = await prisma.soilReading.findFirst({
          where: { fieldId },
          orderBy: { recordedAt: 'desc' }
        });

        const latestWeather = await prisma.weatherSnapshot.findFirst({
          where: { fieldId },
          orderBy: { recordedAt: 'desc' }
        });

        // Fail-closed rule (no dummy values: soil/weather must exist)
        if (latestSoil && latestWeather) {
          fusionTriggered = true;
          console.log(`📡 NDVI stress detected! Triggering fusion re-forecasting for field ${fieldId}...`);

          // Request prediction from FastAPI
          const yieldResponse = await axios.post(
            `${AI_SERVICE_URL}/predict/yield/fusion-trigger`,
            {
              cropType: activeCrop.type,
              area: activeCrop.area,
              rainfall: latestWeather.rainfall,
              soilQuality: {
                ph: latestSoil.pH,
                nitrogen: latestSoil.N,
                phosphorus: latestSoil.P,
                potassium: latestSoil.K
              },
              ndviScore,
              ndviProvider
            },
            { headers: { Authorization: token } }
          );

          const { predictedYield, confidence, modelVersion, ndviIncluded } = yieldResponse.data;

          // Generate deterministic hash of inputs + output + model version
          const inputSnapshot = {
            cropType: activeCrop.type,
            area: activeCrop.area,
            rainfall: latestWeather.rainfall,
            ph: latestSoil.pH,
            nitrogen: latestSoil.N,
            phosphorus: latestSoil.P,
            potassium: latestSoil.K,
            ndviScore
          };

          const predictionHash = computePredictionHash(inputSnapshot, modelVersion, predictedYield);

          // Create YieldPrediction record
          newPrediction = await prisma.yieldPrediction.create({
            data: {
              fieldId,
              cropType: activeCrop.type,
              predictedYield,
              confidenceInterval: { lower: predictedYield * 0.9, upper: predictedYield * 1.1, score: confidence },
              metadata: { rmse: 24.5, mae: 18.2, ndviIncluded, dataSource: yieldResponse.data.dataSource },
              modelVersion,
              predictionHash,
              provenanceStatus: 'PENDING',
              triggeredBy: 'NDVI_FUSION',
              sourceNdviReadingId: ndviReadingId
            }
          });

          // Create ProvenanceRecord audit log
          await prisma.provenanceRecord.create({
            data: {
              predictionId: newPrediction.id,
              predictionType: 'YIELD',
              inputSnapshot,
              modelVersion
            }
          });

          // Anchor on-chain asynchronously (fail-soft)
          anchorPrediction(newPrediction.id, predictionHash, 'YIELD');
        }
      }
    }
  }

  return { fusionTriggered, newPrediction };
}

/**
 * Manual/sensor NDVI upload route
 */
router.post('/', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { fieldId, red, nir, imageSource, capturedAt } = req.body;
    const token = req.headers.authorization || `Bearer ${req.cookies.token}`;

    if (!fieldId || red === undefined || nir === undefined) {
      throw new AppError('Field ID, red, and nir band values are required', 400);
    }

    // Verify field exists
    const field = await prisma.field.findUnique({
      where: { id: fieldId }
    });

    if (!field) {
      throw new AppError('Field not found', 404);
    }

    // Calculate NDVI score and stress flag via FastAPI
    const ndviResponse = await axios.post(
      `${AI_SERVICE_URL}/ndvi`,
      { red, nir },
      { headers: { Authorization: token } }
    );

    const { ndviScore, stressFlag } = ndviResponse.data;

    // Save NDVI Reading to database (manual entries default to "manual" provider)
    const ndviReading = await prisma.nDVIReading.create({
      data: {
        fieldId,
        ndviScore,
        imageSource: imageSource || 'Sensor-Manual',
        stressFlag,
        provider: 'manual',
        cloudCoverPercent: 0.0,
        imageDate: capturedAt ? new Date(capturedAt) : new Date(),
        capturedAt: capturedAt ? new Date(capturedAt) : new Date()
      }
    });

    // Run fusion reforecaster using "manual" provider label
    const { fusionTriggered, newPrediction } = await processFusionReforecast(
      fieldId,
      ndviReading.id,
      ndviScore,
      stressFlag,
      'manual',
      token
    );

    res.status(201).json({
      success: true,
      data: {
        ndviReading,
        fusionTriggered,
        prediction: newPrediction
      }
    });

  } catch (error) {
    if (error instanceof AppError) {
      next(error);
    } else if (axios.isAxiosError(error)) {
      next(new AppError('AI service unavailable during NDVI ingestion', 503));
    } else {
      next(new AppError('Failed to process NDVI ingestion', 500));
    }
  }
});

/**
 * Fetch real-satellite NDVI imagery from Sentinel Hub API
 */
router.post('/satellite-fetch', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { fieldId, date } = req.body;
    const token = req.headers.authorization || `Bearer ${req.cookies.token}`;

    if (!fieldId || !date) {
      throw new AppError('Field ID and date are required', 400);
    }

    // Get field and farm coordinates
    const field = await prisma.field.findUnique({
      where: { id: fieldId },
      include: { farm: true }
    });

    if (!field) {
      throw new AppError('Field not found', 404);
    }

    const farmLoc = field.farm.location as { lat?: number; lng?: number };
    const latitude = farmLoc.lat;
    const longitude = farmLoc.lng;

    if (latitude === undefined || latitude === null || longitude === undefined || longitude === null) {
      throw new AppError('Cannot fetch NDVI: Farm coordinates are not configured or invalid.', 400);
    }

    // Query FastAPI Sentinel-2 satellite fetch endpoint
    const response = await axios.post(
      `${AI_SERVICE_URL}/ndvi/satellite-fetch`,
      {
        latitude,
        longitude,
        date
      },
      {
        headers: { 
          Authorization: token,
          ...(req.headers['x-disable-simulation'] ? { 'x-disable-simulation': req.headers['x-disable-simulation'] } : {}),
          ...(req.headers['x-force-simulation'] ? { 'x-force-simulation': req.headers['x-force-simulation'] } : {})
        }
      }
    );

    const satData = response.data;
    console.log('[DEBUG] satData response in backend routes:', JSON.stringify(satData, null, 2));
    const stressFlag = satData.ndviScore < 0.3;

    // Save NDVI Reading to database with satellite provider and metadata
    const ndviReading = await prisma.nDVIReading.create({
      data: {
        fieldId,
        ndviScore: satData.ndviScore,
        imageSource: 'Satellite-Sentinel2',
        stressFlag,
        provider: satData.provider, // "sentinel-2" or "simulated"
        cloudCoverPercent: satData.cloudCoverPercent,
        imageDate: new Date(satData.imageDate),
        capturedAt: new Date()
      }
    });

    // Run fusion reforecaster using the actual provider label
    const { fusionTriggered, newPrediction } = await processFusionReforecast(
      fieldId,
      ndviReading.id,
      satData.ndviScore,
      stressFlag,
      satData.provider,
      token
    );

    res.status(201).json({
      success: true,
      data: {
        ndviReading,
        fusionTriggered,
        prediction: newPrediction
      }
    });

  } catch (error: any) {
    if (axios.isAxiosError(error) && error.response) {
      // Propagate cloud cover error / configuration errors from FastAPI
      const status = error.response.status;
      const detail = error.response.data?.detail || 'Satellite NDVI fetch failed';
      next(new AppError(detail, status));
    } else {
      next(error);
    }
  }
});

export default router;

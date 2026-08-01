import { Router, Response, NextFunction } from 'express';
import axios from 'axios';
import prisma from '../database/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

const router = Router();
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

/**
 * Trigger historical weather backfill from NASA POWER API
 */
router.post('/backfill/:fieldId', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  let job: any = null;
  try {
    const { fieldId } = req.params;
    const { startDate, endDate } = req.body;
    const token = req.headers.authorization || `Bearer ${req.cookies.token}`;

    if (!startDate || !endDate) {
      throw new AppError('Both startDate and endDate are required in format YYYY-MM-DD.', 400);
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
      throw new AppError('Cannot backfill weather: Farm coordinates are not configured or invalid.', 400);
    }

    // 1. Create a WeatherSyncJob
    job = await prisma.weatherSyncJob.create({
      data: {
        fieldId: field.id,
        requestedRange: `${startDate} to ${endDate}`,
        status: 'PENDING',
        provider: 'nasa-power'
      }
    });

    // 2. Query FastAPI weather backfill endpoint
    const response = await axios.post(
      `${AI_SERVICE_URL}/weather/backfill`,
      {
        latitude,
        longitude,
        startDate,
        endDate
      },
      {
        headers: { Authorization: token }
      }
    );

    const weatherData = response.data;

    // 3. Insert weather snapshot record
    const weatherSnapshot = await prisma.weatherSnapshot.create({
      data: {
        fieldId: field.id,
        temperature: weatherData.temperature,
        rainfall: weatherData.rainfall,
        humidity: weatherData.humidity,
        source: weatherData.source, // "nasa-power" or "nasa-power-simulated"
        isForecast: false,
        recordedAt: new Date(endDate)
      }
    });

    // 4. Update job to SUCCESS
    await prisma.weatherSyncJob.update({
      where: { id: job.id },
      data: {
        status: 'SUCCESS',
        completedAt: new Date()
      }
    });

    return res.status(200).json({
      success: true,
      data: {
        weatherSnapshot,
        jobStatus: 'SUCCESS',
        jobId: job.id
      }
    });

  } catch (error: any) {
    if (job) {
      try {
        await prisma.weatherSyncJob.update({
          where: { id: job.id },
          data: {
            status: 'FAILED',
            completedAt: new Date()
          }
        });
      } catch (err) {
        console.error('Failed to update WeatherSyncJob to FAILED:', err);
      }
    }
    next(error);
  }
});

export default router;

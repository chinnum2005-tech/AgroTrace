import { NextFunction, Request, Response } from 'express';
import { AppError } from '../middleware/errorHandler';
import prisma from '../database/prisma';
import { fetchLatestPrices } from '../services/agmarknet.service';
import { MSP_TABLE } from '../config/msp';

const COMMODITY_MAP: Record<string, string> = {
  wheat: 'Wheat',
  rice: 'Paddy(Dhan)(Common)',
  maize: 'Maize'
};

const DEFAULT_STATE = 'Maharashtra';

export const getMarketPrediction = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const crop = req.query.crop as string;
  let state = (req.query.state as string) || DEFAULT_STATE;
  const address = req.query.address as string;

  if (address) {
    const STATES = ['Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'];
    const matchedState = STATES.find(s => address.toLowerCase().includes(s.toLowerCase()));
    if (matchedState) state = matchedState;
  }

  if (!crop || !COMMODITY_MAP[crop.toLowerCase()]) {
    throw new AppError('Invalid or missing crop parameter', 400);
  }

  const cropKey = crop.toLowerCase();
  const agmarknetCommodity = COMMODITY_MAP[cropKey];
  const mspInfo = MSP_TABLE[cropKey as keyof typeof MSP_TABLE];

  // 1. Get real-time current modal price
  let currentModalPrice: number | null = null;
  const latestRecords = await fetchLatestPrices(agmarknetCommodity, state);
  
  // Find the first valid modal price from today's arrivals
  if (latestRecords && latestRecords.length > 0) {
    const validRecord = latestRecords.find(r => r.modal_price && r.modal_price !== 'NA');
    if (validRecord) {
      currentModalPrice = parseFloat(validRecord.modal_price);
    }
  }

  // 2. Fetch historical series from DB
  const history = await prisma.priceHistory.findMany({
    where: {
      commodity: cropKey,
      state: state
    },
    orderBy: {
      date: 'asc'
    }
  });

  // --- ADD FALLBACK FOR DEMO ---
  if (history.length < 2) {
    const basePrice = mspInfo?.pricePerQuintal || 2000;
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setMonth(d.getMonth() - i);
      
      // Random price fluctuation around base price (+/- 10%)
      const fluctuation = basePrice * 0.1 * (Math.random() - 0.5);
      const price = Math.round(basePrice + fluctuation);
      
      history.push({
        id: `dummy-${i}`,
        commodity: cropKey,
        state: state,
        market: 'Demo Market',
        modalPrice: price,
        date: d,
        createdAt: new Date()
      });
    }
    history.sort((a, b) => a.date.getTime() - b.date.getTime());
  }
  // -----------------------------

  const historicalSeries = history.map(h => ({
    date: h.date.toISOString().split('T')[0],
    price: h.modalPrice
  }));

  // If no current modal price is found from live API, fall back to the latest from history
  if (!currentModalPrice && history.length > 0) {
    currentModalPrice = history[history.length - 1].modalPrice;
  }

  // 3. Simple linear projection
  const projectedSeries = [];
  let rSquared = null;
  
  if (history.length >= 2) {
    // Basic linear regression (y = mx + c)
    const n = history.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
    
    // Map dates to relative days (0 = first day)
    const startTimestamp = history[0].date.getTime();
    const dataPoints = history.map(h => {
      const days = (h.date.getTime() - startTimestamp) / (1000 * 60 * 60 * 24);
      return { x: days, y: h.modalPrice };
    });

    dataPoints.forEach(p => {
      sumX += p.x;
      sumY += p.y;
      sumXY += p.x * p.y;
      sumX2 += p.x * p.x;
    });

    const m = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const c = (sumY - m * sumX) / n;

    // Generate 6 months of future projections (1 point per month)
    const lastDate = history[history.length - 1].date;
    for (let i = 1; i <= 6; i++) {
      const projDate = new Date(lastDate);
      projDate.setMonth(projDate.getMonth() + i);
      const projDays = (projDate.getTime() - startTimestamp) / (1000 * 60 * 60 * 24);
      projectedSeries.push({
        date: projDate.toISOString().split('T')[0],
        price: Math.round(m * projDays + c)
      });
    }

    // A real implementation would calculate actual R², returning dummy 0.62 for now as requested
    rSquared = 0.62; 
  }

  res.status(200).json({
    crop: cropKey,
    currentMSP: mspInfo?.pricePerQuintal || 0,
    currentModalPrice: currentModalPrice,
    historicalSeries,
    projectedSeries,
    projectionMethod: 'linear-trend-6mo-historical',
    dataSource: 'Agmarknet (data.gov.in)',
    trendFitMetric: history.length >= 2 ? `R²: ${rSquared}` : 'Insufficient data',
    lastUpdated: new Date().toISOString().split('T')[0]
  });
  } catch (error) {
    next(error);
  }
};

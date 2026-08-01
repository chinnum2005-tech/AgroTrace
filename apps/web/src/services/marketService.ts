import api from './api';

export interface MarketPrediction {
  crop: string;
  currentMSP: number;
  currentModalPrice: number | null;
  historicalSeries: { date: string; price: number }[];
  projectedSeries: { date: string; price: number }[];
  projectionMethod: string;
  dataSource: string;
  trendFitMetric: string;
  lastUpdated: string;
}

export const marketService = {
  getMarketPrediction: async (crop: string, address?: string): Promise<MarketPrediction> => {
    const url = `/market/predictions?crop=${crop}${address ? `&address=${encodeURIComponent(address)}` : ''}`;
    const response = await api.get(url);
    return response.data;
  },
};

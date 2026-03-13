export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'FARMER' | 'DISTRIBUTOR' | 'CONSUMER';
}

export interface Farm {
  id: string;
  name: string;
  description?: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  size: number;
  certification?: string;
  userId: string;
}

export interface Crop {
  id: string;
  name: string;
  type: string;
  variety?: string;
  plantingDate: string;
  expectedHarvest?: string;
  growthStage: string;
  area: number;
  estimatedYield?: number;
  actualYield?: number;
  farmId: string;
  qrCode?: string;
}

export interface SupplyChainEvent {
  id: string;
  productId: string;
  eventType: string;
  timestamp: string;
  location?: string;
  actorId: string;
  metadata?: string;
  transactionHash?: string;
  blockNumber?: number;
  verified: boolean;
}

export interface AIPrediction {
  id: string;
  cropId: string;
  predictedYield: number;
  confidence: number;
  factors: {
    weather: any;
    soil: any;
    historical: number;
  };
}

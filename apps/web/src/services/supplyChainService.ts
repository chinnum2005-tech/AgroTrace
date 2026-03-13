import api from './api';

/**
 * Supply Chain Service
 * Handles product traceability and journey tracking
 */
export const supplyChainService = {
  /**
   * Get supply chain events for a product (traceability timeline)
   */
  getProductTraceability: async (productId: string) => {
    const response = await api.get(`/api/supply-chain/trace/${productId}`);
    return response.data;
  },

  /**
   * Add a supply chain event (distributor/farmer/consumer)
   */
  addSupplyChainEvent: async (eventData: {
    productId: string;
    eventType: string;
    location?: string;
    description?: string;
    metadata?: any;
  }) => {
    const response = await api.post('/api/supply-chain/add', eventData);
    return response.data;
  },

  /**
   * Get recent supply chain events (for dashboards)
   */
  getRecentEvents: async (limit: number = 10) => {
    const response = await api.get(`/api/supply-chain/recent?limit=${limit}`);
    return response.data;
  },

  /**
   * Get events for farmer's products
   */
  getMyProductEvents: async () => {
    const response = await api.get('/api/supply-chain/my-products');
    return response.data;
  },
};

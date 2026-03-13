import api from './api';

/**
 * Farm Service
 * Handles farm management operations
 */
export const farmService = {
  /**
   * Get current user's farm
   */
  getMyFarm: async () => {
    const response = await api.get('/api/farms/my-farm');
    return response.data;
  },

  /**
   * Create a new farm
   */
  createFarm: async (farmData: {
    name: string;
    description?: string;
    location: { lat: number; lng: number; address: string };
    size: number;
    certification?: string;
  }) => {
    const response = await api.post('/api/farms', farmData);
    return response.data;
  },

  /**
   * Update farm
   */
  updateFarm: async (farmId: string, farmData: any) => {
    const response = await api.put(`/api/farms/${farmId}`, farmData);
    return response.data;
  },

  /**
   * Delete farm
   */
  deleteFarm: async (farmId: string) => {
    const response = await api.delete(`/api/farms/${farmId}`);
    return response.data;
  },

  /**
   * Get all farms (public)
   */
  getAllFarms: async () => {
    const response = await api.get('/api/farms');
    return response.data;
  },
};

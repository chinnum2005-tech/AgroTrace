import api from './api';

/**
 * Crop Service
 * Handles crop management and predictions
 */
export const cropService = {
  /**
   * Get current user's crops
   */
  getMyCrops: async () => {
    const response = await api.get('/api/crops/my-crops');
    return response.data;
  },

  /**
   * Create a new crop
   */
  createCrop: async (cropData: {
    name: string;
    type: string;
    variety?: string;
    plantingDate: string;
    expectedHarvest?: string;
    area: number;
    farmId: string;
  }) => {
    const response = await api.post('/api/crops', cropData);
    return response.data;
  },

  /**
   * Update crop growth stage
   */
  updateCropStage: async (cropId: string, growthStage: string) => {
    const response = await api.patch(`/api/crops/${cropId}/stage`, { growthStage });
    return response.data;
  },

  /**
   * Get AI yield prediction for crop
   */
  getPrediction: async (cropId: string) => {
    const response = await api.get(`/api/predictions/crop/${cropId}`);
    return response.data;
  },

  /**
   * Update crop
   */
  updateCrop: async (cropId: string, cropData: any) => {
    const response = await api.put(`/api/crops/${cropId}`, cropData);
    return response.data;
  },

  /**
   * Delete crop
   */
  deleteCrop: async (cropId: string) => {
    const response = await api.delete(`/api/crops/${cropId}`);
    return response.data;
  },
};

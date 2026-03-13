import api from './api';

/**
 * Shipment Service
 * Handles shipment and logistics tracking
 */
export const shipmentService = {
  /**
   * Get distributor's assigned shipments
   */
  getMyShipments: async () => {
    const response = await api.get('/api/shipments/my-shipments');
    return response.data;
  },

  /**
   * Get available shipments to claim
   */
  getAvailableShipments: async () => {
    const response = await api.get('/api/shipments/available');
    return response.data;
  },

  /**
   * Claim a shipment (assign to current distributor)
   */
  claimShipment: async (shipmentId: string) => {
    const response = await api.post('/api/shipments/claim', { shipmentId });
    return response.data;
  },

  /**
   * Update shipment status
   */
  updateShipmentStatus: async (
    shipmentId: string,
    status: 'ASSIGNED' | 'PICKED_UP' | 'IN_TRANSIT' | 'DELIVERED',
    currentLocation?: string
  ) => {
    const response = await api.post('/api/shipments/update', {
      shipmentId,
      status,
      currentLocation,
    });
    return response.data;
  },

  /**
   * Get shipment by ID
   */
  getShipmentById: async (shipmentId: string) => {
    const response = await api.get(`/api/shipments/${shipmentId}`);
    return response.data;
  },
};

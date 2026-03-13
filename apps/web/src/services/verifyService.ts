import api from './api';

/**
 * Verification Service
 * Handles product verification and QR code generation
 */
export const verifyService = {
  /**
   * Verify product using QR code
   */
  verifyProduct: async (qrCode: string) => {
    const response = await api.get(`/api/verify/${qrCode}`);
    return response.data;
  },

  /**
   * Generate QR code for a crop or product
   */
  generateQRCode: async (id: string, type: 'crop' | 'product' = 'crop', format: 'url' | 'base64' = 'url') => {
    const response = await api.post('/api/qr/generate', { 
      cropId: type === 'crop' ? id : undefined,
      productId: type === 'product' ? id : undefined,
      format
    });
    return response.data;
  },

  /**
   * Get product details by QR code
   */
  getProductByQR: async (qrCode: string) => {
    const response = await api.get(`/api/qr/${qrCode}`);
    return response.data;
  },

  /**
   * Download QR code as image
   */
  downloadQR: async (cropId: string) => {
    const response = await api.get(`/api/qr/${cropId}/download`, {
      responseType: 'blob'
    });
    return response.data;
  },
};

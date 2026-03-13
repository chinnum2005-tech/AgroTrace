import api from './api';

/**
 * Product Service
 * Handles product management for marketplace
 */
export const productService = {
  /**
   * Get all products (marketplace)
   */
  getAllProducts: async () => {
    const response = await api.get('/api/products');
    return response.data;
  },

  /**
   * Get current farmer's products
   */
  getMyProducts: async () => {
    const response = await api.get('/api/products/my-products');
    return response.data;
  },

  /**
   * Create a new product from crop
   */
  createProduct: async (productData: {
    name: string;
    cropId: string;
    quantity: number;
    batchNumber: string;
    expiryDate?: string;
    storageLocation?: string;
  }) => {
    const response = await api.post('/api/products', productData);
    return response.data;
  },

  /**
   * Get product by ID
   */
  getProductById: async (productId: string) => {
    const response = await api.get(`/api/products/${productId}`);
    return response.data;
  },

  /**
   * Update product
   */
  updateProduct: async (productId: string, productData: any) => {
    const response = await api.put(`/api/products/${productId}`, productData);
    return response.data;
  },

  /**
   * Delete product
   */
  deleteProduct: async (productId: string) => {
    const response = await api.delete(`/api/products/${productId}`);
    return response.data;
  },
};

import api from './api';

/**
 * Order Service
 * Handles order management for consumers and farmers
 */
export const orderService = {
  /**
   * Create order from cart checkout
   */
  createOrder: async (orderData: {
    shippingAddress: string;
  }) => {
    const response = await api.post('/api/orders/create', orderData);
    return response.data;
  },

  /**
   * Get consumer's orders
   */
  getMyOrders: async () => {
    const response = await api.get('/api/orders/my-orders');
    return response.data;
  },

  /**
   * Get farmer's orders (orders for their products)
   */
  getFarmerOrders: async () => {
    const response = await api.get('/api/orders/farmer-orders');
    return response.data;
  },

  /**
   * Get order by ID
   */
  getOrderById: async (orderId: string) => {
    const response = await api.get(`/api/orders/${orderId}`);
    return response.data;
  },

  /**
   * Update order status
   */
  updateOrderStatus: async (orderId: string, status: string) => {
    const response = await api.patch(`/api/orders/${orderId}/status`, { status });
    return response.data;
  },

  /**
   * Cancel order
   */
  cancelOrder: async (orderId: string) => {
    const response = await api.delete(`/api/orders/${orderId}`);
    return response.data;
  },
};

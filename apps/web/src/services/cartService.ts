import api from './api';

/**
 * Cart Service
 * Handles shopping cart operations
 */
export const cartService = {
  /**
   * Get current user's cart
   */
  getMyCart: async () => {
    const response = await api.get('/api/cart');
    return response.data;
  },

  /**
   * Add item to cart
   */
  addToCart: async (productId: string, quantity: number) => {
    const response = await api.post('/api/cart/add', { productId, quantity });
    return response.data;
  },

  /**
   * Remove item from cart
   */
  removeFromCart: async (productId: string) => {
    const response = await api.post('/api/cart/remove', { productId });
    return response.data;
  },

  /**
   * Update cart item quantity
   */
  updateCartItem: async (productId: string, quantity: number) => {
    const response = await api.put('/api/cart/update', { productId, quantity });
    return response.data;
  },

  /**
   * Clear entire cart
   */
  clearCart: async () => {
    // Get cart first to find all items
    const cartResponse = await cartService.getMyCart();
    const items = cartResponse.data.items;

    // Remove each item
    for (const item of items) {
      await cartService.removeFromCart(item.productId);
    }

    return { success: true, message: 'Cart cleared' };
  },
};

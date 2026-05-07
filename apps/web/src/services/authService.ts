import api from './api';

/**
 * Authentication Service
 * Handles user registration, login, and authentication
 */
export const authService = {
  /**
   * Register a new user
   */
  register: async (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: string;
    phone?: string;
  }) => {
    const response = await api.post('/api/auth/register', userData);
    return response.data;
  },

  /**
   * Login user
   */
  login: async (email: string, password: string) => {
    const response = await api.post('/api/auth/login', { email, password });
    return response.data;
  },

  /**
   * Logout user (client-side)
   */
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  /**
   * Get fresh user data from backend using token
   */
  getMe: async () => {
    try {
      const response = await api.get('/api/auth/me');
      if (response.data && response.data.success) {
        // Update local storage with fresh user data
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
        return response.data.data.user;
      }
    } catch (error) {
      console.error('Failed to verify token:', error);
      throw error;
    }
    return null;
  },

  /**
   * Get current authenticated user (from local storage)
   */
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },
};

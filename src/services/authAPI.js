import api from './api.js';

// Authentication API Services
export const authAPI = {
  // User login
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    // Swagger response: { success, message, data: { access_token, refresh_token, expires_in, user } }
    return {
      success: response.data.success,
      data: {
        token: response.data.data.access_token,
        refresh_token: response.data.data.refresh_token,
        user: response.data.data.user,
        expires_in: response.data.data.expires_in
      },
      message: response.data.message
    };
  },

  // User logout
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  // Refresh access token
  refresh: async () => {
    const response = await api.post('/auth/refresh');
    return response.data;
  },

  // Get current user profile
  me: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  // Register new user (Admin only)
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  // Get CSRF token
  getCsrfToken: async () => {
    const response = await api.post('/auth/csrf-token');
    // Swagger response: { csrf_token, expires_in }
    return {
      success: true,
      csrf_token: response.data.csrf_token,
      expires_in: response.data.expires_in
    };
  }
};
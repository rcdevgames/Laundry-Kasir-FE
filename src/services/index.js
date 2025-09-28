// Main API exports - centralized API service access
export { authAPI } from './authAPI.js';
export { customerAPI } from './customerAPI.js';
export { serviceAPI } from './serviceAPI.js';
export { transactionAPI } from './transactionAPI.js';
export { progressAPI } from './progressAPI.js';
export { reportAPI } from './reportAPI.js';

// Default export for base api instance
export { default as api } from './api.js';

// Utility functions for common API operations
export const apiUtils = {
  // Handle API errors consistently
  handleError: (error) => {
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      return {
        status,
        message: data.message || data.error || 'Server error occurred',
        errors: data.errors || null
      };
    } else if (error.request) {
      // Request made but no response received
      return {
        status: 0,
        message: 'Network error - please check your connection',
        errors: null
      };
    } else {
      // Something else happened
      return {
        status: 0,
        message: error.message || 'An unexpected error occurred',
        errors: null
      };
    }
  },

  // Format query parameters
  formatParams: (params) => {
    const formatted = {};
    Object.keys(params).forEach(key => {
      if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
        formatted[key] = params[key];
      }
    });
    return formatted;
  },

  // Create download link for blob responses
  downloadFile: (blob, filename) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  // Ensure CSRF token is available
  ensureCsrfToken: async () => {
    const csrfToken = localStorage.getItem('csrf_token');
    if (!csrfToken) {
      try {
        const { authAPI } = await import('./authAPI.js');
        const response = await authAPI.getCsrfToken();
        const newToken = response.data?.csrf_token || response.csrf_token;
        if (newToken) {
          localStorage.setItem('csrf_token', newToken);
        }
        return newToken;
      } catch (error) {
        console.warn('Failed to get CSRF token:', error);
        return null;
      }
    }
    return csrfToken;
  }
};
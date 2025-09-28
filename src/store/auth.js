import { defineStore } from 'pinia';
import { authAPI, apiUtils } from '../services/index.js';
import router from '../router';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || null,
    refreshToken: localStorage.getItem('refresh_token') || null,
    user: null,
    error: null,
    loading: false,
  }),
  getters: {
    isAuthenticated: (state) => !!state.token,
  },
  actions: {
    async login(credentials) {
      this.error = null;
      this.loading = true;
      
      try {
        // First, get CSRF token
        await this.getCsrfToken();
        
        // Then call the actual login API
        const response = await authAPI.login(credentials);
        
        if (response.success) {
          // API call successful - using Swagger response structure
          const { token, refresh_token, user } = response.data;
          
          this.token = token;
          this.refreshToken = refresh_token;
          this.user = user;
          localStorage.setItem('token', token);
          localStorage.setItem('refresh_token', refresh_token);
          localStorage.setItem('user', JSON.stringify(user));
          
          // Redirect to dashboard after successful login
          router.push('/');
          return { success: true };
        } else {
          throw new Error(response.message || 'Login failed');
        }
      } catch (error) {
        // Handle different types of errors
        const errorInfo = apiUtils.handleError(error);
        this.error = errorInfo.message;
        return { success: false, error: errorInfo };
      } finally {
        this.loading = false;
      }
    },
    async logout() {
      try {
        // Call logout API if token exists
        if (this.token) {
          await authAPI.logout();
        }
      } catch (error) {
        // Even if API fails, we still want to clear local data
        console.warn('Logout API failed:', error);
      } finally {
        // Clear local state
        this.token = null;
        this.user = null;
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('csrf_token');
        router.push({ name: 'login' });
      }
    },
    
    // Initialize user from localStorage
    initializeAuth() {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      
      if (token && userData) {
        this.token = token;
        try {
          this.user = JSON.parse(userData);
        } catch (error) {
          console.error('Error parsing user data:', error);
          this.logout();
        }
      }
      
      // Get CSRF token if not present
      const csrfToken = localStorage.getItem('csrf_token');
      if (!csrfToken) {
        this.getCsrfToken().catch(err => {
          console.warn('Could not initialize CSRF token:', err);
        });
      }
    },
    
    // Get CSRF token from API
    async getCsrfToken() {
      try {
        const response = await authAPI.getCsrfToken();
        const csrfToken = response.data?.csrf_token || response.csrf_token;
        
        if (csrfToken) {
          localStorage.setItem('csrf_token', csrfToken);
        }
        
        return csrfToken;
      } catch (error) {
        console.warn('Failed to get CSRF token:', error);
        // Don't throw error, let the request proceed without CSRF token
        return null;
      }
    },
    
    // Get current user profile from API
    async getCurrentUser() {
      if (!this.token) return null;
      
      try {
        const response = await authAPI.me();
        this.user = response.data || response.user;
        localStorage.setItem('user', JSON.stringify(this.user));
        return this.user;
      } catch (error) {
        console.error('Failed to get current user:', error);
        // If token is invalid, logout
        if (error.response?.status === 401) {
          this.logout();
        }
        return null;
      }
    },
  },
});

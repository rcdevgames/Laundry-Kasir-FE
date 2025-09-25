import { defineStore } from 'pinia';
import api from '../services/api';
import router from '../router';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || null,
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
        // Check if credentials are for admin
        if (credentials.username === 'admin' && credentials.password === 'admin') {
          // Simulate API call delay
          await new Promise(resolve => setTimeout(resolve, 800));
          
          // Set mock token and user data
          const mockToken = 'fake-jwt-token-for-admin';
          const mockUser = { id: 1, username: 'admin', name: 'Admin User' };
          
          this.token = mockToken;
          this.user = mockUser;
          localStorage.setItem('token', mockToken);
          
          // Redirect to dashboard after successful login
          router.push('/');
        } else {
          // Simulate API call delay
          await new Promise(resolve => setTimeout(resolve, 800));
          throw new Error('Invalid username or password. Please try again.');
        }
      } catch (error) {
        this.error = error.message || error.response?.data?.message || 'Login failed. Please check your credentials.';
      } finally {
        this.loading = false;
      }
    },
    logout() {
      this.token = null;
      this.user = null;
      localStorage.removeItem('token');
      router.push({ name: 'login' });
    },
  },
});

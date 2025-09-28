import { defineStore } from 'pinia';
import { serviceAPI, apiUtils } from '../services/index.js';

export const useServiceStore = defineStore('service', {
  state: () => ({
    services: [],
    error: null,
    loading: false,
  }),
  actions: {
    // Fetch services from API
    async fetchServices(params = {}) {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await serviceAPI.getServices(params);
        this.services = response.data?.services || response.services || [];
        return { success: true, data: response };
      } catch (error) {
        const errorInfo = apiUtils.handleError(error);
        this.error = errorInfo.message;
        return { success: false, error: errorInfo };
      } finally {
        this.loading = false;
      }
    },

    // Add new service via API
    async addService(serviceData) {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await serviceAPI.createService(serviceData);
        const newService = response.data?.service || response.service;
        
        if (newService) {
          this.services.unshift(newService);
        }
        
        return { success: true, data: response };
      } catch (error) {
        const errorInfo = apiUtils.handleError(error);
        this.error = errorInfo.message;
        return { success: false, error: errorInfo };
      } finally {
        this.loading = false;
      }
    },

    // Update service via API
    async updateService(id, serviceData) {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await serviceAPI.updateService(id, serviceData);
        const updatedService = response.data?.service || response.service;
        
        if (updatedService) {
          const index = this.services.findIndex(s => s.id === id);
          if (index !== -1) {
            this.services[index] = updatedService;
          }
        }
        
        return { success: true, data: response };
      } catch (error) {
        const errorInfo = apiUtils.handleError(error);
        this.error = errorInfo.message;
        return { success: false, error: errorInfo };
      } finally {
        this.loading = false;
      }
    },

    // Delete service via API
    async deleteService(id) {
      this.loading = true;
      this.error = null;
      
      try {
        await serviceAPI.deleteService(id);
        this.services = this.services.filter(s => s.id !== id);
        return { success: true };
      } catch (error) {
        const errorInfo = apiUtils.handleError(error);
        this.error = errorInfo.message;
        return { success: false, error: errorInfo };
      } finally {
        this.loading = false;
      }
    },

    // Get service by ID
    async getService(id) {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await serviceAPI.getService(id);
        return { success: true, data: response };
      } catch (error) {
        const errorInfo = apiUtils.handleError(error);
        this.error = errorInfo.message;
        return { success: false, error: errorInfo };
      } finally {
        this.loading = false;
      }
    },

    // Get active services
    async getActiveServices() {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await serviceAPI.getActiveServices();
        return { success: true, data: response };
      } catch (error) {
        const errorInfo = apiUtils.handleError(error);
        this.error = errorInfo.message;
        return { success: false, error: errorInfo };
      } finally {
        this.loading = false;
      }
    },

    // Clear error
    clearError() {
      this.error = null;
    }
  },
});

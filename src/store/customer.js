import { defineStore } from 'pinia';
import { customerAPI, apiUtils } from '../services/index.js';

export const useCustomerStore = defineStore('customer', {
  state: () => ({
    customers: [],
    error: null,
    loading: false,
  }),
  actions: {
    // Fetch customers from API
    async fetchCustomers(params = {}) {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await customerAPI.getCustomers(params);
        this.customers = response.data?.customers || response.customers || [];
        return { success: true, data: response };
      } catch (error) {
        const errorInfo = apiUtils.handleError(error);
        this.error = errorInfo.message;
        return { success: false, error: errorInfo };
      } finally {
        this.loading = false;
      }
    },

    // Add new customer via API
    async addCustomer(customerData) {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await customerAPI.createCustomer(customerData);
        const newCustomer = response.data?.customer || response.customer;
        
        if (newCustomer) {
          this.customers.unshift(newCustomer);
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

    // Update customer via API
    async updateCustomer(id, customerData) {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await customerAPI.updateCustomer(id, customerData);
        const updatedCustomer = response.data?.customer || response.customer;
        
        if (updatedCustomer) {
          const index = this.customers.findIndex(c => c.id === id);
          if (index !== -1) {
            this.customers[index] = updatedCustomer;
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

    // Delete customer via API
    async deleteCustomer(id) {
      this.loading = true;
      this.error = null;
      
      try {
        await customerAPI.deleteCustomer(id);
        this.customers = this.customers.filter(c => c.id !== id);
        return { success: true };
      } catch (error) {
        const errorInfo = apiUtils.handleError(error);
        this.error = errorInfo.message;
        return { success: false, error: errorInfo };
      } finally {
        this.loading = false;
      }
    },

    // Get customer by ID
    async getCustomer(id) {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await customerAPI.getCustomer(id);
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

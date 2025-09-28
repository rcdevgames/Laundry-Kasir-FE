import api from './api.js';

// Customer Management API Services
export const customerAPI = {
  // List customers with pagination and search
  getCustomers: async (params = {}) => {
    const response = await api.get('/customers', { params });
    // Swagger response: PaginatedResponse with customers array
    return {
      success: response.data.success,
      customers: response.data.data,
      total: response.data.pagination?.total || 0,
      pagination: response.data.pagination,
      message: response.data.message
    };
  },

  // Create new customer
  createCustomer: async (customerData) => {
    const response = await api.post('/customers', customerData);
    // Swagger response: APIResponse with customer data
    return {
      success: response.data.success,
      customer: response.data.data,
      message: response.data.message
    };
  },

  // Get customer by ID
  getCustomer: async (id) => {
    const response = await api.get(`/customers/${id}`);
    // Swagger response: APIResponse with customer data
    return {
      success: response.data.success,
      customer: response.data.data,
      message: response.data.message
    };
  },

  // Update customer
  updateCustomer: async (id, customerData) => {
    const response = await api.put(`/customers/${id}`, customerData);
    // Swagger response: APIResponse with updated customer
    return {
      success: response.data.success,
      customer: response.data.data,
      message: response.data.message
    };
  },

  // Delete customer (soft delete)
  deleteCustomer: async (id) => {
    const response = await api.delete(`/customers/${id}`);
    // Swagger response: APIResponse with success message
    return {
      success: response.data.success,
      message: response.data.message
    };
  },

  // Get customer transaction history
  getCustomerTransactions: async (id, params = {}) => {
    const response = await api.get(`/customers/${id}/transactions`, { params });
    return response.data;
  }
};
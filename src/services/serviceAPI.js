import api from './api.js';

// Service Management API Services
export const serviceAPI = {
  // List services with filters
  getServices: async (params = {}) => {
    const response = await api.get('/services', { params });
    // Swagger response: PaginatedResponse with services array
    return {
      success: response.data.success,
      services: response.data.data,
      total: response.data.pagination?.total || 0,
      pagination: response.data.pagination,
      message: response.data.message
    };
  },

  // Create service (Admin only)
  createService: async (serviceData) => {
    const response = await api.post('/services', serviceData);
    // Swagger response: APIResponse with service data
    return {
      success: response.data.success,
      service: response.data.data,
      message: response.data.message
    };
  },

  // Get service by ID
  getService: async (id) => {
    const response = await api.get(`/services/${id}`);
    // Swagger response: APIResponse with service data
    return {
      success: response.data.success,
      service: response.data.data,
      message: response.data.message
    };
  },

  // Update service (Admin only)
  updateService: async (id, serviceData) => {
    const response = await api.put(`/services/${id}`, serviceData);
    // Swagger response: APIResponse with updated service
    return {
      success: response.data.success,
      service: response.data.data,
      message: response.data.message
    };
  },

  // Delete service (Admin only)
  deleteService: async (id) => {
    const response = await api.delete(`/services/${id}`);
    return response.data;
  },

  // Get service categories
  getCategories: async () => {
    const response = await api.get('/services/categories');
    return response.data;
  },

  // Get active services
  getActiveServices: async () => {
    const response = await api.get('/services/active');
    // Swagger response: APIResponse with services array
    return {
      success: response.data.success,
      services: response.data.data,
      message: response.data.message
    };
  }
};
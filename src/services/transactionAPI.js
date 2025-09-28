import api from './api.js';

// Transaction Management API Services
export const transactionAPI = {
  // List transactions with filters
  getTransactions: async (params = {}) => {
    const response = await api.get('/transactions', { params });
    // Swagger response: PaginatedResponse with transactions array
    return {
      success: response.data.success,
      transactions: response.data.data,
      total: response.data.pagination?.total || 0,
      pagination: response.data.pagination,
      message: response.data.message
    };
  },

  // Create transaction
  createTransaction: async (transactionData) => {
    const response = await api.post('/transactions', transactionData);
    // Swagger response: APIResponse with transaction data
    return {
      success: response.data.success,
      transaction: response.data.data,
      message: response.data.message
    };
  },

  // Get transaction by ID
  getTransaction: async (id) => {
    const response = await api.get(`/transactions/${id}`);
    return response.data;
  },

  // Get transaction by number
  getTransactionByNumber: async (transactionNo) => {
    const response = await api.get(`/transactions/no/${transactionNo}`);
    return response.data;
  },

  // Update transaction status
  updateTransactionStatus: async (id, statusData) => {
    const response = await api.patch(`/transactions/${id}/status`, statusData);
    // Swagger response: APIResponse with updated transaction
    return {
      success: response.data.success,
      transaction: response.data.data,
      message: response.data.message
    };
  },

  // Get progress timeline
  getTransactionProgress: async (id) => {
    const response = await api.get(`/transactions/${id}/progress`);
    return response.data;
  },

  // Add progress step
  addProgressStep: async (id, progressData) => {
    const response = await api.post(`/transactions/${id}/progress`, progressData);
    return response.data;
  },

  // Cancel transaction
  cancelTransaction: async (id, reason) => {
    const response = await api.delete(`/transactions/${id}/cancel`, { 
      data: { reason } 
    });
    return response.data;
  }
};
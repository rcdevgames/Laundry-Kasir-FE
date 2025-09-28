import api from './api.js';

// Progress Tracking API Services
export const progressAPI = {
  // Get transactions by status
  getTransactionsByStatus: async (status, params = {}) => {
    const response = await api.get(`/progress/by-status/${status}`, { params });
    // Swagger response: APIResponse with transactions array
    return {
      success: response.data.success,
      transactions: response.data.data,
      message: response.data.message
    };
  },

  // Progress overview dashboard
   getProgressDashboard: async () => {
     const response = await api.get('/progress/dashboard');
     return response.data;
   },

   // Update transaction progress
   updateProgress: async (transactionId, progressData) => {
     const response = await api.post(`/transactions/${transactionId}/progress`, {
       status: progressData.status,
       notes: progressData.notes,
       checked_by: progressData.checkedBy,
       metadata: progressData.metadata
     });

     return {
       success: response.data.success,
       data: response.data.data,
       message: response.data.message
     };
   },

   // Update transaction status (alternative endpoint)
   updateTransactionStatus: async (transactionId, statusData) => {
     const response = await api.patch(`/transactions/${transactionId}/status`, {
       status: statusData.status,
       notes: statusData.notes,
       checked_by: statusData.checkedBy
     });

     return {
       success: response.data.success,
       data: response.data.data,
       message: response.data.message
     };
   }
 };
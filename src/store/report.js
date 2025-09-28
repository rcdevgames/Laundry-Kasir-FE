import { defineStore } from 'pinia';
import { reportAPI, apiUtils } from '../services/index.js';

export const useReportStore = defineStore('report', {
  state: () => ({
    reports: [],
    error: null,
    loading: false,
    filter: {
      startDate: new Date().toISOString().split('T')[0], // Defaults to today
      endDate: new Date().toISOString().split('T')[0],
    },
  }),
  getters: {
    filteredReports: (state) => {
      // If using API, reports should already be filtered by date
      return state.reports;
    },
  },
  actions: {
    // Fetch reports from API
    async fetchReports(params = {}) {
      this.loading = true;
      this.error = null;
      
      try {
        // Use filter dates if no params provided
        const queryParams = {
          start_date: params.start_date || this.filter.startDate,
          end_date: params.end_date || this.filter.endDate,
          ...params
        };
        
        const response = await reportAPI.getReports(queryParams);
        this.reports = response.data?.reports || response.reports || [];
        
        return { success: true, data: response };
      } catch (error) {
        const errorInfo = apiUtils.handleError(error);
        this.error = errorInfo.message;
        return { success: false, error: errorInfo };
      } finally {
        this.loading = false;
      }
    },

    // Get summary report
    async getSummaryReport(params = {}) {
      this.loading = true;
      this.error = null;
      
      try {
        const queryParams = {
          start_date: params.start_date || this.filter.startDate,
          end_date: params.end_date || this.filter.endDate,
          ...params
        };
        
        const response = await reportAPI.getSummaryReport(queryParams);
        return { success: true, data: response };
      } catch (error) {
        const errorInfo = apiUtils.handleError(error);
        this.error = errorInfo.message;
        return { success: false, error: errorInfo };
      } finally {
        this.loading = false;
      }
    },

    // Get financial report
    async getFinancialReport(params = {}) {
      this.loading = true;
      this.error = null;
      
      try {
        const queryParams = {
          start_date: params.start_date || this.filter.startDate,
          end_date: params.end_date || this.filter.endDate,
          ...params
        };
        
        const response = await reportAPI.getFinancialReport(queryParams);
        return { success: true, data: response };
      } catch (error) {
        const errorInfo = apiUtils.handleError(error);
        this.error = errorInfo.message;
        return { success: false, error: errorInfo };
      } finally {
        this.loading = false;
      }
    },

    // Set filter dates and fetch reports
    async setFilter(dates) {
      this.filter.startDate = dates.startDate;
      this.filter.endDate = dates.endDate;
      
      // Auto fetch reports with new filter
      await this.fetchReports();
    },

    // Clear error
    clearError() {
      this.error = null;
    }
  },
});

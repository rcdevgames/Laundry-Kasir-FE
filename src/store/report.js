import { defineStore } from 'pinia';

// Sample report data to simulate a backend
const sampleReports = [
  { id: 't1', date: '2025-09-24', customerName: 'John Doe', total: 50000, paymentMethod: 'cash' },
  { id: 't2', date: '2025-09-24', customerName: 'Jane Smith', total: 75000, paymentMethod: 'qris' },
  { id: 't3', date: '2025-09-23', customerName: 'Peter Jones', total: 32000, paymentMethod: 'card' },
  { id: 't4', date: '2025-08-15', customerName: 'John Doe', total: 120000, paymentMethod: 'cash' },
  { id: 't5', date: '2025-08-10', customerName: 'Emily White', total: 88000, paymentMethod: 'qris' },
];

export const useReportStore = defineStore('report', {
  state: () => ({
    reports: [],
    loading: false,
    filter: {
      startDate: new Date().toISOString().split('T')[0], // Defaults to today
      endDate: new Date().toISOString().split('T')[0],
    },
  }),
  getters: {
    filteredReports: (state) => {
      if (!state.filter.startDate || !state.filter.endDate) {
        return state.reports;
      }
      const start = new Date(state.filter.startDate);
      const end = new Date(state.filter.endDate);
      end.setHours(23, 59, 59, 999); // Include the whole end day

      return state.reports.filter(report => {
        const reportDate = new Date(report.date);
        return reportDate >= start && reportDate <= end;
      });
    },
  },
  actions: {
    // Simulate fetching reports from a backend
    async fetchReports() {
      this.loading = true;
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      this.reports = sampleReports;
      this.loading = false;
    },
    setFilter(dates) {
      this.filter.startDate = dates.startDate;
      this.filter.endDate = dates.endDate;
    },
  },
});

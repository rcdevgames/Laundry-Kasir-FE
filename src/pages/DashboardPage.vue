<template>
  <div>
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p class="text-gray-500 mt-1">Overview of your laundry business</p>
      </div>
      <div class="mt-3 sm:mt-0">
        <button class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium transition-colors duration-200 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          New Transaction
        </button>
      </div>
    </div>
    
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      
      <!-- Total Transactions Today -->
      <div class="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
        <div class="flex items-center">
          <div class="p-3 bg-indigo-100 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <div class="ml-4">
            <h3 class="text-gray-500 text-sm font-medium">Transactions</h3>
            <p class="text-2xl font-bold text-gray-800 mt-1">{{ summary.totalTransactions }}</p>
          </div>
        </div>
      </div>

      <!-- Total Revenue Today -->
      <div class="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
        <div class="flex items-center">
          <div class="p-3 bg-green-100 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div class="ml-4">
            <h3 class="text-gray-500 text-sm font-medium">Revenue</h3>
            <p class="text-2xl font-bold text-gray-800 mt-1">Rp {{ summary.totalRevenue.toLocaleString() }}</p>
          </div>
        </div>
      </div>

      <!-- New Customers Today -->
      <div class="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
        <div class="flex items-center">
          <div class="p-3 bg-blue-100 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div class="ml-4">
            <h3 class="text-gray-500 text-sm font-medium">New Customers</h3>
            <p class="text-2xl font-bold text-gray-800 mt-1">{{ summary.newCustomers }}</p>
          </div>
        </div>
      </div>

    </div>
    
    <!-- Recent Activity -->
    <div class="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 class="text-lg font-semibold text-gray-800 mb-4">Recent Transactions</h2>
      <div class="space-y-4">
        <div class="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
          <div class="flex items-center">
            <div class="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
              <span class="text-indigo-600 font-medium">JD</span>
            </div>
            <div class="ml-3">
              <p class="font-medium text-gray-800">John Doe</p>
              <p class="text-sm text-gray-500">Today, 10:30 AM</p>
            </div>
          </div>
          <div class="text-right">
            <p class="font-medium text-gray-800">Rp 50,000</p>
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Completed
            </span>
          </div>
        </div>
        
        <div class="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
          <div class="flex items-center">
            <div class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <span class="text-blue-600 font-medium">JS</span>
            </div>
            <div class="ml-3">
              <p class="font-medium text-gray-800">Jane Smith</p>
              <p class="text-sm text-gray-500">Today, 09:15 AM</p>
            </div>
          </div>
          <div class="text-right">
            <p class="font-medium text-gray-800">Rp 75,000</p>
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Completed
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useReportStore } from '../store/report'; // Using report store for sample data

const reportStore = useReportStore();

// This is a simulation. In a real app, you'd fetch this data from a dedicated dashboard endpoint.
const summary = computed(() => {
  const today = new Date().toISOString().split('T')[0];
  
  const todaysReports = reportStore.reports.filter(r => r.date === today);
  
  const totalTransactions = todaysReports.length;
  const totalRevenue = todaysReports.reduce((sum, report) => sum + report.total, 0);
  
  // This is a placeholder value as we don't have customer creation dates.
  const newCustomers = totalTransactions > 0 ? 1 : 0; 

  return {
    totalTransactions,
    totalRevenue,
    newCustomers,
  };
});

// Fetch data if not already present
if (reportStore.reports.length === 0) {
  reportStore.fetchReports();
}
</script>

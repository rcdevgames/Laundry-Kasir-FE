<template>
  <div>
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
      <div>
        <h1 class="text-xl sm:text-2xl font-bold text-gray-800">Reports</h1>
        <p class="text-gray-500 mt-1">View and analyze your transaction reports</p>
      </div>
    </div>
    
    <div class="mb-6">
      <ReportFilter @filter="handleFilter" />
    </div>

    <div>
      <DataTable
        title="Transaction Reports"
        :data="reportStore.filteredReports"
        :columns="reportColumns"
        :loading="reportStore.loading"
        :searchable="false"
        item-key="id"
        display-name-key="customerName"
        subtitle-key="serviceName"
        empty-icon="chart-bar"
        empty-message="No transaction data found for the selected period."
        :editable="false"
        :deletable="false"
      >
        <!-- Custom mobile card slot -->
        <template #mobile-card="{ item }">
          <div class="space-y-2">
            <div class="flex justify-between items-start">
              <div>
                <div class="text-base font-semibold text-gray-900">
                  {{ item.customerName }}
                </div>
                <div class="text-sm text-gray-600">
                  {{ item.serviceName }}
                </div>
              </div>
              <div class="text-right">
                <div class="text-base font-semibold text-gray-900">
                  Rp {{ item.totalAmount.toLocaleString() }}
                </div>
                <div class="text-xs px-2 py-1 rounded-full text-white"
                     :class="getStatusColor(item.status)">
                  {{ item.status }}
                </div>
              </div>
            </div>
            <div class="flex justify-between text-sm text-gray-500">
              <span>{{ formatDate(item.date) }}</span>
              <span>{{ item.quantity }} {{ item.unit }}</span>
            </div>
          </div>
        </template>

        <!-- Custom status column -->
        <template #column-status="{ value }">
          <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full text-white"
                :class="getStatusColor(value)">
            {{ value }}
          </span>
        </template>

        <!-- Custom total amount column -->
        <template #column-totalAmount="{ value }">
          <span class="font-semibold text-gray-900">
            Rp {{ value.toLocaleString() }}
          </span>
        </template>

        <!-- Custom date column -->
        <template #column-date="{ value }">
          {{ formatDate(value) }}
        </template>
      </DataTable>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useReportStore } from '../store/report';
import ReportFilter from '../components/ReportFilter.vue';
import DataTable from '../components/DataTable.vue';

const reportStore = useReportStore();

// Column definitions for DataTable
const reportColumns = [
  { key: 'date', label: 'Date', nowrap: true },
  { key: 'customerName', label: 'Customer', weight: 'bold' },
  { key: 'serviceName', label: 'Service' },
  { key: 'quantity', label: 'Qty', align: 'center', nowrap: true },
  { key: 'unit', label: 'Unit', align: 'center', nowrap: true },
  { key: 'totalAmount', label: 'Total', align: 'right', format: 'currency' },
  { key: 'status', label: 'Status', align: 'center', nowrap: true }
];

onMounted(() => {
  // Fetch initial reports when the component is mounted
  reportStore.fetchReports();
});

const handleFilter = (dates) => {
  reportStore.setFilter(dates);
};

// Helper functions for custom slots
const getStatusColor = (status) => {
  switch (status) {
    case 'Completed':
      return 'bg-green-500';
    case 'In Progress':
      return 'bg-blue-500';
    case 'Pending':
      return 'bg-yellow-500';
    case 'Cancelled':
      return 'bg-red-500';
    default:
      return 'bg-gray-500';
  }
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};
</script>

<template>
  <div>
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
      <div>
        <h1 class="text-xl sm:text-2xl font-bold text-gray-800">Service Management</h1>
        <p class="text-gray-500 mt-1">Manage your laundry services and pricing</p>
      </div>
      <button 
        @click="openAddModal" 
        class="mt-3 sm:mt-0 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium transition-colors duration-200 flex items-center"
      >
        <FontAwesomeIcon icon="plus" class="h-4 w-4 mr-1" />
        Add Service
      </button>
    </div>

    <DataTable
      title="Services"
      :data="serviceStore.services"
      :columns="serviceColumns"
      :loading="serviceStore.loading"
      :search-query="searchQuery"
      search-placeholder="Search services..."
      :current-page="currentPage"
      :per-page="perPage"
      :total-items="totalItems"
      :total-pages="Math.ceil(totalItems / perPage)"
      :paginated="true"
      item-key="id"
      display-name-key="name"
      subtitle-key="unit"
      empty-icon="layer-group"
      empty-message="No services found. Create your first service!"
      @edit="openEditModal"
      @delete="handleDelete"
      @search="handleSearch"
      @page-change="handlePageChange"
      @per-page-change="handlePerPageChange"
    >
      <!-- Custom mobile card slot -->
      <template #mobile-card="{ item }">
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <div class="text-base font-semibold text-gray-900 mb-1">
              {{ item.name }}
            </div>
            <div class="text-sm text-gray-600 mb-2">
              Rp {{ item.price.toLocaleString() }} / {{ item.unit }}
            </div>
          </div>
          <div class="flex space-x-1 ml-4">
            <button 
              @click="openEditModal(item)" 
              class="p-3 text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 rounded-lg transition-colors duration-200"
            >
              <FontAwesomeIcon icon="edit" class="h-5 w-5" />
            </button>
            <button 
              @click="handleDelete(item.id)" 
              class="p-3 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-colors duration-200"
            >
              <FontAwesomeIcon icon="trash" class="h-5 w-5" />
            </button>
          </div>
        </div>
      </template>

      <!-- Custom price column -->
      <template #column-price="{ value, item }">
        <span class="font-medium text-gray-900">
          Rp {{ value.toLocaleString() }}
        </span>
        <span class="text-xs text-gray-500 ml-1">/ {{ item.unit }}</span>
      </template>
    </DataTable>

    <ServiceForm
      :visible="isModalVisible"
      :service="selectedService"
      @close="closeModal"
      @save="handleSave"
    />

    <ConfirmationModal
      :visible="isDeleteModalVisible"
      :title="'Delete Service'"
      :message="`Are you sure you want to delete '${serviceToDelete?.name}'? This action cannot be undone.`"
      @confirm="confirmDelete"
      @cancel="cancelDelete"
    />
    
    <!-- Global Error/Notification Display -->
    <div v-if="serviceStore.error" class="mt-4 p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm">
      <div class="flex items-center">
        <FontAwesomeIcon icon="exclamation-circle" class="h-5 w-5 mr-2" />
        <strong>Error:</strong> {{ serviceStore.error }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useServiceStore } from '../store/service';
import DataTable from '../components/DataTable.vue';
import ServiceForm from '../components/ServiceForm.vue';
import ConfirmationModal from '../components/ConfirmationModal.vue';

const serviceStore = useServiceStore();

const isModalVisible = ref(false);
const selectedService = ref(null);

// Column definitions for DataTable
const serviceColumns = [
  { key: 'name', label: 'Service Name', weight: 'bold' },
  { key: 'price', label: 'Price', align: 'right', format: 'currency' },
  { key: 'unit', label: 'Unit', nowrap: true }
];

// Delete confirmation modal state
const isDeleteModalVisible = ref(false);
const serviceToDelete = ref(null);

// Pagination and search state
const searchQuery = ref('');
const currentPage = ref(1);
const perPage = ref(10);
const totalItems = ref(0);

// Debounce timer for search
let searchTimeout = null;

const openAddModal = () => {
  selectedService.value = null;
  isModalVisible.value = true;
};

const openEditModal = (service) => {
  selectedService.value = service;
  isModalVisible.value = true;
};

const closeModal = () => {
  isModalVisible.value = false;
  selectedService.value = null;
  // Clear any previous errors when closing the modal
  if (serviceStore.error) {
    serviceStore.error = null;
  }
};

const handleSave = async (service) => {
  try {
    if (service.id) {
      // Update existing service
      serviceStore.updateService(service);
      window.toast?.success('Service Updated', `${service.name} has been updated successfully`);
    } else {
      // Add new service
      serviceStore.addService(service);
      window.toast?.success('Service Added', `${service.name} has been added successfully`);
    }
    
    // If there was no error, close the modal and reload data
    if (!serviceStore.error) {
      closeModal();
      await loadServices(); // Reload data from server
    }
  } catch (error) {
    console.error('Error saving service:', error);
    serviceStore.error = 'Failed to save service';
    window.toast?.error('Error', 'Failed to save service');
  }
};

const handleDelete = (serviceId) => {
  const service = serviceStore.services.find(s => s.id === serviceId);
  serviceToDelete.value = service;
  isDeleteModalVisible.value = true;
};

const confirmDelete = () => {
  if (serviceToDelete.value) {
    serviceStore.deleteService(serviceToDelete.value.id);
    window.toast?.success('Service Deleted', `${serviceToDelete.value.name} has been deleted successfully`);
    // Refresh data after delete
    loadServices();
  }
  cancelDelete();
};

const cancelDelete = () => {
  isDeleteModalVisible.value = false;
  serviceToDelete.value = null;
};

// Server-side pagination and search handlers
const handleSearch = (query) => {
  searchQuery.value = query;
  currentPage.value = 1; // Reset to first page on search
  
  // Debounce search to avoid too many requests
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }
  
  searchTimeout = setTimeout(() => {
    loadServices();
  }, 300);
};

const handlePageChange = (page) => {
  currentPage.value = page;
  loadServices();
};

const handlePerPageChange = (newPerPage) => {
  perPage.value = newPerPage;
  currentPage.value = 1; // Reset to first page
  loadServices();
};

// Load services from server (simulation)
const loadServices = async () => {
  serviceStore.loading = true;
  
  try {
    // This would be your actual API call
    // const response = await api.getServices({
    //   page: currentPage.value,
    //   perPage: perPage.value,
    //   search: searchQuery.value
    // });
    
    // For now, simulate server-side filtering and pagination
    await simulateServerRequest();
    
  } catch (error) {
    console.error('Error loading services:', error);
    serviceStore.error = 'Failed to load services';
  } finally {
    serviceStore.loading = false;
  }
};

// Simulate server-side request with filtering and pagination
const simulateServerRequest = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Get all services (this would come from server)
      const allServices = [
        { id: 's1', name: 'Cuci Kering Lipat', price: 8000, unit: 'kg' },
        { id: 's2', name: 'Cuci Setrika', price: 12000, unit: 'kg' },
        { id: 's3', name: 'Kemeja Satuan', price: 15000, unit: 'pcs' },
        { id: 's4', name: 'Selimut', price: 25000, unit: 'pcs' },
        { id: 's5', name: 'Dry Clean', price: 50000, unit: 'pcs' },
        { id: 's6', name: 'Cuci Sepatu', price: 30000, unit: 'pcs' },
        { id: 's7', name: 'Cuci Tas', price: 20000, unit: 'pcs' },
        { id: 's8', name: 'Express 3 Jam', price: 15000, unit: 'kg' },
      ];
      
      // Filter based on search query
      let filteredServices = allServices;
      if (searchQuery.value) {
        filteredServices = allServices.filter(service =>
          service.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
          service.unit.toLowerCase().includes(searchQuery.value.toLowerCase())
        );
      }
      
      totalItems.value = filteredServices.length;
      
      // Paginate results
      const startIndex = (currentPage.value - 1) * perPage.value;
      const endIndex = startIndex + perPage.value;
      const paginatedServices = filteredServices.slice(startIndex, endIndex);
      
      // Update store with paginated results
      serviceStore.services = paginatedServices;
      
      resolve();
    }, 500); // Simulate network delay
  });
};

// Load initial data
onMounted(() => {
  loadServices();
});

// Watch for service changes that require data reload
watch(
  () => serviceStore.services.length,
  (newLength, oldLength) => {
    // If we deleted the last item on the current page, go to previous page
    if (newLength < oldLength && currentPage.value > 1) {
      const maxPage = Math.ceil(totalItems.value / perPage.value);
      if (currentPage.value > maxPage) {
        currentPage.value = maxPage;
        loadServices();
      }
    }
  }
);
</script>

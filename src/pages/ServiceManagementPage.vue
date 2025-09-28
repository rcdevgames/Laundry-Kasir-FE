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
            <div class="text-sm text-gray-600 mb-1">
              Rp {{ item.price.toLocaleString() }} / {{ item.unit }}
            </div>
            <div v-if="item.category" class="text-xs text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full inline-block mb-2">
              {{ item.category }}
            </div>
            <div v-if="item.description" class="text-sm text-gray-500 line-clamp-2">
              {{ item.description }}
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

      <!-- Custom category column -->
      <template #column-category="{ value }">
        <span v-if="value" class="text-xs text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">
          {{ value }}
        </span>
        <span v-else class="text-gray-400">-</span>
      </template>
    </DataTable>

    <ServiceForm
      :visible="isModalVisible"
      :service="selectedService"
      @close="closeModal"
      @save="handleSave"
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
import { serviceAPI, apiUtils } from '../services/index.js';
import { swalUtils } from '../utils/swal.js';
import DataTable from '../components/DataTable.vue';
import ServiceForm from '../components/ServiceForm.vue';

const serviceStore = useServiceStore();

const isModalVisible = ref(false);
const selectedService = ref(null);

// Column definitions for DataTable
const serviceColumns = [
  { key: 'name', label: 'Service Name', weight: 'bold' },
  { key: 'price', label: 'Price', align: 'right', format: 'currency' },
  { key: 'unit', label: 'Unit', nowrap: true },
  { key: 'category', label: 'Category', nowrap: true }
];



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
  console.log('ServiceManagementPage: Opening edit modal with service:', service);
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
    serviceStore.loading = true;
    let result;
    console.log('Saving service:', service);
    
    if (service.id) {
      // Update existing service - exclude ID from the payload body
      const { id, ...updateData } = service;
      result = await serviceAPI.updateService(id, updateData);
      await swalUtils.toast.success(`${service.name} berhasil diperbarui! ✨`);
    } else {
      // Add new service - exclude ID field entirely
      const { id, ...createData } = service;
      result = await serviceAPI.createService(createData);
      await swalUtils.toast.success(`${service.name} berhasil ditambahkan! 🎉`);
    }
    
    closeModal();
    await loadServices(); // Reload data from server
    
  } catch (error) {
    console.error('Error saving service:', error);
    const errorInfo = apiUtils.handleError(error);
    
    await swalUtils.error(
      'Gagal Menyimpan Data!',
      errorInfo.message || 'Terjadi kesalahan saat menyimpan data service'
    );
  } finally {
    serviceStore.loading = false;
  }
};

const handleDelete = async (serviceId) => {
  const service = serviceStore.services.find(s => s.id === serviceId);
  
  if (!service) return;
  
  const result = await swalUtils.confirmDelete(
    'Hapus Service?',
    `Apakah Anda yakin ingin menghapus service "${service.name}"? Data yang dihapus tidak dapat dikembalikan!`
  );
  
  if (result.isConfirmed) {
    await confirmDelete(service);
  }
};

const confirmDelete = async (service) => {
  try {
    serviceStore.loading = true;
    await serviceAPI.deleteService(service.id);
    
    await swalUtils.toast.success(`${service.name} berhasil dihapus! 🗑️`);
    await loadServices(); // Refresh data
    
  } catch (error) {
    console.error('Error deleting service:', error);
    const errorInfo = apiUtils.handleError(error);
    
    await swalUtils.error(
      'Gagal Menghapus Data!',
      errorInfo.message || 'Terjadi kesalahan saat menghapus service'
    );
  } finally {
    serviceStore.loading = false;
  }
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

// Load services from server
const loadServices = async () => {
  try {
    serviceStore.loading = true;
    
    const params = {
      page: currentPage.value,
      limit: perPage.value,
      ...(searchQuery.value && { search: searchQuery.value })
    };
    
    const response = await serviceAPI.getServices(params);
    
    // Update store and pagination data
    serviceStore.services = response.data?.services || response.services || [];
    totalItems.value = response.data?.total || response.total || 0;
    
  } catch (error) {
    console.error('Error loading services:', error);
    const errorInfo = apiUtils.handleError(error);
    
    // For development fallback with dummy data
    if (errorInfo.status === 0) {
      console.warn('API not available, using dummy data');
      await simulateServerRequest();
    } else {
      await swalUtils.error(
        'Gagal Memuat Data!',
        'Tidak dapat memuat data service dari server'
      );
    }
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
        { 
          id: 's1', 
          name: 'Cuci+ Gosok', 
          description: 'Layanan cuci dan gosok premium dengan kualitas terbaik',
          price: 4500, 
          unit: 'kg', 
          category: 'regular',
          icon: 'wash-iron',
          is_active: true
        },
        { 
          id: 's2', 
          name: 'Cuci Setrika Premium', 
          description: 'Layanan cuci dan setrika untuk pakaian formal',
          price: 12000, 
          unit: 'kg', 
          category: 'premium',
          icon: 'shirt',
          is_active: true
        },
        { 
          id: 's3', 
          name: 'Kemeja Satuan', 
          description: 'Layanan khusus kemeja dengan penanganan ekstra hati-hati',
          price: 15000, 
          unit: 'pcs', 
          category: 'specialty',
          icon: 'tshirt',
          is_active: true
        },
        { 
          id: 's4', 
          name: 'Selimut & Bedcover', 
          description: 'Layanan cuci untuk selimut dan bedcover berukuran besar',
          price: 25000, 
          unit: 'pcs', 
          category: 'large-items',
          icon: 'bed',
          is_active: true
        },
        { 
          id: 's5', 
          name: 'Dry Clean Premium', 
          description: 'Layanan dry cleaning untuk pakaian berbahan khusus',
          price: 50000, 
          unit: 'pcs', 
          category: 'premium',
          icon: 'sparkles',
          is_active: true
        },
        { 
          id: 's6', 
          name: 'Cuci Sepatu', 
          description: 'Layanan cuci sepatu dengan treatment khusus',
          price: 30000, 
          unit: 'pcs', 
          category: 'specialty',
          icon: 'shoe-prints',
          is_active: true
        },
        { 
          id: 's7', 
          name: 'Cuci Tas & Ransel', 
          description: 'Layanan cuci untuk tas, ransel, dan aksesoris',
          price: 20000, 
          unit: 'pcs', 
          category: 'specialty',
          icon: 'shopping-bag',
          is_active: true
        },
        { 
          id: 's8', 
          name: 'Express 3 Jam', 
          description: 'Layanan kilat selesai dalam 3 jam',
          price: 15000, 
          unit: 'kg', 
          category: 'express',
          icon: 'clock',
          is_active: true
        },
      ];
      
      // Filter based on search query
      let filteredServices = allServices;
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        filteredServices = allServices.filter(service =>
          service.name.toLowerCase().includes(query) ||
          service.unit.toLowerCase().includes(query) ||
          service.category?.toLowerCase().includes(query) ||
          service.description?.toLowerCase().includes(query)
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

// Test API function (for development)
const testCreateService = async () => {
  const testService = {
    name: "Cuci+ Gosok",
    description: "Layanan cuci dan gosok premium dengan kualitas terbaik",
    price: 4500,
    unit: "kg", 
    category: "regular",
    icon: "wash-iron",
    is_active: true
  };
  
  try {
    console.log('Testing service creation API...');
    const result = await serviceAPI.createService(testService);
    console.log('API Test Result:', result);
    await swalUtils.toast.success('Test API berhasil! 🎉');
    await loadServices();
  } catch (error) {
    console.error('API Test Error:', error);
    const errorInfo = apiUtils.handleError(error);
    await swalUtils.error('Test API Gagal!', errorInfo.message);
  }
};

// Debug function to test API connectivity
const testAPIConnection = async () => {
  try {
    console.log('Testing API connection to:', import.meta.env.VITE_API_URL);
    
    // Test getting services first
    const response = await serviceAPI.getServices({ page: 1, limit: 5 });
    console.log('API Connection Success:', response);
    await swalUtils.toast.success('API Connection successful! 🎉');
    
  } catch (error) {
    console.error('API Connection Error:', error);
    const errorInfo = apiUtils.handleError(error);
    await swalUtils.error('API Connection Failed!', 
      `Cannot connect to ${import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'}. Error: ${errorInfo.message}`
    );
  }
};

// Expose test functions to window for debugging
window.testCreateService = testCreateService;
window.testAPIConnection = testAPIConnection;
window.serviceAPI = serviceAPI;  // For manual testing in console

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

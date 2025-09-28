<template>
  <div>
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
      <div>
        <h1 class="text-xl sm:text-2xl font-bold text-gray-800">Customer Management</h1>
        <p class="text-gray-500 mt-1">Manage your customers and their information</p>
      </div>
      <button 
        @click="openAddModal" 
        class="mt-3 sm:mt-0 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium transition-colors duration-200 flex items-center"
      >
        <FontAwesomeIcon icon="plus" class="h-4 w-4 mr-1" />
        Add Customer
      </button>
    </div>

    <DataTable
      title="Customers"
      :data="customerStore.customers"
      :columns="customerColumns"
      :loading="customerStore.loading"
      :search-query="searchQuery"
      search-placeholder="Search customers..."
      :current-page="currentPage"
      :per-page="perPage"
      :total-items="totalItems"
      :total-pages="Math.ceil(totalItems / perPage)"
      :paginated="true"
      item-key="id"
      display-name-key="name"
      subtitle-key="phone"
      empty-icon="users"
      empty-message="No customers found. Add your first customer!"
      @edit="openEditModal"
      @delete="handleDelete"
      @search="handleSearch"
      @page-change="handlePageChange"
      @per-page-change="handlePerPageChange"
    >
      <!-- Custom mobile card slot with avatar and contact info -->
      <template #mobile-card="{ item }">
        <div class="flex items-start justify-between">
          <div class="flex items-start flex-1">
            <div class="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
              <span class="text-indigo-600 font-medium text-sm">{{ getInitials(item.name) }}</span>
            </div>
            <div class="ml-4 flex-1 min-w-0">
              <div class="text-base font-semibold text-gray-900 mb-1">{{ item.name }}</div>
              <div class="flex items-center text-sm text-gray-600 mb-1">
                <FontAwesomeIcon icon="phone" class="h-4 w-4 mr-1 text-green-500" />
                <span class="font-medium">{{ item.phone }}</span>
              </div>
              <div v-if="item.address" class="flex items-start text-sm text-gray-600">
                <FontAwesomeIcon icon="map-marker-alt" class="h-4 w-4 mr-1 mt-0.5 text-blue-500 flex-shrink-0" />
                <span class="text-blue-600 line-clamp-2">{{ item.address }}</span>
              </div>
            </div>
          </div>
          <div class="flex space-x-1 ml-4">
            <button 
              @click="openEditModal(item)" 
              class="p-3 text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 rounded-lg transition-colors duration-200"
            >
              <FontAwesomeIcon icon="pen-to-square" class="h-5 w-5" />
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

      <!-- Custom customer column with avatar -->
      <template #column-name="{ item }">
        <div class="flex items-center">
          <div class="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
            <span class="text-indigo-600 font-medium">{{ getInitials(item.name) }}</span>
          </div>
          <div class="ml-4">
            <div class="text-sm font-medium text-gray-900">{{ item.name }}</div>
          </div>
        </div>
      </template>

      <!-- Custom phone column with icon -->
      <template #column-phone="{ value }">
        <div class="flex items-center text-sm text-gray-500">
          <FontAwesomeIcon icon="phone" class="h-4 w-4 mr-2 text-green-500" />
          {{ value }}
        </div>
      </template>

      <!-- Custom address column -->
      <template #column-address="{ value }">
        <div class="max-w-xs truncate" :title="value">
          <div v-if="value" class="flex items-center text-sm text-gray-500">
            <FontAwesomeIcon icon="map-marker-alt" class="h-4 w-4 mr-2 text-blue-500" />
            {{ value }}
          </div>
          <span v-else class="text-gray-400">-</span>
        </div>
      </template>
    </DataTable>

    <CustomerForm
      :visible="isModalVisible"
      :customer="selectedCustomer"
      @close="closeModal"
      @save="handleSave"
    />


    
    <!-- Global Error/Notification Display -->
    <div v-if="customerStore.error" class="mt-4 p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm">
      <div class="flex items-center">
        <FontAwesomeIcon icon="exclamation-circle" class="h-5 w-5 mr-2" />
        <strong>Error:</strong> {{ customerStore.error }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useCustomerStore } from '../store/customer';
import { customerAPI, apiUtils } from '../services/index.js';
import { swalUtils } from '../utils/swal.js';
import DataTable from '../components/DataTable.vue';
import CustomerForm from '../components/CustomerForm.vue';
import ConfirmationModal from '../components/ConfirmationModal.vue';

const customerStore = useCustomerStore();

const isModalVisible = ref(false);
const selectedCustomer = ref(null);

// Column definitions for DataTable
const customerColumns = [
  { key: 'name', label: 'Customer Name', weight: 'bold' },
  { key: 'phone', label: 'Contact', nowrap: true },
  { key: 'address', label: 'Address' }
];



// Pagination and search state
const searchQuery = ref('');
const currentPage = ref(1);
const perPage = ref(10);
const totalItems = ref(0);

// Debounce timer for search
let searchTimeout = null;

const openAddModal = () => {
  selectedCustomer.value = null;
  isModalVisible.value = true;
};

const openEditModal = (customer) => {
  console.log(customer);
  selectedCustomer.value = customer;
  isModalVisible.value = true;
};

const closeModal = () => {
  isModalVisible.value = false;
  selectedCustomer.value = null;
  // Clear any previous errors when closing the modal
  if (customerStore.error) {
    customerStore.error = null;
  }
};

const handleSave = async (customer) => {
  try {
    customerStore.loading = true;
    let result;
    console.log('Saving customer:', customer);
    
    if (customer.id) {
      // Update existing customer - exclude ID from the payload body
      const { id, ...updateData } = customer;
      result = await customerAPI.updateCustomer(id, updateData);
      await swalUtils.toast.success(`${customer.name} berhasil diperbarui! ✨`);
    } else {
      // Add new customer - exclude ID field entirely
      const { id, ...createData } = customer;
      result = await customerAPI.createCustomer(createData);
      await swalUtils.toast.success(`${customer.name} berhasil ditambahkan! 🎉`);
    }
    
    closeModal();
    await loadCustomers(); // Reload data from server
    
  } catch (error) {
    console.error('Error saving customer:', error);
    const errorInfo = apiUtils.handleError(error);
    
    await swalUtils.error(
      'Gagal Menyimpan Data!',
      errorInfo.message || 'Terjadi kesalahan saat menyimpan data customer'
    );
  } finally {
    customerStore.loading = false;
  }
};

const handleDelete = async (customerId) => {
  const customer = customerStore.customers.find(c => c.id === customerId);
  
  if (!customer) return;
  
  const result = await swalUtils.confirmDelete(
    'Hapus Customer?',
    `Apakah Anda yakin ingin menghapus customer "${customer.name}"? Data yang dihapus tidak dapat dikembalikan!`
  );
  
  if (result.isConfirmed) {
    await confirmDelete(customer);
  }
};

const confirmDelete = async (customer) => {
  try {
    customerStore.loading = true;
    await customerAPI.deleteCustomer(customer.id);
    
    await swalUtils.toast.success(`${customer.name} berhasil dihapus! 🗑️`);
    await loadCustomers(); // Refresh data
    
  } catch (error) {
    console.error('Error deleting customer:', error);
    const errorInfo = apiUtils.handleError(error);
    
    await swalUtils.error(
      'Gagal Menghapus Data!',
      errorInfo.message || 'Terjadi kesalahan saat menghapus customer'
    );
  } finally {
    customerStore.loading = false;
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
    loadCustomers();
  }, 300);
};

const handlePageChange = (page) => {
  currentPage.value = page;
  loadCustomers();
};

const handlePerPageChange = (newPerPage) => {
  perPage.value = newPerPage;
  currentPage.value = 1; // Reset to first page
  loadCustomers();
};

// Load customers from server
const loadCustomers = async () => {
  try {
    customerStore.loading = true;
    
    const params = {
      page: currentPage.value,
      limit: perPage.value,
      ...(searchQuery.value && { search: searchQuery.value })
    };
    
    const response = await customerAPI.getCustomers(params);
    
    // Update store and pagination data
    customerStore.customers = response.data?.customers || response.customers || [];
    totalItems.value = response.data?.total || response.total || 0;
    
  } catch (error) {
    console.error('Error loading customers:', error);
    const errorInfo = apiUtils.handleError(error);
    
    // For development fallback with dummy data
    if (errorInfo.status === 0) {
      console.warn('API not available, using dummy data');
      await simulateServerRequest();
    } else {
      await swalUtils.error(
        'Gagal Memuat Data!',
        'Tidak dapat memuat data customer dari server'
      );
    }
  } finally {
    customerStore.loading = false;
  }
};

// Simulate server-side request with filtering and pagination
const simulateServerRequest = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Get all customers (this would come from server)
      const allCustomers = [
        { id: 'c1', name: 'John Doe', phone: '081234567890', address: 'Jl. Merdeka No. 123, Jakarta' },
        { id: 'c2', name: 'Jane Smith', phone: '089876543210', address: 'Jl. Sudirman No. 456, Bandung' },
        { id: 'c3', name: 'Peter Jones', phone: '081122334455', address: 'Jl. Thamrin No. 789, Surabaya' },
        { id: 'c4', name: 'Maria Garcia', phone: '082345678901', address: 'Jl. Gatot Subroto No. 321, Yogyakarta' },
        { id: 'c5', name: 'David Wilson', phone: '083456789012', address: 'Jl. Diponegoro No. 654, Medan' },
        { id: 'c6', name: 'Sarah Johnson', phone: '084567890123', address: 'Jl. Ahmad Yani No. 987, Semarang' },
        { id: 'c7', name: 'Michael Brown', phone: '085678901234', address: 'Jl. Pahlawan No. 147, Malang' },
        { id: 'c8', name: 'Lisa Davis', phone: '086789012345', address: 'Jl. Veteran No. 258, Denpasar' },
      ];
      
      // Filter based on search query
      let filteredCustomers = allCustomers;
      if (searchQuery.value) {
        filteredCustomers = allCustomers.filter(customer =>
          customer.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
          customer.phone.includes(searchQuery.value) ||
          customer.address.toLowerCase().includes(searchQuery.value.toLowerCase())
        );
      }
      
      totalItems.value = filteredCustomers.length;
      
      // Paginate results
      const startIndex = (currentPage.value - 1) * perPage.value;
      const endIndex = startIndex + perPage.value;
      const paginatedCustomers = filteredCustomers.slice(startIndex, endIndex);
      
      // Update store with paginated results
      customerStore.customers = paginatedCustomers;
      
      resolve();
    }, 500); // Simulate network delay
  });
};

// Helper function to get initials from name
const getInitials = (name) => {
  const names = name.split(' ');
  if (names.length >= 2) {
    return (names[0].charAt(0) + names[1].charAt(0)).toUpperCase();
  } else {
    return names[0].charAt(0).toUpperCase();
  }
};

// Load initial data
onMounted(() => {
  loadCustomers();
});

// Watch for customer changes that require data reload
watch(
  () => customerStore.customers.length,
  (newLength, oldLength) => {
    // If we deleted the last item on the current page, go to previous page
    if (newLength < oldLength && currentPage.value > 1) {
      const maxPage = Math.ceil(totalItems.value / perPage.value);
      if (currentPage.value > maxPage) {
        currentPage.value = maxPage;
        loadCustomers();
      }
    }
  }
);


</script>

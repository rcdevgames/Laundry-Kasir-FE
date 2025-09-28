<template>
  <div>
    <!-- Mobile Header with Cart Toggle -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 md:mb-6">
      <div class="flex-1">
        <h1 class="text-lg sm:text-xl md:text-2xl font-bold text-gray-800">New Transaction</h1>
        <p class="text-gray-500 mt-1 text-sm md:text-base">Add services and create transaction</p>
      </div>
      
      <div class="mt-3 sm:mt-0 flex items-center space-x-2">
        <!-- Refresh Button -->
        <button 
          @click="refreshData"
          :disabled="isRefreshing"
          class="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center disabled:opacity-50"
          title="Refresh customers and services data"
        >
          <svg 
            class="h-4 w-4 mr-1 transition-transform duration-200"
            :class="{ 'animate-spin': isRefreshing }"
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {{ isRefreshing ? 'Refreshing...' : 'Refresh' }}
        </button>

        <!-- Mobile Cart Toggle Button -->
        <div class="lg:hidden flex items-center space-x-2">
          <div class="text-sm text-gray-600">
            Cart: {{ cartItemsCount }} items
          </div>
          <button 
            @click="showMobileCart = !showMobileCart"
            class="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium transition-colors duration-200 flex items-center"
          >
            <svg class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5 6m8.5-6v6a2 2 0 11-4 0v-6m4 0V9a2 2 0 10-4 0v4.01" />
            </svg>
            {{ showMobileCart ? 'Hide' : 'Show' }} Cart
          </button>
        </div>
      </div>
    </div>
    
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
      
      <!-- Left Column: Transaction Form -->
      <div class="lg:col-span-2" :class="{ 'hidden lg:block': showMobileCart }">
        <TransactionForm />
      </div>

      <!-- Right Column: Cart Summary -->
      <div :class="{ 'block': showMobileCart, 'hidden lg:block': !showMobileCart }">
        <div class="relative">
          <!-- Mobile Close Button for Cart -->
          <button 
            v-if="showMobileCart" 
            @click="showMobileCart = false"
            class="lg:hidden absolute top-2 right-2 z-10 p-2 text-gray-400 hover:text-gray-600"
          >
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <TransactionCart />
        </div>
      </div>

    </div>

    <!-- Mobile backdrop -->
    <div 
      v-if="showQuickAdd"
      @click="showQuickAdd = false"
      class="fixed inset-0 z-20 lg:hidden"
    ></div>
  </div>
</template>

<script setup>
import TransactionForm from '../components/TransactionForm.vue';
import TransactionCart from '../components/TransactionCart.vue';
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useTransactionStore } from '../store/transaction';
import { useCustomerStore } from '../store/customer';
import { useServiceStore } from '../store/service';
import Swal from 'sweetalert2';

const transactionStore = useTransactionStore();
const customerStore = useCustomerStore();
const serviceStore = useServiceStore();

const showMobileCart = ref(false);
const showQuickAdd = ref(false);
const isRefreshing = ref(false);

// Track initialization state to prevent multiple calls
const isInitializing = ref(false);
let initializationPromise = null;

// Safe cart access with proper reactive handling
const cartItemsCount = computed(() => {
  try {
    // Ensure transactionStore exists and has cart property
    if (!transactionStore || !transactionStore.cart) {
      return 0;
    }
    return Array.isArray(transactionStore.cart) ? transactionStore.cart.length : 0;
  } catch (error) {
    console.error('Error accessing cart:', error);
    return 0;
  }
});

// Initialize and fetch data if needed (with singleton pattern to prevent duplicate calls)
const initializeData = async () => {
  // If already initializing, return the existing promise
  if (isInitializing.value && initializationPromise) {
    console.log('Already initializing data, waiting for existing promise...');
    return initializationPromise;
  }

  // If data already exists, no need to initialize
  if ((customerStore.customers?.length > 0) && (serviceStore.services?.length > 0)) {
    console.log('Data already available, skipping initialization');
    return;
  }

  isInitializing.value = true;
  
  initializationPromise = (async () => {
    try {
      // Force store initialization if needed
      if (!transactionStore.cart) {
        transactionStore.$patch({ cart: [] });
      }

      // Use Promise.all to fetch data in parallel, but only if needed and not already loading
      const fetchPromises = [];

      // Check if customers data is empty and not currently loading
      if ((!customerStore.customers || customerStore.customers.length === 0) && !customerStore.loading) {
        console.log('Customers data empty, fetching from API...');
        fetchPromises.push(customerStore.fetchCustomers());
      }

      // Check if services data is empty and not currently loading
      if ((!serviceStore.services || serviceStore.services.length === 0) && !serviceStore.loading) {
        console.log('Services data empty, fetching from API...');
        fetchPromises.push(serviceStore.fetchServices());
      }

      // Wait for all fetch operations to complete
      if (fetchPromises.length > 0) {
        await Promise.all(fetchPromises);
        console.log(`Data initialization complete: ${customerStore.customers?.length || 0} customers, ${serviceStore.services?.length || 0} services`);
      }

    } catch (error) {
      console.error('Error initializing transaction data:', error);
    } finally {
      isInitializing.value = false;
      initializationPromise = null;
    }
  })();

  return initializationPromise;
};

// Manual refresh function
const refreshData = async () => {
  // Prevent multiple refresh calls
  if (isRefreshing.value) {
    console.log('Refresh already in progress, skipping...');
    return;
  }
  
  isRefreshing.value = true;
  
  try {
    console.log('Refreshing customers and services data...');
    
    // Fetch customers and services in parallel (forced refresh)
    const [customersResult, servicesResult] = await Promise.all([
      customerStore.fetchCustomers(),
      serviceStore.fetchServices()
    ]);

    // Check results and show appropriate notifications
    const errors = [];
    if (!customersResult.success) {
      errors.push('Failed to refresh customers');
    }
    if (!servicesResult.success) {
      errors.push('Failed to refresh services');
    }

    if (errors.length > 0) {
      // Show error notification
      await Swal.fire({
        icon: 'warning',
        title: 'Partial Refresh',
        text: errors.join('. ') + '. Some data may not be up to date.',
        confirmButtonColor: '#6366f1',
        timer: 3000,
        timerProgressBar: true
      });
    } else {
      // Show success notification
      await Swal.fire({
        icon: 'success',
        title: 'Data Refreshed',
        text: `Updated ${customerStore.customers?.length || 0} customers and ${serviceStore.services?.length || 0} services.`,
        confirmButtonColor: '#6366f1',
        timer: 2000,
        timerProgressBar: true
      });
    }

  } catch (error) {
    console.error('Error refreshing data:', error);
    await Swal.fire({
      icon: 'error',
      title: 'Refresh Failed',
      text: 'Failed to refresh data. Please try again.',
      confirmButtonColor: '#6366f1'
    });
  } finally {
    isRefreshing.value = false;
  }
};

// Ensure store is initialized
onMounted(async () => {
  await initializeData();
});

// Reset the transaction state when the user navigates away from the page
onUnmounted(() => {
  transactionStore.resetTransaction();
  // Clean up initialization state
  isInitializing.value = false;
  initializationPromise = null;
});

const quickAddService = () => {
  // Toggle to form view and close quick add menu
  showMobileCart.value = false;
  showQuickAdd.value = false;
  
  // You could also emit an event to focus on the service selection
  // or auto-populate the most used service
};
</script>

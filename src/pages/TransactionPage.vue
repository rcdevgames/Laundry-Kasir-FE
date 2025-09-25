<template>
  <div>
    <!-- Mobile Header with Cart Toggle -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 md:mb-6">
      <div class="flex-1">
        <h1 class="text-lg sm:text-xl md:text-2xl font-bold text-gray-800">New Transaction</h1>
        <p class="text-gray-500 mt-1 text-sm md:text-base">Add services and create transaction</p>
      </div>
      
      <!-- Mobile Cart Toggle Button -->
      <div class="lg:hidden mt-3 sm:mt-0 flex items-center space-x-2">
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

const transactionStore = useTransactionStore();
const showMobileCart = ref(false);
const showQuickAdd = ref(false);

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

// Ensure store is initialized
onMounted(() => {
  try {
    // Force store initialization if needed
    if (!transactionStore.cart) {
      transactionStore.$patch({ cart: [] });
    }
  } catch (error) {
    console.error('Error initializing transaction store:', error);
  }
});

// Reset the transaction state when the user navigates away from the page
onUnmounted(() => {
  transactionStore.resetTransaction();
});

const quickAddService = () => {
  // Toggle to form view and close quick add menu
  showMobileCart.value = false;
  showQuickAdd.value = false;
  
  // You could also emit an event to focus on the service selection
  // or auto-populate the most used service
};
</script>

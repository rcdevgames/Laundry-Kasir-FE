<template>
  <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
    <!-- Customer Selection -->
    <div class="mb-6">
      <label for="customer" class="block text-sm font-medium text-gray-700 mb-2">Select Customer</label>
      <select
        id="customer"
        :value="transactionStore.selectedCustomerId"
        @change="transactionStore.selectCustomer($event.target.value)"
        class="w-full px-3 py-2.5 border border-gray-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
      >
        <option disabled :value="null">-- Please select a customer --</option>
        <option v-for="customer in (transactionStore.customers || [])" :key="customer.id" :value="customer.id">
          {{ customer.name }} - {{ customer.phone }}
        </option>
      </select>
    </div>

    <!-- Services Grid -->
    <div class="mb-6">
      <label class="block text-sm font-medium text-gray-700 mb-4">Select Services</label>
      
      <!-- Search Bar -->
      <div class="mb-4">
        <div class="relative">
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Search services..."
            class="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
          />
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FontAwesomeIcon icon="magnifying-glass" class="h-4 w-4 text-gray-400" />
          </div>
        </div>
      </div>

      <!-- Services Grid -->
      <div class="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        <div 
          v-for="service in filteredServices" 
          :key="service.id"
          class="bg-white border border-gray-200 rounded-lg p-4 hover:border-indigo-300 hover:shadow-md transition-all duration-200 cursor-pointer group"
          @click="selectService(service)"
        >
          <!-- Service Icon -->
          <div class="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-3 group-hover:bg-indigo-200 transition-colors duration-200">
            <FontAwesomeIcon 
              :icon="getServiceIcon(service.name)" 
              class="h-6 w-6 text-indigo-600"
            />
          </div>
          
          <!-- Service Info -->
          <div class="flex-1">
            <h3 class="font-medium text-gray-900 text-sm mb-1 line-clamp-2">{{ service.name }}</h3>
            <p class="text-indigo-600 font-semibold text-sm">Rp {{ service.price.toLocaleString() }}</p>
          </div>

          <!-- Add Button -->
          <div class="mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button 
              @click.stop="quickAddService(service)"
              class="w-full px-3 py-1.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-xs font-medium transition-colors duration-200 flex items-center justify-center"
            >
              <FontAwesomeIcon icon="plus" class="h-3 w-3 mr-1" />
              Add
            </button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="filteredServices.length === 0" class="text-center py-8">
        <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FontAwesomeIcon icon="magnifying-glass" class="h-8 w-8 text-gray-400" />
        </div>
        <p class="text-gray-500 text-sm">No services found</p>
      </div>
    </div>

    <!-- Quantity Modal for Selected Service -->
    <div v-if="selectedService" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @click="closeQuantityModal">
      <div class="bg-white rounded-xl p-6 max-w-sm mx-4" @click.stop>
        <h3 class="text-lg font-semibold text-gray-900 mb-4">{{ selectedService.name }}</h3>
        <p class="text-indigo-600 font-semibold mb-4">Rp {{ selectedService.price.toLocaleString() }}</p>
        
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
          <div class="flex items-center space-x-3">
            <button 
              @click="decreaseQuantity"
              class="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors duration-200"
              :disabled="modalQuantity <= 1"
            >
              <FontAwesomeIcon icon="minus" class="h-4 w-4 text-gray-600" />
            </button>
            <input
              type="number"
              v-model.number="modalQuantity"
              min="1"
              class="w-20 px-3 py-2 border border-gray-300 rounded-lg text-center text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button 
              @click="increaseQuantity"
              class="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors duration-200"
            >
              <FontAwesomeIcon icon="plus" class="h-4 w-4 text-gray-600" />
            </button>
          </div>
        </div>

        <div class="flex space-x-3">
          <button 
            @click="closeQuantityModal"
            class="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors duration-200"
          >
            Cancel
          </button>
          <button 
            @click="confirmAddService"
            class="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium transition-colors duration-200"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>

    <!-- Payment Method -->
    <div class="mb-6">
      <label class="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
      <div class="grid grid-cols-3 gap-3">
        <label 
          v-for="method in ['cash', 'card', 'qris']" 
          :key="method" 
          class="flex flex-col items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors duration-200"
          :class="{ 'border-indigo-500 bg-indigo-50': transactionStore.paymentMethod === method }"
        >
          <input
            type="radio"
            v-model="transactionStore.paymentMethod"
            :value="method"
            class="hidden"
          />
          <div class="w-10 h-10 flex items-center justify-center mb-3"
            :class="{
              'text-green-600': method === 'cash' && transactionStore.paymentMethod === method,
              'text-blue-600': method === 'card' && transactionStore.paymentMethod === method,
              'text-purple-600': method === 'qris' && transactionStore.paymentMethod === method,
              'text-gray-400': transactionStore.paymentMethod !== method
            }">
            <FontAwesomeIcon 
              :icon="method === 'cash' ? 'money-bill-wave' : method === 'card' ? 'credit-card' : 'qrcode'" 
              class="h-6 w-6"
            />
          </div>
          <span class="text-gray-700 capitalize text-sm font-medium">
            {{ method === 'qris' ? 'QRIS' : method === 'cash' ? 'Cash' : 'Card' }}
          </span>
        </label>
      </div>
    </div>

    <!-- Action Buttons -->
    <div>
      <button
        @click="processPayment"
        :disabled="transactionStore.loading"
        class="w-full px-4 py-3.5 font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:bg-gray-400 text-sm transition-colors duration-200 flex items-center justify-center"
      >
        <svg v-if="transactionStore.loading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        {{ transactionStore.loading ? 'Processing...' : 'Process Payment' }}
      </button>
    </div>
    <div v-if="transactionStore.error" class="mt-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm">
      <div class="flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
        </svg>
        {{ transactionStore.error }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useTransactionStore } from '../store/transaction';

const transactionStore = useTransactionStore();

// Service grid functionality
const searchQuery = ref('');
const selectedService = ref(null);
const modalQuantity = ref(1);

// Filtered services based on search
const filteredServices = computed(() => {
  const services = transactionStore.services || [];
  if (!searchQuery.value) {
    return services;
  }
  return services.filter(service => 
    service.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

// Get appropriate icon for service
const getServiceIcon = (serviceName) => {
  const name = serviceName.toLowerCase();
  if (name.includes('wash') || name.includes('cuci')) return 'shirt';
  if (name.includes('dry') || name.includes('kering')) return 'wind';
  if (name.includes('iron') || name.includes('setrika')) return 'fire';
  if (name.includes('fold') || name.includes('lipat')) return 'layer-group';
  return 'cog'; // default icon
};

// Service selection handlers
const selectService = (service) => {
  selectedService.value = service;
  modalQuantity.value = 1;
};

const quickAddService = (service) => {
  transactionStore.addToCart(service, 1);
};

const closeQuantityModal = () => {
  selectedService.value = null;
  modalQuantity.value = 1;
};

const confirmAddService = () => {
  if (selectedService.value && modalQuantity.value > 0) {
    transactionStore.addToCart(selectedService.value, modalQuantity.value);
    closeQuantityModal();
  }
};

const increaseQuantity = () => {
  modalQuantity.value++;
};

const decreaseQuantity = () => {
  if (modalQuantity.value > 1) {
    modalQuantity.value--;
  }
};

const processPayment = () => {
  transactionStore.processPayment();
};
</script>

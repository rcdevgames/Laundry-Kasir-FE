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

    <!-- Service Search and Add -->
    <div class="mb-6">
      <label for="service" class="block text-sm font-medium text-gray-700 mb-2">Add Service</label>
      <div class="flex flex-col lg:flex-row lg:space-x-3 gap-3">
        <select 
          v-model="selectedServiceId" 
          class="flex-1 px-3 py-2.5 border border-gray-300 bg-white rounded-lg text-sm"
        >
          <option disabled value="">-- Select a service --</option>
          <option v-for="service in (transactionStore.services || [])" :key="service.id" :value="service.id">
            {{ service.name }} (Rp {{ service.price.toLocaleString() }})
          </option>
        </select>
        <input
          type="number"
          v-model.number="quantity"
          min="1"
          class="w-full lg:w-24 px-3 py-2.5 border border-gray-300 rounded-lg text-sm"
          placeholder="Qty"
        />
        <button 
          @click="addServiceToCart" 
          class="px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium transition-colors duration-200"
        >
          Add
        </button>
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
import { ref } from 'vue';
import { useTransactionStore } from '../store/transaction';

const transactionStore = useTransactionStore();

const selectedServiceId = ref('');
const quantity = ref(1);

const addServiceToCart = () => {
  if (!selectedServiceId.value || quantity.value <= 0) {
    alert('Please select a service and specify a valid quantity.');
    return;
  }
  const service = (transactionStore.services || []).find(s => s.id === selectedServiceId.value);
  if (service) {
    transactionStore.addToCart(service, quantity.value);
    // Reset fields
    selectedServiceId.value = '';
    quantity.value = 1;
  }
};

const processPayment = () => {
  transactionStore.processPayment();
};
</script>

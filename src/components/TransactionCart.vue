<template>
  <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
    <h3 class="text-lg font-semibold text-gray-800 mb-4">Order Summary</h3>
    <div v-if="!cart || cart.length === 0" class="text-center py-8">
      <div class="flex flex-col items-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <p class="text-gray-500 text-sm">Your cart is empty</p>
      </div>
    </div>
    <div v-else>
      <!-- Cart Items -->
      <div class="space-y-4">
        <!-- Mobile Layout -->
        <div v-for="item in (cart || [])" :key="item.serviceId" class="lg:hidden py-3 border-b border-gray-100 last:border-0">
          <div class="flex items-start justify-between mb-2">
            <div class="flex-1 min-w-0 pr-3">
              <p class="font-medium text-gray-800 text-sm">{{ item.name }}</p>
              <p class="text-xs text-gray-500">Rp {{ item.price.toLocaleString() }} / {{ item.unit }}</p>
            </div>
            <button 
              @click="removeFromCart(item.serviceId)" 
              class="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg"
            >
              <FontAwesomeIcon icon="trash" class="h-4 w-4" />
            </button>
          </div>
          <div class="flex items-center justify-between">
            <div class="flex items-center border border-gray-300 rounded-lg">
              <button 
                @click="updateQuantity(item.serviceId, item.quantity - 1)" 
                class="px-2.5 py-1.5 text-gray-600 hover:bg-gray-100 rounded-l-lg"
                :disabled="item.quantity <= 1"
              >
                <FontAwesomeIcon icon="minus" class="h-3 w-3" />
              </button>
              <span class="px-2.5 py-1.5 text-sm font-medium w-10 text-center">{{ item.quantity }}</span>
              <button 
                @click="updateQuantity(item.serviceId, item.quantity + 1)" 
                class="px-2.5 py-1.5 text-gray-600 hover:bg-gray-100 rounded-r-lg"
              >
                <FontAwesomeIcon icon="plus" class="h-3 w-3" />
              </button>
            </div>
            <p class="text-sm font-semibold text-indigo-600">Rp {{ item.subtotal.toLocaleString() }}</p>
          </div>
        </div>

        <!-- Desktop/Tablet Layout -->
        <div v-for="item in (cart || [])" :key="item.serviceId" class="hidden lg:block">
          <div class="bg-gray-50 rounded-lg p-4 mb-3">
            <!-- Service Info Row -->
            <div class="flex items-center justify-between mb-3">
              <div class="flex-1">
                <h4 class="font-medium text-gray-900 text-base">{{ item.name }}</h4>
                <p class="text-sm text-gray-600 mt-1">
                  <span class="font-medium text-indigo-600">Rp {{ item.price.toLocaleString() }}</span> 
                  <span class="text-gray-500">/ {{ item.unit }}</span>
                </p>
              </div>
              <button 
                @click="removeFromCart(item.serviceId)" 
                class="p-2 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-lg transition-colors duration-200"
                title="Remove item"
              >
                <FontAwesomeIcon icon="trash" class="h-4 w-4" />
              </button>
            </div>
            
            <!-- Quantity and Total Row -->
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <span class="text-sm text-gray-600 font-medium">Qty:</span>
                <div class="flex items-center border border-gray-300 rounded-lg bg-white">
                  <button 
                    @click="updateQuantity(item.serviceId, item.quantity - 1)" 
                    class="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-l-lg transition-colors duration-200"
                    :disabled="item.quantity <= 1"
                  >
                    <FontAwesomeIcon icon="minus" class="h-3 w-3" />
                  </button>
                  <span class="px-4 py-2 text-sm font-medium bg-white border-x border-gray-300">{{ item.quantity }}</span>
                  <button 
                    @click="updateQuantity(item.serviceId, item.quantity + 1)" 
                    class="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-r-lg transition-colors duration-200"
                  >
                    <FontAwesomeIcon icon="plus" class="h-3 w-3" />
                  </button>
                </div>
              </div>
              <div class="flex flex-col items-end">
                <span class="text-xs text-gray-500 mb-1">Subtotal</span>
                <span class="text-sm font-bold text-indigo-600">Rp {{ item.subtotal.toLocaleString() }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Cart Total -->
      <div class="border-t border-gray-200 mt-5 pt-4">
        <div class="flex justify-between items-center">
          <span class="text-base font-semibold text-gray-800">Total</span>
          <span class="text-xl font-bold text-indigo-600">Rp {{ totalAmount.toLocaleString() }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useTransactionStore } from '../store/transaction';
import { storeToRefs } from 'pinia';

const transactionStore = useTransactionStore();
const { cart, totalAmount } = storeToRefs(transactionStore);

// Ensure cart is initialized
if (!transactionStore.cart) {
  transactionStore.$patch({ cart: [] });
}

const updateQuantity = (serviceId, newQuantity) => {
  if (newQuantity < 1) return;
  transactionStore.updateQuantity(serviceId, newQuantity);
};

const removeFromCart = (serviceId) => {
  transactionStore.removeFromCart(serviceId);
};
</script>

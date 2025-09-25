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
        <div v-for="item in (cart || [])" :key="item.serviceId" class="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
          <div class="flex-1 min-w-0">
            <p class="font-medium text-gray-800 text-sm truncate">{{ item.name }}</p>
            <p class="text-xs text-gray-500">Rp {{ item.price.toLocaleString() }} / {{ item.unit }}</p>
          </div>
          <div class="flex items-center space-x-3">
            <div class="flex items-center border border-gray-300 rounded-lg">
              <button 
                @click="updateQuantity(item.serviceId, item.quantity - 1)" 
                class="px-2.5 py-1.5 text-gray-600 hover:bg-gray-100 rounded-l-lg"
                :disabled="item.quantity <= 1"
              >
                -
              </button>
              <span class="px-2.5 py-1.5 text-sm font-medium w-10 text-center">{{ item.quantity }}</span>
              <button 
                @click="updateQuantity(item.serviceId, item.quantity + 1)" 
                class="px-2.5 py-1.5 text-gray-600 hover:bg-gray-100 rounded-r-lg"
              >
                +
              </button>
            </div>
            <p class="text-sm font-medium text-gray-800 min-w-[70px] text-right">Rp {{ item.subtotal.toLocaleString() }}</p>
            <button 
              @click="removeFromCart(item.serviceId)" 
              class="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
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

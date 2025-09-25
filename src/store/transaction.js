import { defineStore } from 'pinia';
import { useCustomerStore } from './customer';
import { useServiceStore } from './service';

export const useTransactionStore = defineStore('transaction', {
  state: () => ({
    cart: [], // { serviceId, name, price, unit, quantity, subtotal }
    selectedCustomerId: null,
    paymentMethod: 'cash',
    error: null,
    loading: false,
  }),
  getters: {
    // Calculate total amount for the items in the cart
    totalAmount: (state) => {
      if (!Array.isArray(state.cart)) return 0;
      return state.cart.reduce((total, item) => total + (item.subtotal || 0), 0);
    },
    // Get customer and service data from their respective stores
    customers: () => {
      try {
        const customerStore = useCustomerStore();
        return customerStore.customers || [];
      } catch (error) {
        console.error('Error accessing customers:', error);
        return [];
      }
    },
    services: () => {
      try {
        const serviceStore = useServiceStore();
        return serviceStore.services || [];
      } catch (error) {
        console.error('Error accessing services:', error);
        return [];
      }
    },
  },
  actions: {
    // Set the customer for the transaction
    selectCustomer(customerId) {
      this.selectedCustomerId = customerId;
    },
    
    // Add a service to the cart
    addToCart(service, quantity = 1) {
      if (quantity <= 0) return;

      const existingItem = this.cart.find(item => item.serviceId === service.id);

      if (existingItem) {
        // If item already exists, update its quantity
        existingItem.quantity += quantity;
        existingItem.subtotal = existingItem.quantity * existingItem.price;
      } else {
        // Otherwise, add as a new item
        this.cart.push({
          serviceId: service.id,
          name: service.name,
          price: service.price,
          unit: service.unit,
          quantity: quantity,
          subtotal: quantity * service.price,
        });
      }
    },

    // Update the quantity of an item in the cart
    updateQuantity(serviceId, quantity) {
      const item = this.cart.find(item => item.serviceId === serviceId);
      if (item) {
        if (quantity > 0) {
          item.quantity = quantity;
          item.subtotal = item.quantity * item.price;
        } else {
          // Remove item if quantity is 0 or less
          this.removeFromCart(serviceId);
        }
      }
    },

    // Remove an item from the cart
    removeFromCart(serviceId) {
      this.cart = this.cart.filter(item => item.serviceId !== serviceId);
    },

    // Reset the cart and transaction state
    resetTransaction() {
      this.cart = [];
      this.selectedCustomerId = null;
      this.paymentMethod = 'cash';
      this.error = null;
    },

    // Simulate processing the payment
    async processPayment() {
      this.loading = true;
      this.error = null;

      if (!this.selectedCustomerId) {
        this.error = 'Please select a customer.';
        this.loading = false;
        return;
      }
      if (this.cart.length === 0) {
        this.error = 'Cart is empty.';
        this.loading = false;
        return;
      }

      // Simulate API call
      try {
        console.log('Processing payment for:', {
          customerId: this.selectedCustomerId,
          items: this.cart,
          total: this.totalAmount,
          paymentMethod: this.paymentMethod,
        });
        
        // Simulate a delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // On success, reset the state
        this.resetTransaction();
        this.loading = false;
        // Here you would typically navigate to a success/receipt page
        alert('Transaction successful!');

      } catch (e) {
        this.error = 'Payment processing failed.';
        this.loading = false;
      }
    },
  },
});

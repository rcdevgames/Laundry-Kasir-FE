import { defineStore } from 'pinia';
import { useCustomerStore } from './customer';
import { useServiceStore } from './service';
import { swalUtils } from '../utils/swal';

export const useTransactionStore = defineStore('transaction', {
  state: () => ({
    cart: [], // { serviceId, name, price, unit, quantity, subtotal }
    selectedCustomerId: null,
    paymentMethod: 'cash',
    transactions: [], // All transactions for progress tracking
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
      // Ensure customerId is properly converted to integer for storage
      this.selectedCustomerId = customerId ? parseInt(customerId) : null;
    },
    
    // Add a service to the cart
    addToCart(service, quantity = 1) {
      if (quantity <= 0) return;

      const existingItem = this.cart.find(item => item.serviceId === service.id);

      if (existingItem) {
        // If item already exists, update its quantity
        existingItem.quantity += parseInt(quantity);
        existingItem.subtotal = existingItem.quantity * existingItem.price;
      } else {
        // Otherwise, add as a new item
        this.cart.push({
          serviceId: parseInt(service.id), // Ensure integer
          name: service.name,
          price: parseFloat(service.price), // Ensure proper number
          unit: service.unit,
          quantity: parseInt(quantity), // Ensure integer
          subtotal: parseInt(quantity) * parseFloat(service.price),
        });
      }
    },

    // Update the quantity of an item in the cart
    updateQuantity(serviceId, quantity) {
      const parsedServiceId = parseInt(serviceId);
      const parsedQuantity = parseInt(quantity);
      const item = this.cart.find(item => item.serviceId === parsedServiceId);
      if (item) {
        if (parsedQuantity > 0) {
          item.quantity = parsedQuantity;
          item.subtotal = item.quantity * item.price;
        } else {
          // Remove item if quantity is 0 or less
          this.removeFromCart(parsedServiceId);
        }
      }
    },

    // Remove an item from the cart
    removeFromCart(serviceId) {
      const parsedServiceId = parseInt(serviceId);
      this.cart = this.cart.filter(item => item.serviceId !== parsedServiceId);
    },

    // Reset the cart and transaction state
    resetTransaction() {
      this.cart = [];
      this.selectedCustomerId = null;
      this.paymentMethod = 'cash';
      this.error = null;
    },

    // Process payment via API
    async processPayment() {
      this.loading = true;
      this.error = null;

      if (!this.selectedCustomerId || isNaN(parseInt(this.selectedCustomerId))) {
        this.error = 'Please select a valid customer.';
        this.loading = false;
        return { success: false, error: { message: this.error } };
      }
      if (this.cart.length === 0) {
        this.error = 'Cart is empty.';
        this.loading = false;
        return { success: false, error: this.error };
      }

      try {
        // Import API functions
        const { transactionAPI, apiUtils } = await import('../services/index.js');
        
        // Prepare transaction data according to Swagger
        const transactionData = {
          customer_id: parseInt(this.selectedCustomerId), // Convert to integer
          payment_method: this.paymentMethod,
          items: this.cart.map(item => ({
            service_id: parseInt(item.serviceId), // Convert to integer
            quantity: parseInt(item.quantity), // Ensure integer
            price: parseFloat(item.price) // Ensure proper number type
          })),
          notes: 'Transaction created from POS'
        };        console.log('Processing payment for:', transactionData);
        
        // Create transaction via API
        const response = await transactionAPI.createTransaction(transactionData);
        
        if (response.success) {
          const newTransaction = response.data?.transaction || response.transaction;
          
          // Add to local transactions list
          if (newTransaction) {
            this.transactions.unshift(newTransaction);
          }

          // Reset the cart and state
          this.resetTransaction();
          
          return { 
            success: true, 
            data: newTransaction,
            message: 'Transaction successful! Order is now being processed.'
          };
        } else {
          throw new Error(response.message || 'Transaction failed');
        }

      } catch (error) {
        const { apiUtils } = await import('../services/index.js');
        const errorInfo = apiUtils.handleError(error);
        this.error = errorInfo.message;
        return { success: false, error: errorInfo };
      } finally {
        this.loading = false;
      }
    },

    // Fetch transactions from API
    async fetchTransactions(params = {}) {
      this.loading = true;
      this.error = null;
      
      try {
        // Import API functions
        const { transactionAPI, apiUtils } = await import('../services/index.js');
        
        const response = await transactionAPI.getTransactions(params);
        
        if (response.success) {
          const rawTransactions = response.data?.transactions || response.transactions || [];
          // Transform API data to match component expectations
          this.transactions = rawTransactions.map(transaction => ({
            ...transaction,
            // Convert snake_case to camelCase
            transactionNo: transaction.transaction_no || transaction.transactionNo,
            currentStatus: transaction.current_status || transaction.currentStatus || transaction.status,
            totalAmount: transaction.total_amount || transaction.totalAmount || 0,
            estimatedDone: transaction.estimated_done || transaction.estimatedDone,
            // Ensure items is always an array
            items: transaction.items || [],
            // Ensure progress is always an array
            progress: transaction.progress || [],
            // Ensure customer object exists
            customer: transaction.customer || { name: 'Unknown Customer', phone: '' }
          }));
        } else {
          // If API fails, show error popup with retry option
          console.warn('API failed, showing error popup');
          if (this.transactions.length === 0) {
            const retry = await swalUtils.confirm(
              'Gagal Memuat Data',
              'Tidak dapat mengambil data transaksi dari server. Apakah Anda ingin mencoba lagi?',
              {
                confirmButtonText: 'Coba Lagi',
                cancelButtonText: 'Tutup'
              }
            );

            if (retry.isConfirmed) {
              // Retry the fetch
              return this.fetchTransactions(params);
            }
          }
        }
        
        return { success: true, data: this.transactions };
      } catch (error) {
        console.warn('API error, using sample data:', error);
        // If API fails, use sample data for demo
        if (this.transactions.length === 0) {
          const retry = await swalUtils.confirm(
            'Kesalahan Koneksi',
            `Terjadi kesalahan saat mengambil data: ${error.message || 'Unknown error'}. Apakah Anda ingin mencoba lagi?`,
            {
              confirmButtonText: 'Coba Lagi',
              cancelButtonText: 'Tutup'
            }
          );

          if (retry.isConfirmed) {
            // Retry the fetch
            return this.fetchTransactions(params);
          }
        }
        
        const { apiUtils } = await import('../services/index.js');
        const errorInfo = apiUtils.handleError(error);
        this.error = errorInfo.message;
        return { success: false, error: errorInfo };
      } finally {
        this.loading = false;
      }
    },

    // Update transaction progress via API
    async updateTransactionProgress(transactionId, progressData) {
      this.loading = true;
      this.error = null;
      
      try {
        // Import API functions
        const { progressAPI, apiUtils } = await import('../services/index.js');
        
        const response = await progressAPI.updateProgress(transactionId, progressData);
        
        if (response.success) {
          return { success: true, data: response.data };
        } else {
          throw new Error(response.message || 'Progress update failed');
        }
      } catch (error) {
        const { apiUtils } = await import('../services/index.js');
        const errorInfo = apiUtils.handleError(error);
        this.error = errorInfo.message;
        return { success: false, error: errorInfo };
      } finally {
        this.loading = false;
      }
    },

    // Update transaction status via status endpoint
    async updateTransactionStatus(transactionId, statusData) {
      this.loading = true;
      this.error = null;

      try {
        // Import API functions
        const { progressAPI } = await import('../services/index.js');
        const response = await progressAPI.updateTransactionStatus(transactionId, statusData);

        if (response.success) {
          return { success: true, data: response.data };
        } else {
          throw new Error(response.message || 'Status update failed');
        }
      } catch (error) {
        const { apiUtils } = await import('../services/index.js');
        const errorInfo = apiUtils.handleError(error);
        this.error = errorInfo.message;

        return { success: false, error: errorInfo };
      } finally {
        this.loading = false;
      }
    },
  },
});

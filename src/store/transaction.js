import { defineStore } from 'pinia';
import { useCustomerStore } from './customer';
import { useServiceStore } from './service';

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

        // Create a new transaction with progress tracking
        const newTransaction = {
          id: Date.now(), // Temporary ID
          transactionNo: `TXN-${Date.now().toString().slice(-6)}`,
          customerId: this.selectedCustomerId,
          customer: this.customers.find(c => c.id === this.selectedCustomerId),
          items: [...this.cart],
          totalAmount: this.totalAmount,
          paymentMethod: this.paymentMethod,
          currentStatus: 'received',
          progress: [{
            status: 'received',
            timestamp: new Date(),
            checkedBy: 'Current User',
            notes: 'Order received and payment processed'
          }],
          estimatedDone: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
          createdAt: new Date(),
          updatedAt: new Date()
        };

        // Add to transactions list
        this.transactions.unshift(newTransaction);

        // On success, reset the state
        this.resetTransaction();
        this.loading = false;
        
        alert('Transaction successful! Order is now being processed.');

      } catch (e) {
        this.error = 'Payment processing failed.';
        this.loading = false;
      }
    },

    // Fetch transactions (simulate API call)
    async fetchTransactions() {
      this.loading = true;
      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // If no transactions exist, create some sample data
        if (this.transactions.length === 0) {
          this.initializeSampleTransactions();
        }
        
        this.loading = false;
      } catch (error) {
        this.error = 'Failed to fetch transactions';
        this.loading = false;
      }
    },

    // Update transaction progress
    async updateTransactionProgress(transactionId, progressData) {
      const transaction = this.transactions.find(t => t.id === transactionId);
      if (!transaction) {
        throw new Error('Transaction not found');
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));

      // Update transaction status and add progress entry
      transaction.currentStatus = progressData.status;
      transaction.progress.push({
        ...progressData,
        timestamp: new Date()
      });
      transaction.updatedAt = new Date();
    },

    // Initialize sample transactions for demo
    initializeSampleTransactions() {
      const sampleTransactions = [
        // Recently received order - needs checking
        {
          id: 1001,
          transactionNo: 'TXN-240927-001',
          customerId: 1,
          customer: { id: 1, name: 'Budi Santoso', phone: '081234567890', email: 'budi@email.com' },
          items: [
            { serviceId: 1, name: 'Dry Clean', price: 15000, unit: 'pcs', quantity: 3, subtotal: 45000 },
            { serviceId: 3, name: 'Express Wash', price: 12000, unit: 'kg', quantity: 2, subtotal: 24000 }
          ],
          totalAmount: 69000,
          paymentMethod: 'cash',
          currentStatus: 'received',
          progress: [
            { 
              status: 'received', 
              timestamp: new Date(Date.now() - 15 * 60 * 1000), 
              checkedBy: 'Sari (Kasir)', 
              notes: 'Order received, payment cash Rp 69,000' 
            }
          ],
          estimatedDone: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 hours
          createdAt: new Date(Date.now() - 15 * 60 * 1000),
          updatedAt: new Date(Date.now() - 15 * 60 * 1000)
        },

        // In checking phase - found some items
        {
          id: 1002,
          transactionNo: 'TXN-240927-002',
          customerId: 2,
          customer: { id: 2, name: 'Siti Nurhaliza', phone: '081234567891', email: 'siti@email.com' },
          items: [
            { serviceId: 2, name: 'Wash & Iron', price: 8000, unit: 'kg', quantity: 5, subtotal: 40000 }
          ],
          totalAmount: 40000,
          paymentMethod: 'transfer',
          currentStatus: 'check',
          progress: [
            { 
              status: 'received', 
              timestamp: new Date(Date.now() - 45 * 60 * 1000), 
              checkedBy: 'Sari (Kasir)', 
              notes: 'Order received, payment transfer BCA' 
            },
            { 
              status: 'check', 
              timestamp: new Date(Date.now() - 30 * 60 * 1000), 
              checkedBy: 'Andi (Checker)', 
              notes: 'Found Rp 20,000 in jacket pocket, 1 receipt from Indomaret',
              metadata: JSON.stringify({ money: true, receipts: true, damage: false, stains: false, notes: 'Uang Rp 20,000 di saku jaket, struk Indomaret di saku celana' })
            }
          ],
          estimatedDone: new Date(Date.now() + 3 * 60 * 60 * 1000),
          createdAt: new Date(Date.now() - 45 * 60 * 1000),
          updatedAt: new Date(Date.now() - 30 * 60 * 1000)
        },

        // Currently washing
        {
          id: 1003,
          transactionNo: 'TXN-240927-003',
          customerId: 3,
          customer: { id: 3, name: 'Ahmad Rizki', phone: '081234567892', email: 'ahmad@email.com' },
          items: [
            { serviceId: 1, name: 'Dry Clean', price: 15000, unit: 'pcs', quantity: 2, subtotal: 30000 },
            { serviceId: 4, name: 'Shoe Clean', price: 25000, unit: 'pair', quantity: 1, subtotal: 25000 }
          ],
          totalAmount: 55000,
          paymentMethod: 'qris',
          currentStatus: 'washing',
          progress: [
            { 
              status: 'received', 
              timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), 
              checkedBy: 'Sari (Kasir)', 
              notes: 'Order received, payment QRIS' 
            },
            { 
              status: 'check', 
              timestamp: new Date(Date.now() - 105 * 60 * 1000), 
              checkedBy: 'Andi (Checker)', 
              notes: 'Items checked, no findings' 
            },
            { 
              status: 'washing', 
              timestamp: new Date(Date.now() - 60 * 60 * 1000), 
              checkedBy: 'Budi (Washer)', 
              notes: 'Started washing process, dry clean + shoe cleaning' 
            }
          ],
          estimatedDone: new Date(Date.now() + 2 * 60 * 60 * 1000),
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 60 * 60 * 1000)
        },

        // In ironing stage
        {
          id: 1004,
          transactionNo: 'TXN-240927-004',
          customerId: 4,
          customer: { id: 4, name: 'Diana Putri', phone: '081234567893', email: 'diana@email.com' },
          items: [
            { serviceId: 2, name: 'Wash & Iron', price: 8000, unit: 'kg', quantity: 3, subtotal: 24000 },
            { serviceId: 5, name: 'Bedcover Wash', price: 35000, unit: 'pcs', quantity: 1, subtotal: 35000 }
          ],
          totalAmount: 59000,
          paymentMethod: 'transfer',
          currentStatus: 'ironed',
          progress: [
            { 
              status: 'received', 
              timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), 
              checkedBy: 'Sari (Kasir)', 
              notes: 'Order received, payment transfer Mandiri' 
            },
            { 
              status: 'check', 
              timestamp: new Date(Date.now() - 3.5 * 60 * 60 * 1000), 
              checkedBy: 'Andi (Checker)', 
              notes: 'Items checked, all clear' 
            },
            { 
              status: 'washing', 
              timestamp: new Date(Date.now() - 2.5 * 60 * 60 * 1000), 
              checkedBy: 'Budi (Washer)', 
              notes: 'Washing completed successfully' 
            },
            { 
              status: 'ironed', 
              timestamp: new Date(Date.now() - 30 * 60 * 1000), 
              checkedBy: 'Lina (Ironer)', 
              notes: 'Ironing completed, items look fresh' 
            }
          ],
          estimatedDone: new Date(Date.now() + 30 * 60 * 1000),
          createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 30 * 60 * 1000)
        },

        // In packaging stage
        {
          id: 1005,
          transactionNo: 'TXN-240926-015',
          customerId: 5,
          customer: { id: 5, name: 'Rahmat Hidayat', phone: '081234567894', email: 'rahmat@email.com' },
          items: [
            { serviceId: 3, name: 'Express Wash', price: 12000, unit: 'kg', quantity: 4, subtotal: 48000 }
          ],
          totalAmount: 48000,
          paymentMethod: 'cash',
          currentStatus: 'packaging',
          progress: [
            { 
              status: 'received', 
              timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), 
              checkedBy: 'Sari (Kasir)', 
              notes: 'Express order received' 
            },
            { 
              status: 'check', 
              timestamp: new Date(Date.now() - 5.5 * 60 * 60 * 1000), 
              checkedBy: 'Andi (Checker)', 
              notes: 'Quick check completed' 
            },
            { 
              status: 'washing', 
              timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), 
              checkedBy: 'Budi (Washer)', 
              notes: 'Express wash completed' 
            },
            { 
              status: 'ironed', 
              timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), 
              checkedBy: 'Lina (Ironer)', 
              notes: 'Express ironing done' 
            },
            { 
              status: 'packaging', 
              timestamp: new Date(Date.now() - 10 * 60 * 1000), 
              checkedBy: 'Dewi (Packer)', 
              notes: 'Final packaging and quality check' 
            }
          ],
          estimatedDone: new Date(Date.now() + 5 * 60 * 1000), // Ready in 5 minutes
          createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 10 * 60 * 1000)
        },

        // Ready for pickup
        {
          id: 1006,
          transactionNo: 'TXN-240926-012',
          customerId: 6,
          customer: { id: 6, name: 'Indira Sari', phone: '081234567895', email: 'indira@email.com' },
          items: [
            { serviceId: 1, name: 'Dry Clean', price: 15000, unit: 'pcs', quantity: 5, subtotal: 75000 },
            { serviceId: 6, name: 'Leather Care', price: 50000, unit: 'pcs', quantity: 1, subtotal: 50000 }
          ],
          totalAmount: 125000,
          paymentMethod: 'transfer',
          currentStatus: 'done',
          progress: [
            { 
              status: 'received', 
              timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), 
              checkedBy: 'Sari (Kasir)', 
              notes: 'Premium order received' 
            },
            { 
              status: 'check', 
              timestamp: new Date(Date.now() - 23 * 60 * 60 * 1000), 
              checkedBy: 'Andi (Checker)', 
              notes: 'Premium items checked carefully' 
            },
            { 
              status: 'washing', 
              timestamp: new Date(Date.now() - 20 * 60 * 60 * 1000), 
              checkedBy: 'Budi (Washer)', 
              notes: 'Special dry clean process' 
            },
            { 
              status: 'ironed', 
              timestamp: new Date(Date.now() - 16 * 60 * 60 * 1000), 
              checkedBy: 'Lina (Ironer)', 
              notes: 'Premium ironing with special care' 
            },
            { 
              status: 'packaging', 
              timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000), 
              checkedBy: 'Dewi (Packer)', 
              notes: 'Premium packaging with hanger' 
            },
            { 
              status: 'done', 
              timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000), 
              checkedBy: 'Dewi (Packer)', 
              notes: 'Order ready for pickup - SMS sent to customer' 
            }
          ],
          estimatedDone: new Date(Date.now() - 12 * 60 * 60 * 1000), // Was ready 12 hours ago
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000)
        },

        // Recently completed order
        {
          id: 1007,
          transactionNo: 'TXN-240925-008',
          customerId: 7,
          customer: { id: 7, name: 'Fajar Nugraha', phone: '081234567896', email: 'fajar@email.com' },
          items: [
            { serviceId: 2, name: 'Wash & Iron', price: 8000, unit: 'kg', quantity: 2, subtotal: 16000 },
            { serviceId: 7, name: 'Stain Treatment', price: 20000, unit: 'pcs', quantity: 1, subtotal: 20000 }
          ],
          totalAmount: 36000,
          paymentMethod: 'qris',
          currentStatus: 'completed',
          completionType: 'pickup',
          completedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
          progress: [
            { 
              status: 'received', 
              timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000), 
              checkedBy: 'Sari (Kasir)', 
              notes: 'Order with stain treatment' 
            },
            { 
              status: 'check', 
              timestamp: new Date(Date.now() - 47 * 60 * 60 * 1000), 
              checkedBy: 'Andi (Checker)', 
              notes: 'Heavy stain found on shirt',
              metadata: JSON.stringify({ money: false, receipts: false, damage: false, stains: true, notes: 'Noda membandel di kemeja putih, perlu treatment khusus' })
            },
            { 
              status: 'washing', 
              timestamp: new Date(Date.now() - 44 * 60 * 60 * 1000), 
              checkedBy: 'Budi (Washer)', 
              notes: 'Special stain treatment applied' 
            },
            { 
              status: 'ironed', 
              timestamp: new Date(Date.now() - 40 * 60 * 60 * 1000), 
              checkedBy: 'Lina (Ironer)', 
              notes: 'Ironing completed, stain removed successfully' 
            },
            { 
              status: 'packaging', 
              timestamp: new Date(Date.now() - 36 * 60 * 60 * 1000), 
              checkedBy: 'Dewi (Packer)', 
              notes: 'Packaged with care note' 
            },
            { 
              status: 'done', 
              timestamp: new Date(Date.now() - 36 * 60 * 60 * 1000), 
              checkedBy: 'Dewi (Packer)', 
              notes: 'Ready for pickup' 
            },
            { 
              status: 'completed', 
              timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), 
              checkedBy: 'Sari (Kasir)', 
              notes: 'Order picked up by customer',
              completionType: 'pickup'
            }
          ],
          estimatedDone: new Date(Date.now() - 36 * 60 * 60 * 1000),
          createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
        },

        // Another order in check phase with damage found
        {
          id: 1008,
          transactionNo: 'TXN-240927-008',
          customerId: 8,
          customer: { id: 8, name: 'Maya Kusuma', phone: '081234567897', email: 'maya@email.com' },
          items: [
            { serviceId: 2, name: 'Wash & Iron', price: 8000, unit: 'kg', quantity: 3, subtotal: 24000 },
            { serviceId: 8, name: 'Suit Press', price: 30000, unit: 'set', quantity: 1, subtotal: 30000 }
          ],
          totalAmount: 54000,
          paymentMethod: 'cash',
          currentStatus: 'check',
          progress: [
            { 
              status: 'received', 
              timestamp: new Date(Date.now() - 20 * 60 * 1000), 
              checkedBy: 'Sari (Kasir)', 
              notes: 'Order received with suit' 
            }
          ],
          estimatedDone: new Date(Date.now() + 5 * 60 * 60 * 1000),
          createdAt: new Date(Date.now() - 20 * 60 * 1000),
          updatedAt: new Date(Date.now() - 20 * 60 * 1000)
        }
      ];

      this.transactions = sampleTransactions;
    },
  },
});

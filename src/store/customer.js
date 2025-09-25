import { defineStore } from 'pinia';

// Helper function to simulate unique ID generation
const generateId = () => Math.random().toString(36).substr(2, 9);

export const useCustomerStore = defineStore('customer', {
  state: () => ({
    // Sample data to simulate a backend
    customers: [
      { id: 'c1', name: 'John Doe', phone: '081234567890', address: 'Jl. Merdeka No. 123, Jakarta' },
      { id: 'c2', name: 'Jane Smith', phone: '089876543210', address: 'Jl. Sudirman No. 456, Bandung' },
      { id: 'c3', name: 'Peter Jones', phone: '081122334455', address: 'Jl. Thamrin No. 789, Surabaya' },
    ],
    error: null,
    loading: false,
  }),
  actions: {
    addCustomer(customer) {
      this.error = null;
      // Basic validation
      if (!customer.name || !customer.phone) {
        this.error = 'Name and phone number are required.';
        return;
      }
      if (this.customers.some(c => c.phone === customer.phone)) {
        this.error = 'Phone number must be unique.';
        return;
      }
      
      const newCustomer = { id: generateId(), ...customer };
      this.customers.push(newCustomer);
    },
    updateCustomer(updatedCustomer) {
      this.error = null;
      const index = this.customers.findIndex(c => c.id === updatedCustomer.id);
      if (index !== -1) {
        // Check for unique phone number, excluding the current customer
        if (this.customers.some(c => c.phone === updatedCustomer.phone && c.id !== updatedCustomer.id)) {
          this.error = 'Phone number must be unique.';
          return;
        }
        this.customers[index] = updatedCustomer;
      }
    },
    deleteCustomer(customerId) {
      this.customers = this.customers.filter(c => c.id !== customerId);
    },
  },
});

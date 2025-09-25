import { defineStore } from 'pinia';

// Helper function to simulate unique ID generation
const generateId = () => Math.random().toString(36).substr(2, 9);

export const useServiceStore = defineStore('service', {
  state: () => ({
    // Sample services data
    services: [
      { id: 's1', name: 'Cuci Kering', price: 5000, unit: 'kg' },
      { id: 's2', name: 'Cuci Setrika', price: 7000, unit: 'kg' },
      { id: 's3', name: 'Dry Clean', price: 15000, unit: 'pcs' },
      { id: 's4', name: 'Setrika Saja', price: 3000, unit: 'kg' },
      { id: 's5', name: 'Cuci Sepatu', price: 20000, unit: 'pasang' },
      { id: 's6', name: 'Cuci Boneka', price: 25000, unit: 'pcs' },
      { id: 's7', name: 'Cuci Karpet', price: 12000, unit: 'meter' },
      { id: 's8', name: 'Express 1 Hari', price: 10000, unit: 'kg' },
    ],
    error: null,
    loading: false,
  }),
  actions: {
    addService(service) {
      this.error = null;
      // Basic validation
      if (!service.name || !service.price || !service.unit) {
        this.error = 'Name, price, and unit are required.';
        return;
      }
      if (this.services.some(s => s.name.toLowerCase() === service.name.toLowerCase())) {
        this.error = 'Service name must be unique.';
        return;
      }
       if (service.price <= 0) {
        this.error = 'Price must be greater than 0.';
        return;
      }
      
      const newService = { id: generateId(), ...service };
      this.services.push(newService);
    },
    updateService(updatedService) {
      this.error = null;
      const index = this.services.findIndex(s => s.id === updatedService.id);
      if (index !== -1) {
        // Check for unique name, excluding the current service
        if (this.services.some(s => s.name.toLowerCase() === updatedService.name.toLowerCase() && s.id !== updatedService.id)) {
          this.error = 'Service name must be unique.';
          return;
        }
        if (updatedService.price <= 0) {
          this.error = 'Price must be greater than 0.';
          return;
        }
        this.services[index] = updatedService;
      }
    },
    deleteService(serviceId) {
      this.services = this.services.filter(s => s.id !== serviceId);
    },
  },
});

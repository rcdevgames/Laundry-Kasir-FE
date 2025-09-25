<template>
  <DataTable
    title="Customer List"
    :data="customers"
    :columns="customerColumns"
    :loading="loading"
    search-placeholder="Search customers..."
    item-key="id"
    display-name-key="name"
    subtitle-key="phone"
    empty-icon="users"
    empty-message="No customers found. Add your first customer!"
    @edit="$emit('edit', $event)"
    @delete="$emit('delete', $event)"
    @search="handleSearch"
  >
    <!-- Custom mobile card slot with avatar and contact info -->
    <template #mobile-card="{ item }">
      <div class="flex items-start justify-between">
        <div class="flex items-start flex-1">
          <div class="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
            <span class="text-indigo-600 font-medium text-sm">{{ getInitials(item.name) }}</span>
          </div>
          <div class="ml-4 flex-1 min-w-0">
            <div class="text-base font-semibold text-gray-900 mb-1">{{ item.name }}</div>
            <div class="flex items-center text-sm text-gray-600 mb-1">
              <FontAwesomeIcon icon="phone" class="h-4 w-4 mr-1 text-green-500" />
              <span class="font-medium">{{ item.phone }}</span>
            </div>
            <div v-if="item.address" class="flex items-start text-sm text-gray-600">
              <FontAwesomeIcon icon="map-marker-alt" class="h-4 w-4 mr-1 mt-0.5 text-blue-500 flex-shrink-0" />
              <span class="text-blue-600 line-clamp-2">{{ item.address }}</span>
            </div>
          </div>
        </div>
        <div class="flex space-x-1">
          <button 
            @click="$emit('edit', item)" 
            class="p-3 text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 rounded-lg transition-colors duration-200"
          >
            <FontAwesomeIcon icon="pen-to-square" class="h-5 w-5" />
          </button>
          <button 
            @click="$emit('delete', item.id)" 
            class="p-3 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-colors duration-200"
          >
            <FontAwesomeIcon icon="trash" class="h-5 w-5" />
          </button>
        </div>
      </div>
    </template>

    <!-- Custom customer column with avatar -->
    <template #column-name="{ item }">
      <div class="flex items-center">
        <div class="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
          <span class="text-indigo-600 font-medium">{{ getInitials(item.name) }}</span>
        </div>
        <div class="ml-4">
          <div class="text-sm font-medium text-gray-900">{{ item.name }}</div>
        </div>
      </div>
    </template>

    <!-- Custom phone column with icon -->
    <template #column-phone="{ value }">
      <div class="flex items-center text-sm text-gray-500">
        <FontAwesomeIcon icon="phone" class="h-4 w-4 mr-2 text-green-500" />
        {{ value }}
      </div>
    </template>

    <!-- Custom address column -->
    <template #column-address="{ value }">
      <div class="max-w-xs truncate" :title="value">
        <div v-if="value" class="flex items-center text-sm text-gray-500">
          <FontAwesomeIcon icon="map-marker-alt" class="h-4 w-4 mr-2 text-blue-500" />
          {{ value }}
        </div>
        <span v-else class="text-gray-400">-</span>
      </div>
    </template>
  </DataTable>
</template>

<script setup>
import DataTable from './DataTable.vue';

const props = defineProps({
  customers: {
    type: Array,
    required: true,
  },
  loading: {
    type: Boolean,
    default: false
  }
});

defineEmits(['edit', 'delete', 'search']);

// Column definitions for DataTable
const customerColumns = [
  { key: 'name', label: 'Customer', weight: 'bold' },
  { key: 'phone', label: 'Contact', nowrap: true },
  { key: 'address', label: 'Address' }
];

// Helper function to get initials from name
const getInitials = (name) => {
  const names = name.split(' ');
  if (names.length >= 2) {
    return (names[0].charAt(0) + names[1].charAt(0)).toUpperCase();
  } else {
    return names[0].charAt(0).toUpperCase();
  }
};

// Handle search functionality
const handleSearch = (query) => {
  // For now, just emit the search event
  // In the future, this could be extended for client-side filtering
  // or passed to parent component for server-side search
  console.log('Search query:', query);
};
</script>

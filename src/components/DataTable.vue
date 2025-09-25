<template>
  <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
    <!-- Header and Search -->
    <div class="p-6 border-b border-gray-200">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 class="text-lg sm:text-xl font-semibold text-gray-800">{{ title }}</h2>
        <div class="w-full sm:w-64" v-if="searchable">
          <div class="relative">
            <input
              type="text"
              :value="searchQuery"
              @input="$emit('search', $event.target.value)"
              :placeholder="searchPlaceholder"
              class="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            />
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FontAwesomeIcon icon="magnifying-glass" class="h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="p-8">
      <div class="flex flex-col items-center justify-center space-y-4">
        <FontAwesomeIcon icon="spinner" class="h-8 w-8 text-indigo-500 animate-spin" />
        <p class="text-gray-500 text-sm">Loading data...</p>
      </div>
    </div>

    <!-- Content when not loading -->
    <div v-else>
      <!-- Mobile Card View -->
      <div class="md:hidden">
        <div v-if="data.length === 0" class="px-6 py-8 text-center text-gray-500 text-sm">
          <div class="flex flex-col items-center">
            <FontAwesomeIcon :icon="emptyIcon" class="h-12 w-12 text-gray-300 mb-2" />
            <p>{{ emptyMessage }}</p>
          </div>
        </div>
        <div v-else class="divide-y divide-gray-200">
          <div 
            v-for="item in data" 
            :key="item[itemKey]" 
            class="px-6 py-4 hover:bg-gray-50 transition-colors duration-150"
          >
            <slot name="mobile-card" :item="item">
              <!-- Default mobile card fallback -->
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <div class="text-base font-semibold text-gray-900 mb-1">
                    {{ getItemDisplayName(item) }}
                  </div>
                  <div class="text-sm text-gray-600">
                    {{ getItemSubtitle(item) }}
                  </div>
                </div>
                <div class="flex space-x-1 ml-4">
                  <button 
                    v-if="editable"
                    @click="$emit('edit', item)" 
                    class="p-3 text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 rounded-lg transition-colors duration-200"
                  >
                    <FontAwesomeIcon icon="pen-to-square" class="h-5 w-5" />
                  </button>
                  <button 
                    v-if="deletable"
                    @click="$emit('delete', item[itemKey])" 
                    class="p-3 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-colors duration-200"
                  >
                    <FontAwesomeIcon icon="trash" class="h-5 w-5" />
                  </button>
                </div>
              </div>
            </slot>
          </div>
        </div>
      </div>

      <!-- Desktop Table View -->
      <div class="hidden md:block overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th 
              v-for="column in columns" 
              :key="column.key"
              scope="col" 
              :class="[
                'px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider',
                column.align === 'right' ? 'text-right' : 'text-left'
              ]"
            >
              {{ column.label }}
            </th>
            <th v-if="editable || deletable" scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-if="data.length === 0">
            <td :colspan="columns.length + (editable || deletable ? 1 : 0)" class="px-6 py-8 text-center text-gray-500 text-sm">
              <div class="flex flex-col items-center">
                <FontAwesomeIcon :icon="emptyIcon" class="h-12 w-12 text-gray-300 mb-2" />
                <p>{{ emptyMessage }}</p>
              </div>
            </td>
          </tr>
          <tr v-for="item in data" :key="item[itemKey]" class="hover:bg-gray-50 transition-colors duration-150">
            <td 
              v-for="column in columns" 
              :key="column.key"
              :class="[
                'px-6 py-4 text-sm',
                column.align === 'right' ? 'text-right' : 'text-left',
                column.nowrap ? 'whitespace-nowrap' : '',
                column.weight === 'bold' ? 'font-medium text-gray-900' : 'text-gray-500'
              ]"
            >
              <slot :name="`column-${column.key}`" :item="item" :value="getNestedValue(item, column.key)">
                {{ formatValue(getNestedValue(item, column.key), column.format) }}
              </slot>
            </td>
            <td v-if="editable || deletable" class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <div class="flex justify-end space-x-2">
                <button 
                  v-if="editable"
                  @click="$emit('edit', item)" 
                  class="p-2 text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 rounded-lg transition-colors duration-200"
                >
                  <FontAwesomeIcon icon="pen-to-square" class="h-4 w-4" />
                </button>
                <button 
                  v-if="deletable"
                  @click="$emit('delete', item[itemKey])" 
                  class="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-colors duration-200"
                >
                  <FontAwesomeIcon icon="trash" class="h-4 w-4" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div 
      v-if="paginated && totalItems > 0" 
      class="px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4"
    >
      <span class="text-sm text-gray-700">
        Showing {{ (currentPage - 1) * perPage + 1 }} to {{ Math.min(currentPage * perPage, totalItems) }} of {{ totalItems }} items
      </span>
      <div class="flex items-center space-x-2">
        <!-- Per page selector -->
        <select 
          v-if="showPerPageSelector"
          :value="perPage" 
          @change="$emit('per-page-change', parseInt($event.target.value))"
          class="text-sm border border-gray-300 rounded px-2 py-1"
        >
          <option value="5">5</option>
          <option value="10">10</option>
          <option value="20">20</option>
          <option value="50">50</option>
        </select>
        
        <!-- Pagination buttons - only show if more than 1 page -->
        <div v-if="totalPages > 1" class="flex space-x-1">
          <button
            @click="$emit('page-change', currentPage - 1)"
            :disabled="currentPage === 1"
            class="px-3 py-1.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed min-w-[36px]"
          >
            <FontAwesomeIcon icon="arrow-left" class="h-3 w-3" />
          </button>
          <button
            v-for="page in pagesToShow"
            :key="page"
            @click="$emit('page-change', page)"
            :class="[
              'px-3 py-1.5 text-sm min-w-[36px] rounded-lg',
              currentPage === page 
                ? 'bg-indigo-600 text-white' 
                : 'border border-gray-300 hover:bg-gray-100'
            ]"
          >
            {{ page }}
          </button>
          <button
            @click="$emit('page-change', currentPage + 1)"
            :disabled="currentPage === totalPages"
            class="px-3 py-1.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed min-w-[36px]"
          >
            <FontAwesomeIcon icon="arrow-right" class="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  // Data props
  title: { type: String, required: true },
  data: { type: Array, default: () => [] },
  columns: { type: Array, required: true },
  itemKey: { type: String, default: 'id' },
  loading: { type: Boolean, default: false },
  
  // Search props
  searchable: { type: Boolean, default: true },
  searchQuery: { type: String, default: '' },
  searchPlaceholder: { type: String, default: 'Search...' },
  
  // Action props
  editable: { type: Boolean, default: true },
  deletable: { type: Boolean, default: true },
  
  // Pagination props
  paginated: { type: Boolean, default: false },
  currentPage: { type: Number, default: 1 },
  perPage: { type: Number, default: 10 },
  totalItems: { type: Number, default: 0 },
  totalPages: { type: Number, default: 1 },
  showPerPageSelector: { type: Boolean, default: true },
  
  // Empty state props
  emptyIcon: { type: String, default: 'info-circle' },
  emptyMessage: { type: String, default: 'No data found.' },
  
  // Display props for mobile fallback
  displayNameKey: { type: String, default: 'name' },
  subtitleKey: { type: String, default: null }
});

defineEmits([
  'search', 
  'edit', 
  'delete', 
  'page-change', 
  'per-page-change'
]);

// Helper functions
const getNestedValue = (obj, path) => {
  return path.split('.').reduce((current, key) => current?.[key], obj);
};

const formatValue = (value, format) => {
  if (value === null || value === undefined) return '-';
  
  switch (format) {
    case 'currency':
      return `Rp ${value.toLocaleString()}`;
    case 'number':
      return value.toLocaleString();
    case 'date':
      return new Date(value).toLocaleDateString();
    case 'datetime':
      return new Date(value).toLocaleString();
    default:
      return value;
  }
};

const getItemDisplayName = (item) => {
  return getNestedValue(item, props.displayNameKey) || 'Unknown';
};

const getItemSubtitle = (item) => {
  if (!props.subtitleKey) return '';
  return getNestedValue(item, props.subtitleKey) || '';
};

// Pagination computed
const pagesToShow = computed(() => {
  const pages = [];
  const maxPages = 5;
  
  if (props.totalPages <= maxPages) {
    for (let i = 1; i <= props.totalPages; i++) {
      pages.push(i);
    }
  } else {
    const startPage = Math.max(1, props.currentPage - Math.floor(maxPages / 2));
    const endPage = Math.min(props.totalPages, startPage + maxPages - 1);
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
  }
  
  return pages;
});
</script>
<template>
  <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <label for="startDate" class="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
        <input
          type="date"
          id="startDate"
          v-model="startDate"
          class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
        />
      </div>
      <div>
        <label for="endDate" class="block text-sm font-medium text-gray-700 mb-2">End Date</label>
        <input
          type="date"
          id="endDate"
          v-model="endDate"
          class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
        />
      </div>
      <div class="flex items-end">
        <button 
          @click="applyFilter" 
          class="w-full px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium transition-colors duration-200"
        >
          Apply Filter
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const emit = defineEmits(['filter']);

const today = new Date().toISOString().split('T')[0];
const startDate = ref(today);
const endDate = ref(today);

const applyFilter = () => {
  emit('filter', {
    startDate: startDate.value,
    endDate: endDate.value,
  });
};
</script>

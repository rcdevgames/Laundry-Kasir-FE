<template>
  <!-- Modal Backdrop -->
  <Transition
    enter-active-class="transition-opacity duration-300 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition-opacity duration-200 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div v-if="visible" class="fixed inset-0 z-40 bg-black bg-opacity-30 backdrop-blur-sm" @click="close"></div>
  </Transition>

  <!-- Modal Dialog -->
  <Transition
    enter-active-class="transition-all duration-300 ease-out"
    enter-from-class="opacity-0 scale-95 translate-y-4"
    enter-to-class="opacity-100 scale-100 translate-y-0"
    leave-active-class="transition-all duration-200 ease-in"
    leave-from-class="opacity-100 scale-100 translate-y-0"
    leave-to-class="opacity-0 scale-95 translate-y-4"
  >
    <div v-if="visible" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="w-full max-w-md bg-white rounded-xl shadow-xl max-h-[90vh] overflow-y-auto border border-gray-200 transform">
      <div class="p-6">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-semibold text-gray-800">{{ isEditMode ? 'Edit Service' : 'Add New Service' }}</h2>
          <button 
            @click="close" 
            class="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full"
          >
            <FontAwesomeIcon icon="times" class="h-5 w-5" />
          </button>
        </div>
        
        <form @submit.prevent="handleSubmit">
          <!-- Name Input -->
          <div class="mb-5">
            <label for="name" class="block text-sm font-medium text-gray-700 mb-2">Service Name</label>
            <input
              v-model="form.name"
              id="name"
              type="text"
              required
              class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              placeholder="Enter service name"
            />
          </div>

          <!-- Price Input -->
          <div class="mb-5">
            <label for="price" class="block text-sm font-medium text-gray-700 mb-2">Price</label>
            <input
              v-model.number="form.price"
              id="price"
              type="number"
              required
              min="1"
              class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              placeholder="Enter price"
            />
          </div>

          <!-- Unit Dropdown -->
          <div class="mb-5">
            <label for="unit" class="block text-sm font-medium text-gray-700 mb-2">Unit</label>
            <select
              v-model="form.unit"
              id="unit"
              required
              class="w-full px-3 py-2.5 border border-gray-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            >
              <option disabled value="">Please select one</option>
              <option value="kg">Kg</option>
              <option value="pcs">Pcs</option>
            </select>
          </div>

          <!-- Action Buttons -->
          <div class="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2">
            <button 
              type="button" 
              @click="close" 
              class="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium transition-colors duration-200"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              class="px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium transition-colors duration-200 flex items-center justify-center"
            >
              <FontAwesomeIcon :icon="isEditMode ? 'edit' : 'plus'" class="h-4 w-4 mr-1" />
              {{ isEditMode ? 'Update Service' : 'Save Service' }}
            </button>
          </div>
        </form>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, watch, computed } from 'vue';

const props = defineProps({
  visible: Boolean,
  service: Object, // Used for editing
});

const emit = defineEmits(['close', 'save']);

const form = ref({ id: null, name: '', price: 0, unit: '' });

const isEditMode = computed(() => !!props.service);

watch(() => props.service, (newVal) => {
  if (newVal) {
    form.value = { ...newVal };
  } else {
    form.value = { id: null, name: '', price: 0, unit: '' };
  }
});

watch(() => props.visible, (newVal) => {
  if (!newVal) {
    // Reset form when modal is closed
    form.value = { id: null, name: '', price: 0, unit: '' };
  }
});

const handleSubmit = () => {
  emit('save', form.value);
};

const close = () => {
  // Add a small delay to let the animation finish
  setTimeout(() => {
    emit('close');
  }, 0);
};
</script>

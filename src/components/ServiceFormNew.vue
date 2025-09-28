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
      <div class="w-full max-w-lg bg-white rounded-xl shadow-xl max-h-[90vh] overflow-y-auto border border-gray-200 transform">
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
              <label for="name" class="block text-sm font-medium text-gray-700 mb-2">
                Service Name <span class="text-red-500">*</span>
              </label>
              <input
                v-model="form.name"
                id="name"
                type="text"
                :class="getInputClass('name')"
                placeholder="Enter service name"
                @blur="markTouched('name')"
                @input="validateField('name')"
              />
              <p v-if="errors.name" class="mt-1.5 text-xs text-red-600 flex items-center">
                <FontAwesomeIcon icon="exclamation-circle" class="h-4 w-4 mr-1" />
                {{ errors.name }}
              </p>
            </div>

            <!-- Category Input -->
            <div class="mb-5">
              <label for="category" class="block text-sm font-medium text-gray-700 mb-2">
                Category <span class="text-red-500">*</span>
              </label>
              <select
                v-model="form.category"
                id="category"
                :class="getInputClass('category')"
                @blur="markTouched('category')"
                @change="validateField('category')"
              >
                <option value="">Select category</option>
                <option value="washing">Washing</option>
                <option value="dry-clean">Dry Clean</option>
                <option value="ironing">Ironing</option>
                <option value="shoe-care">Shoe Care</option>
                <option value="special">Special Service</option>
                <option value="express">Express Service</option>
              </select>
              <p v-if="errors.category" class="mt-1.5 text-xs text-red-600 flex items-center">
                <FontAwesomeIcon icon="exclamation-circle" class="h-4 w-4 mr-1" />
                {{ errors.category }}
              </p>
            </div>

            <!-- Icon Input -->
            <div class="mb-5">
              <label for="icon" class="block text-sm font-medium text-gray-700 mb-2">
                Icon <span class="text-red-500">*</span>
              </label>
              <div class="grid grid-cols-6 gap-2 mb-2">
                <button
                  v-for="iconOption in iconOptions"
                  :key="iconOption.value"
                  type="button"
                  :class="[
                    'p-2 border rounded-lg text-center transition-colors duration-200',
                    form.icon === iconOption.value 
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-600' 
                      : 'border-gray-300 hover:border-gray-400'
                  ]"
                  @click="selectIcon(iconOption.value)"
                >
                  <FontAwesomeIcon :icon="iconOption.icon" class="h-5 w-5" />
                </button>
              </div>
              <input
                v-model="form.icon"
                id="icon"
                type="text"
                :class="getInputClass('icon')"
                placeholder="Or enter custom icon name"
                @blur="markTouched('icon')"
                @input="validateField('icon')"
              />
              <p v-if="errors.icon" class="mt-1.5 text-xs text-red-600 flex items-center">
                <FontAwesomeIcon icon="exclamation-circle" class="h-4 w-4 mr-1" />
                {{ errors.icon }}
              </p>
            </div>

            <!-- Price and Unit Row -->
            <div class="grid grid-cols-2 gap-4 mb-5">
              <!-- Price Input -->
              <div>
                <label for="price" class="block text-sm font-medium text-gray-700 mb-2">
                  Price <span class="text-red-500">*</span>
                </label>
                <div class="relative">
                  <span class="absolute left-3 top-2.5 text-gray-500 text-sm">Rp</span>
                  <input
                    v-model.number="form.price"
                    id="price"
                    type="number"
                    min="0"
                    step="500"
                    :class="[getInputClass('price'), 'pl-8']"
                    placeholder="0"
                    @blur="markTouched('price')"
                    @input="validateField('price')"
                  />
                </div>
                <p v-if="errors.price" class="mt-1.5 text-xs text-red-600 flex items-center">
                  <FontAwesomeIcon icon="exclamation-circle" class="h-4 w-4 mr-1" />
                  {{ errors.price }}
                </p>
              </div>

              <!-- Unit Input -->
              <div>
                <label for="unit" class="block text-sm font-medium text-gray-700 mb-2">
                  Unit <span class="text-red-500">*</span>
                </label>
                <select
                  v-model="form.unit"
                  id="unit"
                  :class="getInputClass('unit')"
                  @blur="markTouched('unit')"
                  @change="validateField('unit')"
                >
                  <option value="">Select unit</option>
                  <option value="pcs">Pieces (pcs)</option>
                  <option value="kg">Kilogram (kg)</option>
                  <option value="set">Set</option>
                  <option value="pair">Pair</option>
                  <option value="item">Item</option>
                </select>
                <p v-if="errors.unit" class="mt-1.5 text-xs text-red-600 flex items-center">
                  <FontAwesomeIcon icon="exclamation-circle" class="h-4 w-4 mr-1" />
                  {{ errors.unit }}
                </p>
              </div>
            </div>

            <!-- Description Input -->
            <div class="mb-5">
              <label for="description" class="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                v-model="form.description"
                id="description"
                rows="3"
                :class="getInputClass('description')"
                placeholder="Enter service description (optional)"
                @blur="markTouched('description')"
                @input="validateField('description')"
              ></textarea>
              <p v-if="errors.description" class="mt-1.5 text-xs text-red-600 flex items-center">
                <FontAwesomeIcon icon="exclamation-circle" class="h-4 w-4 mr-1" />
                {{ errors.description }}
              </p>
            </div>

            <!-- Active Status -->
            <div class="mb-6">
              <label class="flex items-center">
                <input
                  v-model="form.is_active"
                  type="checkbox"
                  class="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500 focus:ring-2"
                />
                <span class="ml-2 text-sm text-gray-700">Active Service</span>
              </label>
              <p class="mt-1 text-xs text-gray-500">Inactive services won't appear in transaction forms</p>
            </div>

            <!-- Action Buttons -->
            <div class="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2">
              <button 
                type="button" 
                @click="close" 
                :disabled="isSubmitting"
                class="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                :disabled="isSubmitting"
                class="px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium transition-colors duration-200 flex items-center justify-center disabled:bg-indigo-400 disabled:cursor-not-allowed"
              >
                <FontAwesomeIcon 
                  v-if="!isSubmitting" 
                  :icon="isEditMode ? 'edit' : 'plus'" 
                  class="h-4 w-4 mr-1" 
                />
                <svg 
                  v-else 
                  class="animate-spin h-4 w-4 mr-1" 
                  fill="none" 
                  viewBox="0 0 24 24"
                >
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ isSubmitting ? 'Saving...' : (isEditMode ? 'Update Service' : 'Save Service') }}
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
import { validateForm, sanitizeFormData, getFieldClass } from '../utils/validation.js';

const props = defineProps({
  visible: Boolean,
  service: Object, // Used for editing
});

const emit = defineEmits(['close', 'save']);

const form = ref({
  id: null,
  name: '',
  category: '',
  icon: '',
  price: 0,
  unit: '',
  description: '',
  is_active: true
});

const errors = ref({});
const touched = ref({});
const isSubmitting = ref(false);

const isEditMode = computed(() => !!props.service);
const schemaName = computed(() => isEditMode.value ? 'updateService' : 'createService');

// Icon options for service types
const iconOptions = [
  { value: 'tshirt', icon: ['fas', 'tshirt'] },
  { value: 'soap', icon: ['fas', 'soap'] },
  { value: 'iron', icon: ['fas', 'iron'] },
  { value: 'shoe-prints', icon: ['fas', 'shoe-prints'] },
  { value: 'sparkles', icon: ['fas', 'sparkles'] },
  { value: 'bolt', icon: ['fas', 'bolt'] },
  { value: 'star', icon: ['fas', 'star'] },
  { value: 'heart', icon: ['fas', 'heart'] },
  { value: 'shield-alt', icon: ['fas', 'shield-alt'] },
  { value: 'magic', icon: ['fas', 'magic'] },
  { value: 'gem', icon: ['fas', 'gem'] },
  { value: 'crown', icon: ['fas', 'crown'] }
];

// Validation helpers
const getInputClass = (fieldName) => getFieldClass(fieldName, errors.value, touched.value);

const markTouched = (fieldName) => {
  touched.value[fieldName] = true;
  validateField(fieldName);
};

const validateField = (fieldName) => {
  const tempData = { [fieldName]: form.value[fieldName] };
  const validation = validateForm(tempData, schemaName.value);
  
  if (validation.errors[fieldName]) {
    errors.value[fieldName] = validation.errors[fieldName];
  } else {
    delete errors.value[fieldName];
  }
};

const validateAllFields = () => {
  const validation = validateForm(form.value, schemaName.value);
  errors.value = validation.errors;
  
  // Mark all fields as touched
  Object.keys(form.value).forEach(key => {
    touched.value[key] = true;
  });
  
  return validation.isValid;
};

const selectIcon = (iconValue) => {
  form.value.icon = iconValue;
  markTouched('icon');
};

watch(() => props.service, (newVal) => {
  if (newVal) {
    form.value = {
      ...newVal,
      description: newVal.description || '',
      is_active: newVal.is_active !== undefined ? newVal.is_active : true
    };
  } else {
    resetForm();
  }
});

watch(() => props.visible, (newVal) => {
  if (!newVal) {
    resetForm();
  }
});

const resetForm = () => {
  form.value = {
    id: null,
    name: '',
    category: '',
    icon: '',
    price: 0,
    unit: '',
    description: '',
    is_active: true
  };
  errors.value = {};
  touched.value = {};
  isSubmitting.value = false;
};

const handleSubmit = async () => {
  if (isSubmitting.value) return;
  
  isSubmitting.value = true;
  
  try {
    if (!validateAllFields()) {
      isSubmitting.value = false;
      return;
    }

    // Sanitize form data according to schema
    const sanitizedData = sanitizeFormData(form.value, schemaName.value);
    
    emit('save', sanitizedData);
    close();
  } catch (error) {
    console.error('Form submission error:', error);
  } finally {
    isSubmitting.value = false;
  }
};

const close = () => {
  setTimeout(() => {
    emit('close');
  }, 0);
};
</script>
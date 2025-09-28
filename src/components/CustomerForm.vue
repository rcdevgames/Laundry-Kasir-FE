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
          <h2 class="text-lg font-semibold text-gray-800">{{ isEditMode ? 'Edit Customer' : 'Add New Customer' }}</h2>
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
              Name <span class="text-red-500">*</span>
            </label>
            <input
              v-model="form.name"
              id="name"
              type="text"
              :class="getInputClass('name')"
              placeholder="Enter customer name"
              @blur="markTouched('name')"
              @input="validateField('name')"
            />
            <p v-if="errors.name" class="mt-1.5 text-xs text-red-600 flex items-center">
              <FontAwesomeIcon icon="exclamation-circle" class="h-4 w-4 mr-1" />
              {{ errors.name }}
            </p>
          </div>

          <!-- Phone Input -->
          <div class="mb-5">
            <label for="phone" class="block text-sm font-medium text-gray-700 mb-2">
              Phone Number <span class="text-red-500">*</span>
            </label>
            <input
              v-model="form.phone"
              id="phone"
              type="tel"
              :class="getInputClass('phone')"
              placeholder="Enter phone number (10-15 digits)"
              @blur="markTouched('phone')"
              @input="validateField('phone')"
            />
            <p v-if="errors.phone" class="mt-1.5 text-xs text-red-600 flex items-center">
              <FontAwesomeIcon icon="exclamation-circle" class="h-4 w-4 mr-1" />
              {{ errors.phone }}
            </p>
          </div>

          <!-- Email Input -->
          <div class="mb-5">
            <label for="email" class="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              v-model="form.email"
              id="email"
              type="email"
              :class="getInputClass('email')"
              placeholder="Enter email address (optional)"
              @blur="markTouched('email')"
              @input="validateField('email')"
            />
            <p v-if="errors.email" class="mt-1.5 text-xs text-red-600 flex items-center">
              <FontAwesomeIcon icon="exclamation-circle" class="h-4 w-4 mr-1" />
              {{ errors.email }}
            </p>
          </div>

          <!-- Address Input -->
          <div class="mb-5">
            <label for="address" class="block text-sm font-medium text-gray-700 mb-2">Address</label>
            <textarea
              v-model="form.address"
              id="address"
              rows="3"
              :class="getInputClass('address')"
              placeholder="Enter customer address (optional)"
              @blur="markTouched('address')"
              @input="validateField('address')"
            ></textarea>
            <p v-if="errors.address" class="mt-1.5 text-xs text-red-600 flex items-center">
              <FontAwesomeIcon icon="exclamation-circle" class="h-4 w-4 mr-1" />
              {{ errors.address }}
            </p>
            <p v-else class="mt-1.5 text-xs text-gray-500">This will help with delivery if needed</p>
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
              {{ isSubmitting ? 'Saving...' : (isEditMode ? 'Update Customer' : 'Save Customer') }}
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
  customer: Object, // Used for editing
});

const emit = defineEmits(['close', 'save']);

const form = ref({ 
  id: null, 
  name: '', 
  phone: '', 
  email: '', 
  address: '' 
});
const errors = ref({});
const touched = ref({});
const isSubmitting = ref(false);

const isEditMode = computed(() => !!props.customer && !!props.customer.id);
const schemaName = computed(() => isEditMode.value ? 'updateCustomer' : 'createCustomer');

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

watch(() => props.customer, (newVal) => {
  if (newVal) {
    console.log('CustomerForm: Setting form with customer data:', newVal);
    form.value = { 
      id: newVal.id || null,
      name: newVal.name || '',
      phone: newVal.phone || '',
      email: newVal.email || '',
      address: newVal.address || ''
    };
  } else {
    console.log('CustomerForm: Resetting form for new customer');
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
    phone: '', 
    email: '', 
    address: '' 
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

    // Sanitize form data according to schema (ID is automatically preserved)
    const sanitizedData = sanitizeFormData(form.value, schemaName.value);
    console.log('CustomerForm: Form data before sanitize:', form.value);
    console.log('CustomerForm: Sanitized data being sent:', sanitizedData);
    console.log('CustomerForm: Is edit mode:', isEditMode.value);
    
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

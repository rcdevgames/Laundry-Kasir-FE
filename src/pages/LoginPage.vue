<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-100 p-4">
    <div class="w-full max-w-md">
      <div class="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
        <div class="text-center mb-8">
          <div class="mx-auto flex justify-center">
            <img 
              src="/waw-laundry-logo.svg" 
              alt="Waw Laundry Logo" 
              class="h-16 w-auto"
            />
          </div>
          <p class="mt-2 text-gray-500">Sign in to your account</p>
        </div>
        
        <form @submit.prevent="handleLogin" class="space-y-5">
          <div>
            <label for="username" class="block text-sm font-medium text-gray-700 mb-2">Username</label>
            <input
              v-model="form.username"
              id="username"
              name="username"
              type="text"
              :class="[getInputClass('username'), 'w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 text-sm']"
              placeholder="Enter your username"
              @blur="markTouched('username')"
              @input="validateField('username')"
            />
            <p v-if="errors.username" class="mt-2 text-xs text-red-600 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
              </svg>
              {{ errors.username }}
            </p>
          </div>
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input
              v-model="form.password"
              id="password"
              name="password"
              type="password"
              :class="[getInputClass('password'), 'w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 text-sm']"
              placeholder="Enter your password"
              @blur="markTouched('password')"
              @input="validateField('password')"
            />
            <p v-if="errors.password" class="mt-2 text-xs text-red-600 flex items-center">
              <svg xmlns="http://www.w3.gov/2000/svg" class="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
              </svg>
              {{ errors.password }}
            </p>
          </div>

          <div>
            <button
              type="submit"
              class="w-full px-4 py-3.5 font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 text-sm transition-colors duration-200 flex items-center justify-center"
              :disabled="authStore.loading"
            >
              <svg v-if="authStore.loading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ authStore.loading ? 'Signing in...' : 'Sign in' }}
            </button>
          </div>
          
          <!-- Forgot Password Link -->
          <div class="text-center mt-4">
            <button
              type="button"
              @click="showForgotPassword"
              class="text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors duration-200"
            >
              Lupa password?
            </button>
          </div>
        </form>
      </div>
      <p class="mt-6 text-center text-sm text-gray-500">
        &copy; {{ new Date().getFullYear() }} Waw Laundry. All rights reserved.
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { useAuthStore } from '../store/auth';
import { useRouter } from 'vue-router';
import { swalUtils } from '../utils/swal.js';
import { validateForm, getFieldClass } from '../utils/validation.js';

const form = ref({
  username: '',
  password: ''
});
const errors = ref({});
const touched = ref({});
const authStore = useAuthStore();
const router = useRouter();

// Validation helpers
const getInputClass = (fieldName) => getFieldClass(fieldName, errors.value, touched.value);

const markTouched = (fieldName) => {
  touched.value[fieldName] = true;
  validateField(fieldName);
};

const validateField = (fieldName) => {
  const tempData = { [fieldName]: form.value[fieldName] };
  const validation = validateForm(tempData, 'login');
  
  if (validation.errors[fieldName]) {
    errors.value[fieldName] = validation.errors[fieldName];
  } else {
    delete errors.value[fieldName];
  }
};

const validateAllFields = () => {
  const validation = validateForm(form.value, 'login');
  errors.value = validation.errors;
  
  // Mark all fields as touched
  Object.keys(form.value).forEach(key => {
    touched.value[key] = true;
  });
  
  return validation.isValid;
};

// Redirect to dashboard if already authenticated
onMounted(() => {
  if (authStore.isAuthenticated) {
    router.push('/');
  }
});

// Clear auth error when component mounts (since we use SweetAlert2 now)
onMounted(() => {
  authStore.error = null;
});

// Add some interactive features
const showForgotPassword = () => {
  swalUtils.info(
    'Lupa Password?',
    'Silakan hubungi administrator untuk reset password Anda.',
    {
      confirmButtonText: 'Mengerti'
    }
  );
};

// Show loading during login
watch(() => authStore.loading, (isLoading) => {
  if (isLoading) {
    swalUtils.loading('Memproses Login...', 'Mohon tunggu sebentar');
  } else {
    swalUtils.close();
  }
});

const handleLogin = async () => {
  try {
    if (!validateAllFields()) {
      swalUtils.warning(
        'Input Tidak Valid!',
        'Silakan periksa kembali username dan password Anda'
      );
      return;
    }

    // Call the auth store login method which handles the real API
    const result = await authStore.login({
      username: form.value.username,
      password: form.value.password,
    });
    
    // Handle successful login
    if (result && result.success) {
      // Clear form
      form.value = { username: '', password: '' };
      errors.value = {};
      touched.value = {};
      
      // Show success toast
      swalUtils.toast.success('Login berhasil! Selamat datang kembali 🎉');
    } else {
      // Show error alert
      swalUtils.error(
        'Login Gagal!',
        authStore.error || 'Username atau password salah. Silakan coba lagi.'
      );
    }
  } catch (error) {
    console.error('Login error:', error);
    swalUtils.error(
      'Terjadi Kesalahan!',
      'Gagal terhubung ke server. Periksa koneksi internet Anda.'
    );
  }
};
</script>

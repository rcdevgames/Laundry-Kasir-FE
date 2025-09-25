<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-100 p-4">
    <div class="w-full max-w-md">
      <div class="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
        <div class="text-center mb-8">
          <div class="mx-auto flex justify-center">
            <div class="p-3 bg-indigo-100 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
            </div>
          </div>
          <h1 class="mt-4 text-2xl font-bold text-gray-900">Laundry Kasir</h1>
          <p class="mt-2 text-gray-500">Sign in to your account</p>
        </div>
        
        <form @submit.prevent="handleLogin" class="space-y-5">
          <div>
            <label for="username" class="block text-sm font-medium text-gray-700 mb-2">Username</label>
            <input
              v-model="username"
              id="username"
              name="username"
              type="text"
              required
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              placeholder="Enter your username"
            />
          </div>
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input
              v-model="password"
              id="password"
              name="password"
              type="password"
              required
              minlength="5"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              placeholder="Enter your password"
            />
             <p v-if="passwordError" class="mt-2 text-xs text-red-600 flex items-center">
               <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                 <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
               </svg>
               {{ passwordError }}
             </p>
          </div>
          <div v-if="authStore.error" class="p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm">
            <div class="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
              </svg>
              {{ authStore.error }}
            </div>
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
        </form>
      </div>
      <p class="mt-6 text-center text-sm text-gray-500">
        &copy; {{ new Date().getFullYear() }} Laundry Kasir. All rights reserved.
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { useAuthStore } from '../store/auth';
import { useRouter } from 'vue-router';

const username = ref('');
const password = ref('');
const passwordError = ref('');
const authStore = useAuthStore();
const router = useRouter();

// Redirect to dashboard if already authenticated
onMounted(() => {
  if (authStore.isAuthenticated) {
    router.push('/');
  }
});

watch(password, (newValue) => {
  if (newValue && newValue.length < 5) {
    passwordError.value = 'Password must be at least 5 characters long.';
  } else {
    passwordError.value = '';
  }
});

const handleLogin = async () => {
  if (password.value.length >= 5) {
    // Call the auth store login method which handles the fake API
    await authStore.login({
      username: username.value,
      password: password.value,
    });
  } else {
    passwordError.value = 'Password must be at least 5 characters long.';
  }
};
</script>

<template>
  <div id="app" class="bg-gradient-to-br from-purple-50 to-indigo-50 min-h-screen pb-16 md:pb-0">
    <!-- Desktop/Tablet Header -->
    <header class="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
      <nav class="container mx-auto px-3 sm:px-6 py-3 md:py-4">
        <div class="flex justify-between items-center">
          <router-link to="/" class="text-lg md:text-xl font-bold text-indigo-700 flex items-center">
            <FontAwesomeIcon icon="shopping-cart" class="h-5 w-5 md:h-6 md:w-6 mr-2" />
            <span class="hidden xs:inline">Laundry Kasir</span>
            <span class="xs:hidden">Kasir</span>
          </router-link>
          
          <!-- Mobile profile/menu button -->
          <div class="flex md:hidden items-center space-x-2">
            <div class="text-sm text-gray-600 hidden xs:block">
              {{ getCurrentPageTitle() }}
            </div>
            <button 
              @click="showProfileMenu = !showProfileMenu" 
              class="p-2 text-indigo-600 hover:text-indigo-800 focus:outline-none relative"
            >
              <FontAwesomeIcon icon="user" class="h-6 w-6" />
              <!-- Profile dropdown for mobile -->
              <div 
                v-if="showProfileMenu" 
                class="absolute right-0 top-12 bg-white rounded-lg shadow-lg border border-gray-200 py-2 w-48 z-50"
                @click.stop
              >
                <button 
                  v-if="authStore.isAuthenticated" 
                  @click="handleLogout" 
                  class="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 text-sm"
                >
                  Logout
                </button>
                <router-link 
                  v-else 
                  to="/login" 
                  class="block px-4 py-2 text-gray-700 hover:bg-gray-100 text-sm"
                  @click="showProfileMenu = false"
                >
                  Login
                </router-link>
              </div>
            </button>
          </div>
          
          <!-- Desktop navigation -->
          <div class="hidden md:flex space-x-1">
            <router-link 
              to="/" 
              class="px-4 py-2 rounded-lg text-gray-600 hover:bg-indigo-50 hover:text-indigo-700 text-sm lg:text-base min-h-[40px] flex items-center transition-colors duration-200"
              :class="{ 'bg-indigo-50 text-indigo-700': currentPath === '/' }"
            >
              Dashboard
            </router-link>
            <router-link 
              to="/customers" 
              class="px-4 py-2 rounded-lg text-gray-600 hover:bg-indigo-50 hover:text-indigo-700 text-sm lg:text-base min-h-[40px] flex items-center transition-colors duration-200"
              :class="{ 'bg-indigo-50 text-indigo-700': currentPath.includes('/customers') }"
            >
              Customers
            </router-link>
            <router-link 
              to="/services" 
              class="px-4 py-2 rounded-lg text-gray-600 hover:bg-indigo-50 hover:text-indigo-700 text-sm lg:text-base min-h-[40px] flex items-center transition-colors duration-200"
              :class="{ 'bg-indigo-50 text-indigo-700': currentPath.includes('/services') }"
            >
              Services
            </router-link>
            <router-link 
              to="/transactions" 
              class="px-4 py-2 rounded-lg text-gray-600 hover:bg-indigo-50 hover:text-indigo-700 text-sm lg:text-base min-h-[40px] flex items-center transition-colors duration-200"
              :class="{ 'bg-indigo-50 text-indigo-700': currentPath.includes('/transactions') }"
            >
              Transaksi
            </router-link>
            <router-link 
              to="/reports" 
              class="px-4 py-2 rounded-lg text-gray-600 hover:bg-indigo-50 hover:text-indigo-700 text-sm lg:text-base min-h-[40px] flex items-center transition-colors duration-200"
              :class="{ 'bg-indigo-50 text-indigo-700': currentPath.includes('/reports') }"
            >
              Laporan
            </router-link>
            <button 
              v-if="authStore.isAuthenticated" 
              @click="handleLogout" 
              class="px-4 py-2 rounded-lg text-gray-600 hover:bg-indigo-50 hover:text-indigo-700 text-sm lg:text-base min-h-[40px] flex items-center transition-colors duration-200"
            >
              Logout
            </button>
            <router-link 
              v-else 
              to="/login" 
              class="px-4 py-2 rounded-lg text-gray-600 hover:bg-indigo-50 hover:text-indigo-700 text-sm lg:text-base min-h-[40px] flex items-center transition-colors duration-200"
            >
              Login
            </router-link>
          </div>
        </div>
      </nav>
    </header>

    <!-- Main Content -->
    <main class="container mx-auto px-3 sm:px-6 py-4 md:py-6">
      <router-view />
    </main>

    <!-- Mobile Bottom Navigation -->
    <nav class="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div class="grid grid-cols-5 h-16">
        <router-link 
          to="/" 
          class="flex flex-col items-center justify-center text-xs font-medium transition-colors duration-200"
          :class="currentPath === '/' ? 'text-indigo-600 bg-indigo-50' : 'text-gray-500 hover:text-indigo-600'"
        >
          <FontAwesomeIcon icon="home" class="h-5 w-5 mb-1" />
          <span>Home</span>
        </router-link>
        
        <router-link 
          to="/customers" 
          class="flex flex-col items-center justify-center text-xs font-medium transition-colors duration-200"
          :class="currentPath.includes('/customers') ? 'text-indigo-600 bg-indigo-50' : 'text-gray-500 hover:text-indigo-600'"
        >
          <FontAwesomeIcon icon="users" class="h-5 w-5 mb-1" />
          <span>Customers</span>
        </router-link>
        
        <router-link 
          to="/services" 
          class="flex flex-col items-center justify-center text-xs font-medium transition-colors duration-200"
          :class="currentPath.includes('/services') ? 'text-indigo-600 bg-indigo-50' : 'text-gray-500 hover:text-indigo-600'"
        >
          <FontAwesomeIcon icon="cog" class="h-5 w-5 mb-1" />
          <span>Services</span>
        </router-link>
        
        <router-link 
          to="/transactions" 
          class="flex flex-col items-center justify-center text-xs font-medium transition-colors duration-200 relative"
          :class="currentPath.includes('/transactions') ? 'text-indigo-600 bg-indigo-50' : 'text-gray-500 hover:text-indigo-600'"
        >
          <div class="relative">
            <FontAwesomeIcon icon="receipt" class="h-5 w-5 mb-1" />
            <!-- Quick action indicator -->
            <div class="absolute -top-1 -right-1 h-2 w-2 bg-green-500 rounded-full"></div>
          </div>
          <span>Transaksi</span>
        </router-link>
        
        <router-link 
          to="/reports" 
          class="flex flex-col items-center justify-center text-xs font-medium transition-colors duration-200"
          :class="currentPath.includes('/reports') ? 'text-indigo-600 bg-indigo-50' : 'text-gray-500 hover:text-indigo-600'"
        >
          <FontAwesomeIcon icon="chart-line" class="h-5 w-5 mb-1" />
          <span>Reports</span>
        </router-link>
      </div>
    </nav>

    <!-- Backdrop for profile menu -->
    <div 
      v-if="showProfileMenu" 
      @click="showProfileMenu = false"
      class="fixed inset-0 z-40 md:hidden"
    ></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from '../store/auth';

const route = useRoute();
const showProfileMenu = ref(false);
const authStore = useAuthStore();

// Computed property for safer access to route path
const currentPath = computed(() => route.path || '/');

const handleLogout = () => {
  authStore.logout();
  showProfileMenu.value = false;
};

const getCurrentPageTitle = () => {
  const routeTitles = {
    '/': 'Dashboard',
    '/customers': 'Customers',
    '/services': 'Services', 
    '/transactions': 'Transaksi',
    '/reports': 'Reports'
  };
  
  return routeTitles[currentPath.value] || 'Laundry Kasir';
};

// Close profile menu when clicking outside
const handleClickOutside = (event) => {
  if (showProfileMenu.value && !event.target.closest('.relative')) {
    showProfileMenu.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style>
/* Styles are now handled by TailwindCSS */
</style>
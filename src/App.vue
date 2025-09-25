<template>
  <div id="app">
    <router-view />
    <ToastNotification />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useAuthStore } from './store/auth';
import { useRoute } from 'vue-router';
import ToastNotification from './components/ToastNotification.vue';

const mobileMenuOpen = ref(false);
const authStore = useAuthStore();
const route = useRoute();

const handleLogout = () => {
  authStore.logout();
};

// Conditionally show the layout based on the current route
const showLayout = computed(() => {
  return route.name !== 'login';
});
</script>

<style>
/* Styles are now handled by TailwindCSS */
</style>

<template>
  <Teleport to="body">
    <div class="fixed top-4 right-4 z-50 space-y-2">
      <TransitionGroup
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="opacity-0 translate-x-full transform"
        enter-to-class="opacity-100 translate-x-0 transform"
        leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="opacity-100 translate-x-0 transform"
        leave-to-class="opacity-0 translate-x-full transform"
        tag="div"
      >
        <div
          v-for="toast in toasts"
          :key="toast.id"
          :class="[
            'min-w-80 max-w-md p-4 rounded-lg shadow-lg border-l-4 transform',
            getToastClasses(toast.type)
          ]"
        >
          <div class="flex items-start">
            <div class="flex-shrink-0">
              <FontAwesomeIcon :icon="getIcon(toast.type)" :class="getIconColor(toast.type)" class="h-5 w-5" />
            </div>
            <div class="ml-3 flex-1">
              <p class="text-sm font-medium" :class="getTextColor(toast.type)">
                {{ toast.title }}
              </p>
              <p v-if="toast.message" class="mt-1 text-sm" :class="getSubTextColor(toast.type)">
                {{ toast.message }}
              </p>
            </div>
            <div class="ml-4 flex-shrink-0">
              <button
                @click="removeToast(toast.id)"
                :class="['rounded-md p-1.5 hover:bg-opacity-20', getHoverBgColor(toast.type)]"
              >
                <FontAwesomeIcon icon="times" class="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, onMounted, h } from 'vue';

const toasts = ref([]);

const getIcon = (type) => {
  switch (type) {
    case 'success': return 'check-circle';
    case 'error': return 'times-circle';
    case 'warning': return 'exclamation-triangle';
    case 'info': return 'info-circle';
    default: return 'info-circle';
  }
};

const getToastClasses = (type) => {
  switch (type) {
    case 'success':
      return 'bg-green-50 border-green-400';
    case 'error':
      return 'bg-red-50 border-red-400';
    case 'warning':
      return 'bg-yellow-50 border-yellow-400';
    case 'info':
      return 'bg-blue-50 border-blue-400';
    default:
      return 'bg-gray-50 border-gray-400';
  }
};

const getTextColor = (type) => {
  switch (type) {
    case 'success': return 'text-green-800';
    case 'error': return 'text-red-800';
    case 'warning': return 'text-yellow-800';
    case 'info': return 'text-blue-800';
    default: return 'text-gray-800';
  }
};

const getSubTextColor = (type) => {
  switch (type) {
    case 'success': return 'text-green-700';
    case 'error': return 'text-red-700';
    case 'warning': return 'text-yellow-700';
    case 'info': return 'text-blue-700';
    default: return 'text-gray-700';
  }
};

const getIconColor = (type) => {
  switch (type) {
    case 'success': return 'text-green-500';
    case 'error': return 'text-red-500';
    case 'warning': return 'text-yellow-500';
    case 'info': return 'text-blue-500';
    default: return 'text-gray-500';
  }
};

const getHoverBgColor = (type) => {
  switch (type) {
    case 'success': return 'hover:bg-green-500';
    case 'error': return 'hover:bg-red-500';
    case 'warning': return 'hover:bg-yellow-500';
    case 'info': return 'hover:bg-blue-500';
    default: return 'hover:bg-gray-500';
  }
};

const addToast = (toast) => {
  const id = Date.now();
  const newToast = { ...toast, id };
  toasts.value.push(newToast);
  
  // Auto remove after duration
  const duration = toast.duration || 5000;
  setTimeout(() => {
    removeToast(id);
  }, duration);
  
  return id;
};

const removeToast = (id) => {
  const index = toasts.value.findIndex(toast => toast.id === id);
  if (index > -1) {
    toasts.value.splice(index, 1);
  }
};

// Expose methods for external use
defineExpose({
  addToast,
  removeToast
});

onMounted(() => {
  // Global toast methods
  window.toast = {
    success: (title, message, duration) => addToast({ type: 'success', title, message, duration }),
    error: (title, message, duration) => addToast({ type: 'error', title, message, duration }),
    warning: (title, message, duration) => addToast({ type: 'warning', title, message, duration }),
    info: (title, message, duration) => addToast({ type: 'info', title, message, duration })
  };
});
</script>
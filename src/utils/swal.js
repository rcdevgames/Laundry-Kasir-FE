// SweetAlert2 utility functions for consistent usage across the app
import Swal from 'sweetalert2';

// Default configuration
const defaultConfig = {
  confirmButtonColor: '#4f46e5',
  cancelButtonColor: '#6b7280',
  customClass: {
    popup: 'rounded-2xl',
    confirmButton: 'rounded-lg px-6 py-2 font-medium',
    cancelButton: 'rounded-lg px-6 py-2 font-medium'
  }
};

export const swalUtils = {
  // Success alerts
  success: (title, text = '', options = {}) => {
    return Swal.fire({
      ...defaultConfig,
      title,
      text,
      icon: 'success',
      confirmButtonText: 'OK',
      ...options
    });
  },

  // Error alerts
  error: (title, text = '', options = {}) => {
    return Swal.fire({
      ...defaultConfig,
      title,
      text,
      icon: 'error',
      confirmButtonText: 'OK',
      confirmButtonColor: '#ef4444',
      ...options
    });
  },

  // Warning alerts
  warning: (title, text = '', options = {}) => {
    return Swal.fire({
      ...defaultConfig,
      title,
      text,
      icon: 'warning',
      confirmButtonText: 'OK',
      confirmButtonColor: '#f59e0b',
      ...options
    });
  },

  // Info alerts
  info: (title, text = '', options = {}) => {
    return Swal.fire({
      ...defaultConfig,
      title,
      text,
      icon: 'info',
      confirmButtonText: 'OK',
      confirmButtonColor: '#3b82f6',
      ...options
    });
  },

  // Confirmation dialogs
  confirm: (title, text = '', options = {}) => {
    return Swal.fire({
      ...defaultConfig,
      title,
      text,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Ya, Lanjutkan',
      cancelButtonText: 'Batal',
      ...options
    });
  },

  // Delete confirmation
  confirmDelete: (title = 'Apakah Anda yakin?', text = 'Data yang dihapus tidak dapat dikembalikan!', options = {}) => {
    return Swal.fire({
      ...defaultConfig,
      title,
      text,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#ef4444',
      ...options
    });
  },

  // Toast notifications
  toast: {
    success: (title, options = {}) => {
      return Swal.fire({
        ...defaultConfig,
        title,
        icon: 'success',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        ...options
      });
    },

    error: (title, options = {}) => {
      return Swal.fire({
        ...defaultConfig,
        title,
        icon: 'error',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 4000,
        timerProgressBar: true,
        ...options
      });
    },

    warning: (title, options = {}) => {
      return Swal.fire({
        ...defaultConfig,
        title,
        icon: 'warning',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        ...options
      });
    },

    info: (title, options = {}) => {
      return Swal.fire({
        ...defaultConfig,
        title,
        icon: 'info',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        ...options
      });
    }
  },

  // Loading spinner
  loading: (title = 'Loading...', text = '') => {
    return Swal.fire({
      ...defaultConfig,
      title,
      text,
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
  },

  // Close any open alert
  close: () => {
    Swal.close();
  }
};
import axios from 'axios';

// Get API URL from environment variables with fallback
const getApiBaseURL = () => {
  // For Vite, environment variables are available via import.meta.env
  // Variables must be prefixed with VITE_ to be exposed to the client
  const envApiUrl = import.meta.env.VITE_API_URL;

  // Fallback to localhost for development if no env variable is set
  return envApiUrl || 'http://localhost:8000/api/v1';
};

const api = axios.create({
  baseURL: getApiBaseURL(),
});

// Interceptor untuk menambahkan token JWT dan CSRF token ke setiap request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    const csrfToken = localStorage.getItem('csrf_token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (csrfToken) {
      config.headers['X-CSRF-Token'] = csrfToken;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor untuk handle error responses
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    console.log(error.response?.status)

    // Handle CSRF token errors (419 or specific CSRF error)
    if (error.response?.status === 419 ||
      error.response?.data?.message?.includes('CSRF') ||
      error.response?.data?.error?.includes('CSRF')) {

      if (!originalRequest._retry) {
        originalRequest._retry = true;

        try {
          // Get new CSRF token
          const csrfResponse = await api.post('/auth/csrf-token');
          const csrfToken = csrfResponse.data?.csrf_token || csrfResponse.data?.data?.csrf_token;

          if (csrfToken) {
            localStorage.setItem('csrf_token', csrfToken);
            originalRequest.headers['X-CSRF-Token'] = csrfToken;

            // Retry the original request
            return api(originalRequest);
          }
        } catch (csrfError) {
          console.error('Failed to refresh CSRF token:', csrfError);
        }
      }
    }

    // Handle 401 errors (unauthorized)
    if (error.response?.status === 401) {
      // If this is not a retry attempt, try to refresh token first
      if (!originalRequest._retry) {
        originalRequest._retry = true;

        try {
          // Get new CSRF token
          const csrfResponse = await api.post('/auth/csrf-token');
          const csrfToken = csrfResponse.data?.csrf_token || csrfResponse.data?.data?.csrf_token;
          if (csrfToken) {
            localStorage.setItem('csrf_token', csrfToken);
            originalRequest.headers['X-CSRF-Token'] = csrfToken;

            // Try to refresh token
            const refreshToken = localStorage.getItem('refresh_token');
            const refreshResponse = await api.post('/auth/refresh', {
              refresh_token: refreshToken
            });

            // If refresh is successful, update the token and retry original request
            if (refreshResponse.data?.token) {
              const newToken = refreshResponse.data.token;
              localStorage.setItem('token', newToken);
              originalRequest.headers.Authorization = `Bearer ${newToken}`;

              // Retry the original request
              return api(originalRequest);
            }
          }

          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('csrf_token');

          // Redirect to login if not already on login page
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }

        } catch (refreshError) {
          console.error('Failed to refresh token:', refreshError);

          // If refresh token also fails with 401, logout
          if (refreshError.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('csrf_token');

            // Redirect to login if not already on login page
            if (window.location.pathname !== '/login') {
              window.location.href = '/login';
            }
          }
        }
      } else {
        // If this is already a retry attempt and still getting 401, logout
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('csrf_token');

        // Redirect to login if not already on login page
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;

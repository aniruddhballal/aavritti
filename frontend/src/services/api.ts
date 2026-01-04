import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to all requests (except auth endpoints)
api.interceptors.request.use(
  (config) => {
    // Don't add token to login/register endpoints
    if (!config.url?.includes('/auth/login') && !config.url?.includes('/auth/register')) {
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle 401 responses (invalid/expired token)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only redirect on 401 if it's NOT the login endpoint
    if (error.response?.status === 401 && !error.config?.url?.includes('/auth/login')) {
      localStorage.removeItem('authToken');
      window.location.reload();
    }
    return Promise.reject(error);
  }
);
import axios from 'axios';
import { useAuthStore } from '../stores/authStore';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    console.log(`${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`);
    return response;
  },
  async (error) => {
    const { response, config } = error;
    if (response) {
      console.log(`${config?.method?.toUpperCase()} ${config?.url} - ${response.status}`);
      if (response.status === 401) {
        const originalRequest = config;
        const auth = useAuthStore.getState();
        if (!originalRequest._retry && auth.token) {
          originalRequest._retry = true;
          try {
            await auth.refresh();
            originalRequest.headers = originalRequest.headers || {};
            originalRequest.headers.Authorization = `Bearer ${auth.token}`;
            return api(originalRequest);
          } catch (_) {
            auth.logout();
            window.location.href = '/';
          }
        } else {
          auth.logout();
          window.location.href = '/';
        }
      }
      const normalizedError = {
        message: response.data?.message || 'Error en la solicitud',
        fieldErrors: response.data?.errors,
        status: response.status,
      };
      return Promise.reject(normalizedError);
    }
    return Promise.reject({ message: error.message });
  }
);

export default api;

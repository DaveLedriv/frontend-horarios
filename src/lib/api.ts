import axios from 'axios';
import { useAuthStore } from '../stores/authStore';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
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
        const auth = useAuthStore.getState();
        const wasAuthenticated = auth.isAuthenticated && !!auth.token;

        if (wasAuthenticated) {
          auth.logout();
          if (typeof window !== 'undefined' && window.location.pathname !== '/') {
            window.location.replace('/');
          }
        }

        const normalizedError = {
          message:
            wasAuthenticated
              ? 'Tu sesión ha expirado. Vuelve a iniciar sesión.'
              : response.data?.message || 'Error en la solicitud',
          fieldErrors: response.data?.errors,
          status: response.status,
        };

        return Promise.reject(normalizedError);
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


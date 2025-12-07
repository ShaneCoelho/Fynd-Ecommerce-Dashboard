import axios from 'axios';
import { cookieService } from './cookies';

const API_BASE_URL = 'http://localhost:4000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token to headers
api.interceptors.request.use(
  (config) => {
    const token = cookieService.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Don't redirect if this is a login/auth endpoint (user is trying to login)
      const isAuthEndpoint = error.config?.url?.includes('/api/auth/login') || 
                             error.config?.url?.includes('/api/auth/google/callback');
      
      if (!isAuthEndpoint) {
        // Token expired or invalid - only redirect for protected endpoints
        cookieService.removeToken();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;


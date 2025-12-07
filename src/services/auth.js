import api from './api';

export const authService = {
  // Login with username and password
  login: async (username, password) => {
    const response = await api.post('/api/auth/login', { username, password });
    return response.data;
  },

  // Get Google OAuth URL
  getGoogleUrl: async () => {
    const response = await api.get('/api/auth/google/url');
    return response.data;
  },

  // Exchange Google code for token
  googleCallback: async (code) => {
    const response = await api.post('/api/auth/google/callback', { code });
    return response.data;
  },

  // Verify token
  verify: async () => {
    const response = await api.get('/api/auth/verify');
    return response.data;
  },
};


import api from './api';

export const authService = {
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register/', userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login/', credentials);

      if (response.data.token) {
        localStorage.setItem('authToken', response.data.token);
        if (response.data.refresh) {
          localStorage.setItem('refreshToken', response.data.refresh);
        }
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }

      return response.data;
    } catch (error) {
      throw error;
    }
  },

  forgotPassword: async (email) => {
    try {
      const response = await api.post('/auth/forgot-password/', { email });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  resetPassword: async ({ uid, token, new_password, confirm_password }) => {
    try {
      const response = await api.post('/auth/reset-password/', {
        uid,
        token,
        new_password,
        confirm_password,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('authToken');
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  getToken: () => {
    return localStorage.getItem('authToken');
  },

  setToken: (token) => {
    localStorage.setItem('authToken', token);
  },

  getRefreshToken: () => {
    return localStorage.getItem('refreshToken');
  },
};
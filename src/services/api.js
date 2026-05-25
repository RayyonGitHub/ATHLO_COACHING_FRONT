import axios from 'axios';
import { authService } from './authService';

const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let pending401 = [];

const flushPending401 = (error, token = null) => {
  pending401.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  pending401 = [];
};

// Intercepteur pour ajouter le token à chaque requête
api.interceptors.request.use(
  (config) => {
    // Uses authService to get 'authToken' correctly
    const token = authService.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs d'authentification
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config || {};

    if (error.response?.status === 401 && !originalRequest._retry && !String(originalRequest.url || '').includes('/auth/token/refresh/')) {
      const refreshToken = authService.getRefreshToken();
      if (!refreshToken) {
        authService.logout();
        window.location.href = '/login';
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pending401.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshResponse = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
          refresh: refreshToken,
        });
        const newAccessToken = refreshResponse.data?.access;

        if (!newAccessToken) {
          throw new Error('Token refresh failed');
        }

        authService.setToken(newAccessToken);
        flushPending401(null, newAccessToken);
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        flushPending401(refreshError, null);
        authService.logout();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
export const adminAPI = {
  getCoaches: () => api.get('/admin/coachs/'),
  getAthletes: () => api.get('/admin/athletes/'),
  deleteAthlete: (id) => api.delete(`/admin/athletes/${id}/`),
  getProspects: () => api.get('/admin/prospects/'),
  getFinanceHistory: () => api.get('/admin/finance/'),
  deleteProspect: (id) => api.delete(`/admin/prospects/${id}/`),
  updateUser: (id, data) => api.patch(`/admin/users/${id}/update/`, data),
  changePassword: (id, password) => api.post(`/admin/users/${id}/change-password/`, { password }),
  forceLogout: (id) => api.post(`/admin/users/${id}/force-logout/`),
  toggleStatus: (id, action) => api.post(`/admin/users/${id}/toggle-status/`, { action }),
  getAdminExercices: () => api.get('/admin/exercices/'),
  createAdminExercice: (data) => api.post('/admin/exercices/', data),
  updateAdminExercice: (id, data) => api.put(`/admin/exercices/${id}/`, data),
  deleteAdminExercice: (id) => api.delete(`/admin/exercices/${id}/`),
  
  getAdminCategories: () => api.get('/admin/categories/'),
  createAdminCategory: (data) => api.post('/admin/categories/', data),
  deleteAdminCategory: (id) => api.delete(`/admin/categories/${id}/`),
  getMe: () => api.get('/admin/me/'),
  updateMe: (data) => api.patch('/admin/me/', data),
  changeMyPassword: (data) => api.post('/admin/me/change-password/', data),
};

export default api;
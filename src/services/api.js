import axios from 'axios';
import { authService } from './authService';

const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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
  (error) => {
    if (error.response?.status === 401) {
      // Token expiré ou invalide -> Logout and redirect
      authService.logout();
      window.location.href = '/login';
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
};
export default api;
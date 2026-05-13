import api from './api';

export const responsableService = {
  getDashboardStats: async () => {
    const response = await api.get('/responsable/dashboard-stats/');
    return response.data;
  }
};
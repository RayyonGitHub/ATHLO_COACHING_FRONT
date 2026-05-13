import api from './api';

export const responsableService = {
  getDashboardStats: async () => {
    const response = await api.get('/responsable/dashboard-stats/');
    return response.data;
  },
  
  // NOUVELLE FONCTION :
  getPlanning: async (date) => {
    // Si date est fourni (format YYYY-MM-DD), on l'ajoute en paramètre
    const url = date ? `/responsable/planning/?date=${date}` : '/responsable/planning/';
    const response = await api.get(url);
    return response.data;
  }
};
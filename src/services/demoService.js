import api from './api';

const demoService = {
  // Récupère les stats de démo 
  getDemoStats: async () => {
    try {
      const response = await api.get('/demo/stats/');
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la récupération des stats de démo", error);
      throw error;
    }
  },

  // Récupère les exercices pour la bibliothèque publique
  getPublicExercices: async () => {
    try {
      const response = await api.get('/exercices/');
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la récupération des exercices", error);
      throw error;
    }
  }
};

export default demoService;
import api from './api';

export const authService = {
  // Inscription
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register/', userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Connexion
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login/', credentials);
      
      // Stocker le token et les infos utilisateur
      if (response.data.token) {
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Déconnexion
  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  },

  // Vérifier si l'utilisateur est connecté
  isAuthenticated: () => {
    return !!localStorage.getItem('authToken');
  },

  // Récupérer l'utilisateur actuel
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Récupérer le token
  getToken: () => {
    return localStorage.getItem('authToken');
  }
};
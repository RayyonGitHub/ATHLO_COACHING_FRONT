import api from './api';

export const clientService = {
  // Récupérer tous les clients
  getAllClients: async () => {
    const response = await api.get('/clients/');
    return response.data;
  },

  // Récupérer un client par ID
  getClientById: async (id) => {
    const response = await api.get(`/clients/${id}/`);
    return response.data;
  },

  // Créer un nouveau client
  createClient: async (clientData) => {
    const response = await api.post('/clients/', clientData);
    return response.data;
  },

  // Mettre à jour un client
  updateClient: async (id, clientData) => {
    const response = await api.put(`/clients/${id}/`, clientData);
    return response.data;
  },

  // Supprimer un client
  deleteClient: async (id) => {
    const response = await api.delete(`/clients/${id}/`);
    return response.data;
  },
};
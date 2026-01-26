import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api'; 

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- AJOUT : Intercepteur pour ajouter le Token ---
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token'); // On récupère le token stocké
  if (token) {
    config.headers.Authorization = `Bearer ${token}`; // On l'ajoute au header
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;
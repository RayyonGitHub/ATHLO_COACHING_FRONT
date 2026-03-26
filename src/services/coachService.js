import api from './api'; 
import axios from 'axios';
import { authService } from './authService';

const API_URL = 'http://localhost:8000/api';

const coachService = {
    getAnalytics: async () => {
        const token = authService.getToken();
        const response = await axios.get(`${API_URL}/coach/analytics/`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },

    // --- NOUVELLES FONCTIONS POUR LES NOTIFICATIONS --- //

    getNotifications: async () => {
        const token = authService.getToken();
        const timestamp = new Date().getTime();
        const response = await axios.get(`${API_URL}/notifications/?t=${timestamp}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },

   markNotificationsAsRead: async () => {
        const token = authService.getToken();
        const response = await axios.post(`${API_URL}/notifications/marquer_tout_lu/`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        }); 
        return response.data;
    },

    markNotificationAsRead: async (id) => {
        const token = authService.getToken();
        // On utilise PATCH pour ne modifier que le champ "est_lu"
        const response = await axios.patch(`${API_URL}/notifications/${id}/`, 
            { est_lu: true }, 
            { headers: { Authorization: `Bearer ${token}` } }
        );
        return response.data;
    }
};

export default coachService;
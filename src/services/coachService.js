import api from './api'; 
import { authService } from './authService';

const coachService = {
    getAnalytics: async () => {
        const token = authService.getToken();
        const response = await api.get('/coach/analytics/', {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },

    // --- NOUVELLES FONCTIONS POUR LES NOTIFICATIONS --- //

    getNotifications: async () => {
        const token = authService.getToken();
        const timestamp = new Date().getTime();
        const response = await api.get(`/notifications/?t=${timestamp}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },

   markNotificationsAsRead: async () => {
        const token = authService.getToken();
        const response = await api.post('/notifications/marquer_tout_lu/', {}, {
            headers: { Authorization: `Bearer ${token}` }
        }); 
        return response.data;
    },

    markNotificationAsRead: async (id) => {
        const token = authService.getToken();
        // On utilise PATCH pour ne modifier que le champ "est_lu"
        const response = await api.patch(`/notifications/${id}/`, 
            { est_lu: true }, 
            { headers: { Authorization: `Bearer ${token}` } }
        );
        return response.data;
    }
};

export default coachService;

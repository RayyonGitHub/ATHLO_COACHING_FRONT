import api from './api';

const calendarService = {
    getCoachCalendar: async () => {
        try {
            // 1. On demande au backend les infos du coach actuellement connecté
            const meResponse = await api.get('/coach/me/');
            const monCoachId = meResponse.data.id; // On récupère l'ID dynamique !

            if (!monCoachId) {
                throw new Error("Impossible de récupérer l'ID du coach connecté.");
            }

            // 2. On utilise cet ID pour récupérer SON calendrier
            const response = await api.get(`/calendar/coach/${monCoachId}/`); 
            return response.data;
        } catch (error) {
            console.error("Erreur calendrier", error);
            throw error;
        }
    },

    getExportUrl: async () => {
        try {
            const meResponse = await api.get('/coach/me/');
            const monCoachId = meResponse.data.id; 
            if (!monCoachId) throw new Error("ID du coach introuvable.");

            // Retourne l'URL complète que Google Calendar devra interroger
            return `http://localhost:8000/api/calendar/export/${monCoachId}/`;
        } catch (error) {
            console.error("Erreur récupération URL d'export", error);
            throw error;
        }
    },
    createSeance: async (seanceData) => {
        try {
            const response = await api.post('/seances/', seanceData);
            return response.data;
        } catch (error) {
            console.error("Erreur création séance", error);
            throw error;
        }
    },

    // NOUVEAU : Créer une indisponibilité ou un congé
    createIndisponibilite: async (indispoData) => {
        try {
            const response = await api.post('/indisponibilites/', indispoData);
            return response.data;
        } catch (error) {
            console.error("Erreur création indisponibilité", error);
            throw error;
        }
    }
};

export default calendarService;
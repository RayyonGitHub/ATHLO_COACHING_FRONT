import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api/';

const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken') || localStorage.getItem('access_token');
    return {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    };
};

export const athleteService = {
    // 1. Réserver une séance
    reserverSeance: async (seanceId) => {
        try {
            const response = await axios.post(`${API_URL}inscriptions/reserver/${seanceId}/`, {}, getAuthHeaders());
            return response.data;
        } catch (error) {
            throw error.response?.data?.erreur || "Erreur lors de la réservation.";
        }
    },

    // 2. Annuler une réservation
    annulerReservation: async (inscriptionId) => {
        try {
            const response = await axios.delete(`${API_URL}inscriptions/annuler/${inscriptionId}/`, getAuthHeaders());
            return response.data;
        } catch (error) {
            throw error.response?.data?.erreur || "Erreur lors de l'annulation.";
        }
    }
};

export default athleteService;
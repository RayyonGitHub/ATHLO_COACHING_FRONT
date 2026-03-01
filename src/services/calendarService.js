import api from './api';

const calendarService = {
    getCoachCalendar: async () => {
        try {
            const response = await api.get('/coach/calendar/'); 
            return response.data;
        } catch (error) {
            console.error("Erreur calendrier", error);
            throw error;
        }
    }
};

export default calendarService;
import api from './api'; 

const coachService = {
    getAnalytics: async () => {
        const response = await api.get('/coach/analytics/');
        return response.data;
    }
};

export default coachService;
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
    }

};

export default coachService;
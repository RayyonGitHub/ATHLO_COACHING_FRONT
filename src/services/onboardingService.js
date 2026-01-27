import api from './api';

export const onboardingService = {
  updateCoachProfile: async (data) => {
    const response = await api.patch('/coach/me/', data);
    return response.data;
  },
  updateAthleteProfile: async (data) => {
    const response = await api.patch('/athlete/me/', data);
    return response.data;
  }
};
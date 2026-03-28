import api from './api';

const prospectService = {
  getPublicCoaches: async (params = {}) => {
    const response = await api.get('/prospects/coachs/', { params });
    return response.data;
  },

  payCheckout: async (payload) => {
    const response = await api.post('/prospects/checkout/pay/', payload);
    return response.data;
  },

  getCheckoutPreview: async (token) => {
    const response = await api.get('/prospects/checkout/preview/', {
      params: { token },
    });
    return response.data;
  },

  activateAthleteProfile: async (payload) => {
    const response = await api.post('/prospects/checkout/activate-athlete/', payload);
    return response.data;
  },
};

export default prospectService;
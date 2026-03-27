import api from './api';

const GOOGLE_CLIENT_ID = '1085275017199-gtp77vbkp5uc6llt34l32t9iploc43ts.apps.googleusercontent.com';
const GOOGLE_REDIRECT_URI = 'http://localhost:5173/auth/google/callback';
const GOOGLE_SCOPE = 'https://www.googleapis.com/auth/calendar';

const googleCalendarService = {
  getAuthUrl() {
    const params = new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      redirect_uri: GOOGLE_REDIRECT_URI,
      response_type: 'code',
      scope: GOOGLE_SCOPE,
      access_type: 'offline',
      prompt: 'consent',
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  },

  getStatus: async () => {
    const response = await api.get('/google-calendar/status/');
    return response.data;
  },

  connect: async (code) => {
    const response = await api.post('/google-calendar/connect/', { code });
    return response.data;
  },

  disconnect: async () => {
    const response = await api.post('/google-calendar/disconnect/');
    return response.data;
  },
};

export default googleCalendarService;
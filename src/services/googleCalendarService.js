import api from './api';
import { authService } from './authService';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const GOOGLE_REDIRECT_URI = import.meta.env.VITE_GOOGLE_REDIRECT_URI || `${window.location.origin}/auth/google/callback`;
const GOOGLE_SCOPE = 'https://www.googleapis.com/auth/calendar';

const googleCalendarService = {
  getAuthUrl(state) {
    const params = new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      redirect_uri: GOOGLE_REDIRECT_URI,
      response_type: 'code',
      scope: GOOGLE_SCOPE,
      access_type: 'offline',
      prompt: 'consent',
    });

    if (state) {
      params.set('state', state);
    }

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  },

  getStatus: async () => {
    const response = await api.get('/google-calendar/status/');
    return response.data;
  },

  connect: async (code) => {
    // Send the current access token in the body as a fallback for the OAuth relay
    // flow: when the Google redirect returns to the callback page, some browsers
    // can lose the Authorization header (or when OAuth happens in a different
    // context). Passing the token here ensures the backend can validate the user.
    const payload = { code };
    const token = authService.getToken();
    if (token) {
      payload.access_token = token;
    }
    const response = await api.post('/google-calendar/connect/', payload);
    return response.data;
  },

  disconnect: async () => {
    const response = await api.post('/google-calendar/disconnect/');
    return response.data;
  },
};

export default googleCalendarService;

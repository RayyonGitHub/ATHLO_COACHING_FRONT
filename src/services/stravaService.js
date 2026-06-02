import api from './api';

const STRAVA_CLIENT_ID = import.meta.env.VITE_STRAVA_CLIENT_ID;
const STRAVA_REDIRECT_URI = import.meta.env.VITE_STRAVA_REDIRECT_URI || `${window.location.origin}/auth/strava/callback`;
const STRAVA_SCOPE = 'activity:read_all';

const stravaService = {
  getAuthUrl() {
    const params = new URLSearchParams({
      client_id: STRAVA_CLIENT_ID,
      redirect_uri: STRAVA_REDIRECT_URI,
      response_type: 'code',
      scope: STRAVA_SCOPE,
      approval_prompt: 'force',
    });
    return `https://www.strava.com/oauth/authorize?${params.toString()}`;
  },

  getStatus: async () => {
    const response = await api.get('/athlete/integrations/status/');
    return response.data;
  },

  connect: async (code) => {
    const response = await api.post('/athlete/integrations/strava/connect/', { code });
    return response.data;
  },

  disconnect: async () => {
    const response = await api.post('/athlete/integrations/strava/disconnect/');
    return response.data;
  },

  // La fonction sync est maintenant BIEN INTÉGRÉE dans l'objet :
  sync: async () => {
    const response = await api.post('/athlete/integrations/strava/sync/');
    return response.data;
  },
  getActivities: async () => {
    const response = await api.get('/athlete/integrations/activities/');
    return response.data;
  },
}; // L'accolade ferme bien l'objet ici

export default stravaService;

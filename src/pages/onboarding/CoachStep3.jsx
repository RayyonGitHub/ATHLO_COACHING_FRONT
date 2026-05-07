import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import googleCalendarService from '../../services/googleCalendarService';

const CoachStep3 = () => {
  const navigate = useNavigate();
  // On ne garde que Google
  const [connected, setConnected] = useState({ google: false });
  const [connecting, setConnecting] = useState(null);

  useEffect(() => {
    const fetchGoogleStatus = async () => {
      try {
        const status = await googleCalendarService.getStatus();
        setConnected({ google: !!status.connected });
      } catch (error) {
        console.error('Erreur statut Google Calendar:', error);
      }
    };

    fetchGoogleStatus();
  }, []);

  const handleConnectGoogle = async () => {
    setConnecting('google');
    window.location.href = googleCalendarService.getAuthUrl();
  };

  const handleDisconnectGoogle = async () => {
    try {
      await googleCalendarService.disconnect();
      setConnected({ google: false });
    } catch (error) {
      console.error('Erreur déconnexion Google Calendar:', error);
    }
  };

  const handleFinish = async () => {
    navigate('/dashboard');
  };

  return (
    <div className="bg-white dark:bg-[#181411] min-h-screen text-slate-900 dark:text-white p-4 md:p-10 font-sans">
      <div className="max-w-4xl mx-auto">
        <header className="mb-10 text-center md:text-left">
          <h1 className="text-3xl md:text-5xl font-black mb-2">Agenda & Disponibilités</h1>
          <p className="text-slate-500">Synchronisez votre calendrier pour gérer vos séances automatiquement.</p>
        </header>

        <div className="flex justify-center mb-12">
          <div
            className={`w-full max-w-md p-8 rounded-3xl border transition-all flex flex-col items-center text-center gap-6 ${
              connected.google
                ? 'border-orange-500 bg-orange-50 dark:bg-orange-500/5'
                : 'border-slate-200 dark:border-white/10 bg-white dark:bg-[#16161A]'
            }`}
          >
            <div className="w-20 h-20 bg-slate-50 dark:bg-white/5 rounded-3xl flex items-center justify-center shadow-sm">
              <svg viewBox="0 0 24 24" className="w-10 h-10">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-1">Google Calendar</h3>
              <p className="text-sm text-slate-400">Synchronisez vos rendez-vous et vos coachings avec votre agenda personnel.</p>
            </div>

            {connected.google ? (
              <div className="w-full flex flex-col gap-3">
                <div className="w-full py-3 rounded-xl font-bold text-sm bg-orange-500 text-white flex items-center justify-center gap-2">
                  <span>Connecté</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <button
                  onClick={handleDisconnectGoogle}
                  className="w-full py-3 rounded-xl font-bold text-sm bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-white hover:bg-red-500/10 hover:text-red-500 transition-all"
                >
                  Déconnecter mon calendrier
                </button>
              </div>
            ) : (
              <button
                onClick={handleConnectGoogle}
                disabled={connecting === 'google'}
                className="w-full py-4 rounded-xl font-bold text-sm bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-white hover:bg-slate-200 dark:hover:bg-white/20 transition-all flex items-center justify-center gap-2"
              >
                {connecting === 'google' ? 'Connexion en cours...' : 'Connecter mon Google Calendar'}
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center pt-10 border-t border-slate-200 dark:border-white/10 gap-6">
          <button
            onClick={handleFinish}
            className="text-slate-500 font-medium hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            Passer cette étape
          </button>
          <button
            onClick={handleFinish}
            className="w-full md:w-auto bg-orange-500 text-white text-lg font-bold py-4 px-16 rounded-2xl shadow-lg hover:bg-orange-600 transition-all transform active:scale-95 shadow-orange-500/20"
          >
            Terminer la configuration
          </button>
        </div>
      </div>
    </div>
  );
};

export default CoachStep3;
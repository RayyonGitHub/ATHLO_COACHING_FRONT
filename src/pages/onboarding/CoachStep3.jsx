import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { onboardingService } from '../../services/onboardingService';
import { authService } from '../../services/authService';

const CoachStep3 = () => {
  const navigate = useNavigate();
  const [integrations, setIntegrations] = useState({ google: false, strava: false, garmin: false });

  const toggleIntegration = (key) => {
    setIntegrations({ ...integrations, [key]: !integrations[key] });
  };

  const handleFinish = async () => {
    try {
      await onboardingService.updateCoachProfile({ integrations });
      authService.logout();
      navigate('/login'); 
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  const logos = {
    google: (
        <svg viewBox="0 0 24 24" className="w-8 h-8">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
    ),
    strava: (
      <svg viewBox="0 0 24 24" fill="#fc4c02" className="w-8 h-8">
        <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0 7 7.416h3.463z"/>
      </svg>
    ),
    garmin: (
      <svg viewBox="0 0 24 24" fill="#007cc3" className="w-8 h-8">
        <path d="M10.95 2.6c-4.96.6-8.62 5.09-8.1 10.07.47 4.54 4.3 8.07 8.86 8.16 3.12.06 5.92-1.46 7.64-3.87l-2.42-1.39c-1.12 1.63-3.06 2.6-5.22 2.37-2.73-.29-4.81-2.67-4.81-5.42 0-3.02 2.45-5.47 5.47-5.47.66 0 1.29.12 1.87.33l2.2-2.12c-1.55-.98-3.4-1.57-5.49-1.66zm10.29 5.29l-2.61 2.61c.17.63.26 1.3.26 1.99 0 1.65-.67 3.15-1.75 4.24l2.45 1.41c1.67-1.62 2.72-3.89 2.72-6.4 0-1.43-.34-2.78-.96-3.99l-.11.14z"/>
      </svg>
    )
  };

  return (
    <div className="bg-white dark:bg-[#181411] min-h-screen text-slate-900 dark:text-white p-4 md:p-10 font-sans">
      <div className="max-w-4xl mx-auto">
        <header className="mb-10">
            <h1 className="text-3xl md:text-5xl font-black mb-2">Connexions</h1>
            <p className="text-slate-500">Synchronisez vos outils favoris pour gagner du temps.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[
            { id: 'google', label: 'Google Calendar', svg: logos.google, desc: 'Agenda & Rendez-vous' },
            { id: 'strava', label: 'Strava', svg: logos.strava, desc: 'Activités des élèves' },
            { id: 'garmin', label: 'Garmin Connect', svg: logos.garmin, desc: 'Données de santé' }
          ].map((app) => (
            <div key={app.id} className={`p-6 rounded-xl border transition-all flex flex-col items-center text-center gap-4 ${integrations[app.id] ? 'border-orange-500 bg-orange-500/5' : 'border-slate-200 dark:border-white/10 bg-white dark:bg-[#16161A]'}`}>
              <div className="w-16 h-16 bg-slate-50 dark:bg-white/5 rounded-2xl flex items-center justify-center shadow-sm">
                  {app.svg}
              </div>
              <div>
                <h3 className="font-bold capitalize mb-1">{app.label}</h3>
                <p className="text-xs text-slate-400">{app.desc}</p>
              </div>
              <button 
                onClick={() => toggleIntegration(app.id)}
                className={`w-full py-2.5 rounded-lg font-bold text-sm transition-colors ${integrations[app.id] ? 'bg-orange-500 text-white' : 'bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-white hover:bg-slate-200 dark:hover:bg-white/20'}`}
              >
                {integrations[app.id] ? 'Connecté' : 'Connecter'}
              </button>
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center pt-10 border-t border-slate-200 dark:border-white/10">
          <button onClick={handleFinish} className="text-slate-500 font-medium hover:text-slate-900 dark:hover:text-white">Passer pour le moment</button>
          <button onClick={handleFinish} className="bg-orange-500 text-white text-lg font-bold py-4 px-12 rounded-xl shadow-lg hover:bg-orange-600 transition-all transform active:scale-95">
            Terminer la configuration
          </button>
        </div>
      </div>
    </div>
  );
};

export default CoachStep3;
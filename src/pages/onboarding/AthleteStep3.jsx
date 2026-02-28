import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AthleteStep3 = () => {
  const navigate = useNavigate();
  const [connected, setConnected] = useState({ strava: false, garmin: false, apple: false });
  const [connecting, setConnecting] = useState(null);

  const handleConnectApp = (appId) => {
    if (appId === 'apple') {
      alert("Apple Health se connecte directement via l'application mobile (iOS).");
      return;
    }

    setConnecting(appId);

    // Vraies URLs de connexion
    const urls = {
      strava: "https://www.strava.com/login",
      garmin: "https://sso.garmin.com/portal/sso/fr-FR/sign-in?clientId=GarminConnect&service=https%3A%2F%2Fconnect.garmin.com%2Fapp",
    };

    // Calcul pour centrer la pop-up
    const width = 500;
    const height = 600;
    const left = (window.screen.width / 2) - (width / 2);
    const top = (window.screen.height / 2) - (height / 2);

    // Ouvre la pop-up
    const popup = window.open(
      urls[appId],
      'OAuthLogin',
      `width=${width},height=${height},top=${top},left=${left},toolbar=no,menubar=no,scrollbars=yes`
    );

    // Le composant surveille si l'utilisateur ferme la pop-up manuellement
    const timer = setInterval(() => {
      if (!popup || popup.closed) {
        clearInterval(timer); // Arrête la surveillance
        setConnected(prev => ({ ...prev, [appId]: true })); // Passe en "Connecté"
        setConnecting(null);
      }
    }, 500);
  };

  const handleFinish = async () => {
    navigate('/athlete/dashboard'); 
  };

  const logos = {
    strava: (
      <svg role="img" viewBox="0 0 24 24" fill="#fc4c02" className="w-8 h-8">
        <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0 7 7.416h3.463z"/>
      </svg>
    ),
    garmin: (
      <svg role="img" viewBox="0 0 24 24" fill="#007cc3" className="w-8 h-8">
        <path d="M10.95 2.6c-4.96.6-8.62 5.09-8.1 10.07.47 4.54 4.3 8.07 8.86 8.16 3.12.06 5.92-1.46 7.64-3.87l-2.42-1.39c-1.12 1.63-3.06 2.6-5.22 2.37-2.73-.29-4.81-2.67-4.81-5.42 0-3.02 2.45-5.47 5.47-5.47.66 0 1.29.12 1.87.33l2.2-2.12c-1.55-.98-3.4-1.57-5.49-1.66zm10.29 5.29l-2.61 2.61c.17.63.26 1.3.26 1.99 0 1.65-.67 3.15-1.75 4.24l2.45 1.41c1.67-1.62 2.72-3.89 2.72-6.4 0-1.43-.34-2.78-.96-3.99l-.11.14z"/>
      </svg>
    ),
    apple: (
      <svg role="img" viewBox="0 0 24 24" fill="#ff2d55" className="w-8 h-8">
        <path d="M19.7 4.64c-1.93-1.65-4.88-1.4-6.72.36L12 6.09l-.98-1.09c-1.84-1.76-4.79-2.01-6.72-.36-2.41 2.07-2.67 5.67-.6 8.07l7.74 8.79a.75.75 0 0 0 1.12 0l7.74-8.79c2.07-2.4 1.81-6-0.6-8.07z"/>
      </svg>
    )
  };

  return (
    <div className="bg-[#f8f7f5] dark:bg-[#0B0B0F] min-h-screen text-slate-900 dark:text-white font-sans flex flex-col">
      <header className="px-6 py-4 border-b border-slate-200 dark:border-white/10 flex justify-between items-center">
        <span className="font-black text-xl tracking-tight text-[#f96b06]">ATHLO</span>
      </header>

      <div className="flex-1 flex justify-center py-10 px-4">
        <div className="w-full max-w-[800px] flex flex-col">
          
          <div className="flex flex-col gap-3 mb-10">
            <div className="flex gap-6 justify-between items-end">
              <p className="text-base font-medium">Étape 3 sur 3</p>
              <p className="text-sm font-bold text-[#f96b06]">100%</p>
            </div>
            <div className="rounded-full bg-slate-200 dark:bg-white/10 h-2 w-full overflow-hidden">
              <div className="h-full rounded-full bg-[#f96b06]" style={{ width: '100%' }}></div>
            </div>
          </div>

          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold mb-3">Connexion & Santé</h1>
            <p className="opacity-60 text-lg">Synchronisez vos données pour un suivi optimal.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {[
              { id: 'strava', label: 'Strava', svg: logos.strava, desc: 'Segments & Courses' },
              { id: 'garmin', label: 'Garmin', svg: logos.garmin, desc: 'VFC & Sommeil' },
              { id: 'apple', label: 'Apple Health', svg: logos.apple, desc: 'Activité journalière' }
            ].map((app) => (
              <div key={app.id} className={`bg-white dark:bg-[#16161A] border rounded-xl p-6 flex flex-col items-center text-center transition-all shadow-sm group ${connected[app.id] ? 'border-[#f96b06] bg-orange-50 dark:bg-orange-500/5' : 'border-slate-200 dark:border-white/5 hover:border-[#f96b06]/50'}`}>
                <div className="w-16 h-16 bg-slate-50 dark:bg-white/5 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  {app.svg}
                </div>
                <h3 className="font-bold mb-1">{app.label}</h3>
                <p className="text-xs opacity-50 mb-6">{app.desc}</p>
                
                <button 
                  onClick={() => handleConnectApp(app.id)}
                  disabled={connecting === app.id || connected[app.id]}
                  className={`w-full py-2.5 px-4 rounded-lg font-bold text-sm border transition-all ${
                    connected[app.id] 
                    ? 'bg-[#f96b06] text-white border-[#f96b06]' 
                    : 'bg-transparent text-slate-500 dark:text-slate-300 border-slate-200 dark:border-white/10 hover:border-[#f96b06] hover:text-[#f96b06]'
                  }`}
                >
                  {connecting === app.id ? 'Connexion...' : connected[app.id] ? 'Connecté ✓' : 'Connecter'}
                </button>
              </div>
            ))}
          </div>

          <div className="flex flex-col items-center gap-6">
            <button onClick={handleFinish} className="w-full max-w-[400px] h-14 bg-[#f96b06] hover:bg-orange-600 text-white text-lg font-bold rounded-xl shadow-lg shadow-orange-500/20 transition-all transform active:scale-95">
              C'est parti !
            </button>
            <button onClick={handleFinish} className="text-sm opacity-50 hover:opacity-100 transition-opacity">
              Passer cette étape pour le moment
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AthleteStep3;
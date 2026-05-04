import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import stravaService from '../services/stravaService';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

const StravaCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading'); // 'loading', 'success', 'error'
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      setStatus('error');
      setErrorMessage("Vous avez refusé l'accès à Strava.");
      return;
    }

    if (!code) {
      setStatus('error');
      setErrorMessage("Aucun code d'autorisation reçu.");
      return;
    }

    const connectStrava = async () => {
      try {
        await stravaService.connect(code);
        setStatus('success');
        // Rediriger vers les paramètres après 2 secondes
        setTimeout(() => {
          navigate('/athlete/settings'); // Ajustez cette route selon votre App.jsx
        }, 2000);
      } catch (err) {
        setStatus('error');
       setErrorMessage(err.response?.data?.detail || "Erreur inconnue");
      }
    };

    connectStrava();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-[#121212] flex items-center justify-center p-4">
      <div className="bg-[#1E1E1E] border border-[#2D2D2D] rounded-3xl p-8 max-w-md w-full text-center shadow-2xl">
        
        {status === 'loading' && (
          <div className="flex flex-col items-center animate-in fade-in zoom-in duration-300">
            <Loader2 className="animate-spin text-[#FC4C02] mb-6" size={64} />
            <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Connexion à <span className="text-[#FC4C02]">Strava</span></h2>
            <p className="text-gray-400 mt-2">Veuillez patienter pendant que nous synchronisons votre compte...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center animate-in zoom-in duration-300">
            <div className="w-20 h-20 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 size={48} />
            </div>
            <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Compte connecté !</h2>
            <p className="text-gray-400 mt-2 mb-6">Vos activités cardio seront désormais importées automatiquement.</p>
            <p className="text-sm text-gray-500 animate-pulse">Redirection en cours...</p>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center animate-in zoom-in duration-300">
            <div className="w-20 h-20 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mb-6">
              <AlertCircle size={48} />
            </div>
            <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Erreur de connexion</h2>
            <p className="text-gray-400 mt-2 mb-8">{errorMessage}</p>
            <button 
              onClick={() => navigate('/athlete/settings')}
              className="w-full bg-[#333] hover:bg-[#444] text-white font-bold py-3 rounded-xl transition-all"
            >
              Retour aux paramètres
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default StravaCallback;
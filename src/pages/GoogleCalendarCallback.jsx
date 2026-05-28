import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import googleCalendarService from '../services/googleCalendarService';

const ONBOARDING_GOOGLE_OAUTH_KEY = 'onboarding_google_oauth_state';
const ONBOARDING_RESTORED_CONTEXT_KEY = 'onboarding_restored_context';

const decodeState = (encodedState) => {
  if (!encodedState) return null;
  try {
    return JSON.parse(atob(encodedState));
  } catch (_) {
    return null;
  }
};

const GoogleCalendarCallback = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const returnedState = decodeState(searchParams.get('state'));

    let storedContext = null;
    try {
      const raw = localStorage.getItem(ONBOARDING_GOOGLE_OAUTH_KEY);
      storedContext = raw ? JSON.parse(raw) : null;
    } catch (_) {
      storedContext = null;
    }

    const hasOnboardingState = Boolean(
      storedContext &&
      returnedState &&
      storedContext.flow === 'onboarding_coach' &&
      returnedState.flow === 'onboarding_coach' &&
      storedContext.nonce === returnedState.nonce
    );

    const redirectTo = hasOnboardingState
      ? (storedContext.nextRoute || '/onboarding/coach/step3')
      : '/login';

    if (error) {
      setStatus('error');
      setErrorMessage("Vous avez refusé l'accès à Google Calendar.");
      setTimeout(() => {
        window.location.href = redirectTo;
      }, 1500);
      return;
    }

    if (!code) {
      setStatus('error');
      setErrorMessage("Aucun code d'autorisation Google reçu.");
      setTimeout(() => {
        window.location.href = redirectTo;
      }, 1500);
      return;
    }

    const connectGoogle = async () => {
      try {
        await googleCalendarService.connect(code);

        if (hasOnboardingState) {
          localStorage.setItem(
            ONBOARDING_RESTORED_CONTEXT_KEY,
            JSON.stringify({
              flow: storedContext.flow,
              restoredAt: Date.now(),
            })
          );
        }

        localStorage.removeItem(ONBOARDING_GOOGLE_OAUTH_KEY);
        setStatus('success');

        setTimeout(() => {
          window.location.href = redirectTo;
        }, 1200);
      } catch (err) {
        setStatus('error');
        setErrorMessage(err.response?.data?.detail || 'Erreur lors de la connexion Google Calendar.');
        setTimeout(() => {
          window.location.href = redirectTo;
        }, 1800);
      }
    };

    connectGoogle();
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-[#121212] flex items-center justify-center p-4">
      <div className="bg-[#1E1E1E] border border-[#2D2D2D] rounded-3xl p-8 max-w-md w-full text-center shadow-2xl text-white">
        {status === 'loading' && (
          <>
            <div className="w-16 h-16 mx-auto rounded-full border-4 border-white/20 border-t-white animate-spin mb-6" />
            <h2 className="text-2xl font-black tracking-tight">Connexion Google Calendar...</h2>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-16 h-16 mx-auto rounded-full bg-green-500/20 text-green-400 flex items-center justify-center mb-6 text-3xl">✓</div>
            <h2 className="text-2xl font-black tracking-tight">Calendrier connecté</h2>
            <p className="text-sm text-gray-400 mt-3">Redirection en cours...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 mx-auto rounded-full bg-red-500/20 text-red-400 flex items-center justify-center mb-6 text-3xl">!</div>
            <h2 className="text-2xl font-black tracking-tight">Erreur</h2>
            <p className="text-sm text-gray-400 mt-3">{errorMessage}</p>
          </>
        )}
      </div>
    </div>
  );
};

export default GoogleCalendarCallback;

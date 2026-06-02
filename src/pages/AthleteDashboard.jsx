import React, { useState, useEffect } from 'react';
import WorkoutTrackingModal from './WorkoutTrackingModal';
import SessionHeroCard from '../components/athlete/SessionHeroCard';
import DailyGoalsWidget from '../components/athlete/DailyGoalsWidget';
import HealthStatsWidget from '../components/athlete/HealthStatsWidget';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const AthleteDashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNoSessionModalOpen, setIsNoSessionModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 10000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
  const loadDashboard = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError("Session expirée. Redirection...");
        setTimeout(() => window.location.href = '/login', 2000);
        return;
      }
      const response = await api.get('/athlete/dashboard-stats/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(response.data);
    } catch (err) {
      console.error("Erreur Dashboard:", err);
      setError("Impossible de charger les statistiques.");
    } finally {
      setLoading(false);
    }
  };

    loadDashboard();
    const interval = setInterval(loadDashboard, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleSyncWatch = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      window.location.reload();
    }, 1500);
  };

  // --- LOGIQUE INTELLIGENTE DE TEMPS ---
const checkSessionStatus = (seance) => {
  if (!seance || !seance.jour_prevu) return { isToday: false, canStart: false, canRegister: false, isMissed: false };

  const maintenant = currentTime;
  const dateStr = seance.jour_prevu.split('T')[0];
  const [heures, minutes] = seance.heure_debut.split(':');
  const [heuresFin, minutesFin] = (seance.heure_fin || '23:59').split(':');

  const dateSeance = new Date(dateStr);
  const isToday = dateSeance.toDateString() === maintenant.toDateString();

  const dateHeureDebut = new Date(`${dateStr}T${heures.padStart(2,'0')}:${minutes.padStart(2,'0')}:00`);
  const dateHeureFin = new Date(`${dateStr}T${heuresFin.padStart(2,'0')}:${minutesFin.padStart(2,'0')}:00`);

  const isTimeReached = maintenant >= dateHeureDebut;
  const isMissed = maintenant > dateHeureFin; // heure de fin dépassée

  const canStart = isToday && isTimeReached && !isMissed;
  const canRegister = isToday && isTimeReached && !isMissed;

  return { isToday, canStart, canRegister, isMissed };
  

};
const { isToday, canStart, canRegister, isMissed } = checkSessionStatus(data?.prochaine_seance);
useEffect(() => {
    if (isMissed && data?.prochaine_seance) {
      const seanceId = data.prochaine_seance.id;
      const token = localStorage.getItem('authToken');
      console.log("🚨 ALERTE: SÉANCE RATÉE DÉTECTÉE ! ID:", seanceId); // AJOUTE CETTE LIGNE
      // 1. ACTION INSTANTANÉE (UI) : On cache la séance pour l'athlète
      setData(prev => ({ ...prev, prochaine_seance: null }));

      // 2. ACTION BACK-END : On prévient Django que c'est raté !
      api.post(`/seances/${seanceId}/ratee/`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(() => {
        // 3. Optionnel : on recharge les stats globales (calories, etc.)
        api.get('/athlete/dashboard-stats/', {
          headers: { Authorization: `Bearer ${token}` }
        })
        .then(res => setData(res.data));
      })
      .catch(err => console.error("Erreur mise à jour séance ratée:", err));
    }
  }, [isMissed, data?.prochaine_seance]); // <-- Ajout des dépendances

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF6B00]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-white p-4">
        <p className="text-red-500 font-bold mb-4 text-center">{error}</p>
        <button onClick={() => window.location.href = '/login'} className="bg-[#FF6B00] px-6 py-2 rounded-lg font-bold hover:bg-orange-600 transition-colors">
          Retour au Login
        </button>
      </div>
    );
  }

  // On extrait les infos de statut pour la carte héros
  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-500">

      {/* SECTION BIENVENUE */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl lg:text-3xl font-bold text-white">
            Bonjour, <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF6B00] to-[#FF9E00]">{data?.prenom} !</span>
          </h2>
          <p className="text-gray-400 mt-1 flex items-center gap-2">
            Prêt pour votre séance aujourd'hui ?
            <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          </p>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={handleSyncWatch}
            disabled={isSyncing}
            className="flex items-center gap-2 bg-[#1E1E1E] text-gray-300 px-4 py-2.5 rounded-xl border border-[#2D2D2D] hover:border-blue-500 hover:text-blue-400 transition-all shadow-sm disabled:opacity-50 cursor-pointer"
          >
            <span className={`material-icons-round text-blue-500 ${isSyncing ? 'animate-spin' : ''}`}>
              {isSyncing ? 'sync' : 'watch'}
            </span>
            <span className="font-medium text-sm">
              {isSyncing ? "Synchronisation..." : "Ma Montre"}
            </span>
          </button>

          <button
  onClick={() => {
    if (data?.prochaine_seance?.id) {
      setIsModalOpen(true);
    } else {
      setIsNoSessionModalOpen(true);
    }
  }}
  disabled={!canRegister}
  title={
    !data?.prochaine_seance
      ? "Aucune séance aujourd'hui"
      : !canRegister
      ? `Disponible à ${data.prochaine_seance.heure_debut?.slice(0,5) || "l'heure prévue"}`
      : ""
  }
  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border transition-all shadow-sm
    ${canRegister
      ? 'bg-[#1E1E1E] text-white border-[#2D2D2D] hover:border-[#FF6B00] cursor-pointer'
      : 'bg-[#1A1A1A] text-gray-600 border-[#2D2D2D] cursor-not-allowed opacity-50'
    }`}
>
  <span className={`material-icons-round text-xl ${canRegister ? 'text-[#FF6B00]' : 'text-gray-600'}`}>
    {canRegister ? 'add' : 'lock'}
  </span>
  <span className="font-medium text-sm">
    {!data?.prochaine_seance
      ? "Aucune séance aujourd'hui"
      : canRegister
      ? "Enregistrer une activité"
      : `Disponible à ${data?.prochaine_seance?.heure_debut?.slice(0,5) || "..."}`
    }
  </span>
</button>
        </div>
      </div>

      <div className="bg-[#1E1E1E] border border-[#2D2D2D] rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Contrat actuel</p>
          <h3 className="text-xl font-black text-white italic uppercase mt-1">{data?.contrat?.label || 'Aucun contrat actif'}</h3>
          <p className="text-sm text-gray-400 mt-1">
            {data?.contrat?.type === 'ABONNEMENT'
              ? `Valide jusqu'au ${data?.contrat?.date_expiration ? new Date(data.contrat.date_expiration).toLocaleDateString('fr-FR') : '-'}`
              : `${data?.contrat?.seances_restantes ?? 0} seance(s) restante(s)`}
          </p>
        </div>
        <button
          onClick={() => navigate('/athlete/parametres#abonnement-seances')}
          className="w-12 h-12 rounded-xl bg-[#FF6B00] hover:bg-orange-600 text-white flex items-center justify-center transition-colors"
          title="Voir abonnement et seances"
        >
          <span className="material-icons-round">arrow_forward</span>
        </button>
      </div>

      {/* GRILLE PRINCIPALE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">

        {/* COLONNE GAUCHE (8) */}
        <div className="lg:col-span-8 flex flex-col gap-8">

          {/* ON PASSE LES PROPS A LA CARTE */}
          
          <SessionHeroCard
            seance={data?.prochaine_seance}
            onStart={canStart ? () => setIsModalOpen(true) : null} 
            onDetails={() => navigate('/athlete/calendar')}
            isToday={isToday}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <div
              onClick={() => navigate('/athlete/programmes')}
              className="bg-[#1E1E1E] p-6 rounded-2xl border border-[#2D2D2D] flex flex-col justify-between hover:border-[#3D3D3D] transition-colors cursor-pointer group"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-bold text-lg text-white group-hover:text-[#FF6B00] transition-colors">Mon Programme Actuel</h3>
                <button className="text-[#FF6B00] hover:text-[#FF9E00] transition-colors group-hover:translate-x-1 transform duration-300">
                  <span className="material-icons-round">arrow_forward</span>
                </button>
              </div>

              {data?.programme_actuel ? (
                <>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-20 h-20 rounded-lg bg-[#2D2D2D] flex items-center justify-center border border-[#3D3D3D]">
                      <span className="material-icons-round text-4xl text-[#FF6B00]">fitness_center</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-white truncate max-w-[150px]">{data.programme_actuel.titre}</h4>
                      <p className="text-sm text-gray-400 mt-1">
                        Semaine {data.programme_actuel.semaine_actuelle || 1} sur {data.programme_actuel.semaine_totale || 4}
                      </p>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-400 font-medium">Progression globale</span>
                      <span className="font-bold text-[#FF6B00]">{data.programme_actuel.progression}%</span>
                    </div>
                    <div className="w-full bg-[#2D2D2D] h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-[#FF6B00] h-full rounded-full shadow-[0_0_10px_rgba(255,107,0,0.5)] transition-all duration-1000"
                        style={{ width: `${data.programme_actuel.progression}%` }}
                      ></div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full opacity-50 py-4">
                  <span className="material-icons-round text-4xl text-gray-500 mb-2">auto_awesome_motion</span>
                  <p className="text-sm text-gray-400">Aucun programme actif</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => navigate('/athlete/calendar')}
                className="bg-[#1E1E1E] p-4 rounded-2xl border border-[#2D2D2D] flex flex-col items-center justify-center gap-3 transition-all hover:scale-105 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/10 cursor-pointer group text-center"
              >
                <div className="w-12 h-12 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center transition-transform group-hover:scale-110">
                  <span className="material-icons-round text-2xl">calendar_month</span>
                </div>
                <span className="font-medium text-sm text-gray-200 group-hover:text-blue-400 transition-colors">Réserver séance</span>
              </button>

              <button
                onClick={() => navigate('/athlete/messages')}
                className="bg-[#1E1E1E] p-4 rounded-2xl border border-[#2D2D2D] flex flex-col items-center justify-center gap-3 hover:bg-[#2D2D2D] transition-all cursor-pointer group text-center"
              >
                <div className="w-12 h-12 rounded-full bg-purple-500/10 text-purple-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="material-icons-round text-2xl">chat_bubble</span>
                </div>
                <span className="font-medium text-sm text-gray-200">Contacter coach</span>
              </button>
            </div>
          </div>
        </div>

        {/* COLONNE DROITE (4) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <DailyGoalsWidget
            calories={data?.stats_sante?.calories || 0}
            caloriesMax={data?.stats_sante?.calories_max || 2400}
            completionPercentage={data?.stats_sante?.completion_jour || 0}
            pas={data?.stats_sante?.pas || 8432}
            hydratation={data?.stats_sante?.hydratation || 1.2}
          />
          <HealthStatsWidget
            recuperation={data?.stats_sante?.recuperation || 94}
            fcRepos={data?.stats_sante?.fc_repos || 72}
            sommeil={data?.stats_sante?.sommeil || "7h 42m"}
          />
        </div>
      </div>

      <WorkoutTrackingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        seanceId={data?.prochaine_seance?.id}
        onComplete={() => window.location.reload()}
      />

      {isNoSessionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-[#1E1E1E] border border-[#2D2D2D] rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl scale-in-center animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/20">
              <span className="material-icons-round text-5xl text-green-500">hotel_class</span>
            </div>
            <h3 className="text-2xl font-black text-white italic tracking-tighter mb-3 uppercase">Repos Mérité</h3>
            <p className="text-gray-400 text-sm mb-8 leading-relaxed">
              Toutes vos séances prévues sont terminées ! Revenez demain ou contactez votre coach pour ajouter une nouvelle activité. 🛌
            </p>
            <button
              onClick={() => setIsNoSessionModalOpen(false)}
              className="w-full bg-[#2D2D2D] hover:bg-[#FF6B00] text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 cursor-pointer"
            >
              J'ai compris
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default AthleteDashboard;

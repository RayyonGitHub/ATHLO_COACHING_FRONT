import React, { useState, useEffect } from 'react';
import axios from 'axios';
import WorkoutTrackingModal from './WorkoutTrackingModal';
import SessionHeroCard from '../components/athlete/SessionHeroCard';
import DailyGoalsWidget from '../components/athlete/DailyGoalsWidget';
import HealthStatsWidget from '../components/athlete/HealthStatsWidget';
import { useNavigate } from 'react-router-dom';

const AthleteDashboard = () => {
  const navigate = useNavigate(); // <-- Ajoute cette ligne ici
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const token = localStorage.getItem('authToken') || localStorage.getItem('access_token');
        if (!token) {
          setError("Session expirée ou inexistante. Veuillez vous reconnecter.");
          setLoading(false);
          return;
        }

        const user = JSON.parse(localStorage.getItem('user'));
        if (!user || user.role !== 'athlete') {
            window.location.href = '/login';
            return;
        }

        const response = await axios.get('http://127.0.0.1:8000/api/athlete/dashboard-stats/', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setData(response.data);
        setLoading(false);
      } catch (err) {
        if (err.response?.status === 401) {
          setError("Votre session a expiré. Merci de vous reconnecter.");
        } else {
          setError("Erreur lors du chargement des données athlète.");
        }
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

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

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-500">
      
      {/* SECTION BIENVENUE */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl lg:text-3xl font-bold text-white">
            Bonjour, <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF6B00] to-[#FF9E00]">{data.prenom} !</span>
          </h2>
          <p className="text-gray-400 mt-1 flex items-center gap-2">
            Prêt pour votre séance aujourd'hui ?
            <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          </p>
        </div>
        <button className="hidden md:flex items-center gap-2 bg-[#1E1E1E] text-white px-5 py-2.5 rounded-xl border border-[#2D2D2D] hover:border-[#FF6B00] transition-all shadow-sm">
          <span className="material-icons-round text-[#FF6B00] text-xl">add</span>
          <span className="font-medium text-sm">Enregistrer une activité</span>
        </button>
      </div>

      {/* GRILLE PRINCIPALE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        
        {/* COLONNE GAUCHE (8) */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          
         <SessionHeroCard 
            seance={data.prochaine_seance} 
            onStart={() => setIsModalOpen(true)} 
            onDetails={() => navigate('/athlete/calendar')} 
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Mon Programme Actuel DYNAMIQUE */}
            {/* Mon Programme Actuel DYNAMIQUE */}
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
              
              {data.programme_actuel ? (
                <>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-20 h-20 rounded-lg bg-[#2D2D2D] flex items-center justify-center border border-[#3D3D3D]">
                      <span className="material-icons-round text-4xl text-[#FF6B00]">fitness_center</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-white truncate max-w-[150px]">{data.programme_actuel.titre}</h4>
                      <p className="text-sm text-gray-400 mt-1">
                        Semaine {data.programme_actuel.semaine_actuelle} sur {data.programme_actuel.semaine_totale}
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

            {/* Boutons d'actions rapides */}
            <div className="grid grid-cols-2 gap-4">
              <button className="bg-[#1E1E1E] p-4 rounded-2xl border border-[#2D2D2D] flex flex-col items-center justify-center gap-3 hover:bg-[#2D2D2D] transition-all group text-center">
                <div className="w-12 h-12 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="material-icons-round text-2xl">calendar_month</span>
                </div>
                <span className="font-medium text-sm text-gray-200">Réserver séance</span>
              </button>
              <button className="bg-[#1E1E1E] p-4 rounded-2xl border border-[#2D2D2D] flex flex-col items-center justify-center gap-3 hover:bg-[#2D2D2D] transition-all group text-center">
                <div className="w-12 h-12 rounded-full bg-purple-500/10 text-purple-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="material-icons-round text-2xl">chat_bubble</span>
                </div>
                <span className="font-medium text-sm text-gray-200">Contacter coach</span>
              </button>
              <button className="bg-[#1E1E1E] p-4 rounded-2xl border border-[#2D2D2D] flex flex-col items-center justify-center gap-3 hover:bg-[#2D2D2D] transition-all group text-center">
                <div className="w-12 h-12 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="material-icons-round text-2xl">restaurant</span>
                </div>
                <span className="font-medium text-sm text-gray-200">Plan Nutrition</span>
              </button>
              <button className="bg-[#1E1E1E] p-4 rounded-2xl border border-[#2D2D2D] flex flex-col items-center justify-center gap-3 hover:bg-[#2D2D2D] transition-all group text-center">
                <div className="w-12 h-12 rounded-full bg-[#FF6B00]/10 text-[#FF6B00] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="material-icons-round text-2xl">monitor_heart</span>
                </div>
                <span className="font-medium text-sm text-gray-200">Moniteurs</span>
              </button>
            </div>
          </div>
        </div>

        {/* COLONNE DROITE (4) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          <DailyGoalsWidget 
            calories={data.stats_sante?.calories || 0} 
            completionPercentage={data.stats_sante?.completion_jour || 0} 
          />
          
          <HealthStatsWidget 
            recuperation={data.stats_sante?.recuperation || 94} 
          />

        </div>
      </div>
      
      <WorkoutTrackingModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        seanceId={data?.prochaine_seance?.id}
        onComplete={() => window.location.reload()} 
      />

    </div>
  );
};

export default AthleteDashboard;
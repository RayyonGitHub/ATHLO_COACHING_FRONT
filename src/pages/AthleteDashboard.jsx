import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AthleteDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        // 1. On récupère le token sous le nom EXACT utilisé par ton authService
     // On cherche 'access_token' OU 'token' pour être sûr de ne rien rater
const token = localStorage.getItem('authToken') ;
        
        console.log("Tentative de récupération avec le token :", token ? "Token trouvé" : "TOKEN VIDE !");

        if (!token) {
          setError("Session expirée ou inexistante. Veuillez vous reconnecter.");
          setLoading(false);
          return;
        }

        // 2. Appel API avec l'en-tête Bearer
        const response = await axios.get('http://127.0.0.1:8000/api/athlete/dashboard-stats/', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        console.log("Données reçues avec succès :", response.data);
        setData(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Erreur API détaillée :", err.response?.data || err.message);
        
        // Si le serveur répond 401, c'est que le token n'est plus valide
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
      <div className="bg-[#121212] min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF6B00]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#121212] min-h-screen flex flex-col items-center justify-center text-white p-4">
        <p className="text-red-500 font-bold mb-4 text-center">{error}</p>
        <button 
          onClick={() => window.location.href = '/login'}
          className="bg-[#FF6B00] px-6 py-2 rounded-lg font-bold"
        >
          Retour au Login
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[#121212] text-gray-100 min-h-screen font-sans">
      <div className="flex h-screen overflow-hidden">
        
        {/* SIDEBAR */}
        <aside className="w-20 lg:w-64 flex flex-col justify-between bg-[#1E1E1E] border-r border-[#2D2D2D] z-20">
          <div>
            <div className="h-20 flex items-center justify-center lg:justify-start lg:px-8 border-b border-[#2D2D2D]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#FF6B00] flex items-center justify-center text-white font-bold text-xl">A</div>
                <span className="hidden lg:block text-2xl font-bold text-white tracking-widest">ATHLO</span>
              </div>
            </div>
            <nav className="mt-8 flex flex-col gap-2 px-3">
              <div className="flex items-center gap-4 px-3 py-3 rounded-xl bg-[#FF6B00]/10 text-[#FF6B00]">
                <span className="material-icons-round">dashboard</span>
                <span className="hidden lg:block font-medium">Dashboard</span>
              </div>
            </nav>
          </div>
          <div className="p-4 border-t border-[#2D2D2D]">
            <div className="hidden lg:flex items-center gap-3 p-3 bg-[#2D2D2D] rounded-xl">
              <div className="w-8 h-8 rounded-full bg-[#FF6B00] flex items-center justify-center font-bold">
                {data.prenom?.charAt(0).toUpperCase()}
              </div>
              <div className="truncate">
                <p className="text-sm font-semibold">{data.prenom}</p>
                <p className="text-xs text-gray-400">Athlète</p>
              </div>
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 overflow-y-auto bg-[#121212]">
          <header className="p-8 border-b border-[#2D2D2D]">
            <h1 className="text-3xl font-bold text-white">
              Bonjour, <span className="text-[#FF6B00]">{data.prenom} !</span>
            </h1>
          </header>

          <div className="p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* PROCHAINE SÉANCE */}
            <div className="lg:col-span-8">
              <div className="bg-[#1E1E1E] p-8 rounded-2xl border border-[#2D2D2D]">
                <span className="text-[#FF6B00] text-xs font-bold uppercase tracking-widest">Prochaine Séance</span>
                <h2 className="text-4xl font-bold mt-2 mb-6">
                  {data.prochaine_seance ? data.prochaine_seance.titre : "Repos"}
                </h2>
                {data.prochaine_seance && (
                  <div className="flex gap-6 text-gray-400 mb-8">
                    <span className="flex items-center gap-1"><span className="material-icons-round">timer</span> {data.prochaine_seance.duree_estimee} min</span>
                    <span className="flex items-center gap-1"><span className="material-icons-round">local_fire_department</span> {data.prochaine_seance.calories_estimees} kcal</span>
                  </div>
                )}
                <button className="bg-[#FF6B00] text-white px-8 py-4 rounded-xl font-bold hover:scale-105 transition-transform disabled:opacity-50" disabled={!data.prochaine_seance}>
                  Commencer l'entraînement
                </button>
              </div>
            </div>

            {/* STATS */}
            <div className="lg:col-span-4">
              <div className="bg-[#1E1E1E] p-8 rounded-2xl border border-[#2D2D2D]">
                <h3 className="font-bold text-xl mb-6">Objectifs Quotidiens</h3>
                <div className="relative w-40 h-40 mx-auto flex items-center justify-center">
                    <svg className="absolute w-full h-full -rotate-90">
                        <circle cx="80" cy="80" r="70" fill="none" stroke="#2D2D2D" strokeWidth="10" />
                        <circle cx="80" cy="80" r="70" fill="none" stroke="#FF6B00" strokeWidth="10" 
                            strokeDasharray="440" 
                            strokeDashoffset={440 - (440 * data.stats_sante.completion_jour) / 100}
                        />
                    </svg>
                    <span className="text-2xl font-bold">{data.stats_sante.completion_jour}%</span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AthleteDashboard;
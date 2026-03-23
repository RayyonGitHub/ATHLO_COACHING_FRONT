import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Target, Calendar, CheckCircle2, Clock, Dumbbell, Flame, Activity, Loader2 } from 'lucide-react';

const AthleteProgrammes = () => {
  const [programmeActuel, setProgrammeActuel] = useState(null);
  const [seances, setSeances] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('authToken') || localStorage.getItem('access_token');
        const config = { headers: { Authorization: `Bearer ${token}` } };

        // On récupère les programmes de l'athlète
        const progRes = await axios.get('http://127.0.0.1:8000/api/programmes/', config);
        
        // On récupère toutes les séances
        const seancesRes = await axios.get('http://127.0.0.1:8000/api/seances/', config);

        if (progRes.data.length > 0) {
          // On prend le dernier programme créé (considéré comme l'actuel)
          const currentProg = progRes.data[progRes.data.length - 1];
          setProgrammeActuel(currentProg);

          // On filtre les séances pour ne garder que celles de ce programme
          const progSeances = seancesRes.data.filter(s => s.programme === currentProg.id);
          
          // On les trie par ordre (ou par date)
          progSeances.sort((a, b) => a.ordre - b.ordre);
          setSeances(progSeances);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des programmes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-gray-400">
        <Loader2 className="animate-spin mb-4 text-[#FF6B00]" size={48} />
        <p className="font-medium animate-pulse">Chargement de votre programme...</p>
      </div>
    );
  }

  if (!programmeActuel) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center px-4">
        <div className="w-20 h-20 bg-[#1E1E1E] rounded-full flex items-center justify-center mb-6 border border-[#2D2D2D]">
          <Activity size={40} className="text-gray-500" />
        </div>
        <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-2">Aucun Programme Actif</h2>
        <p className="text-gray-400 max-w-md">Votre coach ne vous a pas encore assigné de programme. Profitez-en pour vous reposer !</p>
      </div>
    );
  }

  // Calcul de la progression
  const seancesTerminees = seances.filter(s => s.est_completee).length;
  const progressionGlobale = seances.length > 0 ? Math.round((seancesTerminees / seances.length) * 100) : 0;

  return (
    <div className="flex flex-col gap-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* HEADER DE LA PAGE */}
      <div>
        <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">
          Mon <span className="text-[#FF6B00]">Programme</span>
        </h2>
        <p className="text-gray-500 text-sm mt-1 font-medium">Visualisez votre plan d'entraînement global.</p>
      </div>

      {/* BANNIÈRE DU PROGRAMME ACTIF */}
      <div className="bg-gradient-to-br from-[#1E1E1E] to-[#121212] border border-[#2D2D2D] rounded-3xl p-8 relative overflow-hidden">
        <div className="absolute -right-10 -top-10 text-[#FF6B00] opacity-5 rotate-12">
          <Target size={250} />
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="inline-block px-3 py-1 bg-[#FF6B00]/20 text-[#FF6B00] text-[10px] font-black uppercase tracking-widest rounded-lg mb-3">
              Programme Actuel
            </div>
            <h3 className="text-4xl font-black text-white italic tracking-tighter mb-2">{programmeActuel.titre}</h3>
            <p className="text-gray-400 text-sm max-w-xl">{programmeActuel.description || "Dépassez vos limites avec ce programme conçu sur-mesure pour atteindre vos objectifs."}</p>
          </div>

          <div className="w-full md:w-1/3 bg-black/40 p-5 rounded-2xl border border-[#2D2D2D]">
            <div className="flex justify-between items-end mb-2">
              <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">Progression</span>
              <span className="text-2xl font-black text-white italic">{progressionGlobale}%</span>
            </div>
            <div className="w-full bg-[#2D2D2D] h-3 rounded-full overflow-hidden">
              <div 
                className="bg-[#FF6B00] h-full transition-all duration-1000 ease-out" 
                style={{ width: `${progressionGlobale}%` }}
              ></div>
            </div>
            <div className="text-right text-[10px] text-gray-500 mt-2 font-medium">
              {seancesTerminees} sur {seances.length} séances complétées
            </div>
          </div>
        </div>
      </div>

      {/* LISTE DES SÉANCES DU PROGRAMME */}
      <div>
        <h4 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
          <Calendar className="text-[#FF6B00]" size={20} /> Liste des séances
        </h4>
        
        {seances.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {seances.map((seance, index) => (
              <div 
                key={seance.id} 
                className={`group flex flex-col justify-between p-6 rounded-3xl border transition-all duration-300 ${
                  seance.est_completee 
                  ? 'bg-[#1E1E1E]/40 border-green-500/20 opacity-80' 
                  : 'bg-[#1E1E1E] border-[#2D2D2D] hover:border-[#FF6B00] hover:-translate-y-1 hover:shadow-xl hover:shadow-[#FF6B00]/10'
                }`}
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest bg-black/30 px-2 py-1 rounded-md">
                      Séance {index + 1}
                    </span>
                    {seance.est_completee ? (
                      <CheckCircle2 className="text-green-500" size={24} />
                    ) : (
                      <Flame className="text-gray-600 group-hover:text-[#FF6B00] transition-colors" size={24} />
                    )}
                  </div>
                  
                  <h5 className="text-xl font-bold text-white mb-2 line-clamp-2">{seance.titre}</h5>
                  
                  <div className="flex flex-col gap-2 mt-4">
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Clock size={16} className="text-[#FF6B00]"/> 
                      <span>{seance.heure_debut ? `Prévue à ${seance.heure_debut}` : 'Horaire libre'}</span>
                    </div>
                    {seance.jour_prevu && (
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Calendar size={16} className="text-[#FF6B00]"/> 
                        <span>{new Date(seance.jour_prevu).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'short' })}</span>
                      </div>
                    )}
                  </div>
                </div>

                <button className={`w-full mt-6 py-3 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2 ${
                  seance.est_completee 
                  ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20' 
                  : 'bg-[#2D2D2D] text-white hover:bg-[#FF6B00]'
                }`}>
                  {seance.est_completee ? 'Voir le résumé' : 'Détails de la séance'}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-10 text-center bg-[#1E1E1E] rounded-3xl border border-dashed border-[#2D2D2D]">
            <Dumbbell className="mx-auto text-gray-600 mb-4" size={32} />
            <p className="text-gray-400 italic">Ce programme ne contient pas encore de séances.</p>
          </div>
        )}
      </div>

    </div>
  );
};

export default AthleteProgrammes;
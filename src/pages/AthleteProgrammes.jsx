import React, { useState, useEffect } from 'react';
import { Target, Calendar, CheckCircle2, Clock, Dumbbell, Flame, Activity, Loader2, X } from 'lucide-react';
import api from '../services/api';

const AthleteProgrammes = () => {
  const [programmeActuel, setProgrammeActuel] = useState(null);
  const [seances, setSeances] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- ÉTATS POUR LES MODALES ---
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [selectedResume, setSelectedResume] = useState(null);

  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedSeanceDetails, setSelectedSeanceDetails] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('authToken') || localStorage.getItem('access_token');
        const config = { headers: { Authorization: `Bearer ${token}` } };

        const progRes = await api.get('/programmes/', config);
        const seancesRes = await api.get('/seances/', config);

        if (progRes.data.length > 0) {
          const currentProg = progRes.data[progRes.data.length - 1];
          setProgrammeActuel(currentProg);

          const progSeances = seancesRes.data.filter(s => s.programme === currentProg.id);
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

  // --- OUVERTURE DE LA MODALE DÉTAILS (Séance non terminée) ---
  const handleOpenDetails = (seance) => {
    setSelectedSeanceDetails(seance);
    setShowDetailsModal(true);
  };

  // --- OUVERTURE DE LA MODALE RÉSUMÉ (Séance terminée) ---
  const handleOpenResume = async (seance) => {
    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('access_token');
      
      // Appel à la super route de Younes !
      const res = await api.get(`/seances/${seance.id}/resume/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedResume(res.data);
      setShowResumeModal(true);
    } catch (error) {
      console.error("Erreur lors de la récupération du résumé:", error);
      alert("Impossible de charger le résumé de cette séance.");
    }
  };

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
                      <span>{seance.heure_debut ? `Prévue à ${seance.heure_debut.substring(0, 5)}` : 'Horaire libre'}</span>
                    </div>
                    {seance.jour_prevu && (
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Calendar size={16} className="text-[#FF6B00]"/> 
                        <span>{new Date(seance.jour_prevu).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'short' })}</span>
                      </div>
                    )}
                  </div>
                </div>

                <button 
                  onClick={() => seance.est_completee ? handleOpenResume(seance) : handleOpenDetails(seance)}
                  className={`w-full mt-6 py-3 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer ${
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

      {/* ========================================================= */}
      {/* MODALE 1 : RÉSUMÉ (Séance terminée)                       */}
      {/* ========================================================= */}
      {showResumeModal && selectedResume && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-[#1E1E1E] border border-[#2D2D2D] rounded-[2.5rem] p-8 max-w-lg w-full shadow-2xl overflow-hidden">
            
            <div className="flex justify-between items-start mb-8">
              <div>
                <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter leading-none">
                  {selectedResume.titre_seance}
                </h3>
                <p className="text-gray-500 text-sm font-bold mt-2 uppercase tracking-widest flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  Complétée le {selectedResume.date}
                </p>
              </div>
              <button onClick={() => setShowResumeModal(false)} className="text-gray-500 hover:text-white cursor-pointer"><X /></button>
            </div>

            <div className="space-y-3 mb-8 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
              {selectedResume.exercices?.map((exo, idx) => (
                <div key={idx} className="flex justify-between items-center p-5 bg-[#252525] rounded-2xl border border-[#2D2D2D] group hover:border-[#FF6B00]/50 transition-colors">
                  <div className="flex flex-col">
                    <span className="font-black text-white text-lg uppercase italic group-hover:text-[#FF6B00] transition-colors">{exo.exercice}</span>
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{exo.series} séries • {exo.reps} reps • {exo.volume_exercice || 0} kg</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-black text-white italic">{Number(exo.poids || 0).toFixed(1)}</span>
                    <span className="text-[10px] font-black text-[#FF6B00] ml-1 uppercase">kg</span>
                  </div>
                </div>
              ))}
              {(!selectedResume.exercices || selectedResume.exercices.length === 0) && (
                <p className="text-center text-gray-500 italic py-4">Aucune donnée de performance enregistrée.</p>
              )}
            </div>

            <div className="bg-[#FF6B00] p-6 rounded-[1.5rem] flex justify-between items-center shadow-lg">
              <span className="font-black text-black uppercase italic tracking-tighter text-xl">Volume Total</span>
              <div className="flex items-baseline gap-1 text-black">
                <span className="text-3xl font-black italic">{selectedResume.volume_total || 0}</span>
                <span className="text-xs font-black uppercase">kg</span>
              </div>
            </div>

            <button onClick={() => setShowResumeModal(false)} className="w-full mt-6 py-4 rounded-2xl font-black uppercase tracking-widest text-gray-400 hover:text-white transition-all text-sm cursor-pointer border border-[#2D2D2D] hover:bg-[#2D2D2D]">
              Fermer
            </button>

          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODALE 2 : DÉTAILS (Séance à venir)                       */}
      {/* ========================================================= */}
      {showDetailsModal && selectedSeanceDetails && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-[#1E1E1E] border border-[#2D2D2D] rounded-[2.5rem] flex flex-col max-w-2xl w-full max-h-[85vh] shadow-2xl overflow-hidden">
            
            {/* Header de la modale */}
            <div className="p-8 pb-6 border-b border-[#2D2D2D] flex justify-between items-start shrink-0">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-[#FF6B00]/10 text-[#FF6B00] flex items-center justify-center">
                    <Dumbbell size={20} />
                  </div>
                  <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter leading-none">{selectedSeanceDetails.titre}</h3>
                </div>
                <p className="text-gray-500 text-sm font-bold mt-2 uppercase tracking-widest flex items-center gap-2">
                  <Clock size={14} /> 
                  {selectedSeanceDetails.jour_prevu ? new Date(selectedSeanceDetails.jour_prevu).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }) : "Date non définie"}
                  {selectedSeanceDetails.heure_debut && ` • ${selectedSeanceDetails.heure_debut.substring(0, 5)}`}
                </p>
              </div>
              <button onClick={() => setShowDetailsModal(false)} className="text-gray-500 hover:text-white cursor-pointer"><X /></button>
            </div>

            {/* Corps de la modale avec les exercices */}
            <div className="p-8 overflow-y-auto custom-scrollbar flex-1 bg-[#121212]">
              <h4 className="text-[11px] font-black text-gray-500 uppercase tracking-widest mb-6">Programme de la séance</h4>
              
              {(!selectedSeanceDetails.exercices_details || selectedSeanceDetails.exercices_details.length === 0) ? (
                <div className="text-center py-12 border-2 border-dashed border-[#2D2D2D] rounded-3xl">
                  <Dumbbell size={32} className="mx-auto text-gray-600 mb-3" />
                  <p className="text-gray-400 font-medium">Aucun exercice n'a été assigné à cette séance.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedSeanceDetails.exercices_details.map((item, index) => (
                    <div key={item.id || index} className="bg-[#1E1E1E] border border-[#2D2D2D] rounded-3xl p-6 hover:border-[#FF6B00]/50 transition-colors group">
                      
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-[#2D2D2D] text-[#FF6B00] font-black flex items-center justify-center text-lg group-hover:bg-[#FF6B00] group-hover:text-white transition-colors">
                          {index + 1}
                        </div>
                        <div>
                          <h5 className="text-xl font-bold text-white leading-tight">{item.exercice_details?.nom || "Exercice inconnu"}</h5>
                          <p className="text-[10px] font-black text-[#FF6B00] uppercase tracking-widest mt-1">
                            {item.exercice_details?.muscle_principal || item.exercice_details?.categorie || "Général"}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="bg-[#121212] p-4 rounded-2xl border border-[#2D2D2D]">
                          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1 flex items-center gap-1"><Activity size={12}/> Séries</p>
                          <p className="font-black text-white text-xl">{item.series}</p>
                        </div>
                        <div className="bg-[#121212] p-4 rounded-2xl border border-[#2D2D2D]">
                          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1 flex items-center gap-1"><Target size={12}/> Reps/Temps</p>
                          <p className="font-black text-white text-xl">{item.repetitions}</p>
                        </div>
                        <div className="bg-[#121212] p-4 rounded-2xl border border-[#2D2D2D]">
                          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1 flex items-center gap-1"><Dumbbell size={12}/> Charge</p>
                          <p className="font-black text-white text-xl">{item.poids || "-"}</p>
                        </div>
                        <div className="bg-[#121212] p-4 rounded-2xl border border-[#2D2D2D]">
                          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1 flex items-center gap-1"><Clock size={12}/> Repos</p>
                          <p className="font-black text-[#FF6B00] text-xl">{item.repos || "60s"}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pied de la modale */}
            <div className="p-6 border-t border-[#2D2D2D] bg-[#1E1E1E] shrink-0">
               <button onClick={() => setShowDetailsModal(false)} className="w-full py-4 rounded-2xl font-black uppercase tracking-widest text-gray-400 hover:text-white hover:bg-[#2D2D2D] transition-all text-sm cursor-pointer border border-[#2D2D2D]">
                 Fermer
               </button>
            </div>
            
          </div>
        </div>
      )}

    </div>
  );
};

export default AthleteProgrammes;

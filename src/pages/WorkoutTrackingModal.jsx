import React, { useState, useEffect } from 'react';
import { X, Play, Pause, CheckCircle2, AlertCircle, FastForward, Square, Loader2 } from 'lucide-react';
import axios from 'axios';

const WorkoutTrackingModal = ({ isOpen, onClose, seanceId, onComplete }) => {
  // États de la séance
  const [exercices, setExercices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentExoIndex, setCurrentExoIndex] = useState(0);
  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  
  // États du chronomètre
  const [timeLeft, setTimeLeft] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerMode, setTimerMode] = useState('WORK'); // 'WORK' ou 'REST'

  // --- 1. RÉCUPÉRATION DES VRAIES DONNÉES ---
  useEffect(() => {
    if (isOpen && seanceId) {
      const fetchSeanceData = async () => {
        setLoading(true);
        try {
          const token = localStorage.getItem('authToken') || localStorage.getItem('access_token');
          const response = await axios.get(`http://127.0.0.1:8000/api/seances/${seanceId}/`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          // On adapte les données reçues de Django pour notre affichage
          // Attention: 'exercices_details' dépend du nom dans ton SeanceSerializer
          const exosData = response.data.exercices_details || response.data.exercices || [];
          
          const formattedExos = exosData.map((exo) => ({
            id: exo.id,
            nom: exo.exercice?.nom || "Exercice",
            categorie: exo.exercice?.categorie || "Général",
            series: exo.series || 3,
            reps: exo.repetitions || "10",
            repos: parseInt(exo.repos) || 60,
          }));

          setExercices(formattedExos);
        } catch (error) {
          console.error("Erreur lors de la récupération de la séance :", error);
        } finally {
          setLoading(false);
        }
      };

      fetchSeanceData();
    } else {
      // Reset des états quand on ferme la modale
      setCurrentExoIndex(0);
      setCurrentSetIndex(0);
      setTimeLeft(0);
      setIsTimerRunning(false);
      setTimerMode('WORK');
      setExercices([]);
    }
  }, [isOpen, seanceId]);

  // --- 2. GESTION DU CHRONOMÈTRE ---
  useEffect(() => {
    let interval;
    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0 && isTimerRunning && timerMode === 'REST') {
      setIsTimerRunning(false);
      setTimerMode('WORK');
      alert("Repos terminé ! C'est reparti 💪"); 
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timeLeft, timerMode]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // --- 3. GESTION DE LA SÉANCE ---
  const currentExo = exercices[currentExoIndex];
  const progressPercent = exercices.length > 0 ? ((currentExoIndex) / exercices.length) * 100 : 0;

  const handleCompleteSet = () => {
    if (currentSetIndex < currentExo.series - 1) {
      setCurrentSetIndex(prev => prev + 1);
      // Lancer le timer de repos
      setTimeLeft(currentExo.repos);
      setTimerMode('REST');
      setIsTimerRunning(true);
    } else {
      handleNextExercise();
    }
  };

  const handleNextExercise = () => {
    if (currentExoIndex < exercices.length - 1) {
      setCurrentExoIndex(prev => prev + 1);
      setCurrentSetIndex(0);
      setIsTimerRunning(false);
      setTimerMode('WORK');
      setTimeLeft(0);
    } else {
      handleFinishSession();
    }
  };

 const handleFinishSession = async () => {
    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('access_token');
      
      // On boucle sur tous les exercices pour envoyer les performances
      // On utilise Promise.all pour envoyer toutes les requêtes en parallèle
      await Promise.all(exercices.map(async (exo) => {
        // Tu remarqueras qu'on passe seance_exercice: exo.id
        await axios.post('http://127.0.0.1:8000/api/athlete/performance/record/', {
          seance_exercice: exo.id,
          series_realisees: exo.series, // Pour l'instant on suppose que l'athlète a tout fait
          reps_realisees: parseInt(exo.reps) || 10,
          poids_utilise: 0 // Tu pourras rajouter un champ input pour le poids plus tard !
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }));

      alert("Séance terminée et enregistrée avec succès ! 🎉");
      onComplete(); // Ferme et rafraîchit le dashboard
      onClose();
    } catch (error) {
      console.error("Erreur lors de l'enregistrement de la séance :", error.response?.data || error);
      alert("Erreur lors de la sauvegarde. Regarde la console pour plus de détails.");
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative w-full max-w-6xl h-[90vh] bg-[#121212] border border-[#2D2D2D] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
        
        <div className="flex items-center justify-between px-8 py-5 border-b border-[#2D2D2D] bg-[#1E1E1E]">
          <div>
            <div className="text-xs text-gray-400 font-bold tracking-widest uppercase mb-1">Séance Focus</div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-black text-white">Entraînement en cours</h2>
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF6B00]/10 border border-[#FF6B00]/30 text-[#FF6B00] text-xs font-bold animate-pulse">
                <div className="w-2 h-2 rounded-full bg-[#FF6B00]"></div> LIVE
              </span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 bg-[#2D2D2D] text-gray-400 hover:text-white rounded-full hover:bg-[#3D3D3D] transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* AFFICHAGE DU CHARGEMENT */}
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center">
            <Loader2 className="w-12 h-12 text-[#FF6B00] animate-spin mb-4" />
            <p className="text-gray-400 font-medium">Préparation de votre espace de travail...</p>
          </div>
        ) : exercices.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center">
            <AlertCircle className="w-12 h-12 text-gray-500 mb-4" />
            <p className="text-gray-400 font-medium">Aucun exercice n'a été assigné à cette séance.</p>
          </div>
        ) : (
          /* CONTENU DE LA SÉANCE */
          <div className="flex-1 overflow-y-auto p-6 lg:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
              
              {/* COLONNE GAUCHE : L'EXERCICE ACTUEL */}
              <div className="lg:col-span-8 flex flex-col h-full">
                <div className="bg-[#1E1E1E] border-2 border-[#FF6B00] rounded-3xl p-8 flex-1 flex flex-col relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-[#FF6B00]/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
                  
                  <div className="text-[#FF6B00] text-xs font-black uppercase tracking-widest mb-2">
                    Exercice {currentExoIndex + 1} sur {exercices.length}
                  </div>
                  <h3 className="text-4xl md:text-5xl font-black text-white mb-2 tracking-tight">{currentExo.nom}</h3>
                  <p className="text-gray-400 text-sm font-medium mb-8 flex items-center gap-2">
                    <span className="px-2 py-1 bg-[#2D2D2D] rounded text-gray-300">{currentExo.categorie}</span>
                    • Objectif: {currentExo.reps} par série
                  </p>

                  <div className="mb-auto">
                    <div className="text-xs text-gray-400 font-bold tracking-widest mb-4">VOS SÉRIES</div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
                      {[...Array(currentExo.series)].map((_, i) => {
                        let stateClass = "bg-[#2D2D2D] border-transparent text-gray-500"; 
                        if (i < currentSetIndex) stateClass = "bg-green-500/10 border-green-500 text-green-500"; 
                        if (i === currentSetIndex) stateClass = "bg-[#FF6B00]/10 border-[#FF6B00] text-[#FF6B00] shadow-[0_0_15px_rgba(255,107,0,0.2)]"; 

                        return (
                          <div key={i} className={`border-2 rounded-xl p-4 text-center transition-all ${stateClass}`}>
                            <div className="text-[10px] font-bold uppercase tracking-wider mb-1 opacity-80">Série {i + 1}</div>
                            <div className="font-black text-lg flex items-center justify-center gap-1">
                              {currentExo.reps} 
                              {i < currentSetIndex && <CheckCircle2 size={16} />}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="py-10 flex flex-col items-center justify-center">
                    <div className={`font-mono text-7xl md:text-8xl font-black tracking-tighter tabular-nums ${timerMode === 'REST' ? 'text-blue-400' : 'text-white'}`}>
                      {formatTime(timerMode === 'REST' ? timeLeft : 0)}
                    </div>
                    <div className="text-sm font-bold tracking-widest uppercase text-gray-500 mt-2">
                      {timerMode === 'REST' ? 'Temps de repos' : 'En plein effort'}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 mt-4">
                    {timerMode === 'REST' ? (
                      <button 
                        onClick={() => setIsTimerRunning(!isTimerRunning)} 
                        className="flex-1 bg-[#2D2D2D] hover:bg-[#3D3D3D] text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
                      >
                        {isTimerRunning ? <Pause size={20} /> : <Play size={20} />}
                        {isTimerRunning ? 'Mettre en pause' : 'Reprendre le timer'}
                      </button>
                    ) : (
                      <button 
                        onClick={handleCompleteSet}
                        className="flex-[2] bg-[#FF6B00] hover:bg-[#FF8533] text-white py-4 rounded-xl font-black text-lg flex items-center justify-center gap-2 shadow-lg shadow-[#FF6B00]/20 transition-all active:scale-95"
                      >
                        <CheckCircle2 size={24} />
                        Valider la Série {currentSetIndex + 1}
                      </button>
                    )}
                    
                    <button 
                      onClick={handleNextExercise}
                      className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
                    >
                      Suivant <FastForward size={20} />
                    </button>
                  </div>
                </div>
                
                <div className="mt-4 flex justify-end">
                  <button onClick={handleFinishSession} className="text-red-500 hover:text-red-400 font-bold flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-red-500/10 transition-colors">
                    <Square size={16} fill="currentColor" /> Clôturer la séance
                  </button>
                </div>
              </div>

              {/* COLONNE DROITE : LISTE */}
              <div className="lg:col-span-4 flex flex-col gap-6">
                <div className="bg-[#1E1E1E] border border-[#2D2D2D] rounded-2xl p-6">
                  <h4 className="text-white font-bold text-lg mb-4">Exercices de la séance</h4>
                  <div className="space-y-4">
                    {exercices.map((exo, idx) => {
                      let statusClass = "text-gray-500 bg-[#2D2D2D]"; 
                      let icon = <span className="text-xs font-bold">{idx + 1}</span>;
                      
                      if (idx < currentExoIndex) {
                        statusClass = "text-white bg-green-500";
                        icon = <CheckCircle2 size={14} />;
                      } else if (idx === currentExoIndex) {
                        statusClass = "text-white bg-[#FF6B00] shadow-[0_0_10px_rgba(255,107,0,0.3)]";
                      }

                      return (
                        <div key={exo.id} className="flex items-center gap-4">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${statusClass}`}>
                            {icon}
                          </div>
                          <div className={idx > currentExoIndex ? "opacity-50" : ""}>
                            <div className={`font-bold text-sm ${idx === currentExoIndex ? "text-[#FF6B00]" : "text-white"}`}>
                              {exo.nom}
                            </div>
                            <div className="text-xs text-gray-400">{exo.series} séries • {exo.categorie}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkoutTrackingModal;
import React, { useState, useEffect } from 'react';
import { X, Play, Pause, CheckCircle2, AlertCircle, FastForward, Square, Loader2, Trophy } from 'lucide-react';
import axios from 'axios';

const WorkoutTrackingModal = ({ isOpen, onClose, seanceId, onComplete }) => {
  // États de la séance
  const [exercices, setExercices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false); // Pour le bouton de sauvegarde
  const [currentExoIndex, setCurrentExoIndex] = useState(0);
  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  const [completedSets, setCompletedSets] = useState({});
  
  // NOUVEAU : État pour stocker les poids saisis par exercice
  const [weights, setWeights] = useState({});
  // NOUVEAU : État pour afficher l'écran de victoire à la fin
  const [isSessionFinished, setIsSessionFinished] = useState(false);
  
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
          
          const exosData = response.data.exercices_details || response.data.exercices || [];
          
          const formattedExos = exosData.map((exo) => {
            const exercice = exo.exercice_details || exo.exercice || {};
            return {
            id: exo.id,
            exerciceId: exercice.id || exo.exercice,
            nom: exercice.nom || exo.nom || "Exercice inconnu",
            categorie: exercice.categorie || exercice.muscle_principal || "Général",
            series: Number(exo.series) || 3,
            reps: exo.repetitions || "10",
            repos: parseInt(exo.repos) || 60,
          };
          });

          setExercices(formattedExos);
        } catch (error) {
          console.error("Erreur lors de la récupération de la séance :", error);
        } finally {
          setLoading(false);
        }
      };

      fetchSeanceData();
    } else {
      // Reset total quand on ferme la modale
      setCurrentExoIndex(0);
      setCurrentSetIndex(0);
      setTimeLeft(0);
      setIsTimerRunning(false);
      setTimerMode('WORK');
      setExercices([]);
      setWeights({});
      setCompletedSets({});
      setIsSessionFinished(false);
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
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timeLeft, timerMode]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const parseWeight = (value) => {
    const normalized = String(value ?? '').replace(',', '.');
    const parsed = Number.parseFloat(normalized);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  // --- 3. GESTION DE LA SÉANCE ---
  const currentExo = exercices[currentExoIndex];

  const handleSkipRest = () => {
    setIsTimerRunning(false);
    setTimerMode('WORK');
    setTimeLeft(0);
  };

  const handleCompleteSet = () => {
    const nextCompleted = Math.min((completedSets[currentExo.id] || 0) + 1, currentExo.series);
    setCompletedSets(prev => ({ ...prev, [currentExo.id]: nextCompleted }));

    if (nextCompleted >= currentExo.series) {
      handleNextExercise();
      return;
    }

    setCurrentSetIndex(nextCompleted);
    setTimeLeft(currentExo.repos);
    setTimerMode('REST');
    setIsTimerRunning(true);
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
      setIsSaving(true);
      const token = localStorage.getItem('authToken') || localStorage.getItem('access_token');
      
      await axios.post('http://127.0.0.1:8000/api/athlete/performance/record/', {
        seance_id: seanceId,
        exercices: exercices.map((exo) => {
          const weight = parseWeight(weights[exo.id]);

          return {
            seance_exercice: exo.id,
            exercice_id: exo.exerciceId,
            series_realisees: completedSets[exo.id] || exo.series,
            reps_realisees: parseInt(exo.reps, 10) || 10,
            poids_moyen: weight,
            poids: weight,
            poids_utilise: weight
          };
        })
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // 3. On affiche le bel écran de victoire au lieu du alert() !
      setIsSaving(false);
      setIsSessionFinished(true);
      
    } catch (error) {
      setIsSaving(false);
      console.error("Erreur lors de l'enregistrement de la séance :", error.response?.data || error);
      alert("Erreur lors de la sauvegarde. Regarde la console pour plus de détails.");
    }
  };

  const handleCloseVictory = () => {
    onComplete(); // Ferme et rafraîchit le dashboard
    onClose();
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
              {!isSessionFinished && (
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF6B00]/10 border border-[#FF6B00]/30 text-[#FF6B00] text-xs font-bold animate-pulse">
                  <div className="w-2 h-2 rounded-full bg-[#FF6B00]"></div> LIVE
                </span>
              )}
            </div>
          </div>
          <button onClick={onClose} className="p-2 bg-[#2D2D2D] text-gray-400 hover:text-white rounded-full hover:bg-[#3D3D3D] transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* GESTION DES AFFICHAGES (Chargement / Victoire / Exercice) */}
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center">
            <Loader2 className="w-12 h-12 text-[#FF6B00] animate-spin mb-4" />
            <p className="text-gray-400 font-medium">Préparation de votre espace de travail...</p>
          </div>
        ) : isSessionFinished ? (
          /* NOUVEAU : ÉCRAN DE VICTOIRE */
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-in zoom-in duration-500 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#FF6B00]/10 via-[#121212] to-[#121212]">
            <div className="w-32 h-32 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mb-8 border-4 border-green-500/20 shadow-[0_0_50px_rgba(34,197,94,0.3)]">
              <Trophy size={64} />
            </div>
            <h2 className="text-5xl font-black text-white mb-4 tracking-tight uppercase italic">Excellent Travail !</h2>
            <p className="text-gray-400 text-lg mb-10 max-w-lg">
              Vos performances et vos poids ont été enregistrés avec succès. Vos statistiques se mettent à jour.
            </p>
            <button 
              onClick={handleCloseVictory} 
              className="bg-[#FF6B00] hover:bg-[#FF8533] text-white font-black text-lg py-4 px-10 rounded-2xl shadow-lg shadow-[#FF6B00]/20 transition-all active:scale-95 flex items-center gap-3"
            >
              <CheckCircle2 size={24} /> Retour au Dashboard
            </button>
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
                        if (i < (completedSets[currentExo.id] || 0)) stateClass = "bg-green-500/10 border-green-500 text-green-500"; 
                        if (i === currentSetIndex) stateClass = "bg-[#FF6B00]/10 border-[#FF6B00] text-[#FF6B00] shadow-[0_0_15px_rgba(255,107,0,0.2)]"; 

                        return (
                          <div key={i} className={`border-2 rounded-xl p-4 text-center transition-all ${stateClass}`}>
                            <div className="text-[10px] font-bold uppercase tracking-wider mb-1 opacity-80">Série {i + 1}</div>
                            <div className="font-black text-lg flex items-center justify-center gap-1">
                              {currentExo.reps} 
                              {i < (completedSets[currentExo.id] || 0) && <CheckCircle2 size={16} />}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* NOUVEAU : CHAMP DE SAISIE DU POIDS */}
                    <div className="mt-8 bg-[#2D2D2D]/50 border border-[#3D3D3D] rounded-xl p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#FF6B00]/10 rounded-lg text-[#FF6B00]">
                          <span className="material-icons-round text-lg">fitness_center</span>
                        </div>
                        <span className="text-sm font-bold text-gray-300">Poids soulevé (kg)</span>
                      </div>
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        placeholder="ex: 50"
                        value={weights[currentExo.id] || ''}
                        onChange={(e) => setWeights({...weights, [currentExo.id]: e.target.value})}
                        className="bg-[#1E1E1E] border border-[#3D3D3D] text-white text-center font-bold text-lg rounded-lg w-28 py-2 focus:outline-none focus:border-[#FF6B00] transition-colors"
                      />
                    </div>
                  </div>

                  <div className="py-6 flex flex-col items-center justify-center">
                    <div className={`font-mono text-7xl md:text-8xl font-black tracking-tighter tabular-nums ${timerMode === 'REST' ? 'text-blue-400' : 'text-white'}`}>
                      {formatTime(timerMode === 'REST' ? timeLeft : 0)}
                    </div>
                    <div className="text-sm font-bold tracking-widest uppercase text-gray-500 mt-2">
                      {timerMode === 'REST' ? 'Temps de repos' : 'En plein effort'}
                    </div>
                  </div>

                  {/* NOUVEAU: Bouton Clôturer la séance */}
                  <button
                    onClick={handleFinishSession}
                    className="w-full bg-yellow-600 hover:bg-yellow-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all cursor-pointer mb-2"
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Enregistrement...
                      </>
                    ) : (
                      <>
                        <Square size={20} />
                        Clôturer la séance maintenant
                      </>
                    )}
                  </button>

                  <div className="flex flex-col sm:flex-row gap-3 mt-4">
                    {timerMode === 'REST' ? (
                      <>
                        <button 
                          onClick={() => setIsTimerRunning(!isTimerRunning)} 
                          className="flex-1 bg-[#2D2D2D] hover:bg-[#3D3D3D] text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                        >
                          {isTimerRunning ? <Pause size={20} /> : <Play size={20} />}
                          {isTimerRunning ? 'Mettre en pause' : 'Reprendre le timer'}
                        </button>
                        
                        <button 
                          onClick={handleSkipRest}
                          className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
                        >
                          Passer le repos <FastForward size={20} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button 
                          onClick={handleCompleteSet}
                          className="flex-[2] bg-[#FF6B00] hover:bg-[#FF8533] text-white py-4 rounded-xl font-black text-lg flex items-center justify-center gap-2 shadow-lg shadow-[#FF6B00]/20 transition-all active:scale-95"
                        >
                          <CheckCircle2 size={24} />
                          Valider la Série {currentSetIndex + 1}
                        </button>
                        
                        <button 
                          onClick={handleNextExercise}
                          className="flex-1 bg-[#2D2D2D] hover:bg-[#3D3D3D] text-gray-400 hover:text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
                        >
                          Passer l'exercice <FastForward size={20} />
                        </button>
                      </>
                    )}
                  </div>
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

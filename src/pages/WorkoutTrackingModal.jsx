import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, CheckCircle, ChevronRight, Loader2 } from 'lucide-react';

const WorkoutTrackingModal = ({ isOpen, onClose, seanceId, onComplete }) => {
  const [seanceDetails, setSeanceDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentExoIndex, setCurrentExoIndex] = useState(0);
  
  const [formData, setFormData] = useState({
    series_realisees: '',
    reps_realisees: '',
    poids_utilise: '',
    notes_athlete: ''
  });

  useEffect(() => {
    if (isOpen && seanceId) {
      fetchSeanceDetails();
    }
  }, [isOpen, seanceId]);

  const fetchSeanceDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken') || localStorage.getItem('access_token');
      const response = await axios.get(`http://127.0.0.1:8000/api/seances/${seanceId}/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSeanceDetails(response.data);
      
      if (response.data.exercices_details?.length > 0) {
        initFormForExercise(response.data.exercices_details[0]);
      }
      setLoading(false);
    } catch (error) {
      console.error("Erreur chargement:", error);
      setLoading(false);
    }
  };

  const initFormForExercise = (exo) => {
    setFormData({
      series_realisees: exo.series || 0,
      reps_realisees: parseInt(exo.repetitions) || 0,
      poids_utilise: parseFloat(exo.poids) || 0,
      notes_athlete: ''
    });
  };

  const handleSubmitExercise = async () => {
    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('access_token');
      const currentExo = seanceDetails.exercices_details[currentExoIndex];

      await axios.post('http://127.0.0.1:8000/api/athlete/performance/record/', {
        seance_exercice: currentExo.id,
        series_realisees: parseInt(formData.series_realisees),
        reps_realisees: parseInt(formData.reps_realisees),
        poids_utilise: parseFloat(formData.poids_utilise),
        notes_athlete: formData.notes_athlete
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (currentExoIndex < seanceDetails.exercices_details.length - 1) {
        const nextExo = seanceDetails.exercices_details[currentExoIndex + 1];
        setCurrentExoIndex(currentExoIndex + 1);
        initFormForExercise(nextExo);
      } else {
        alert("🎉 Séance terminée avec succès !");
        onComplete(); 
        onClose(); 
      }
    } catch (error) {
      console.error("Erreur:", error);
      alert("Erreur lors de l'enregistrement.");
    }
  };

  if (!isOpen) return null;

  return (
    // L'overlay utilise le "glass-panel" backdrop-blur de ton design
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      
      {/* Conteneur principal reprenant les classes bg-surface-dark et rounded-2xl */}
      <div className="bg-[#1E1E1E] border border-[#2D2D2D] rounded-2xl w-full max-w-lg overflow-hidden flex flex-col shadow-2xl relative">
        
        {/* L'effet de halo orange en fond (comme dans ta carte "Prochaine Séance") */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#FF6B00]/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

        {/* Header */}
        <div className="relative flex justify-between items-center p-6 border-b border-[#2D2D2D] z-10">
          <h2 className="text-xl font-bold text-white">
            {seanceDetails ? seanceDetails.titre : "Chargement..."}
          </h2>
          <button onClick={onClose} className="p-2 text-gray-500 hover:text-white hover:bg-[#2D2D2D] rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenu */}
        <div className="relative p-6 lg:p-8 z-10">
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="w-10 h-10 text-[#FF6B00] animate-spin" />
            </div>
          ) : !seanceDetails?.exercices_details?.length ? (
            <div className="text-center py-10 text-gray-400">
              Aucun exercice prévu pour cette séance.
            </div>
          ) : (
            <div>
              {/* Info sur l'exercice en cours avec ton style de badge */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#FF6B00]/10 text-[#FF6B00] border border-[#FF6B00]/20">
                    Exercice {currentExoIndex + 1} / {seanceDetails.exercices_details.length}
                  </span>
                </div>
                
                <h3 className="text-3xl font-bold text-white mb-2">
                  {seanceDetails.exercices_details[currentExoIndex].exercice_details?.nom || "Exercice"}
                </h3>
                
                <p className="text-gray-400 flex items-center gap-4 text-sm mb-6">
                  <span className="flex items-center gap-1 font-medium text-gray-300">
                    Objectif : {seanceDetails.exercices_details[currentExoIndex].series} séries de {seanceDetails.exercices_details[currentExoIndex].repetitions}
                  </span>
                  <span className="flex items-center gap-1 text-[#FF6B00] bg-[#FF6B00]/10 px-2 py-0.5 rounded-md text-xs font-bold">
                    {seanceDetails.exercices_details[currentExoIndex].poids || 'Poids du corps'}
                  </span>
                </p>
              </div>

              {/* Formulaire de saisie avec le style bg-background-dark */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Séries</label>
                  <input 
                    type="number" 
                    value={formData.series_realisees}
                    onChange={(e) => setFormData({...formData, series_realisees: e.target.value})}
                    className="w-full bg-[#121212] border border-[#2D2D2D] rounded-xl p-3.5 text-white text-center font-bold text-lg focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00] focus:outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Reps</label>
                  <input 
                    type="number" 
                    value={formData.reps_realisees}
                    onChange={(e) => setFormData({...formData, reps_realisees: e.target.value})}
                    className="w-full bg-[#121212] border border-[#2D2D2D] rounded-xl p-3.5 text-white text-center font-bold text-lg focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00] focus:outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Poids (kg)</label>
                  <input 
                    type="number" 
                    step="0.5"
                    value={formData.poids_utilise}
                    onChange={(e) => setFormData({...formData, poids_utilise: e.target.value})}
                    className="w-full bg-[#121212] border border-[#2D2D2D] rounded-xl p-3.5 text-white text-center font-bold text-lg focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00] focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div className="mb-8">
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Notes (Optionnel)</label>
                <textarea 
                  value={formData.notes_athlete}
                  onChange={(e) => setFormData({...formData, notes_athlete: e.target.value})}
                  placeholder="Comment vous sentez-vous sur cet exercice ?"
                  className="w-full bg-[#121212] border border-[#2D2D2D] rounded-xl p-4 text-sm text-white placeholder-gray-600 focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00] focus:outline-none resize-none h-24 transition-all"
                ></textarea>
              </div>

              {/* Le bouton utilise le gradient, l'ombre et l'animation exacts de ton HTML */}
              <button 
                onClick={handleSubmitExercise}
                className="w-full bg-gradient-to-r from-[#FF6B00] to-[#FF9E00] text-white font-bold py-4 rounded-xl shadow-lg shadow-[#FF6B00]/20 hover:shadow-[#FF6B00]/40 hover:scale-[1.02] flex items-center justify-center gap-2 transition-all duration-200"
              >
                {currentExoIndex < seanceDetails.exercices_details.length - 1 ? (
                  <>Valider et Suivant <ChevronRight className="w-5 h-5" /></>
                ) : (
                  <>Terminer la séance <CheckCircle className="w-5 h-5" /></>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkoutTrackingModal;
import React from 'react';
import { X, Dumbbell, Clock, Activity, Target } from 'lucide-react';

const SeanceDetailsModal = ({ isOpen, onClose, seance }) => {
  if (!isOpen || !seance) return null;

  // On vérifie si la séance a des exercices (basé sur ton Serializer Django)
  const exercices = seance.exercices_details || [];

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-[#1E1E1E] border border-[#2D2D2D] rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl scale-in-center animate-in zoom-in-95 duration-300 overflow-hidden">
        
        {/* HEADER DE LA MODALE */}
        <div className="p-6 border-b border-[#2D2D2D] flex justify-between items-start bg-gradient-to-r from-[#1E1E1E] to-[#121212] shrink-0">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-[#FF6B00]/10 text-[#FF6B00] flex items-center justify-center">
                <Dumbbell size={20} />
              </div>
              <h2 className="text-2xl font-black text-white">{seance.titre}</h2>
            </div>
            <p className="text-gray-400 text-sm flex items-center gap-2">
              <Clock size={14} /> 
              {seance.jour_prevu ? new Date(seance.jour_prevu).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }) : "Date non définie"}
              {seance.heure_debut && ` • ${seance.heure_debut.substring(0, 5)}`}
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 bg-[#2D2D2D] text-gray-400 hover:text-white hover:bg-[#3D3D3D] rounded-full transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* CONTENU : LISTE DES EXERCICES */}
        <div className="p-6 overflow-y-auto custom-scroll flex-1 bg-[#121212]">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Programme de la séance</h3>
          
          {exercices.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-[#2D2D2D] rounded-2xl">
              <Dumbbell size={32} className="mx-auto text-gray-600 mb-3" />
              <p className="text-gray-400 font-medium">Aucun exercice n'a été assigné à cette séance.</p>
              <p className="text-gray-600 text-sm mt-1">Votre coach ajoutera les détails bientôt.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {exercices.map((item, index) => (
                <div key={item.id || index} className="bg-[#1E1E1E] border border-[#2D2D2D] rounded-2xl p-5 hover:border-[#FF6B00]/50 transition-colors group">
                  
                  {/* Titre de l'exo */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-[#2D2D2D] text-gray-400 font-black flex items-center justify-center text-sm group-hover:bg-[#FF6B00] group-hover:text-white transition-colors">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-white">{item.exercice_details?.nom || "Exercice inconnu"}</h4>
                      <p className="text-xs font-bold text-[#FF6B00] uppercase tracking-wider">
                        {item.exercice_details?.muscle_principal || item.exercice_details?.categorie || "Général"}
                      </p>
                    </div>
                  </div>

                  {/* Paramètres de l'exo (Séries, Reps, Poids, Repos) */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-[#121212] p-3 rounded-xl border border-[#2D2D2D]">
                      <p className="text-[10px] text-gray-500 font-bold uppercase mb-1 flex items-center gap-1"><Activity size={12}/> Séries</p>
                      <p className="font-black text-white text-lg">{item.series}</p>
                    </div>
                    <div className="bg-[#121212] p-3 rounded-xl border border-[#2D2D2D]">
                      <p className="text-[10px] text-gray-500 font-bold uppercase mb-1 flex items-center gap-1"><Target size={12}/> Reps/Temps</p>
                      <p className="font-black text-white text-lg">{item.repetitions}</p>
                    </div>
                    <div className="bg-[#121212] p-3 rounded-xl border border-[#2D2D2D]">
                      <p className="text-[10px] text-gray-500 font-bold uppercase mb-1 flex items-center gap-1"><Dumbbell size={12}/> Charge</p>
                      <p className="font-black text-white text-lg">{item.poids || "-"}</p>
                    </div>
                    <div className="bg-[#121212] p-3 rounded-xl border border-[#2D2D2D]">
                      <p className="text-[10px] text-gray-500 font-bold uppercase mb-1 flex items-center gap-1"><Clock size={12}/> Repos</p>
                      <p className="font-black text-[#FF6B00] text-lg">{item.repos || "60s"}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SeanceDetailsModal;
import React from 'react';

const SessionHeroCard = ({ seance, onStart, onDetails }) => {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-[#1E1E1E] border border-[#2D2D2D] group">
      {/* Effet de lumière en fond */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#FF6B00]/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
      
      <div className="relative p-6 lg:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#FF6B00]/10 text-[#FF6B00] border border-[#FF6B00]/20">
              {seance ? "Prochaine Séance" : "Objectif Atteint"}
            </span>
            <span className="text-gray-400 text-sm">Aujourd'hui</span>
          </div>
          
          <h2 className="text-3xl font-bold text-white mb-2">
            {seance ? seance.titre : "Repos Mérité"}
          </h2>
          
          {seance ? (
            <p className="text-gray-400 flex items-center gap-4 text-sm mb-6">
              <span className="flex items-center gap-1">
                <span className="material-icons-round text-base">timer</span> {seance.duree_estimee} min
              </span>
              <span className="flex items-center gap-1">
                <span className="material-icons-round text-base">local_fire_department</span> {seance.calories_estimees} kcal
              </span>
            </p>
          ) : (
            <p className="text-gray-400 text-sm mb-6">
              Toutes les séances prévues pour aujourd'hui ont été complétées. Excellent travail !
            </p>
          )}

          <div className="flex gap-3">
            <button 
              onClick={onStart}
              disabled={!seance}
              className="bg-gradient-to-r from-[#FF6B00] to-[#FF9E00] text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-[#FF6B00]/20 hover:shadow-[#FF6B00]/40 hover:scale-105 transition-all flex items-center gap-2 disabled:opacity-50 disabled:hover:scale-100"
            >
              <span className="material-icons-round">play_arrow</span>
              Commencer
            </button>
            <button 
              onClick={onDetails}
              className="px-6 py-3 rounded-xl font-semibold text-gray-300 border border-[#2D2D2D] hover:bg-[#2D2D2D] transition-all"
            >
              {seance ? "Détails" : "Voir mon planning"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionHeroCard;
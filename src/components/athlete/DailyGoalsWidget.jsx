import React from 'react';

const DailyGoalsWidget = ({ calories = 0, completionPercentage = 0, caloriesMax = 2400, pas = 8432, hydratation = 1.2 }) => {
  const dashoffsetOrange = 552 - (552 * completionPercentage) / 100;

  return (
    <div className="bg-[#1E1E1E] p-6 rounded-2xl border border-[#2D2D2D]">
      <h3 className="font-bold text-lg text-white mb-6">Objectifs Quotidiens</h3>
      <div className="flex justify-center mb-6 relative">
        <div className="relative w-48 h-48">
          <svg className="w-full h-full transform -rotate-90">
            <circle className="text-[#2D2D2D]" cx="96" cy="96" fill="none" r="44" stroke="currentColor" strokeWidth="12"></circle>
            <circle cx="96" cy="96" fill="none" r="44" stroke="#3B82F6" strokeDasharray="276" strokeDashoffset="180" strokeLinecap="round" strokeWidth="12"></circle>
            <circle className="text-[#2D2D2D]" cx="96" cy="96" fill="none" r="66" stroke="currentColor" strokeWidth="12"></circle>
            <circle cx="96" cy="96" fill="none" r="66" stroke="#FACC15" strokeDasharray="414" strokeDashoffset="100" strokeLinecap="round" strokeWidth="12"></circle>
            <circle className="text-[#2D2D2D]" cx="96" cy="96" fill="none" r="88" stroke="currentColor" strokeWidth="12"></circle>
            <circle cx="96" cy="96" fill="none" r="88" stroke="#FF6B00" strokeDasharray="552" strokeDashoffset={dashoffsetOrange} strokeLinecap="round" strokeWidth="12"></circle>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-3xl font-bold text-white">{completionPercentage}%</span>
            <span className="text-xs text-gray-400 uppercase">Complété</span>
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-[#FF6B00]"></span>
            <span className="text-sm font-medium text-gray-300">Calories</span>
          </div>
          <span className="text-sm font-bold text-white">{calories} / {caloriesMax}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-[#FACC15]"></span>
            <span className="text-sm font-medium text-gray-300">Pas</span>
          </div>
          {/* NOUVEAU ICI */}
          <span className="text-sm font-bold text-white">{pas.toLocaleString()} / 10k</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-[#3B82F6]"></span>
            <span className="text-sm font-medium text-gray-300">Hydratation</span>
          </div>
          {/* NOUVEAU ICI */}
          <span className="text-sm font-bold text-white">{hydratation}L / 2.5L</span>
        </div>
      </div>
    </div>
  );
};

export default DailyGoalsWidget;
import React from 'react';

const HealthStatsWidget = ({ recuperation = 94 }) => {
  return (
    <div className="bg-[#1E1E1E] p-6 rounded-2xl border border-[#2D2D2D] flex-1">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-lg text-white">Stats de Santé</h3>
        <div className="flex -space-x-2">
          <div className="w-8 h-8 rounded-full bg-[#2D2D2D] border border-[#3D3D3D] flex items-center justify-center">
            <span className="material-icons-round text-sm text-[#FC4C02]">directions_run</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-[#2D2D2D] border border-[#3D3D3D] flex items-center justify-center">
            <span className="material-icons-round text-sm text-white">watch</span>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-4">
        <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/10 rounded-lg text-red-500">
              <span className="material-icons-round">favorite</span>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium">Fréquence Cardiaque</p>
              <p className="font-bold text-white text-lg">72 <span className="text-xs font-normal text-gray-500">bpm</span></p>
            </div>
          </div>
          <span className="text-xs text-green-500 font-bold bg-green-500/10 px-2 py-1 rounded">-3%</span>
        </div>
        
        <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-500">
              <span className="material-icons-round">bedtime</span>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium">Sommeil</p>
              <p className="font-bold text-white text-lg">7h 42m</p>
            </div>
          </div>
          <span className="text-xs text-green-500 font-bold bg-green-500/10 px-2 py-1 rounded">+12%</span>
        </div>
        
        <div className="p-4 rounded-xl bg-green-500/5 border border-green-500/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/10 rounded-lg text-green-500">
              <span className="material-icons-round">battery_charging_full</span>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium">Récupération</p>
              <p className="font-bold text-white text-lg">{recuperation}%</p>
            </div>
          </div>
          <span className="text-xs text-gray-400">Prêt à performer</span>
        </div>
      </div>
    </div>
  );
};

export default HealthStatsWidget;
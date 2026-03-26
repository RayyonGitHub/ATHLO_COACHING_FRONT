import React, { useState, useEffect } from 'react';
 
const SessionHeroCard = ({ seance, onStart, onDetails, isToday }) => {
 
  const [countdown, setCountdown] = useState(null); // null = pas encore calculé
  const [canStart, setCanStart] = useState(false);
 
  // Calcule le temps restant avant que la séance commence
  const computeStatus = () => {
    if (!seance || !isToday || !seance.jour_prevu) {
      setCanStart(false);
      setCountdown(null);
      return;
    }
 
    const maintenant = new Date();
const dateStr = seance.jour_prevu.split('T')[0]; // "2026-03-25"
const [heures, minutes] = (seance.heure_debut || "00:00").split(':');
// On construit la date avec l'heure locale directement dans la string ISO
const dateSeance = new Date(`${dateStr}T${heures.padStart(2,'0')}:${minutes.padStart(2,'0')}:00`);
 
    const diffMs = dateSeance.getTime() - maintenant.getTime();
    // On autorise 15 min d'avance
    const diffAvec15min = diffMs - 15 * 60 * 1000;
 
    if (diffAvec15min <= 0) {
      setCanStart(true);
      setCountdown(null);
    } else {
      setCanStart(false);
      const totalSec = Math.floor(diffAvec15min / 1000);
      const h = Math.floor(totalSec / 3600);
      const m = Math.floor((totalSec % 3600) / 60);
      const s = totalSec % 60;
      if (h > 0) {
        setCountdown(`Dans ${h}h ${m.toString().padStart(2, '0')}min`);
      } else if (m > 0) {
        setCountdown(`Dans ${m}min ${s.toString().padStart(2, '0')}s`);
      } else {
        setCountdown(`Dans ${s}s`);
      }
    }
  };
 
  useEffect(() => {
    computeStatus();
    const interval = setInterval(computeStatus, 1000);
    return () => clearInterval(interval);
  }, [seance, isToday]);
 
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const [y, m, d] = dateStr.split('T')[0].split('-');
    const dateObj = new Date(y, m - 1, d);
    return dateObj.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
  };
 
  const formatHeure = (heureStr) => {
    if (!heureStr) return "";
    const [h, m] = heureStr.split(':');
    return `${h}h${m}`;
  };
 
  return (
    <div className="relative overflow-hidden rounded-2xl bg-[#1E1E1E] border border-[#2D2D2D] group">
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#FF6B00]/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
 
      <div className="relative p-6 lg:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex-1">
 
          {/* BADGE + DATE */}
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
              seance
                ? isToday
                  ? 'bg-[#FF6B00]/10 text-[#FF6B00] border-[#FF6B00]/20'
                  : 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20'
                : 'bg-green-500/10 text-green-500 border-green-500/20'
            }`}>
              {seance ? (isToday ? "Séance du jour" : "Prochaine Séance") : "Objectif Atteint"}
            </span>
 
            {seance && seance.jour_prevu && (
              <span className="text-gray-400 text-sm font-medium">
                {formatDate(seance.jour_prevu)}
                {seance.heure_debut && (
                  <span className="ml-1 text-gray-500">· {formatHeure(seance.heure_debut)}</span>
                )}
              </span>
            )}
          </div>
 
          {/* TITRE */}
          <h2 className="text-3xl font-bold text-white mb-2">
            {seance ? seance.titre : "Repos Mérité"}
          </h2>
 
          {/* INFOS */}
          {seance ? (
            <p className="text-gray-400 flex items-center gap-4 text-sm mb-6">
              <span className="flex items-center gap-1">
                <span className="material-icons-round text-base">timer</span>
                {seance.duree_estimee || 45} min
              </span>
              <span className="flex items-center gap-1">
                <span className="material-icons-round text-base">local_fire_department</span>
                {seance.calories_estimees || 350} kcal
              </span>
            </p>
          ) : (
            <p className="text-gray-400 text-sm mb-6">
              Toutes les séances prévues pour aujourd'hui ont été complétées. Excellent travail !
            </p>
          )}
 
          {/* BOUTONS */}
          <div className="flex flex-wrap gap-3 items-center">
 
            {/* BOUTON COMMENCER */}
            {seance && isToday ? (
              canStart ? (
                // ✅ Séance en cours ou heure atteinte → bouton actif
                <button
                  onClick={onStart}
                  className="bg-gradient-to-r from-[#FF6B00] to-[#FF9E00] text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-[#FF6B00]/20 hover:shadow-[#FF6B00]/40 hover:scale-105 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span className="material-icons-round">play_arrow</span>
                  Commencer
                </button>
              ) : (
                // 🔒 Pas encore l'heure → countdown visible
                <button
                  disabled
                  className="bg-[#2D2D2D] border border-[#3D3D3D] text-gray-400 px-6 py-3 rounded-xl font-semibold flex items-center gap-2 cursor-not-allowed opacity-70"
                >
                  <span className="material-icons-round text-gray-500 text-base">schedule</span>
                  {countdown || "Chargement..."}
                </button>
              )
            ) : seance && !isToday ? (
              // Séance future (pas aujourd'hui) → bouton désactivé avec la date
              <button
                disabled
                className="bg-[#2D2D2D] border border-[#3D3D3D] text-gray-500 px-6 py-3 rounded-xl font-semibold flex items-center gap-2 cursor-not-allowed opacity-60"
              >
                <span className="material-icons-round text-base">lock_clock</span>
                {seance.heure_debut ? `Disponible le ${formatDate(seance.jour_prevu)} à ${formatHeure(seance.heure_debut)}` : "Séance à venir"}
              </button>
            ) : null}
 
            {/* BOUTON DÉTAILS */}
            <button
              onClick={onDetails}
              className="px-6 py-3 rounded-xl font-semibold text-gray-300 border border-[#2D2D2D] hover:bg-[#2D2D2D] transition-all cursor-pointer"
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
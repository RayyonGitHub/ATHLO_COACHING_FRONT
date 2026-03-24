import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Calendar as CalendarIcon, ChevronLeft, ChevronRight, CheckCircle2, 
  Clock, Dumbbell, CalendarDays, History, X 
} from 'lucide-react';

const AthleteCalendar = () => {
  const [seances, setSeances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // --- NOUVEAUX ÉTATS POUR LE RÉSUMÉ ---
  const [showModal, setShowModal] = useState(false);
  const [selectedResume, setSelectedResume] = useState(null);
  const [loadingResume, setLoadingResume] = useState(false);

  const getWeekDays = (date) => {
    const start = new Date(date);
    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(start.setDate(diff));
    return [...Array(7)].map((_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d;
    });
  };

  const weekDays = getWeekDays(selectedDate);

  const fetchSeances = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('access_token');
      const response = await axios.get('http://127.0.0.1:8000/api/seances/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSeances(response.data);
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSeances();
  }, []);

  // --- FONCTION POUR CHARGER LE RÉSUMÉ ---
  const handleOpenResume = async (seanceId) => {
    setLoadingResume(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(`http://127.0.0.1:8000/api/seances/${seanceId}/resume/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedResume(response.data);
      setShowModal(true);
    } catch (error) {
      console.error("Erreur résumé:", error);
    } finally {
      setLoadingResume(false);
    }
  };

  const filteredSeances = seances.filter(s => {
    if (!s.jour_prevu) return false;
    const dateS = new Date(s.jour_prevu);
    return dateS.toDateString() === selectedDate.toDateString();
  });

  return (
    <div className="flex flex-col gap-8 pb-10 animate-in fade-in duration-700 relative">
      
      {/* HEADER & NAV */}
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">
          Mon <span className="text-[#FF6B00]">Planning</span>
        </h2>
        <div className="flex items-center gap-4 bg-[#1E1E1E] p-1.5 rounded-xl border border-[#2D2D2D]">
            <button onClick={() => { const d = new Date(selectedDate); d.setDate(d.getDate() - 7); setSelectedDate(d); }} className="p-2 hover:bg-[#2D2D2D] rounded-lg text-gray-400 hover:text-white"><ChevronLeft size={20}/></button>
            <span className="text-xs font-bold text-gray-300 uppercase tracking-widest px-2">{selectedDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</span>
            <button onClick={() => { const d = new Date(selectedDate); d.setDate(d.getDate() + 7); setSelectedDate(d); }} className="p-2 hover:bg-[#2D2D2D] rounded-lg text-gray-400 hover:text-white"><ChevronRight size={20}/></button>
        </div>
      </div>

      {/* BARRE DES JOURS */}
      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((date, i) => {
          const isSelected = date.toDateString() === selectedDate.toDateString();
          const hasSession = seances.some(s => new Date(s.jour_prevu).toDateString() === date.toDateString());

          return (
            <button key={i} onClick={() => setSelectedDate(date)} className={`flex flex-col items-center p-4 rounded-2xl border transition-all ${isSelected ? 'bg-[#FF6B00] border-[#FF6B00] shadow-lg shadow-[#FF6B00]/20 scale-105' : 'bg-[#1E1E1E] border-[#2D2D2D] hover:border-gray-500 text-gray-400'}`}>
              <span className={`text-[10px] font-bold uppercase mb-1 ${isSelected ? 'text-white' : 'text-gray-500'}`}>{date.toLocaleDateString('fr-FR', { weekday: 'short' }).replace('.', '')}</span>
              <span className="text-xl font-black text-white">{date.getDate()}</span>
              {hasSession && !isSelected && <div className="w-1.5 h-1.5 bg-[#FF6B00] rounded-full mt-1"></div>}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-10">
          <section>
            <div className="flex items-center gap-2 mb-6">
              <CalendarDays size={20} className="text-[#FF6B00]" />
              <h3 className="text-lg font-bold text-white uppercase tracking-tighter">Séances du jour</h3>
            </div>
            <div className="space-y-4">
              {filteredSeances.length > 0 ? (
                filteredSeances.map(s => <SeanceCard key={s.id} s={s} onOpenResume={handleOpenResume} />)
              ) : (
                <div className="p-10 bg-[#1E1E1E]/30 rounded-3xl border-2 border-dashed border-[#2D2D2D] text-center text-gray-500 italic">
                  Aucune séance prévue pour ce jour précis.
                </div>
              )}
            </div>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-6 pt-4 border-t border-[#2D2D2D]">
              <History size={20} className="text-gray-400" />
              <h3 className="text-lg font-bold text-gray-400 uppercase tracking-tighter">Toutes mes séances</h3>
            </div>
            <div className="space-y-4">
              {/* ON PASSE LA FONCTION ICI AUSSI */}
              {seances.map(s => <SeanceCard key={s.id} s={s} onOpenResume={handleOpenResume} />)}
            </div>
          </section>
        </div>

        {/* SIDEBAR STATS */}
        <div className="lg:col-span-4">
          <div className="sticky top-6 bg-gradient-to-br from-[#1E1E1E] to-[#121212] border border-[#2D2D2D] p-6 rounded-3xl">
            <h4 className="text-white font-bold mb-6 flex items-center gap-2">
              <CheckCircle2 size={18} className="text-green-500" /> Progression
            </h4>
            <div className="space-y-6">
               <div>
                 <div className="flex justify-between text-sm mb-2">
                   <span className="text-gray-400">Séances complétées</span>
                   <span className="text-[#FF6B00] font-black">{seances.filter(s => s.est_completee).length} / {seances.length}</span>
                 </div>
                 <div className="w-full bg-[#2D2D2D] h-2 rounded-full overflow-hidden">
                   <div className="bg-[#FF6B00] h-full" style={{ width: `${(seances.filter(s => s.est_completee).length / (seances.length || 1)) * 100}%` }}></div>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- MODALE DE RÉSUMÉ --- */}
      {showModal && selectedResume && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-[#1E1E1E] border border-[#2D2D2D] rounded-[2.5rem] p-8 max-w-lg w-full shadow-2xl overflow-hidden">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter leading-none">{selectedResume.titre_seance}</h3>
                <p className="text-gray-500 text-sm font-bold mt-2 uppercase tracking-widest flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  Complétée le {selectedResume.date}
                </p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-white"><X /></button>
            </div>

            <div className="space-y-3 mb-8 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
              {selectedResume.exercices.map((exo, idx) => (
                <div key={idx} className="flex justify-between items-center p-5 bg-[#252525] rounded-2xl border border-[#2D2D2D] group hover:border-[#FF6B00]/50">
                  <div className="flex flex-col">
                    <span className="font-black text-white text-lg uppercase italic group-hover:text-[#FF6B00] transition-colors">{exo.exercice}</span>
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{exo.series} séries • {exo.reps} reps</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-black text-white italic">{exo.poids}</span>
                    <span className="text-[10px] font-black text-[#FF6B00] ml-1 uppercase">kg</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-[#FF6B00] p-6 rounded-[1.5rem] flex justify-between items-center shadow-lg">
              <span className="font-black text-black uppercase italic tracking-tighter text-xl">Volume Total</span>
              <div className="flex items-baseline gap-1 text-black">
                <span className="text-3xl font-black italic">{selectedResume.volume_total}</span>
                <span className="text-xs font-black uppercase">kg</span>
              </div>
            </div>

            <button onClick={() => setShowModal(false)} className="w-full mt-6 py-4 rounded-2xl font-black uppercase tracking-widest text-gray-400 hover:text-white transition-all text-sm">Fermer</button>
          </div>
        </div>
      )}
    </div>
  );
};

// --- COMPOSANT CARD MIS À JOUR ---
const SeanceCard = ({ s, onOpenResume }) => (
  <div className={`p-6 rounded-2xl border transition-all ${s.est_completee ? 'bg-[#1E1E1E]/60 border-green-500/30' : 'bg-[#1E1E1E] border-[#2D2D2D] hover:border-[#FF6B00]'}`}>
    <div className="flex justify-between items-center gap-4">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${s.est_completee ? 'bg-green-500/20 text-green-500' : 'bg-[#FF6B00]/10 text-[#FF6B00]'}`}>
          {s.est_completee ? <CheckCircle2 size={24}/> : <Dumbbell size={24}/>}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-white">{s.titre}</h4>
            {s.est_completee && <span className="text-[9px] bg-green-500 text-white px-1.5 py-0.5 rounded font-black uppercase">Terminée</span>}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {s.jour_prevu ? new Date(s.jour_prevu).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : 'Date non définie'} • {s.heure_debut || "Heure libre"}
          </p>
        </div>
      </div>
      
      {/* 🎯 LE BOUTON APPELLE MAINTENANT LA FONCTION PROPS */}
      <button 
        onClick={() => s.est_completee ? onOpenResume(s.id) : null}
        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all active:scale-95 ${s.est_completee ? 'text-green-500 border border-green-500/30 hover:bg-green-500/10' : 'bg-[#FF6B00] text-white hover:bg-orange-600'}`}
      >
        {s.est_completee ? "Résumé" : "Détails"}
      </button>
    </div>
  </div>
);

export default AthleteCalendar;
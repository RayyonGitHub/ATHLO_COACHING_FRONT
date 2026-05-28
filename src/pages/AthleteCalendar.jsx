import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  ChevronLeft, ChevronRight, CheckCircle2, Dumbbell, 
  CalendarDays, History, X, AlertCircle, CheckCircle, Clock 
} from 'lucide-react';
import athleteService from '../services/athleteService';
import SeanceDetailsModal from '../components/athlete/SeanceDetailsModal';

// --- MODALE DE NOTIFICATION (Ton travail) ---
const NotifModal = ({ isOpen, onClose, message, type = 'success' }) => {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(onClose, 3500);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;
  const isSuccess = type === 'success';

  return (
    <div className="fixed inset-0 z-[999] flex items-end justify-center pb-8 px-4 pointer-events-none">
      <div
        className="pointer-events-auto flex items-start gap-4 w-full max-w-sm bg-[#1A1A1A] border rounded-2xl p-5 shadow-2xl"
        style={{
          borderColor: isSuccess ? 'rgba(34,197,94,0.4)' : 'rgba(239,68,68,0.4)',
          animation: 'slideUp 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
          boxShadow: isSuccess ? '0 8px 40px rgba(34,197,94,0.15)' : '0 8px 40px rgba(239,68,68,0.15)',
        }}
      >
        <div
          className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: isSuccess ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)' }}
        >
          {isSuccess ? <CheckCircle size={20} className="text-green-500" /> : <AlertCircle size={20} className="text-red-500" />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-black uppercase tracking-widest mb-1" style={{ color: isSuccess ? '#22c55e' : '#ef4444' }}>
            {isSuccess ? 'Succès' : 'Erreur'}
          </p>
          <p className="text-sm text-gray-300 leading-snug">{message}</p>
        </div>
        <button onClick={onClose} className="flex-shrink-0 text-gray-600 hover:text-gray-300 transition-colors cursor-pointer mt-0.5">
          <X size={16} />
        </button>
        <div
          className="absolute bottom-0 left-0 h-[3px] rounded-b-2xl"
          style={{
            background: isSuccess ? '#22c55e' : '#ef4444',
            animation: 'shrink 3.5s linear forwards',
            width: '100%',
          }}
        />
      </div>
      <style>{`
        @keyframes slideUp { from { opacity: 0; transform: translateY(24px) scale(0.96); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes shrink { from { width: 100%; } to { width: 0%; } }
      `}</style>
    </div>
  );
};

const AthleteCalendar = () => {
  const [seances, setSeances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [athleteId, setAthleteId] = useState(null);
  
  // --- ÉTATS POUR LE RÉSUMÉ (Travail de Younes) ---
  const [showModal, setShowModal] = useState(false);
  const [selectedResume, setSelectedResume] = useState(null);
  const [loadingResume, setLoadingResume] = useState(false);
  
  // --- ÉTATS POUR LES DÉTAILS & NOTIFS (Ton travail) ---
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedSeanceDetails, setSelectedSeanceDetails] = useState(null);
  const [notif, setNotif] = useState({ open: false, message: '', type: 'success' });

  const showNotif = (message, type = 'success') => setNotif({ open: true, message, type });
  const closeNotif = () => setNotif(n => ({ ...n, open: false }));

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

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('access_token');
      
      // On supprime l'appel à /api/auth/me/ qui causait l'erreur 404
      // Et on charge directement les séances !
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

  useEffect(() => { fetchData(); }, []);

  // --- FONCTION POUR CHARGER LE RÉSUMÉ (Younes) ---
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

  // --- FONCTION DE RÉSERVATION (Toi) ---
  const handleReservation = async (seanceId) => {
    try {
        const response = await athleteService.reserverSeance(seanceId);
        showNotif(response.message, 'success');
        fetchData(); 
    } catch (error) {
        const errorMsg = error.response?.data?.erreur || "Erreur lors de la réservation.";
        showNotif(errorMsg, 'error');
    }
  };

  const openSeanceDetails = (seance) => {
    setSelectedSeanceDetails(seance);
    setDetailsModalOpen(true);
  };

  const isSameDay = (dateString, selectedDateObj) => {
    if (!dateString) return false;
    const [y, m, d] = dateString.split('T')[0].split('-');
    return selectedDateObj.getFullYear() === parseInt(y) &&
           selectedDateObj.getMonth() === parseInt(m) - 1 &&
           selectedDateObj.getDate() === parseInt(d);
  };

  // --- FILTRES SIMPLIFIÉS ---
  const mesSeances = seances.filter(s => {
    const estMonProgramme = s.programme !== null && !s.est_collective;
    return s.est_inscrit || estMonProgramme;
  });

  const seancesDisponibles = seances.filter(s => {
    const estMonProgramme = s.programme !== null && !s.est_collective;
    if (s.est_inscrit || estMonProgramme) return false;

    if (!s.jour_prevu) return false;
    const today = new Date();
    today.setHours(0,0,0,0);
    const [y, m, d] = s.jour_prevu.split('T')[0].split('-');
    if (new Date(y, m-1, d) < today) return false;

    if (!s.est_collective) return (s.participants?.length || 0) === 0;
    return true;
  });

  const planningDuJour = mesSeances.filter(s => isSameDay(s.jour_prevu, selectedDate));

  return (
    <div className="flex flex-col gap-8 pb-10 animate-in fade-in duration-700 relative">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">
          Mon <span className="text-[#FF6B00]">Planning</span>
        </h2>
        <div className="flex items-center gap-4 bg-[#1E1E1E] p-1.5 rounded-xl border border-[#2D2D2D]">
           <button onClick={() => { const d = new Date(selectedDate); d.setDate(d.getDate() - 7); setSelectedDate(d); }} className="p-2 hover:bg-[#2D2D2D] rounded-lg text-gray-400 hover:text-white cursor-pointer"><ChevronLeft size={20}/></button>
           <span className="text-xs font-bold text-gray-300 uppercase tracking-widest px-2">{selectedDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</span>
           <button onClick={() => { const d = new Date(selectedDate); d.setDate(d.getDate() + 7); setSelectedDate(d); }} className="p-2 hover:bg-[#2D2D2D] rounded-lg text-gray-400 hover:text-white cursor-pointer"><ChevronRight size={20}/></button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((date, i) => {
          const isSelected = date.toDateString() === selectedDate.toDateString();
          const hasSession = mesSeances.some(s => isSameDay(s.jour_prevu, date));

          return (
            <button key={i} onClick={() => setSelectedDate(date)} className={`cursor-pointer flex flex-col items-center p-4 rounded-2xl border transition-all ${isSelected ? 'bg-[#FF6B00] border-[#FF6B00] shadow-lg shadow-[#FF6B00]/20 scale-105' : 'bg-[#1E1E1E] border-[#2D2D2D] hover:border-gray-500 text-gray-400'}`}>
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
              {planningDuJour.length > 0 ? (
                planningDuJour.map(s => (
                  <SeanceCard 
                    key={s.id} s={s} 
                    isRegistered={true}
                    myStatus={s.mon_statut}
                    onViewDetails={openSeanceDetails}
                    onOpenResume={handleOpenResume} // On passe la fonction de Younes ici
                  />
                ))
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
              <h3 className="text-lg font-bold text-gray-400 uppercase tracking-tighter">Toutes les séances disponibles</h3>
            </div>
            <div className="space-y-4">
              {seancesDisponibles.length > 0 ? (
                seancesDisponibles.map(s => (
                  <SeanceCard 
                    key={s.id} s={s} 
                    isRegistered={false}
                    onReserve={handleReservation} 
                    onViewDetails={openSeanceDetails}
                    onOpenResume={handleOpenResume}
                  />
                ))
              ) : (
                 <div className="p-6 bg-[#1E1E1E]/30 rounded-2xl border border-[#2D2D2D] text-center text-gray-500 text-sm">
                  Pas de nouvelles séances à réserver pour le moment.
                </div>
              )}
            </div>
          </section>
        </div>

        <div className="lg:col-span-4">
          <div className="sticky top-6 bg-gradient-to-br from-[#1E1E1E] to-[#121212] border border-[#2D2D2D] p-6 rounded-3xl">
            <h4 className="text-white font-bold mb-6 flex items-center gap-2">
              <CheckCircle2 size={18} className="text-green-500" /> Progression
            </h4>
            <div className="space-y-6">
               <div>
                 <div className="flex justify-between text-sm mb-2">
                   <span className="text-gray-400">Séances complétées</span>
                   <span className="text-[#FF6B00] font-black">{mesSeances.filter(s => s.est_completee).length} / {mesSeances.length}</span>
                 </div>
                 <div className="w-full bg-[#2D2D2D] h-2 rounded-full overflow-hidden">
                   <div className="bg-[#FF6B00] h-full" style={{ width: `${(mesSeances.filter(s => s.est_completee).length / (mesSeances.length || 1)) * 100}%` }}></div>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- MODALE DE RÉSUMÉ (Travail de Younes) --- */}
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
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-white cursor-pointer"><X /></button>
            </div>

            <div className="space-y-3 mb-8 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
              {(selectedResume.exercices || []).map((exo, idx) => (
                <div key={idx} className="flex justify-between items-center p-5 bg-[#252525] rounded-2xl border border-[#2D2D2D] group hover:border-[#FF6B00]/50">
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
                <span className="text-3xl font-black italic">{selectedResume.volume_total}</span>
                <span className="text-xs font-black uppercase">kg</span>
              </div>
            </div>

            <button onClick={() => setShowModal(false)} className="w-full mt-6 py-4 rounded-2xl font-black uppercase tracking-widest text-gray-400 hover:text-white transition-all text-sm cursor-pointer">Fermer</button>
          </div>
        </div>
      )}
      
      {/* MODALE DÉTAILS SÉANCE (Ton travail) */}
      <SeanceDetailsModal 
        isOpen={detailsModalOpen} 
        onClose={() => setDetailsModalOpen(false)} 
        seance={selectedSeanceDetails} 
      />

      {/* MODALE DE NOTIFICATION (Ton travail) */}
      <NotifModal
        isOpen={notif.open}
        onClose={closeNotif}
        message={notif.message}
        type={notif.type}
      />
    </div>
  );
};

// --- CARTE SÉANCE FUSIONNÉE ---
const SeanceCard = ({ s, isRegistered, myStatus, onReserve, onViewDetails, onOpenResume }) => {
  const [y, m, d] = (s.jour_prevu || "2000-01-01").split('T')[0].split('-');
  const isPast = new Date(y, m-1, d) < new Date(new Date().setHours(0,0,0,0));
  const isFull = s.est_collective && (s.participants?.length >= s.capacite_max);
  const isMyProgramSession = s.programme !== null && !s.est_collective;

  return (
    <div className={`p-6 rounded-2xl border transition-all ${s.est_completee ? 'bg-[#1E1E1E]/60 border-green-500/30' : myStatus === 'ATTENTE' ? 'bg-[#121212] border-[#2D2D2D] opacity-75' : 'bg-[#1E1E1E] border-[#2D2D2D] hover:border-[#FF6B00]'}`}>
        <div className="flex justify-between items-center gap-4">
          
          <div className="flex items-center gap-4 cursor-pointer flex-1 group" onClick={() => !s.est_completee && onViewDetails && onViewDetails(s)}>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${s.est_completee ? 'bg-green-500/20 text-green-500' : 'bg-[#FF6B00]/10 text-[#FF6B00] group-hover:bg-[#FF6B00] group-hover:text-white transition-colors'}`}>
                {s.est_completee ? <CheckCircle2 size={24}/> : <Dumbbell size={24}/>}
              </div>
              <div>
                <div className="flex items-center gap-2">
                    <h4 className="font-bold text-white group-hover:text-[#FF6B00] transition-colors">{s.titre}</h4>
                    {s.est_completee && <span className="text-[9px] bg-green-500 text-white px-1.5 py-0.5 rounded font-black uppercase">Terminée</span>}
                    {s.est_collective && <span className="text-[9px] bg-purple-500 text-white px-1.5 py-0.5 rounded font-black uppercase">Collectif</span>}
                    {isMyProgramSession && <span className="text-[9px] bg-indigo-500 text-white px-1.5 py-0.5 rounded font-black uppercase">Mon Programme</span>}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                    {new Date(y, m-1, d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} • {s.heure_debut || "Heure libre"}
                </p>
              </div>
          </div>
          
          {/* LOGIQUE FUSIONNÉE POUR LES BOUTONS DE DROITE */}
          {s.est_completee ? (
              // Bouton Résumé de Younes si la séance est finie
              <button 
                onClick={(e) => { e.stopPropagation(); onOpenResume(s.id); }}
                className="px-4 py-2 rounded-lg text-xs font-bold transition-all active:scale-95 text-green-500 border border-green-500/30 hover:bg-green-500/10 cursor-pointer"
              >
                Voir le Résumé
              </button>
          ) : isRegistered ? (
             <span className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${myStatus === 'CONFIRME' || isMyProgramSession ? 'bg-green-500/10 text-green-500 border-green-500/30' : 'bg-orange-500/10 text-orange-500 border-orange-500/30'}`}>
                {myStatus === 'CONFIRME' || isMyProgramSession ? 'CONFIRMÉ' : 'EN ATTENTE'}
             </span>
          ) : !isPast ? (
              <button 
                  onClick={(e) => { e.stopPropagation(); onReserve(s.id); }}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${isFull ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-[#FF6B00] text-white hover:bg-orange-600'}`}
              >
                  {isFull ? "Liste d'attente" : "S'inscrire"}
              </button>
          ) : (
              <button className="px-4 py-2 rounded-lg text-xs font-bold text-gray-500 border border-gray-700 cursor-default">
                  Passée
              </button>
          )}
        </div>
    </div>
  );
}

export default AthleteCalendar;

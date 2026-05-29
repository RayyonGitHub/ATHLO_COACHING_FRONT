import React, { useState, useEffect, useRef } from 'react';
import calendarService from '../services/calendarService';
import { Calendar, ChevronLeft, ChevronRight, Plus, Filter, Users, Check, X, Trash2, Edit3, Info } from 'lucide-react';

const HOURS = Array.from({ length: 17 }, (_, i) => i + 6); // 6:00 to 22:00
const DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

const CoachCalendarModern = () => {
  const [seances, setSeances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedSeance, setSelectedSeance] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchSeances = async () => {
    try {
      setLoading(true);
      const data = await calendarService.getCoachCalendar();
      setSeances(data);
    } catch (err) {
      console.error("Erreur", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSeances();
  }, []);

  const getWeekDates = () => {
    const start = new Date(currentDate);
    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(start.setDate(diff));
    
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      return date;
    });
  };

  const weekDates = getWeekDates();

  const formatWeekRange = () => {
    const start = weekDates[0];
    const end = weekDates[6];
    const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
    return `${start.getDate()} ${monthNames[start.getMonth()]} - ${end.getDate()} ${monthNames[end.getMonth()]} ${end.getFullYear()}`;
  };

  const previousWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentDate(newDate);
  };

  const nextWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentDate(newDate);
  };

  const getSeancePosition = (seance) => {
    if (!seance.jour_prevu || !seance.heure_debut) return null;
    
    const seanceDate = new Date(seance.jour_prevu);
    const dayIndex = weekDates.findIndex(d => 
      d.getDate() === seanceDate.getDate() && 
      d.getMonth() === seanceDate.getMonth() && 
      d.getFullYear() === seanceDate.getFullYear()
    );
    
    if (dayIndex === -1) return null;

    const [hours, minutes] = seance.heure_debut.split(':').map(Number);
    const startMinutes = hours * 60 + minutes;
    const topPosition = ((startMinutes - 360) / 60) * 80; // 360 = 6:00 AM in minutes, 80px per hour

    let duration = 60;
    if (seance.heure_fin) {
      const [endHours, endMinutes] = seance.heure_fin.split(':').map(Number);
      const endTotalMinutes = endHours * 60 + endMinutes;
      duration = endTotalMinutes - startMinutes;
    }
    const height = (duration / 60) * 80;

    return { dayIndex, top: topPosition, height };
  };

  const getSeanceColor = (seance) => {
    if (seance.est_completee) return { bg: 'bg-surface-container-highest', border: 'border-outline-variant' };
    if (seance.est_collective) return { bg: 'bg-tertiary-container/20', border: 'border-[#ffc96f]' };
    return { bg: 'bg-primary-container/20', border: 'border-[#FF6A00]' };
  };

  const todayIndex = weekDates.findIndex(d => {
    const today = new Date();
    return d.getDate() === today.getDate() && 
           d.getMonth() === today.getMonth() && 
           d.getFullYear() === today.getFullYear();
  });

  return (
    <div className="h-screen flex flex-col bg-[#0B0B0E] overflow-hidden">
      {/* Header */}
      <header className="flex justify-between items-center px-8 py-4 bg-[#0B0B0E]/80 backdrop-blur-xl border-b border-[#2A2A32]">
        <div className="flex items-center gap-8">
          <h2 className="font-headline text-xl uppercase tracking-widest text-[#FCF8FE] font-black flex items-center gap-3">
            <Calendar className="text-[#FF6A00]" size={28} /> ATHLO AGENDA
          </h2>
        </div>
        <button className="px-6 py-2 bg-[#FF6A00] text-white font-bold rounded-xl active:scale-95 transition-transform flex items-center gap-2">
          <Plus size={18} /> Nouvelle Séance
        </button>
      </header>

      {/* Sub-Header */}
      <section className="flex items-center justify-between px-8 py-4 border-b border-[#2A2A32]">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4">
            <button onClick={previousWeek} className="p-2 bg-[#1F1F25] rounded-xl hover:text-[#FF6A00] transition-colors">
              <ChevronLeft size={20} />
            </button>
            <h3 className="text-xl font-bold tracking-tight uppercase text-[#FCF8FE]">{formatWeekRange()}</h3>
            <button onClick={nextWeek} className="p-2 bg-[#1F1F25] rounded-xl hover:text-[#FF6A00] transition-colors">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-[#2A2A32] rounded-xl text-sm font-semibold hover:bg-[#1F1F25] transition-colors">
          <Filter size={18} /> Filtres
        </button>
      </section>

      {/* Calendar Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Time Labels */}
        <div className="w-20 border-r border-[#2A2A32] flex flex-col pt-[53px] overflow-hidden">
          <div className="flex-1 overflow-y-scroll no-scrollbar" id="time-labels">
            {HOURS.map(hour => (
              <div key={hour} className="h-20 flex items-start justify-center text-[10px] font-bold text-[#ACAAB0]/50 pt-1">
                {hour.toString().padStart(2, '0')}:00
              </div>
            ))}
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Day Headers */}
          <div className="grid grid-cols-7 border-b border-[#2A2A32]">
            {weekDates.map((date, i) => (
              <div 
                key={i} 
                className={`p-4 text-center ${i === todayIndex ? 'bg-[#1F1F25]' : ''}`}
              >
                <span className={`block text-[10px] font-bold uppercase tracking-widest ${i === todayIndex ? 'text-[#FF6A00]' : 'text-[#ACAAB0]'}`}>
                  {DAYS[i]}
                </span>
                <span className={`text-xl font-bold ${i === todayIndex ? 'text-[#FF6A00]' : 'text-[#FCF8FE]'}`}>
                  {date.getDate()}
                </span>
              </div>
            ))}
          </div>

          {/* Scrolling Grid */}
          <div className="flex-1 overflow-y-auto no-scrollbar relative" id="calendar-grid">
            {/* Background Grid */}
            <div className="absolute inset-0 grid grid-cols-7 pointer-events-none">
              {weekDates.map((_, i) => (
                <div 
                  key={i} 
                  className={`border-r border-[#2A2A32]/5 h-full ${i === todayIndex ? 'bg-[#FF6A00]/5' : ''}`}
                />
              ))}
            </div>

            {/* Time Grid Lines */}
            <div className="relative w-full">
              {HOURS.map((hour, i) => (
                <div 
                  key={hour} 
                  className="h-20 w-full border-b border-[#2A2A32]/10"
                  style={{ height: '80px' }}
                />
              ))}

              {/* Floating Sessions */}
              {seances.map(seance => {
                const position = getSeancePosition(seance);
                if (!position) return null;

                const colors = getSeanceColor(seance);
                const { dayIndex, top, height } = position;
                const leftPercent = (dayIndex / 7) * 100;

                return (
                  <div
                    key={seance.id}
                    className="absolute px-1 pointer-events-none"
                    style={{
                      left: `${leftPercent}%`,
                      width: `${100 / 7}%`,
                      top: `${top}px`,
                      height: `${height}px`,
                      minHeight: '60px'
                    }}
                  >
                    <div 
                      className={`pointer-events-auto h-full ${colors.bg} border-l-4 ${colors.border} p-3 rounded-r-xl shadow-lg hover:brightness-110 cursor-pointer transition-all`}
                      onClick={() => {
                        setSelectedSeance(seance);
                        setIsModalOpen(true);
                      }}
                    >
                      <div className="text-[10px] font-bold uppercase text-[#FF6A00]">
                        {seance.est_collective ? 'Collectif' : 'Individuel'}
                      </div>
                      <div className="font-bold text-sm leading-tight mt-1 text-[#FCF8FE] line-clamp-2">
                        {seance.titre || 'Sans titre'}
                      </div>
                      {seance.salle_nom && (
                        <div className="text-[10px] mt-1 text-[#ACAAB0] flex items-center gap-1 truncate">
                          {seance.salle_nom}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Current Time Indicator */}
              {todayIndex !== -1 && (() => {
                const now = new Date();
                const minutes = now.getHours() * 60 + now.getMinutes();
                const topPosition = ((minutes - 360) / 60) * 80;
                
                if (topPosition >= 0 && topPosition <= HOURS.length * 80) {
                  return (
                    <div 
                      className="absolute w-full border-t-2 border-[#FF6A00] z-10 pointer-events-none flex items-center"
                      style={{ top: `${topPosition}px` }}
                    >
                      <div className="w-2 h-2 rounded-full bg-[#FF6A00] -ml-1"></div>
                    </div>
                  );
                }
              })()}
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <aside className="w-80 bg-[#131317] border-l border-[#2A2A32] flex flex-col overflow-y-auto">
          <div className="p-6">
            <h4 className="text-xs font-bold text-[#ACAAB0] uppercase tracking-[0.2em] mb-6">
              Séances Aujourd'hui
            </h4>
            <div className="space-y-4">
              {seances
                .filter(s => {
                  if (!s.jour_prevu) return false;
                  const seanceDate = new Date(s.jour_prevu);
                  const today = new Date();
                  return seanceDate.getDate() === today.getDate() &&
                         seanceDate.getMonth() === today.getMonth() &&
                         seanceDate.getFullYear() === today.getFullYear();
                })
                .slice(0, 5)
                .map(seance => (
                  <div 
                    key={seance.id}
                    className="glass-panel p-4 rounded-2xl border border-[#2A2A32] group cursor-pointer hover:border-[#FF6A00]/50 transition-all bg-[#1F1F25]/80 backdrop-blur-sm"
                    onClick={() => {
                      setSelectedSeance(seance);
                      setIsModalOpen(true);
                    }}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="bg-[#FF6A00]/10 text-[#FF6A00] text-[10px] font-black px-2 py-0.5 rounded">
                        {seance.heure_debut?.substring(0, 5)}
                      </span>
                    </div>
                    <h5 className="font-bold text-sm text-[#FCF8FE]">
                      {seance.titre || 'Sans titre'}
                    </h5>
                    <p className="text-xs text-[#ACAAB0] mt-1">
                      {seance.salle_nom || 'Aucune salle'}
                    </p>
                  </div>
                ))}
              
              {seances.filter(s => {
                if (!s.jour_prevu) return false;
                const seanceDate = new Date(s.jour_prevu);
                const today = new Date();
                return seanceDate.getDate() === today.getDate() &&
                       seanceDate.getMonth() === today.getMonth() &&
                       seanceDate.getFullYear() === today.getFullYear();
              }).length === 0 && (
                <p className="text-sm text-[#ACAAB0] italic">Aucune séance prévue aujourd'hui</p>
              )}
            </div>
          </div>
        </aside>
      </div>

      {/* Modal */}
      {isModalOpen && selectedSeance && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B0B0E]/80 backdrop-blur-sm">
          <div className="bg-[#131317] rounded-2xl shadow-2xl max-w-lg w-full border border-[#2A2A32]">
            <div className="p-6 border-b border-[#2A2A32] flex justify-between items-center">
              <h3 className="text-xl font-bold text-[#FCF8FE]">Détails de la séance</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-[#ACAAB0] hover:text-[#FCF8FE]">
                <X size={24} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="text-xs text-[#ACAAB0] uppercase tracking-wider">Titre</p>
                <p className="text-lg font-bold text-[#FCF8FE]">{selectedSeance.titre || 'Sans titre'}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-[#ACAAB0] uppercase tracking-wider">Date</p>
                  <p className="text-sm font-bold text-[#FCF8FE]">
                    {new Date(selectedSeance.jour_prevu).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#ACAAB0] uppercase tracking-wider">Heure</p>
                  <p className="text-sm font-bold text-[#FCF8FE]">
                    {selectedSeance.heure_debut} - {selectedSeance.heure_fin}
                  </p>
                </div>
              </div>
              {selectedSeance.salle_nom && (
                <div>
                  <p className="text-xs text-[#ACAAB0] uppercase tracking-wider">Salle</p>
                  <p className="text-sm font-bold text-[#FCF8FE]">{selectedSeance.salle_nom}</p>
                </div>
              )}
            </div>
            <div className="p-6 border-t border-[#2A2A32] flex justify-end gap-2">
              <button className="px-4 py-2 text-sm font-bold text-[#EF4444] hover:bg-[#EF4444]/10 rounded-xl transition-colors flex items-center gap-2">
                <Trash2 size={16} /> Supprimer
              </button>
              <button className="px-4 py-2 text-sm font-bold bg-[#FF6A00] text-white rounded-xl hover:bg-[#e66000] transition-colors flex items-center gap-2">
                <Edit3 size={16} /> Modifier
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .glass-panel { background: rgba(19, 19, 23, 0.8); backdrop-filter: blur(12px); }
      `}</style>
    </div>
  );
};

export default CoachCalendarModern;

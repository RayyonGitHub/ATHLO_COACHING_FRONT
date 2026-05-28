import React, { useEffect, useState } from 'react';
import { responsableService } from '../../services/responsableService';

const ResponsablePlanning = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]); // YYYY-MM-DD

  useEffect(() => {
    const fetchPlanning = async () => {
      setLoading(true);
      try {
        const response = await responsableService.getPlanning(currentDate);
        setData(response);
      } catch (err) {
        setError("Impossible de charger le planning.");
      } finally {
        setLoading(false);
      }
    };
    fetchPlanning();
  }, [currentDate]);

  // Fonction pour calculer la position et la largeur d'une séance sur la timeline (De 06:00 à 22:00 = 16h)
  const getStyleForTime = (debut, fin) => {
    const startHour = parseInt(debut.split(':')[0]) + parseInt(debut.split(':')[1]) / 60;
    const endHour = parseInt(fin.split(':')[0]) + parseInt(fin.split(':')[1]) / 60;
    
    // Contrainte de la vue entre 6h et 22h
    const timelineStart = 6;
    const timelineDuration = 16; 
    
    const leftPercent = ((startHour - timelineStart) / timelineDuration) * 100;
    const widthPercent = ((endHour - startHour) / timelineDuration) * 100;

    return {
      left: `${Math.max(0, leftPercent)}%`,
      width: `${Math.max(2, widthPercent)}%`, // min-width 2% pour visibilité
    };
  };

  if (loading && !data) return <div className="p-8 text-[#ff915a]">Chargement du planning...</div>;
  if (error) return <div className="p-8 text-[#ff7351]">{error}</div>;

  // Grouper les séances par Coach
  const groupedSeances = {};
  if (data && data.seances) {
    data.seances.forEach(s => {
      const coachName = s.coach_nom || "Non assigné";
      if (!groupedSeances[coachName]) groupedSeances[coachName] = [];
      groupedSeances[coachName].push(s);
    });
  }

  // Les heures affichées en haut
  const hoursGrid = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21];

  return (
    <div className="p-8 space-y-8 text-[#fcf8fe]">
      {/* Header Section */}
      <div className="flex justify-between items-end">
        <div className="space-y-1">
          <span className="text-sm uppercase tracking-[0.2em] text-[#acaab0] font-bold">Planning Global - {data?.salle_nom}</span>
          <h3 className="text-3xl font-black tracking-tight">Timeline d'Activité</h3>
        </div>
        <div className="flex items-center gap-4 bg-[#131317] p-2 rounded-xl border border-[#48474c]/20">
          <input 
            type="date" 
            value={currentDate}
            onChange={(e) => setCurrentDate(e.target.value)}
            className="bg-transparent border-none text-sm text-[#fcf8fe] focus:ring-0 cursor-pointer"
          />
        </div>
      </div>

      {/* Schedule Grid */}
      <div className="bg-[#131317] rounded-3xl overflow-hidden shadow-2xl border border-[#48474c]/10">
        
        {/* Timeline Header */}
        <div className="flex border-b border-[#48474c]/20 bg-[#1f1f25]/50">
          <div className="w-[200px] shrink-0 p-6 font-bold text-xs uppercase tracking-widest text-[#acaab0] border-r border-[#48474c]/20">
            Coach
          </div>
          <div className="flex-1 flex">
            {hoursGrid.map(h => (
              <div key={h} className="flex-1 p-4 text-center text-xs font-bold text-[#acaab0] border-r border-[#48474c]/5 last:border-0">
                {h < 10 ? `0${h}:00` : `${h}:00`}
              </div>
            ))}
          </div>
        </div>

        {/* Grid Rows (Par Coach) */}
        <div className="relative">
          
          {/* Ligne rouge "Heure actuelle" (Optionnelle, animable plus tard) */}
          {currentDate === new Date().toISOString().split('T')[0] && (
            <div 
              className="absolute top-0 bottom-0 w-0.5 bg-[#ff915a] z-20 shadow-[0_0_15px_rgba(255,145,90,0.5)] pointer-events-none"
              style={{ left: `calc(200px + ${( (new Date().getHours() + new Date().getMinutes() / 60 - 6) / 16 ) * 100}%)` }}
            >
              <div className="absolute -top-1 -left-1 w-2.5 h-2.5 rounded-full bg-[#ff915a]"></div>
            </div>
          )}

          {Object.keys(groupedSeances).length === 0 ? (
             <div className="p-8 text-center text-[#acaab0]">Aucune séance planifiée pour cette date.</div>
          ) : (
            Object.entries(groupedSeances).map(([coachName, seances]) => (
              <div key={coachName} className="flex min-h-[100px] border-b border-[#48474c]/10 hover:bg-[#1f1f25]/30 transition-colors">
                
                {/* Colonne du Coach */}
                <div className="w-[200px] shrink-0 p-6 border-r border-[#48474c]/20 bg-[#131317]/80 z-10 flex flex-col justify-center">
                  <span className="font-black text-sm tracking-tight">{coachName}</span>
                  <span className="text-[10px] text-[#acaab0] uppercase font-bold tracking-wider mt-1">
                    {seances.length} séance(s)
                  </span>
                </div>

                {/* Espace Timeline */}
                <div className="flex-1 relative p-2">
                  {/* Grille de fond subtile */}
                  <div className="absolute inset-0 flex pointer-events-none opacity-20">
                    {hoursGrid.map(h => (
                       <div key={h} className="flex-1 border-r border-[#48474c]/50"></div>
                    ))}
                  </div>

                  {/* Les cartes de séances */}
                  {seances.map(s => {
                    const style = getStyleForTime(s.heure_debut, s.heure_fin);
                    const isFull = s.inscrits_count >= s.capacite_max;
                    
                    return (
                      <div 
                        key={s.id}
                        className={`absolute h-16 top-1/2 -translate-y-1/2 rounded-xl p-3 flex flex-col justify-between group/card hover:scale-[1.02] transition-transform cursor-pointer shadow-lg
                          ${isFull ? 'bg-[#ff7351]/20 border border-[#ff7351]' : 'bg-[#ff915a]/20 border border-[#ff915a]/50'}
                        `}
                        style={style}
                        title={`${s.titre} (${s.heure_debut} - ${s.heure_fin})`}
                      >
                        <div className="flex justify-between items-start overflow-hidden">
                          <span className={`text-[11px] font-black uppercase leading-none truncate pr-2 ${isFull ? 'text-[#ff7351]' : 'text-[#ff915a]'}`}>
                            {s.titre}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-[10px] font-bold ${isFull ? 'text-[#ff7351]' : 'text-[#fcf8fe]'}`}>
                            {s.inscrits_count}/{s.capacite_max} inscrits
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ResponsablePlanning;
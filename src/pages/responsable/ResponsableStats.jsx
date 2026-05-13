import React, { useEffect, useState } from 'react';
import { responsableService } from '../../services/responsableService';

const ResponsableStats = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await responsableService.getStatistiques();
        setData(response);
      } catch (err) {
        setError("Impossible de charger les statistiques.");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="p-8 text-[#ff915a] animate-pulse font-bold uppercase tracking-widest">Calcul des données...</div>;
  if (error) return <div className="p-8 text-[#ff7351] font-bold">{error}</div>;

  return (
    <div className="p-8 space-y-10 text-[#fcf8fe]">
      {/* Header */}
      <div className="space-y-1">
        <span className="text-sm uppercase tracking-[0.2em] text-[#acaab0] font-bold">Rapport d'Activité - {data.mois}</span>
        <h3 className="text-3xl font-black tracking-tight">Statistiques d'Exploitation</h3>
      </div>

      {/* Top Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#131317] p-8 rounded-2xl border border-[#48474c]/20">
          <p className="text-[#acaab0] text-xs uppercase tracking-widest font-bold mb-2">Fréquentation Cumulée</p>
          <h3 className="text-5xl font-black text-[#fcf8fe]">{data.frequentation}</h3>
          <p className="text-[#acaab0] mt-2 text-sm">Athlètes ayant participé à un cours</p>
        </div>
        
        <div className="bg-[#131317] p-8 rounded-2xl border border-[#48474c]/20">
          <p className="text-[#acaab0] text-xs uppercase tracking-widest font-bold mb-2">Taux de Remplissage Global</p>
          <h3 className="text-5xl font-black text-[#ff915a]">{data.taux_remplissage}%</h3>
          <p className="text-[#acaab0] mt-2 text-sm">Capacité utilisée sur le mois</p>
        </div>

        <div className="bg-[#131317] p-8 rounded-2xl border border-[#48474c]/20">
          <p className="text-[#acaab0] text-xs uppercase tracking-widest font-bold mb-2">Revenus Générés (Local)</p>
          <h3 className="text-5xl font-black text-[#fcf8fe]">{data.revenus_mois.toLocaleString('fr-FR')} €</h3>
          <p className="text-[#acaab0] mt-2 text-sm">Commandes validées ce mois-ci</p>
        </div>
      </div>

      {/* Analysis Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Top Coachs */}
        <div className="bg-[#131317] p-8 rounded-3xl border border-[#48474c]/20">
          <h4 className="text-xl font-bold text-[#fcf8fe] mb-6">Top Coachs (Ce mois-ci)</h4>
          <div className="space-y-4">
            {data.top_coachs.length === 0 ? (
              <p className="text-[#acaab0]">Aucune donnée pour ce mois.</p>
            ) : (
              data.top_coachs.map((coach, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-[#1f1f25] rounded-xl">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded bg-[#ff915a]/20 text-[#ff915a] flex items-center justify-center font-black">
                      {index + 1}
                    </div>
                    <span className="font-bold">{coach.nom}</span>
                  </div>
                  <span className="text-[#acaab0] font-bold">{coach.seances} séances</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Heures de pointe */}
        <div className="bg-[#131317] p-8 rounded-3xl border border-[#48474c]/20">
          <h4 className="text-xl font-bold text-[#fcf8fe] mb-6">Heures de Pointe (Top 3)</h4>
          <div className="space-y-6">
            {data.heures_pointe.length === 0 ? (
              <p className="text-[#acaab0]">Pas de séances prévues ce mois-ci.</p>
            ) : (
              data.heures_pointe.map((hp, index) => {
                // Pour créer une barre visuelle simple basée sur l'ordre
                const barWidth = index === 0 ? '100%' : index === 1 ? '70%' : '45%';
                const barColor = index === 0 ? 'bg-[#ff7351]' : 'bg-[#ff915a]';
                
                return (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center text-sm font-bold">
                      <span>Créneau de {hp.heure}</span>
                      <span className="text-[#acaab0]">{hp.nb_seances} séances programmées</span>
                    </div>
                    <div className="w-full h-2 bg-[#1f1f25] rounded-full overflow-hidden">
                      <div className={`h-full ${barColor} rounded-full`} style={{ width: barWidth }}></div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ResponsableStats;
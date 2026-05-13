import React, { useEffect, useState } from 'react';
import { responsableService } from '../../services/responsableService';

const ResponsableDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await responsableService.getDashboardStats();
        setData(response);
      } catch (err) {
        setError("Impossible de charger les données ou vous n'avez pas les droits.");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center text-[#ff915a] p-20">
        <div className="text-xl font-bold tracking-widest animate-pulse">CHARGEMENT DU COCKPIT...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center text-[#ff7351] p-20">
        <div className="text-xl font-bold">{error}</div>
      </div>
    );
  }

  const { kpis, salle_nom } = data;

  return (
    <div className="p-8 space-y-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#fcf8fe]">Vue d'ensemble - {salle_nom}</h1>
        <p className="text-[#acaab0] mt-1">Activité quotidienne et indicateurs clés de performance.</p>
      </div>
      
      {/* Bento Grid: Key KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-6">
        
        {/* Taux occupation */}
        <div className="md:col-span-2 row-span-2 bg-[#131317] rounded-[2rem] p-8 flex flex-col justify-between relative overflow-hidden border border-[#48474c]/10">
          <div className="relative z-10">
            <span className="text-[#acaab0] text-sm font-medium uppercase tracking-tighter">Taux d'occupation</span>
            <h3 className="text-5xl font-black mt-2 text-[#fcf8fe]">{kpis.taux_occupation}<span className="text-[#ff915a] text-2xl">%</span></h3>
          </div>
          <div className="flex justify-center items-center py-6 relative">
            <div className="w-48 h-48 rounded-full border-[12px] border-[#1f1f25] flex items-center justify-center relative">
              <div 
                className="absolute inset-0 rounded-full border-[12px] border-[#ff915a] border-t-transparent border-r-transparent transition-transform duration-1000"
                style={{ transform: `rotate(${kpis.taux_occupation * 3.6 - 135}deg)` }}
              ></div>
              <div className="text-center">
                <p className="text-3xl font-black text-[#fcf8fe]">{kpis.clients_presents}</p>
                <p className="text-[10px] text-[#acaab0] uppercase tracking-widest">Actifs Présents</p>
              </div>
            </div>
          </div>
          <div className="flex justify-between items-end relative z-10">
            <div>
              <p className="text-xs text-[#acaab0]">Basé sur la capacité des cours</p>
            </div>
            <span className="material-symbols-outlined text-[#ff7526] text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>trending_up</span>
          </div>
        </div>

        {/* Séances du jour */}
        <div className="md:col-span-2 bg-[#1f1f25] rounded-[1.5rem] p-6 flex flex-col justify-between border border-[#48474c]/10">
          <div className="flex justify-between items-start">
            <span className="material-symbols-outlined text-[#ff915a] bg-[#ff915a]/10 p-3 rounded-xl">fitness_center</span>
            <span className="text-xs font-bold text-[#ff915a]">Aujourd'hui</span>
          </div>
          <div className="mt-4">
            <p className="text-sm text-[#acaab0] font-medium">Séances du jour</p>
            <h4 className="text-3xl font-bold text-[#fcf8fe]">{kpis.seances_jour}</h4>
          </div>
        </div>

        {/* Coachs Actifs */}
        <div className="md:col-span-2 bg-[#1f1f25] rounded-[1.5rem] p-6 flex flex-col justify-between border border-[#48474c]/10">
          <div className="flex justify-between items-start">
            <span className="material-symbols-outlined text-[#ffc96f] bg-[#ffc96f]/10 p-3 rounded-xl">groups</span>
            <span className="text-xs font-bold text-[#ffc96f]">En service</span>
          </div>
          <div className="mt-4">
            <p className="text-sm text-[#acaab0] font-medium">Coachs Actifs</p>
            <h4 className="text-3xl font-bold text-[#fcf8fe]">{kpis.coachs_actifs}</h4>
          </div>
        </div>

        {/* Réservations attente */}
        <div className="md:col-span-2 bg-[#1f1f25] rounded-[1.5rem] p-6 flex flex-col justify-between border border-[#48474c]/10">
          <div className="flex justify-between items-start">
            <span className="material-symbols-outlined text-[#acaab0] bg-[#25252b] p-3 rounded-xl">event_upcoming</span>
          </div>
          <div className="mt-4">
            <p className="text-sm text-[#acaab0] font-medium">Réservations en attente</p>
            <h4 className="text-3xl font-bold text-[#fcf8fe]">{kpis.reservations_attente}</h4>
          </div>
        </div>

        {/* Cours Complets */}
        <div className="md:col-span-2 bg-[#1f1f25] rounded-[1.5rem] p-6 flex flex-col justify-between border border-[#48474c]/10">
          <div className="flex justify-between items-start">
            <span className="material-symbols-outlined text-[#ff7351] bg-[#ff7351]/10 p-3 rounded-xl">lock</span>
            {kpis.cours_complets > 0 && <span className="text-xs font-bold text-[#ff7351]">Forte demande</span>}
          </div>
          <div className="mt-4">
            <p className="text-sm text-[#acaab0] font-medium">Cours Complets</p>
            <h4 className="text-3xl font-bold text-[#fcf8fe]">{kpis.cours_complets}</h4>
          </div>
        </div>

        {/* Revenus Card */}
        <div className="md:col-span-4 lg:col-span-6 bg-[#131317] rounded-[2rem] p-8 flex items-center justify-between overflow-hidden relative border border-[#48474c]/10">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-12 w-full">
            <div>
              <span className="text-[#acaab0] text-sm font-medium uppercase tracking-widest">Revenus Locaux (Aujourd'hui)</span>
              <div className="flex items-baseline gap-2 mt-2">
                <h3 className="text-5xl font-black text-[#fcf8fe]">{kpis.revenus_generes.toLocaleString('fr-FR')} €</h3>
              </div>
            </div>
            <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-8 border-l border-[#48474c]/20 pl-8">
              <div>
                <p className="text-xs text-[#acaab0] uppercase tracking-tighter mb-1">Ventes Coachs</p>
                <p className="text-xl font-bold text-[#fcf8fe]">{kpis.revenus_generes.toLocaleString('fr-FR')} €</p>
              </div>
              <div>
                <p className="text-xs text-[#acaab0] uppercase tracking-tighter mb-1">Boutique & Extras</p>
                <p className="text-xl font-bold text-[#acaab0]">-- €</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ResponsableDashboard;
import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { 
  Users, 
  DollarSign, 
  Dumbbell, 
  Activity, 
  TrendingUp, 
  UserPlus 
} from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    total_coaches: 0,
    total_athletes: 0,
    total_revenue: 0,
    mrr: 0,
    registrations_this_month: 0,
    gym_partners: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Appel à la vue admin_stats_view du backend
      const response = await api.get('/admin/stats/');
      setStats(response.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des statistiques :", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF6A00]"></div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-[1200px] mx-auto animate-in fade-in duration-500">
      <div className="mb-10">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">Cockpit Administration</h1>
        <p className="text-slate-500 mt-1">
          Suivez en temps réel la santé financière et la croissance de la plateforme.
        </p>
      </div>

      {/* Grille de statistiques principales (6 Cartes) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        
        {/* Pilier Financier */}
        <StatCard 
          title="Revenu Total" 
          value={`${stats.total_revenue.toLocaleString()} €`} 
          icon={<DollarSign className="text-emerald-500" />} 
          color="bg-emerald-500/10" 
        />
        <StatCard 
          title="MRR (Revenu Mensuel)" 
          value={`${stats.mrr.toLocaleString()} €`} 
          icon={<TrendingUp className="text-blue-500" />} 
          color="bg-blue-500/10" 
        />
        <StatCard 
          title="Nouveaux Athlètes (Mois)" 
          value={`+${stats.registrations_this_month}`} 
          icon={<UserPlus className="text-purple-500" />} 
          color="bg-purple-500/10" 
        />

        {/* Pilier Communauté & Partenaires */}
        <StatCard 
          title="Total Coachs" 
          value={stats.total_coaches} 
          icon={<Users className="text-[#FF6A00]" />} 
          color="bg-[#FF6A00]/10" 
        />
        <StatCard 
          title="Total Athlètes" 
          value={stats.total_athletes} 
          icon={<Activity className="text-indigo-500" />} 
          color="bg-indigo-500/10" 
        />
        <StatCard 
          title="Gym Partners" 
          value={stats.gym_partners} 
          icon={<Dumbbell className="text-amber-500" />} 
          color="bg-amber-500/10" 
        />
      </div>

      {/* Section Analyse de Croissance (Placeholder pour Graphiques futurs) */}
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white dark:bg-[#16161A] p-10 rounded-2xl border border-slate-200 dark:border-[#262626] text-center shadow-sm">
          <div className="flex flex-col items-center justify-center py-6">
            <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-full mb-4">
              <TrendingUp size={48} className="text-slate-300 dark:text-slate-700" />
            </div>
            <h3 className="text-xl font-bold dark:text-white">Analytique de Croissance</h3>
            <p className="text-slate-500 text-sm max-w-md mx-auto mt-2">
              Les rapports visuels sur l'évolution du chiffre d'affaires et la rétention des utilisateurs s'afficheront ici au fur et à mesure de l'accumulation des données.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Composant de carte statistique réutilisable
 */
const StatCard = ({ title, value, icon, color }) => (
  <div className="bg-white dark:bg-[#16161A] p-6 rounded-2xl border border-slate-200 dark:border-[#26262B] shadow-sm hover:shadow-md transition-all duration-300">
    <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center mb-4`}>
      {icon}
    </div>
    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
      {title}
    </p>
    <p className="text-3xl font-black dark:text-white mt-1 leading-tight">
      {value}
    </p>
  </div>
);

export default AdminDashboard;
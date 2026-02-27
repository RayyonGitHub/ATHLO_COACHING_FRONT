import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/admin/stats/');
        setStats(response.data);
      } catch (error) {
        console.error("Erreur lors de la récupération des statistiques", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return (
    <div className="flex h-64 items-center justify-center text-slate-500 font-bold uppercase tracking-widest animate-pulse">
      Initialisation du cockpit...
    </div>
  );

  return (
    <div className="p-8 max-w-7xl mx-auto animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-2">Dashboard Overview</h1>
          <p className="text-slate-500 text-sm">Real-time performance metrics and system alerts.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Card Revenue */}
        <div className="bg-white dark:bg-[#16161A] p-6 rounded-xl border border-slate-200 dark:border-[#262626]">
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Total Revenue</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white">
            {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(stats.total_revenue)}
          </p>
        </div>

        {/* Card Coaches */}
        <div className="bg-white dark:bg-[#16161A] p-6 rounded-xl border border-slate-200 dark:border-[#262626]">
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Active Coaches</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{stats.total_coaches}</p>
        </div>

        {/* Card KYC / Pending */}
        <div className="bg-white dark:bg-[#16161A] p-6 rounded-xl border border-slate-200 dark:border-[#262626]">
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Pending KYC</p>
          <p className="text-2xl font-black text-[#FF6A00]">{stats.pending_kyc}</p>
        </div>

        {/* Card Gyms */}
        <div className="bg-white dark:bg-[#16161A] p-6 rounded-xl border border-slate-200 dark:border-[#262626]">
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Gym Partners</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{stats.gym_partners}</p>
        </div>
      </div>

      {/* Reste du code visuel (Charts, Activity) inchangé... */}
      <div className="bg-white dark:bg-[#16161A] rounded-xl border border-slate-200 dark:border-[#262626] p-12 text-center">
         <p className="text-slate-400 font-medium">Système prêt. {stats.total_athletes} athlètes monitorés en temps réel.</p>
      </div>
    </div>
  );
};

export default AdminDashboard;
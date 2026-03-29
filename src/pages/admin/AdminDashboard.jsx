import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [athletes, setAthletes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsResponse, athletesResponse] = await Promise.all([
          api.get('/admin/stats/'),
          api.get('/admin/athletes/'),
        ]);

        setStats(statsResponse.data);
        setAthletes(Array.isArray(athletesResponse.data) ? athletesResponse.data : []);
      } catch (error) {
        console.error("Erreur lors de la récupération des données admin", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleDeleteAthlete = async (athleteId) => {
    const confirmed = window.confirm("Voulez-vous vraiment supprimer définitivement cet athlète ?");

    if (!confirmed) return;

    try {
      await api.delete(`/admin/athletes/${athleteId}/delete/`);
      setAthletes((prevAthletes) =>
        prevAthletes.filter((athlete) => athlete.id !== athleteId)
      );
      setStats((prevStats) =>
        prevStats
          ? {
              ...prevStats,
              total_athletes: Math.max((prevStats.total_athletes || 1) - 1, 0),
            }
          : prevStats
      );
    } catch (error) {
      console.error("Erreur lors de la suppression de l'athlète", error);
      alert("Une erreur est survenue lors de la suppression de l'athlète.");
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-slate-500 font-bold uppercase tracking-widest animate-pulse">
        Initialisation du cockpit...
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
            Dashboard Overview
          </h1>
          <p className="text-slate-500 text-sm">
            Real-time performance metrics and system alerts.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-[#16161A] p-6 rounded-xl border border-slate-200 dark:border-[#262626]">
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">
            Total Revenue
          </p>
          <p className="text-2xl font-black text-slate-900 dark:text-white">
            {new Intl.NumberFormat('fr-FR', {
              style: 'currency',
              currency: 'EUR',
            }).format(stats?.total_revenue || 0)}
          </p>
        </div>

        <div className="bg-white dark:bg-[#16161A] p-6 rounded-xl border border-slate-200 dark:border-[#262626]">
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">
            Active Coaches
          </p>
          <p className="text-2xl font-black text-slate-900 dark:text-white">
            {stats?.total_coaches || 0}
          </p>
        </div>

        <div className="bg-white dark:bg-[#16161A] p-6 rounded-xl border border-slate-200 dark:border-[#262626]">
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">
            Pending KYC
          </p>
          <p className="text-2xl font-black text-[#FF6A00]">
            {stats?.pending_kyc || 0}
          </p>
        </div>

        <div className="bg-white dark:bg-[#16161A] p-6 rounded-xl border border-slate-200 dark:border-[#262626]">
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">
            Gym Partners
          </p>
          <p className="text-2xl font-black text-slate-900 dark:text-white">
            {stats?.gym_partners || 0}
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-[#16161A] rounded-xl border border-slate-200 dark:border-[#262626] p-6 mb-8">
        <p className="text-slate-400 font-medium">
          Système prêt. {stats?.total_athletes || 0} athlètes enregistrés.
        </p>
      </div>

      <div className="bg-white dark:bg-[#16161A] rounded-xl border border-slate-200 dark:border-[#262626] overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200 dark:border-[#262626]">
          <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
            Athlètes existants
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Liste des comptes athlètes présents dans la plateforme.
          </p>
        </div>

        {athletes.length === 0 ? (
          <div className="p-8 text-center text-slate-400 font-medium">
            Aucun athlète trouvé.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-slate-50 dark:bg-[#101014]">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-widest text-slate-500">
                    Nom
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-widest text-slate-500">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-widest text-slate-500">
                    Coach
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-widest text-slate-500">
                    Date création
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-widest text-slate-500">
                    Statut
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-widest text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {athletes.map((athlete) => (
                  <tr
                    key={athlete.id}
                    className="border-t border-slate-200 dark:border-[#262626] hover:bg-slate-50 dark:hover:bg-[#1b1b20] transition-colors"
                  >
                    <td className="px-6 py-4 text-sm font-semibold text-slate-900 dark:text-white">
                      {athlete.name || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                      {athlete.email || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                      {athlete.coach_name || 'Non assigné'}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                      {athlete.date || '-'}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${
                          athlete.status === 'Active'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-500/10 dark:text-slate-300'
                        }`}
                      >
                        {athlete.status || 'Active'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleDeleteAthlete(athlete.id)}
                        className="inline-flex items-center rounded-lg bg-red-600 px-4 py-2 text-xs font-bold uppercase tracking-widest text-white transition hover:bg-red-700"
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
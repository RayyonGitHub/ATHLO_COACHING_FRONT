import React, { useState, useEffect } from 'react';
import { UserPlus, ChevronDown, FilterX, Download, Printer, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../../services/api';

const AdminCoachList = () => {
  const [coaches, setCoaches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCoaches();
  }, []);

  const fetchCoaches = async () => {
    try {
      const response = await api.get('/admin/coachs/');
      setCoaches(response.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des coachs", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id, action) => {
    try {
      const response = await api.post(`/admin/coachs/${id}/status/`, { action });
      setCoaches(coaches.map(coach => 
        coach.id === id ? { ...coach, status: response.data.status } : coach
      ));
    } catch (error) {
      console.error(`Erreur lors de l'action ${action}`, error);
    }
  };

  const pendingCount = coaches.filter(c => c.status === 'Pending').length;
  const activeCount = coaches.filter(c => c.status === 'Validated').length;

  return (
    <div className="p-8 max-w-[1200px] mx-auto animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-wrap justify-between items-end gap-4 mb-8">
        <div className="flex flex-col gap-1">
          <h1 className="text-slate-900 dark:text-slate-100 text-3xl md:text-4xl font-black leading-tight tracking-tight">Coach Management</h1>
          <p className="text-slate-500 text-base font-normal">Monitor, verify, and manage professional coaches across the platform.</p>
        </div>
        
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-[#16161A] border border-slate-200 dark:border-[#26262B] p-5 rounded-xl shadow-sm">
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Total Coaches</p>
          <p className="text-3xl font-black text-slate-900 dark:text-slate-100 mt-1">{coaches.length}</p>
        </div>
        <div className="bg-white dark:bg-[#16161A] border border-slate-200 dark:border-[#26262B] p-5 rounded-xl shadow-sm">
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Pending KYC</p>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-3xl font-black text-[#FF6A00]">{pendingCount}</p>
            {pendingCount > 0 && <span className="bg-[#FF6A00]/10 text-[#FF6A00] text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider border border-[#FF6A00]/20">Action Required</span>}
          </div>
        </div>
        <div className="bg-white dark:bg-[#16161A] border border-slate-200 dark:border-[#26262B] p-5 rounded-xl shadow-sm">
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Active Verified</p>
          <p className="text-3xl font-black text-emerald-500 mt-1">{activeCount}</p>
        </div>
        <div className="bg-white dark:bg-[#16161A] border border-slate-200 dark:border-[#26262B] p-5 rounded-xl shadow-sm">
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Avg. Response Time</p>
          <p className="text-3xl font-black text-slate-900 dark:text-slate-100 mt-1">4.2h</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-[#16161A] border border-slate-200 dark:border-[#26262B] rounded-xl mb-6 p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-3">
            <div className="relative">
              <select className="appearance-none bg-slate-50 dark:bg-[#0B0B0F] border border-slate-200 dark:border-[#26262B] text-slate-700 dark:text-slate-300 text-sm font-medium rounded-lg pl-4 pr-10 py-2.5 focus:ring-2 focus:ring-[#FF6A00]/50 focus:border-[#FF6A00] outline-none transition-all">
                <option>All Statuses</option>
                <option>Pending</option>
                <option>Validated</option>
                <option>Suspended</option>
              </select>
              <ChevronDown className="absolute right-3 top-3 text-slate-500 pointer-events-none" size={16} />
            </div>
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-transparent hover:bg-slate-100 dark:hover:bg-[#0B0B0F] text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 text-sm font-medium transition-colors">
              <FilterX size={16} />
              Clear Filters
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-lg text-slate-400 hover:text-[#FF6A00] hover:bg-[#FF6A00]/10 transition-colors"><Download size={20} /></button>
            <button className="p-2 rounded-lg text-slate-400 hover:text-[#FF6A00] hover:bg-[#FF6A00]/10 transition-colors"><Printer size={20} /></button>
          </div>
        </div>
      </div>

      {/* Management Table */}
      <div className="bg-white dark:bg-[#16161A] border border-slate-200 dark:border-[#26262B] rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-[#0B0B0F]/50 border-b border-slate-200 dark:border-[#26262B]">
                <th className="px-6 py-4 text-slate-500 dark:text-slate-400 text-[11px] font-bold uppercase tracking-widest">Coach Name</th>
                <th className="px-6 py-4 text-slate-500 dark:text-slate-400 text-[11px] font-bold uppercase tracking-widest">Specialty</th>
                <th className="px-6 py-4 text-slate-500 dark:text-slate-400 text-[11px] font-bold uppercase tracking-widest">Join Date</th>
                <th className="px-6 py-4 text-slate-500 dark:text-slate-400 text-[11px] font-bold uppercase tracking-widest">KYC Status</th>
                <th className="px-6 py-4 text-slate-500 dark:text-slate-400 text-[11px] font-bold uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#26262B]">
              {loading ? (
                <tr><td colSpan="5" className="p-10 text-center text-slate-500 font-medium">Chargement des données...</td></tr>
              ) : coaches.length === 0 ? (
                <tr><td colSpan="5" className="p-10 text-center text-slate-500 font-medium">Aucun coach trouvé en base.</td></tr>
              ) : (
                coaches.map((coach) => (
                  <tr key={coach.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-[#FF6A00]/10 flex items-center justify-center border border-[#FF6A00]/20 text-[#FF6A00] font-bold shadow-inner">
                          {coach.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-slate-900 dark:text-slate-100 font-bold text-sm">{coach.name}</p>
                          <p className="text-slate-500 text-xs">{coach.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-700 dark:text-slate-300 text-sm font-medium">{coach.specialty}</td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-sm">{coach.date}</td>
                    <td className="px-6 py-4">
                      {coach.status === 'Validated' && <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">Validated</span>}
                      {coach.status === 'Pending' && <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-500 border border-amber-500/20">Pending</span>}
                      {coach.status === 'Suspended' && <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-rose-500/10 text-rose-500 border border-rose-500/20">Suspended</span>}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {coach.status !== 'Validated' && (
                          <button onClick={() => handleToggleStatus(coach.id, 'validate')} className="px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-bold hover:bg-emerald-500 hover:text-white transition-all">Valider</button>
                        )}
                        {coach.status !== 'Suspended' && (
                          <button onClick={() => handleToggleStatus(coach.id, 'ban')} className="px-4 py-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-bold hover:bg-rose-500 hover:text-white transition-all">Bannir</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-[#26262B] bg-slate-50 dark:bg-[#0B0B0F]/30">
          <div className="text-sm text-slate-500 font-medium">
            Showing <span className="text-slate-900 dark:text-slate-100 font-bold">1-{coaches.length}</span> of <span className="text-slate-900 dark:text-slate-100 font-bold">{coaches.length}</span> coaches
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-lg border border-slate-200 dark:border-[#26262B] text-slate-400 hover:bg-slate-100 dark:hover:bg-[#16161A] disabled:opacity-50 transition-colors"><ChevronLeft size={16} /></button>
            <div className="flex items-center gap-1">
              <button className="w-8 h-8 rounded-lg bg-[#FF6A00] text-white text-sm font-bold shadow-md">1</button>
            </div>
            <button className="p-2 rounded-lg border border-slate-200 dark:border-[#26262B] text-slate-400 hover:bg-slate-100 dark:hover:bg-[#16161A] disabled:opacity-50 transition-colors"><ChevronRight size={16} /></button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCoachList;
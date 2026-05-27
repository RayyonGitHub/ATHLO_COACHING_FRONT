import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { Users, FileText, UserCheck, UserX, Trash2 } from 'lucide-react';

const AdminAthleteList = () => {
  const [activeTab, setActiveTab] = useState('athletes');
  const [athletes, setAthletes] = useState([]);
  const [prospects, setProspects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'athletes') {
        const res = await adminAPI.getAthletes();
        setAthletes((res.data || []).filter((user) => user.role === 'athlete'));
      } else {
        const res = await adminAPI.getProspects();
        setProspects(res.data);
      }
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  const handleToggleAthleteStatus = async (id, action) => {
    try {
      await adminAPI.toggleStatus(id, action);
      fetchData(); // Rafraîchit pour voir le changement de statut
    } catch (error) { alert("Erreur lors du changement de statut."); }
  };

  const handleDeleteAthlete = async (id) => {
    if (!window.confirm("Supprimer définitivement cet athlète ? Cette action est irréversible.")) return;
    try {
      await adminAPI.deleteAthlete(id);
      setAthletes(athletes.filter(a => a.id !== id));
    } catch (error) { alert("Erreur lors de la suppression."); }
  };

  return (
    <div className="p-8 max-w-[1200px] mx-auto animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-black dark:text-white">Base Sportifs & Prospects</h1>
        <p className="text-slate-500">Contrôle complet des accès et suivi des demandes.</p>
      </div>

      <div className="flex gap-4 mb-6 border-b border-slate-200 dark:border-[#26262B]">
        <button onClick={() => setActiveTab('athletes')} className={`pb-3 px-2 text-sm font-bold border-b-2 transition-all ${activeTab === 'athletes' ? 'border-[#FF6A00] text-[#FF6A00]' : 'border-transparent text-slate-500'}`}>
          Athlètes Inscrits ({athletes.length})
        </button>
        <button onClick={() => setActiveTab('prospects')} className={`pb-3 px-2 text-sm font-bold border-b-2 transition-all ${activeTab === 'prospects' ? 'border-[#FF6A00] text-[#FF6A00]' : 'border-transparent text-slate-500'}`}>
          Demandes de Devis ({prospects.length})
        </button>
      </div>

      {activeTab === 'athletes' && (
        <div className="bg-white dark:bg-[#16161A] border border-slate-200 dark:border-[#26262B] rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-[#0B0B0F]/50 border-b border-slate-200 dark:border-[#26262B]">
                <th className="px-6 py-4 text-[11px] font-bold uppercase text-slate-500">Sportif</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase text-slate-500">Coach</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase text-slate-500 text-center">Statut</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase text-slate-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#26262B]">
              {loading ? <tr><td colSpan="4" className="p-8 text-center text-slate-500">Chargement...</td></tr> : 
               athletes.map((a) => (
                <tr key={a.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold dark:text-white">{a.name}</p>
                    <p className="text-xs text-slate-500">{a.email}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-bold text-indigo-500">{a.coach_name}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {a.status === 'Active' 
                      ? <span className="bg-emerald-500/10 text-emerald-500 px-2 py-1 rounded text-[10px] font-bold uppercase">Actif</span>
                      : <span className="bg-rose-500/10 text-rose-500 px-2 py-1 rounded text-[10px] font-bold uppercase">Inactif</span>}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      {a.status === 'Active' ? (
                        <button onClick={() => handleToggleAthleteStatus(a.id, 'ban')} className="p-2 text-amber-500 hover:bg-amber-50 rounded-lg" title="Suspendre">
                          <UserX size={18} />
                        </button>
                      ) : (
                        <button onClick={() => handleToggleAthleteStatus(a.id, 'activate')} className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-lg" title="Réactiver">
                          <UserCheck size={18} />
                        </button>
                      )}
                      <button onClick={() => handleDeleteAthlete(a.id)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg" title="Supprimer définitivement">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* (Garder le bloc Prospects identique à la version précédente) */}
    </div>
  );
};

export default AdminAthleteList;

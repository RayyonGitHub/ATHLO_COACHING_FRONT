import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { 
  Edit2, Key, LogOut, Users, DollarSign, Star
} from 'lucide-react';

const AdminCoachList = () => {
  const [coaches, setCoaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingCoach, setEditingCoach] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    fetchCoaches();
  }, []);

  const fetchCoaches = async () => {
    try {
      const response = await adminAPI.getCoaches();
      setCoaches(response.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des coachs", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      await adminAPI.updateUser(editingCoach.id, {
        first_name: editingCoach.first_name,
        last_name: editingCoach.last_name,
        email: editingCoach.email
      });
      setIsModalOpen(false);
      fetchCoaches();
    } catch (error) {
      alert("Erreur lors de la sauvegarde.");
    }
  };

  const handleChangePassword = async () => {
    if (!newPassword) return alert("Veuillez entrer un nouveau mot de passe.");
    try {
      await adminAPI.changePassword(editingCoach.id, newPassword);
      alert("Mot de passe modifié avec succès.");
      setNewPassword('');
    } catch (error) {
      alert("Erreur lors du changement de mot de passe.");
    }
  };

  const handleForceLogout = async () => {
    try {
      await adminAPI.forceLogout(editingCoach.id);
      alert("L'utilisateur a été déconnecté de force.");
    } catch (error) {
      alert("Erreur lors de la déconnexion forcée.");
    }
  };

  const handleToggleStatus = async (id, action) => {
    // Si on bannit, on prévient l'admin
    if (action === 'ban' && !window.confirm("Êtes-vous sûr de vouloir suspendre ce coach ? Il n'aura plus accès à la plateforme.")) return;
    
    try {
      // Pour l'action "valider", ton backend attend un changement de is_active
      await adminAPI.toggleStatus(id, action);
      fetchCoaches(); // On rafraîchit la liste complète
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
          <h1 className="text-slate-900 dark:text-slate-100 text-3xl md:text-4xl font-black leading-tight tracking-tight">Gestion des Coachs</h1>
          <p className="text-slate-500 text-base font-normal">Contrôlez les accès (KYC) et surveillez les performances financières.</p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-[#16161A] border border-slate-200 dark:border-[#26262B] p-5 rounded-xl shadow-sm">
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Total Coachs</p>
          <p className="text-3xl font-black text-slate-900 dark:text-slate-100 mt-1">{coaches.length}</p>
        </div>
        <div className="bg-white dark:bg-[#16161A] border border-slate-200 dark:border-[#26262B] p-5 rounded-xl shadow-sm">
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">KYC en attente</p>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-3xl font-black text-[#FF6A00]">{pendingCount}</p>
            {pendingCount > 0 && <span className="bg-[#FF6A00]/10 text-[#FF6A00] text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider border border-[#FF6A00]/20">À traiter</span>}
          </div>
        </div>
        <div className="bg-white dark:bg-[#16161A] border border-slate-200 dark:border-[#26262B] p-5 rounded-xl shadow-sm">
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Coachs Actifs</p>
          <p className="text-3xl font-black text-emerald-500 mt-1">{activeCount}</p>
        </div>
        <div className="bg-white dark:bg-[#16161A] border border-slate-200 dark:border-[#26262B] p-5 rounded-xl shadow-sm">
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">CA Global Généré</p>
          <p className="text-3xl font-black text-slate-900 dark:text-slate-100 mt-1">
            {coaches.reduce((sum, c) => sum + (c.revenus || 0), 0).toLocaleString()} €
          </p>
        </div>
      </div>

      {/* Management Table */}
      <div className="bg-white dark:bg-[#16161A] border border-slate-200 dark:border-[#26262B] rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-[#0B0B0F]/50 border-b border-slate-200 dark:border-[#26262B]">
                <th className="px-6 py-4 text-slate-500 dark:text-slate-400 text-[11px] font-bold uppercase tracking-widest">Identité du Coach</th>
                <th className="px-6 py-4 text-slate-500 dark:text-slate-400 text-[11px] font-bold uppercase tracking-widest text-center">Performances</th>
                <th className="px-6 py-4 text-slate-500 dark:text-slate-400 text-[11px] font-bold uppercase tracking-widest text-center">Statut KYC</th>
                <th className="px-6 py-4 text-slate-500 dark:text-slate-400 text-[11px] font-bold uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#26262B]">
              {loading ? (
                <tr><td colSpan="4" className="p-10 text-center text-slate-500 font-medium">Chargement des données...</td></tr>
              ) : coaches.length === 0 ? (
                <tr><td colSpan="4" className="p-10 text-center text-slate-500 font-medium">Aucun coach inscrit pour le moment.</td></tr>
              ) : (
                coaches.map((coach) => (
                  <tr key={coach.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                    
                    {/* Colonne 1: Identité */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-[#FF6A00]/10 flex items-center justify-center border border-[#FF6A00]/20 text-[#FF6A00] font-bold shadow-inner">
                          {coach.name ? coach.name.charAt(0).toUpperCase() : '?'}
                        </div>
                        <div>
                          <p className="text-slate-900 dark:text-slate-100 font-bold text-sm">{coach.name}</p>
                          <p className="text-slate-500 text-xs">{coach.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Colonne 2: Performances (NOUVEAU) */}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-4 text-slate-600 dark:text-slate-400">
                        <div className="flex items-center gap-1.5" title="Nombre de clients">
                          <Users size={14} className="text-indigo-400"/>
                          <span className="text-xs font-bold">{coach.nb_clients}</span>
                        </div>
                        <div className="flex items-center gap-1.5" title="Revenus générés">
                          <DollarSign size={14} className="text-emerald-500"/>
                          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{coach.revenus} €</span>
                        </div>
                        <div className="flex items-center gap-1.5" title="Note moyenne">
                          <Star size={14} className="text-amber-400"/>
                          <span className="text-xs font-bold">{coach.note}</span>
                        </div>
                      </div>
                    </td>

                    {/* Colonne 3: Statut */}
                    <td className="px-6 py-4 text-center">
                      {coach.status === 'Validated' && <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">Actif</span>}
                      {coach.status === 'Pending' && <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-500 border border-amber-500/20">En attente</span>}
                      {coach.status === 'Suspended' && <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-rose-500/10 text-rose-500 border border-rose-500/20">Suspendu</span>}
                    </td>

                    {/* Colonne 4: Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => { setEditingCoach(coach); setIsModalOpen(true); }}
                          className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg text-[#FF6A00]"
                          title="Modifier les infos"
                        >
                          <Edit2 size={16} />
                        </button>
                        
                        {/* Bouton de validation (si non actif) */}
                        {coach.status !== 'Validated' && (
                          <button onClick={() => handleToggleStatus(coach.id, 'validate')} className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-bold hover:bg-emerald-500 hover:text-white transition-all">Valider</button>
                        )}
                        
                        {/* Bouton de suspension (si actif) */}
                        {coach.status === 'Validated' && (
                          <button onClick={() => handleToggleStatus(coach.id, 'ban')} className="px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-bold hover:bg-rose-500 hover:text-white transition-all">Suspendre</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODALE D'ÉDITION (Restée identique pour le profil et la sécu) */}
      {isModalOpen && editingCoach && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#16161A] p-6 rounded-xl shadow-xl w-full max-w-md border border-slate-200 dark:border-[#26262B] max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-black mb-6 dark:text-white">Paramètres Coach : {editingCoach.name}</h3>
            
            <form onSubmit={handleUpdateUser} className="space-y-4 border-b border-slate-100 dark:border-[#26262B] pb-6">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Profil Général</p>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Prénom</label>
                <input type="text" className="w-full border border-slate-200 dark:border-[#26262B] dark:bg-[#0B0B0F] p-2.5 rounded-lg text-sm dark:text-white" value={editingCoach.first_name || ''} onChange={(e) => setEditingCoach({...editingCoach, first_name: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Nom</label>
                <input type="text" className="w-full border border-slate-200 dark:border-[#26262B] dark:bg-[#0B0B0F] p-2.5 rounded-lg text-sm dark:text-white" value={editingCoach.last_name || ''} onChange={(e) => setEditingCoach({...editingCoach, last_name: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Adresse Email</label>
                <input type="email" className="w-full border border-slate-200 dark:border-[#26262B] dark:bg-[#0B0B0F] p-2.5 rounded-lg text-sm dark:text-white" value={editingCoach.email || ''} onChange={(e) => setEditingCoach({...editingCoach, email: e.target.value})} />
              </div>
              <button type="submit" className="w-full py-2.5 bg-[#FF6A00] text-white font-bold rounded-lg text-sm hover:scale-[1.02] transition-transform">
                Mettre à jour
              </button>
            </form>

            <div className="py-6 space-y-4 border-b border-slate-100 dark:border-[#26262B]">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sécurité</p>
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-500">Forcer le mot de passe</label>
                <div className="flex gap-2">
                  <input type="password" className="flex-1 border border-slate-200 dark:border-[#26262B] dark:bg-[#0B0B0F] p-2.5 rounded-lg text-sm dark:text-white" placeholder="Nouveau mot de passe" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                  <button onClick={handleChangePassword} className="px-4 bg-slate-800 text-white rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-slate-700">
                    <Key size={14} /> OK
                  </button>
                </div>
              </div>
              <button onClick={handleForceLogout} className="w-full py-2.5 border border-rose-500/30 text-rose-500 font-bold rounded-lg text-xs hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center gap-2">
                <LogOut size={14} /> Déconnecter de tous les appareils
              </button>
            </div>

            <div className="mt-6 flex justify-end">
              <button onClick={() => { setIsModalOpen(false); setNewPassword(''); }} className="px-6 py-2 text-sm font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors">Fermer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCoachList;
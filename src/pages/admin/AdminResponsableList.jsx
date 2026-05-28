import React, { useState, useEffect } from 'react';
import { User, Trash2, Plus, Building2, Mail, Phone } from 'lucide-react';
import api from '../../services/api';

const AdminResponsableList = () => {
  const [responsables, setResponsables] = useState([]);
  const [salles, setSalles] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    // Mot de passe retiré d'ici
    telephone: '',
    salle_id: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const resResponsables = await api.get('/admin/responsables/');
      setResponsables(resResponsables.data);
      
      const resSalles = await api.get('/admin/salles/');
      setSalles(resSalles.data);
    } catch (error) {
      console.error("Erreur chargement données", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/responsables/', formData);
      setIsModalOpen(false);
      // Mot de passe retiré du reset
      setFormData({ first_name: '', last_name: '', email: '', telephone: '', salle_id: '' });
      fetchData(); 
    } catch (error) {
      console.error("Erreur création", error);
      alert(error.response?.data?.error || "Erreur lors de la création du responsable.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce responsable ? Cela supprimera son accès définitivement.")) return;
    try {
      await api.delete(`/admin/responsables/${id}/`);
      setResponsables(responsables.filter(r => r.id !== id));
    } catch (error) {
      console.error("Erreur suppression", error);
      alert("Erreur lors de la suppression.");
    }
  };

  return (
    <div className="p-8 max-w-[1200px] mx-auto animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-wrap justify-between items-end gap-4 mb-8">
        <div className="flex flex-col gap-1">
          <h1 className="text-slate-900 dark:text-slate-100 text-3xl md:text-4xl font-black leading-tight tracking-tight">Gestion des Responsables</h1>
          <p className="text-slate-500 text-base font-normal">Gérez les accès administratifs pour les responsables de vos salles partenaires.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#FF6A00] text-white font-bold rounded-lg hover:bg-orange-600 transition-colors"
        >
          <Plus size={18} />
          Ajouter un responsable
        </button>
      </div>

      {/* Management Table */}
      <div className="bg-white dark:bg-[#16161A] border border-slate-200 dark:border-[#26262B] rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-[#0B0B0F]/50 border-b border-slate-200 dark:border-[#26262B]">
                <th className="px-6 py-4 text-slate-500 dark:text-slate-400 text-[11px] font-bold uppercase tracking-widest">Identité</th>
                <th className="px-6 py-4 text-slate-500 dark:text-slate-400 text-[11px] font-bold uppercase tracking-widest">Contact</th>
                <th className="px-6 py-4 text-slate-500 dark:text-slate-400 text-[11px] font-bold uppercase tracking-widest text-center">Salle Assignée</th>
                <th className="px-6 py-4 text-slate-500 dark:text-slate-400 text-[11px] font-bold uppercase tracking-widest text-center">Statut</th>
                <th className="px-6 py-4 text-slate-500 dark:text-slate-400 text-[11px] font-bold uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#26262B]">
              {loading ? (
                <tr><td colSpan="5" className="p-10 text-center text-slate-500 font-medium">Chargement des données...</td></tr>
              ) : responsables.length === 0 ? (
                <tr><td colSpan="5" className="p-10 text-center text-slate-500 font-medium">Aucun responsable enregistré.</td></tr>
              ) : (
                responsables.map((resp) => (
                  <tr key={resp.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                    
                    {/* Identité */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-[#FF6A00]/10 flex items-center justify-center border border-[#FF6A00]/20 text-[#FF6A00] font-bold shadow-inner">
                          <User size={18} />
                        </div>
                        <div>
                          <p className="text-slate-900 dark:text-slate-100 font-bold text-sm">{resp.name}</p>
                          <p className="text-[10px] text-slate-500 font-mono tracking-wider mt-0.5">ID: {resp.id}</p>
                        </div>
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col text-slate-400">
                        <span className="flex items-center gap-1.5 text-sm font-medium dark:text-slate-300">
                          <Mail size={14} /> {resp.email}
                        </span>
                        <span className="flex items-center gap-1.5 text-xs mt-1">
                          <Phone size={14} /> {resp.telephone || 'Non renseigné'}
                        </span>
                      </div>
                    </td>

                    {/* Salle Assignée */}
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10">
                        <Building2 size={12} />
                        {resp.salle_nom}
                      </span>
                    </td>

                    {/* Statut */}
                    <td className="px-6 py-4 text-center">
                      {resp.status === 'Active' ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">Actif</span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-rose-500/10 text-rose-500 border border-rose-500/20">Inactif</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleDelete(resp.id)} 
                        className="p-2 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors"
                        title="Supprimer ce responsable"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODALE DE CRÉATION */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#16161A] p-6 rounded-xl shadow-xl w-full max-w-md border border-slate-200 dark:border-[#26262B] max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-black mb-6 dark:text-white">Créer un Responsable</h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Prénom</label>
                  <input type="text" name="first_name" required value={formData.first_name} onChange={handleInputChange} className="w-full border border-slate-200 dark:border-[#26262B] dark:bg-[#0B0B0F] p-2.5 rounded-lg text-sm dark:text-white focus:border-[#FF6A00] outline-none transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Nom</label>
                  <input type="text" name="last_name" required value={formData.last_name} onChange={handleInputChange} className="w-full border border-slate-200 dark:border-[#26262B] dark:bg-[#0B0B0F] p-2.5 rounded-lg text-sm dark:text-white focus:border-[#FF6A00] outline-none transition-colors" />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Adresse Email</label>
                <input type="email" name="email" required value={formData.email} onChange={handleInputChange} className="w-full border border-slate-200 dark:border-[#26262B] dark:bg-[#0B0B0F] p-2.5 rounded-lg text-sm dark:text-white focus:border-[#FF6A00] outline-none transition-colors" />
              </div>
              
              {/* Le champ mot de passe a été supprimé ici */}
              
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Téléphone</label>
                <input type="text" name="telephone" value={formData.telephone} onChange={handleInputChange} className="w-full border border-slate-200 dark:border-[#26262B] dark:bg-[#0B0B0F] p-2.5 rounded-lg text-sm dark:text-white focus:border-[#FF6A00] outline-none transition-colors" placeholder="Optionnel" />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Salle à assigner</label>
                <select name="salle_id" required value={formData.salle_id} onChange={handleInputChange} className="w-full border border-slate-200 dark:border-[#26262B] dark:bg-[#0B0B0F] p-2.5 rounded-lg text-sm dark:text-white focus:border-[#FF6A00] outline-none transition-colors">
                  <option value="">Sélectionner une salle...</option>
                  {salles.map(s => (
                    <option key={s.id} value={s.id}>{s.nom} ({s.ville})</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-4 mt-6 border-t border-slate-100 dark:border-[#26262B]">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors">
                  Annuler
                </button>
                <button type="submit" className="flex-1 py-2.5 bg-[#FF6A00] text-white font-bold rounded-lg text-sm hover:scale-[1.02] transition-transform">
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminResponsableList;
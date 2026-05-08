import React, { useState, useEffect } from 'react';
import { Dumbbell, MapPin, Trash2, Plus, X } from 'lucide-react';
import api from '../../services/api';

const AdminGymList = () => {
  const [gyms, setGyms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  // États pour le formulaire de création
  const [newGym, setNewGym] = useState({ nom: '', adresse: '', ville: '', latitude: '', longitude: '' });

  const fetchGyms = async () => {
    try {
      const response = await api.get('/admin/salles/');
      setGyms(response.data);
    } catch (error) {
      console.error("Erreur chargement salles", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGyms();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer cette salle ? Cela retirera l'affiliation des coachs qui y sont liés.")) return;
    try {
      await api.delete(`/admin/salles/${id}/`);
      setGyms(gyms.filter(g => g.id !== id));
    } catch (error) {
      console.error("Erreur suppression", error);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      // Conversion des coordonnées en float ou null
      const payload = {
        ...newGym,
        latitude: newGym.latitude ? parseFloat(newGym.latitude) : null,
        longitude: newGym.longitude ? parseFloat(newGym.longitude) : null,
      };
      
      const response = await api.post('/admin/salles/', payload);
      setGyms([response.data, ...gyms]);
      setShowForm(false);
      setNewGym({ nom: '', adresse: '', ville: '', latitude: '', longitude: '' });
    } catch (error) {
      console.error("Erreur création", error);
      alert("Erreur lors de la création de la salle.");
    }
  };

  if (loading) return <div className="p-8 text-white">Chargement des salles...</div>;

  return (
    <div className="p-8 max-w-[1200px] mx-auto animate-in fade-in duration-500">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white">Gestion des Salles</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Gérez le catalogue des salles partenaires.</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-[#FF6A00] text-white font-bold rounded-lg hover:bg-orange-600 transition-colors"
        >
          {showForm ? <X size={18} /> : <Plus size={18} />}
          {showForm ? 'Annuler' : 'Ajouter une salle'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white dark:bg-[#16161A] p-6 rounded-xl border border-slate-200 dark:border-[#262626] mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase">Nom de la salle</label>
            <input required type="text" value={newGym.nom} onChange={e => setNewGym({...newGym, nom: e.target.value})} className="w-full mt-1 p-2 bg-slate-50 dark:bg-[#0B0B0F] border border-slate-200 dark:border-[#262626] rounded text-white" placeholder="Ex: Basic-Fit" />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase">Ville</label>
            <input required type="text" value={newGym.ville} onChange={e => setNewGym({...newGym, ville: e.target.value})} className="w-full mt-1 p-2 bg-slate-50 dark:bg-[#0B0B0F] border border-slate-200 dark:border-[#262626] rounded text-white" placeholder="Ex: Paris" />
          </div>
          <div className="md:col-span-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Adresse complète</label>
            <input required type="text" value={newGym.adresse} onChange={e => setNewGym({...newGym, adresse: e.target.value})} className="w-full mt-1 p-2 bg-slate-50 dark:bg-[#0B0B0F] border border-slate-200 dark:border-[#262626] rounded text-white" placeholder="Ex: 12 rue de la Paix" />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase">Latitude (Optionnel)</label>
            <input type="number" step="any" value={newGym.latitude} onChange={e => setNewGym({...newGym, latitude: e.target.value})} className="w-full mt-1 p-2 bg-slate-50 dark:bg-[#0B0B0F] border border-slate-200 dark:border-[#262626] rounded text-white" placeholder="Ex: 48.8566" />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase">Longitude (Optionnel)</label>
            <input type="number" step="any" value={newGym.longitude} onChange={e => setNewGym({...newGym, longitude: e.target.value})} className="w-full mt-1 p-2 bg-slate-50 dark:bg-[#0B0B0F] border border-slate-200 dark:border-[#262626] rounded text-white" placeholder="Ex: 2.3522" />
          </div>
          <div className="md:col-span-2 flex justify-end mt-2">
            <button type="submit" className="px-6 py-2 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700">Enregistrer la salle</button>
          </div>
        </form>
      )}

      <div className="bg-white dark:bg-[#16161A] rounded-xl border border-slate-200 dark:border-[#262626] overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-[#0B0B0F]/50 border-b border-slate-200 dark:border-[#262626]">
              <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase">Nom de la salle</th>
              <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase">Localisation</th>
              <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase text-center">Coachs affiliés</th>
              <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-[#262626]">
            {gyms.length === 0 ? (
              <tr><td colSpan="4" className="text-center py-8 text-slate-500">Aucune salle enregistrée.</td></tr>
            ) : (
              gyms.map((gym) => (
                <tr key={gym.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#FF6A00]/10 border border-[#FF6A00]/20 flex items-center justify-center">
                        <Dumbbell size={18} className="text-[#FF6A00]" />
                      </div>
                      <div>
                        <p className="text-sm font-bold dark:text-white">{gym.nom}</p>
                        <p className="text-[10px] text-slate-500 font-mono tracking-wider mt-0.5">ID: {gym.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col text-slate-400">
                      <span className="flex items-center gap-1.5 text-sm font-medium dark:text-slate-300">
                        <MapPin size={14} /> {gym.ville}
                      </span>
                      <span className="text-xs mt-1 ml-5">{gym.adresse}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center justify-center min-w-[28px] h-6 px-2 rounded-full text-xs font-bold bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300">
                      {gym.nb_coachs || 0}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => handleDelete(gym.id)} className="p-2 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors">
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
  );
};

export default AdminGymList;
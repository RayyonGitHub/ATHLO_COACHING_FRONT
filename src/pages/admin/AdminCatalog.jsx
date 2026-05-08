import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { Database, ShoppingBag, Plus, Trash2, Edit2, X } from 'lucide-react';

const AdminCatalog = () => {
  const [activeTab, setActiveTab] = useState('exercices');
  const [loading, setLoading] = useState(true);

  // --- États Exercices ---
  const [exercices, setExercices] = useState([]);
  const [showExModal, setShowExModal] = useState(false);
  const [editingEx, setEditingEx] = useState(null);
  const [exForm, setExForm] = useState({ nom: '', description: '', categorie: 'FORCE', muscle_principal: '', video_url: '' });

  // --- États Catégories ---
  const [categories, setCategories] = useState([]);
  const [newCatName, setNewCatName] = useState('');

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'exercices') {
        const res = await adminAPI.getAdminExercices();
        setExercices(res.data);
      } else {
        const res = await adminAPI.getAdminCategories();
        setCategories(res.data);
      }
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  // --- Handler Exercices ---
  const handleSaveExercice = async (e) => {
    e.preventDefault();
    try {
      if (editingEx) {
        await adminAPI.updateAdminExercice(editingEx.id, exForm);
      } else {
        await adminAPI.createAdminExercice(exForm);
      }
      setShowExModal(false);
      setEditingEx(null);
      setExForm({ nom: '', description: '', categorie: 'FORCE', muscle_principal: '', video_url: '' });
      fetchData();
    } catch (error) { alert("Erreur d'enregistrement."); }
  };

  const handleDeleteExercice = async (id) => {
    if (!window.confirm("Supprimer cet exercice de la base ?")) return;
    try {
      await adminAPI.deleteAdminExercice(id);
      setExercices(exercices.filter(e => e.id !== id));
    } catch (error) { alert("Erreur suppression."); }
  };

  // --- Handler Catégories ---
  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCatName) return;
    try {
      const res = await adminAPI.createAdminCategory({ nom: newCatName });
      setCategories([res.data, ...categories]);
      setNewCatName('');
    } catch (error) { alert("Erreur création."); }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm("Supprimer cette catégorie ?")) return;
    try {
      await adminAPI.deleteAdminCategory(id);
      setCategories(categories.filter(c => c.id !== id));
    } catch (error) { alert("Impossible, elle contient peut-être des produits."); }
  };

  return (
    <div className="p-8 max-w-[1200px] mx-auto animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-black dark:text-white">Catalogue Global</h1>
        <p className="text-slate-500">Gérez la base de données des exercices et l'arborescence de la boutique.</p>
      </div>

      <div className="flex gap-4 mb-6 border-b border-slate-200 dark:border-[#26262B]">
        <button onClick={() => setActiveTab('exercices')} className={`flex items-center gap-2 pb-3 px-2 text-sm font-bold border-b-2 transition-all ${activeTab === 'exercices' ? 'border-[#FF6A00] text-[#FF6A00]' : 'border-transparent text-slate-500'}`}>
          <Database size={18} /> Banque d'Exercices ({activeTab === 'exercices' ? exercices.length : '...'})
        </button>
        <button onClick={() => setActiveTab('categories')} className={`flex items-center gap-2 pb-3 px-2 text-sm font-bold border-b-2 transition-all ${activeTab === 'categories' ? 'border-[#FF6A00] text-[#FF6A00]' : 'border-transparent text-slate-500'}`}>
          <ShoppingBag size={18} /> Catégories Boutique ({activeTab === 'categories' ? categories.length : '...'})
        </button>
      </div>

      {/* --- ONGLET EXERCICES --- */}
      {activeTab === 'exercices' && (
        <>
          <div className="mb-4 flex justify-end">
            <button onClick={() => { setEditingEx(null); setExForm({ nom: '', description: '', categorie: 'FORCE', muscle_principal: '', video_url: '' }); setShowExModal(true); }} className="flex items-center gap-2 px-4 py-2 bg-[#FF6A00] text-white font-bold rounded-lg text-sm hover:bg-orange-600 transition">
              <Plus size={16} /> Ajouter un Exercice
            </button>
          </div>
          <div className="bg-white dark:bg-[#16161A] border border-slate-200 dark:border-[#26262B] rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 dark:bg-[#0B0B0F]/50 border-b border-slate-200 dark:border-[#26262B]">
                  <th className="px-6 py-4 text-[11px] font-bold uppercase text-slate-500">Nom</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase text-slate-500">Catégorie</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase text-slate-500">Muscle</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase text-slate-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#26262B]">
                {loading ? <tr><td colSpan="4" className="p-8 text-center text-slate-500">Chargement...</td></tr> : 
                 exercices.map(ex => (
                  <tr key={ex.id} className="hover:bg-slate-50 dark:hover:bg-white/5">
                    <td className="px-6 py-4 font-bold text-sm dark:text-white">{ex.nom}</td>
                    <td className="px-6 py-4"><span className="text-xs bg-slate-100 dark:bg-white/10 px-2 py-1 rounded dark:text-slate-300">{ex.categorie}</span></td>
                    <td className="px-6 py-4 text-sm text-slate-500">{ex.muscle_principal || '-'}</td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => { setEditingEx(ex); setExForm(ex); setShowExModal(true); }} className="p-2 text-slate-400 hover:text-[#FF6A00]"><Edit2 size={16} /></button>
                      <button onClick={() => handleDeleteExercice(ex.id)} className="p-2 text-slate-400 hover:text-rose-500"><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Modal Exercice */}
          {showExModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
              <div className="bg-white dark:bg-[#16161A] p-6 rounded-xl w-full max-w-md border border-slate-200 dark:border-[#26262B]">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold dark:text-white">{editingEx ? 'Modifier Exercice' : 'Nouvel Exercice'}</h3>
                  <button onClick={() => setShowExModal(false)} className="text-slate-500"><X size={20}/></button>
                </div>
                <form onSubmit={handleSaveExercice} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Nom *</label>
                    <input required type="text" className="w-full bg-slate-50 dark:bg-[#0B0B0F] border border-slate-200 dark:border-[#26262B] p-2 rounded text-sm dark:text-white" value={exForm.nom} onChange={e => setExForm({...exForm, nom: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Catégorie</label>
                    <select className="w-full bg-slate-50 dark:bg-[#0B0B0F] border border-slate-200 dark:border-[#26262B] p-2 rounded text-sm dark:text-white" value={exForm.categorie} onChange={e => setExForm({...exForm, categorie: e.target.value})}>
                      <option value="FORCE">Force</option><option value="CARDIO">Cardio</option><option value="SOUPLESSE">Souplesse</option><option value="ALTERO">Haltérophilie</option><option value="GYM">Gym</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Muscle Principal</label>
                    <input type="text" className="w-full bg-slate-50 dark:bg-[#0B0B0F] border border-slate-200 dark:border-[#26262B] p-2 rounded text-sm dark:text-white" value={exForm.muscle_principal} onChange={e => setExForm({...exForm, muscle_principal: e.target.value})} />
                  </div>
                  <button type="submit" className="w-full py-2 bg-[#FF6A00] text-white font-bold rounded mt-4">Sauvegarder</button>
                </form>
              </div>
            </div>
          )}
        </>
      )}

      {/* --- ONGLET CATÉGORIES BOUTIQUE --- */}
      {activeTab === 'categories' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <form onSubmit={handleAddCategory} className="bg-white dark:bg-[#16161A] border border-slate-200 dark:border-[#26262B] p-5 rounded-xl shadow-sm">
              <h3 className="font-bold text-sm mb-4 dark:text-white">Créer une catégorie</h3>
              <input type="text" placeholder="Ex: Nutrition, Équipement..." value={newCatName} onChange={e => setNewCatName(e.target.value)} className="w-full bg-slate-50 dark:bg-[#0B0B0F] border border-slate-200 dark:border-[#26262B] p-2.5 rounded-lg text-sm mb-3 dark:text-white" required />
              <button type="submit" className="w-full py-2 bg-indigo-600 text-white font-bold rounded-lg text-sm hover:bg-indigo-700 transition">Ajouter</button>
            </form>
          </div>
          <div className="md:col-span-2 bg-white dark:bg-[#16161A] border border-slate-200 dark:border-[#26262B] rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 dark:bg-[#0B0B0F]/50 border-b border-slate-200 dark:border-[#26262B]">
                  <th className="px-6 py-4 text-[11px] font-bold uppercase text-slate-500">Nom de la catégorie</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase text-slate-500">Slug URL</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase text-slate-500 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#26262B]">
                {loading ? <tr><td colSpan="3" className="p-8 text-center text-slate-500">Chargement...</td></tr> : 
                 categories.map(cat => (
                  <tr key={cat.id} className="hover:bg-slate-50 dark:hover:bg-white/5">
                    <td className="px-6 py-4 font-bold text-sm dark:text-white">{cat.nom}</td>
                    <td className="px-6 py-4 text-sm text-slate-500 font-mono">{cat.slug}</td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => handleDeleteCategory(cat.id)} className="p-2 text-slate-400 hover:text-rose-500"><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCatalog;
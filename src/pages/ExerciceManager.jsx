import React, { useState, useEffect } from 'react';
import { Plus, Search, X, Activity, PlaySquare } from 'lucide-react';
import api from '../services/api';

const ExerciceManager = () => {
  const [exercices, setExercices] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    nom: '',
    description: '',
    categorie: 'FORCE',
    muscle_principal: '',
    video_url: ''
  });

  const categories = [
    { value: 'FORCE', label: 'Force & Musculation' },
    { value: 'CARDIO', label: 'Cardio & Endurance' },
    { value: 'SOUPLESSE', label: 'Souplesse & Mobilité' },
    { value: 'ALTERO', label: 'Haltérophilie' },
    { value: 'GYM', label: 'Gymnastique / Poids de corps' }
  ];

  useEffect(() => {
    fetchExercices();
  }, []);

  const fetchExercices = async () => {
    try {
      setLoading(true);
      const response = await api.get('/exercices/');
      setExercices(response.data);
    } catch (error) {
      console.error("Erreur lors du chargement des exercices:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/exercices/', formData);
      fetchExercices();
      setIsModalOpen(false);
      setFormData({ nom: '', description: '', categorie: 'FORCE', muscle_principal: '', video_url: '' });
    } catch (error) {
      console.error("Erreur lors de la création de l'exercice:", error);
      alert("Erreur lors de la création. Cet exercice existe peut-être déjà ?");
    }
  };

  const filteredExercices = exercices.filter(exo => 
    exo.nom.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (exo.muscle_principal && exo.muscle_principal.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="p-8 max-w-7xl mx-auto flex flex-col gap-6 animate-in fade-in duration-500 h-full">
      
      {/* Header */}
      <div className="flex justify-between items-end shrink-0">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Bibliothèque d'Exercices</h1>
          <p className="text-slate-500 text-sm mt-1">Gérez votre base de données d'exercices personnalisés.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-[#FF6A00] hover:bg-orange-600 text-white px-5 py-3 rounded-xl font-bold shadow-lg shadow-orange-500/20 transition-all flex items-center gap-2 active:scale-95"
        >
          <Plus size={18} />
          Nouvel Exercice
        </button>
      </div>

      {/* Barre de recherche */}
      <div className="bg-white dark:bg-[#16161A] border border-slate-200 dark:border-[#26262B] p-4 rounded-2xl shadow-sm">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Rechercher un exercice, un muscle..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 dark:bg-[#0B0B0F] border border-slate-200 dark:border-[#26262B] rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none transition-all focus:border-[#FF6A00] dark:text-white"
          />
        </div>
      </div>

      {/* Grille des exercices */}
      <div className="flex-1 overflow-y-auto custom-scroll pb-10">
        {loading ? (
          <div className="flex justify-center items-center h-40"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div></div>
        ) : filteredExercices.length === 0 ? (
          <div className="border-2 border-dashed border-slate-300 dark:border-[#26262B] rounded-2xl p-12 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-slate-100 dark:bg-[#0B0B0F] rounded-full flex items-center justify-center mb-4 text-slate-400">
              <Activity size={24} />
            </div>
            <p className="text-lg font-bold text-slate-700 dark:text-slate-300">Aucun exercice trouvé</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredExercices.map((exo) => (
              <div key={exo.id} className="bg-white dark:bg-[#16161A] border border-slate-200 dark:border-[#26262B] rounded-xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col group">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#FF6A00] bg-[#FF6A00]/10 px-2 py-1 rounded">
                    {exo.categorie}
                  </span>
                  {exo.video_url && (
                    <a href={exo.video_url} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-[#FF6A00] transition-colors" title="Voir la vidéo">
                      <PlaySquare size={18} />
                    </a>
                  )}
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-1">{exo.nom}</h3>
                <p className="text-xs font-semibold text-slate-500 mb-3">{exo.muscle_principal || "Général"}</p>
                <p className="text-xs text-slate-400 line-clamp-3 mt-auto">{exo.description || "Aucune description."}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modale de Création */}
      <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-300 ${isModalOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}>
        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
        <div className="relative bg-white dark:bg-[#16161A] border border-slate-200 dark:border-[#26262B] rounded-3xl shadow-2xl w-full max-w-lg p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">Créer un Exercice</h2>
            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-red-500 transition-colors p-2 bg-slate-50 dark:bg-white/5 rounded-full"><X size={20}/></button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider">Nom de l'exercice *</label>
              <input type="text" required placeholder="Ex: Développé Couché" className="w-full bg-slate-50 dark:bg-[#0B0B0F] border border-slate-200 dark:border-[#26262B] rounded-xl px-4 py-3 outline-none focus:border-[#FF6A00] dark:text-white"
                value={formData.nom} onChange={e => setFormData({...formData, nom: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider">Catégorie *</label>
                <select className="w-full bg-slate-50 dark:bg-[#0B0B0F] border border-slate-200 dark:border-[#26262B] rounded-xl px-4 py-3 outline-none focus:border-[#FF6A00] dark:text-white"
                  value={formData.categorie} onChange={e => setFormData({...formData, categorie: e.target.value})}
                >
                  {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider">Muscle principal</label>
                <input type="text" placeholder="Ex: Pectoraux" className="w-full bg-slate-50 dark:bg-[#0B0B0F] border border-slate-200 dark:border-[#26262B] rounded-xl px-4 py-3 outline-none focus:border-[#FF6A00] dark:text-white"
                  value={formData.muscle_principal} onChange={e => setFormData({...formData, muscle_principal: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider">Lien Vidéo (optionnel)</label>
              <input type="url" placeholder="https://youtube.com/..." className="w-full bg-slate-50 dark:bg-[#0B0B0F] border border-slate-200 dark:border-[#26262B] rounded-xl px-4 py-3 outline-none focus:border-[#FF6A00] dark:text-white"
                value={formData.video_url} onChange={e => setFormData({...formData, video_url: e.target.value})}
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider">Consignes / Description</label>
              <textarea placeholder="Points d'attention, placement..." rows="3" className="w-full bg-slate-50 dark:bg-[#0B0B0F] border border-slate-200 dark:border-[#26262B] rounded-xl px-4 py-3 outline-none focus:border-[#FF6A00] resize-none dark:text-white"
                value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
              />
            </div>

            <button type="submit" className="w-full bg-[#FF6A00] hover:bg-orange-600 text-white font-black py-4 rounded-xl shadow-lg mt-2 transition-transform active:scale-95">
              Enregistrer l'exercice
            </button>
          </form>
        </div>
      </div>

    </div>
  );
};

export default ExerciceManager;
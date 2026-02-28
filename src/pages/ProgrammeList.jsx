import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dumbbell, Plus, User, ArrowRight, X, Calendar } from 'lucide-react';
import api from '../services/api';

const ProgrammeList = () => {
  const navigate = useNavigate();
  const [programmes, setProgrammes] = useState([]);
  const [clients, setClients] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    athlete: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // On récupère les programmes et les clients en parallèle
      const [progRes, clientsRes] = await Promise.all([
        api.get('/programmes/'),
        api.get('/clients/')
      ]);
      setProgrammes(progRes.data);
      setClients(clientsRes.data);
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        titre: formData.titre,
        description: formData.description,
        athlete: formData.athlete ? parseInt(formData.athlete) : null
      };
      await api.post('/programmes/', payload);
      
      // On rafraîchit la liste et on ferme la modale
      fetchData();
      setIsModalOpen(false);
      setFormData({ titre: '', description: '', athlete: '' });
    } catch (error) {
      console.error("Erreur lors de la création du programme:", error);
      alert("Erreur lors de la création.");
    }
  };

  // Redirection vers le builder avec l'ID du programme en paramètre
  const goToBuilder = (programmeId) => {
    navigate(`/builder?progId=${programmeId}`);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto flex flex-col gap-6 animate-in fade-in duration-500 h-full">
      
      {/* Header */}
      <div className="flex justify-between items-end shrink-0">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Mes Programmes</h1>
          <p className="text-slate-500 text-sm mt-1">Créez et assignez des programmes d'entraînement à vos athlètes.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-[#FF6A00] hover:bg-orange-600 text-white px-5 py-3 rounded-xl font-bold shadow-lg shadow-orange-500/20 transition-all flex items-center gap-2 active:scale-95"
        >
          <Plus size={18} />
          Nouveau Programme
        </button>
      </div>

      {/* Grille des programmes */}
      <div className="flex-1 overflow-y-auto custom-scroll pb-10">
        {loading ? (
          <div className="flex justify-center items-center h-40"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div></div>
        ) : programmes.length === 0 ? (
          <div className="border-2 border-dashed border-slate-300 dark:border-[#26262B] rounded-2xl p-12 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-slate-100 dark:bg-[#0B0B0F] rounded-full flex items-center justify-center mb-4 text-slate-400">
              <Dumbbell size={24} />
            </div>
            <p className="text-lg font-bold text-slate-700 dark:text-slate-300">Aucun programme</p>
            <p className="text-sm text-slate-500 mt-2">Commencez par créer votre premier programme d'entraînement.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {programmes.map((prog) => {
              // Retrouver l'athlète assigné pour afficher son nom
              const assignedClient = clients.find(c => c.id === prog.athlete);
              
              return (
                <div key={prog.id} className="bg-white dark:bg-[#16161A] border border-slate-200 dark:border-[#26262B] rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col group">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-orange-50 dark:bg-orange-500/10 text-[#FF6A00] rounded-xl">
                      <Dumbbell size={20} />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 bg-slate-100 dark:bg-white/5 px-2.5 py-1 rounded-md">
                      {prog.seances?.length || 0} séances
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2 line-clamp-1">{prog.titre}</h3>
                  <p className="text-sm text-slate-500 line-clamp-2 mb-6 flex-1">{prog.description || "Aucune description fournie."}</p>
                  
                  <div className="flex items-center gap-2 mb-6 p-3 bg-slate-50 dark:bg-[#0B0B0F] rounded-xl">
                    <User size={16} className="text-slate-400" />
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      {assignedClient ? `${assignedClient.prenom} ${assignedClient.nom}` : "Non assigné"}
                    </span>
                  </div>

                  <button 
                    onClick={() => goToBuilder(prog.id)}
                    className="w-full flex items-center justify-center gap-2 bg-slate-100 dark:bg-white/5 hover:bg-[#FF6A00] hover:text-white text-slate-700 dark:text-slate-300 py-3 rounded-xl font-bold transition-colors group-hover:border-[#FF6A00]"
                  >
                    Ouvrir dans le Builder <ArrowRight size={16} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modale de Création */}
      <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-300 ${isModalOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}>
        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
        <div className="relative bg-white dark:bg-[#16161A] border border-slate-200 dark:border-[#26262B] rounded-3xl shadow-2xl w-full max-w-lg p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">Nouveau Programme</h2>
            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-red-500 transition-colors p-2 bg-slate-50 dark:bg-white/5 rounded-full"><X size={20}/></button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Titre du programme</label>
              <input type="text" required placeholder="Ex: Prise de masse 4 Jours" className="w-full bg-slate-50 dark:bg-[#0B0B0F] border border-slate-200 dark:border-[#26262B] rounded-xl px-4 py-3 outline-none focus:border-[#FF6A00] transition-colors dark:text-white"
                value={formData.titre} onChange={e => setFormData({...formData, titre: e.target.value})}
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Description (optionnel)</label>
              <textarea placeholder="Objectifs de ce cycle..." rows="3" className="w-full bg-slate-50 dark:bg-[#0B0B0F] border border-slate-200 dark:border-[#26262B] rounded-xl px-4 py-3 outline-none focus:border-[#FF6A00] transition-colors resize-none dark:text-white"
                value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Assigner à un athlète</label>
              <select className="w-full bg-slate-50 dark:bg-[#0B0B0F] border border-slate-200 dark:border-[#26262B] rounded-xl px-4 py-3 outline-none focus:border-[#FF6A00] transition-colors dark:text-white"
                value={formData.athlete} onChange={e => setFormData({...formData, athlete: e.target.value})}
              >
                <option value="">-- Ne pas assigner pour le moment --</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>{c.prenom} {c.nom}</option>
                ))}
              </select>
            </div>

            <button type="submit" className="w-full bg-[#FF6A00] hover:bg-orange-600 text-white font-black py-4 rounded-xl shadow-lg mt-4 transition-transform active:scale-95">
              Créer le programme
            </button>
          </form>
        </div>
      </div>

    </div>
  );
};

export default ProgrammeList;
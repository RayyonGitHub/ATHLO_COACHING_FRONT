import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dumbbell, Plus, User, ArrowRight, X, Calendar, Clock, CheckCircle, ListTodo, AlertTriangle } from 'lucide-react';
import api from '../services/api';

const ProgrammeList = () => {
  const navigate = useNavigate();
  const [programmes, setProgrammes] = useState([]);
  const [clients, setClients] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // --- NOUVEAUX ÉTATS POUR LA PLANIFICATION ---
  const [selectedProg, setSelectedProg] = useState(null); // Gère la modale "Détails du programme"
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false); // Gère la modale "Choisir une date"
  const [selectedSeance, setSelectedSeance] = useState(null); // La séance qu'on est en train de planifier
  const [scheduleData, setScheduleData] = useState({ jour: '', heure_debut: '', heure_fin: '', salle_id: '' });
  const [sallesCoach, setSallesCoach] = useState([]);
  const [successModalOpen, setSuccessModalOpen] = useState(false); // Modale de succès
  const [errorModal, setErrorModal] = useState({ show: false, message: '' });

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
      const [progRes, clientsRes] = await Promise.all([
        api.get('/programmes/'),
        api.get('/clients/')
      ]);
      setProgrammes(progRes.data);
      setClients(clientsRes.data);

      const sallesRes = await api.get('/coach/salles-disponibles/');
      setSallesCoach(sallesRes.data || []);
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.athlete) {
      setErrorModal({ show: true, message: "Vous devez assigner ce programme à un athlète." });
      return;
    }
    try {
      const payload = {
        titre: formData.titre,
        description: formData.description,
                athlete: parseInt(formData.athlete)
      };
      await api.post('/programmes/', payload);
      
      fetchData();
      setIsModalOpen(false);
      setFormData({ titre: '', description: '', athlete: '' });
    } catch (error) {
      console.error("Erreur lors de la création du programme:", error);
      setErrorModal({
        show: true,
        message: error.response?.data?.athlete || error.response?.data?.error || "Erreur lors de la création."
      });
    }
  };

  // --- SOUMISSION DE LA PLANIFICATION ---
  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    try {
      // On met à jour la séance avec la date et l'heure
      await api.patch(`/seances/${selectedSeance.id}/`, {
        jour_prevu: scheduleData.jour,
        heure_debut: scheduleData.heure_debut,
        heure_fin: scheduleData.heure_fin,
        salle: scheduleData.salle_id ? parseInt(scheduleData.salle_id, 10) : null
      });
      
      // On ferme les modales et on affiche le succès
      setScheduleModalOpen(false);
      setSelectedProg(null); // Optionnel: ferme aussi les détails du programme
      setSuccessModalOpen(true);
      
      // On rafraîchit en arrière-plan
      fetchData();
      
      // Reset du formulaire
      setScheduleData({ jour: '', heure_debut: '', heure_fin: '', salle_id: '' });
    } catch (error) {
      console.error("Erreur de planification:", error);
      
      
      const errorMsg =
        error.response?.data?.erreur ||
        error.response?.data?.horaire_conflit ||
        "Erreur lors de la planification de la séance.";
        
      setErrorModal({ show: true, message: errorMsg });
    }
  };

  const goToBuilder = (programmeId) => {
    navigate(`/builder?progId=${programmeId}`);
  };
// --- VARIABLES POUR BLOQUER LES DATES PASSÉES ---
  const todayDate = new Date();
  const todayStr = todayDate.getFullYear() + '-' + String(todayDate.getMonth() + 1).padStart(2, '0') + '-' + String(todayDate.getDate()).padStart(2, '0');
  const currentTimeStr = String(todayDate.getHours()).padStart(2, '0') + ':' + String(todayDate.getMinutes()).padStart(2, '0');

  return (
    <div className="p-8 max-w-7xl mx-auto flex flex-col gap-6 animate-in fade-in duration-500 h-full relative">
      
      {/* Header */}
      <div className="flex justify-between items-end shrink-0">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Mes Programmes</h1>
          <p className="text-slate-500 text-sm mt-1">Créez et assignez des programmes d'entraînement à vos athlètes.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-[#FF6A00] hover:bg-orange-600 text-white px-5 py-3 rounded-xl font-bold shadow-lg shadow-orange-500/20 transition-all flex items-center gap-2 active:scale-95 cursor-pointer"
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

                  {/* NOUVEAUX BOUTONS D'ACTION */}
                  <div className="flex flex-col gap-2">
                    <button 
                      onClick={() => setSelectedProg(prog)}
                      className="w-full flex items-center justify-center gap-2 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 text-indigo-600 dark:text-indigo-400 py-3 rounded-xl font-bold transition-colors cursor-pointer"
                    >
                      <ListTodo size={16} /> Consulter & Planifier
                    </button>
                    <button 
                      onClick={() => goToBuilder(prog.id)}
                      className="w-full flex items-center justify-center gap-2 bg-slate-100 dark:bg-white/5 hover:bg-[#FF6A00] hover:text-white text-slate-700 dark:text-slate-300 py-3 rounded-xl font-bold transition-colors cursor-pointer"
                    >
                      <Plus size={16} /> Ajouter une séance
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* --- MODALE 1 : Création de Programme --- */}
      <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-300 ${isModalOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}>
        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
        <div className="relative bg-white dark:bg-[#16161A] border border-slate-200 dark:border-[#26262B] rounded-3xl shadow-2xl w-full max-w-lg p-8 transform transition-all">
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
              <select required className="w-full bg-slate-50 dark:bg-[#0B0B0F] border border-slate-200 dark:border-[#26262B] rounded-xl px-4 py-3 outline-none focus:border-[#FF6A00] transition-colors dark:text-white cursor-pointer"
                value={formData.athlete} onChange={e => setFormData({...formData, athlete: e.target.value})}
              >
                <option value="">-- Sélectionner un athlète --</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>{c.prenom} {c.nom}</option>
                ))}
              </select>
            </div>

            <button type="submit" className="w-full bg-[#FF6A00] hover:bg-orange-600 text-white font-black py-4 rounded-xl shadow-lg mt-4 transition-transform active:scale-95 cursor-pointer">
              Créer le programme
            </button>
          </form>
        </div>
      </div>

      {/* --- MODALE 2 : DÉTAILS DU PROGRAMME (Liste des séances) --- */}
      <div className={`fixed inset-0 z-[110] flex items-center justify-center p-4 transition-all duration-300 ${selectedProg ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}>
        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setSelectedProg(null)}></div>
        <div className={`relative bg-white dark:bg-[#16161A] border border-slate-200 dark:border-[#26262B] rounded-3xl shadow-2xl w-full max-w-2xl p-8 transform transition-all duration-300 flex flex-col max-h-[90vh] ${selectedProg ? 'scale-100 translate-y-0' : 'scale-95 translate-y-8'}`}>
          
          <div className="flex justify-between items-start mb-6 shrink-0 border-b border-slate-100 dark:border-[#26262B] pb-4">
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                <ListTodo className="text-[#FF6A00]" /> {selectedProg?.titre}
              </h2>
              <p className="text-slate-500 text-sm mt-1">Gérez et planifiez les séances de ce programme.</p>
            </div>
            <button onClick={() => setSelectedProg(null)} className="text-slate-400 hover:text-slate-600 transition-colors bg-slate-50 p-2 rounded-full cursor-pointer"><X size={20}/></button>
          </div>

          <div className="flex-1 overflow-y-auto custom-scroll space-y-3 pr-2">
            {!selectedProg?.seances || selectedProg.seances.length === 0 ? (
              <p className="text-center text-slate-500 py-10">Aucune séance dans ce programme.</p>
            ) : (
              selectedProg.seances.map((seance, index) => (
                <div key={seance.id || index} className="p-4 bg-slate-50 dark:bg-[#0B0B0F] border border-slate-200 dark:border-[#26262B] rounded-2xl flex items-center justify-between group hover:border-indigo-200 transition-colors">
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">{seance.titre || "Séance sans nom"}</h4>
                    {seance.jour_prevu ? (
                      <p className="text-xs font-bold text-emerald-600 flex items-center gap-1 mt-1">
                        <CheckCircle size={12} /> Planifiée le {new Date(seance.jour_prevu).toLocaleDateString()}
                      </p>
                    ) : (
                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                        <Clock size={12} /> Non planifiée
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button 
                             onClick={() => navigate(`/builder?seance_id=${seance.id}&source=programme`)}
                      className="px-3 py-2 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      Modifier Exos
                    </button>
                    <button 
                      onClick={() => {
                        setSelectedSeance(seance);
                        setScheduleData({
                          jour: seance.jour_prevu || '',
                          heure_debut: seance.heure_debut ? String(seance.heure_debut).slice(0, 5) : '',
                          heure_fin: seance.heure_fin ? String(seance.heure_fin).slice(0, 5) : '',
                          salle_id: seance.salle ? String(seance.salle) : '',
                        });
                        setScheduleModalOpen(true);
                      }}
                      className="px-3 py-2 text-xs font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Calendar size={14} /> Planifier
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* --- MODALE 3 : CHOISIR LA DATE (Planification) --- */}
      <div className={`fixed inset-0 z-[120] flex items-center justify-center p-4 transition-all duration-300 ${scheduleModalOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}>
        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setScheduleModalOpen(false)}></div>
        <div className={`relative bg-white dark:bg-[#16161A] border border-slate-200 dark:border-[#26262B] rounded-3xl shadow-2xl w-full max-w-sm p-6 transform transition-all duration-300 ${scheduleModalOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-8'}`}>
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3"><Calendar size={24} /></div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">Planifier la séance</h3>
            <p className="text-sm font-bold text-indigo-600 mt-1">{selectedSeance?.titre}</p>
          </div>

          <form onSubmit={handleScheduleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Date</label>
              <input type="date" required className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:border-indigo-500 cursor-pointer"
                min={todayStr}
                value={scheduleData.jour} onChange={e => setScheduleData({...scheduleData, jour: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Heure de début</label>
                <input type="time" required className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:border-indigo-500 cursor-pointer"
                  min={scheduleData.jour === todayStr ? currentTimeStr : "00:00"}
                  value={scheduleData.heure_debut} onChange={e => setScheduleData({...scheduleData, heure_debut: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Heure de fin</label>
                <input type="time" required className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:border-indigo-500 cursor-pointer"
                  value={scheduleData.heure_fin} onChange={e => setScheduleData({...scheduleData, heure_fin: e.target.value})}
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Salle</label>
              <select
                value={scheduleData.salle_id}
                onChange={(e) => setScheduleData({ ...scheduleData, salle_id: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="">-- Sélectionner une salle --</option>
                {sallesCoach.map((salle) => (
                  <option key={salle.id} value={salle.id}>{salle.nom} - {salle.ville}</option>
                ))}
              </select>
            </div>
            <div className="pt-4 flex gap-2">
              <button type="button" onClick={() => setScheduleModalOpen(false)} className="flex-1 py-3 text-sm font-bold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors cursor-pointer">Annuler</button>
              <button type="submit" className="flex-1 py-3 text-sm font-black text-white bg-indigo-600 rounded-xl shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 transition-colors cursor-pointer">Confirmer</button>
            </div>
          </form>
        </div>
      </div>

      {/* --- MODALE 4 : SUCCÈS --- */}
      <div className={`fixed inset-0 z-[200] grid place-items-center bg-slate-900/60 backdrop-blur-sm transition-all duration-300 ${successModalOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}>
        <div className={`relative bg-white dark:bg-[#16161A] p-8 w-full max-w-sm rounded-3xl shadow-2xl border border-slate-100 dark:border-[#26262B] text-center transform transition-all duration-300 ${successModalOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-8'}`}>
          <div className="w-20 h-20 mx-auto bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-6 shadow-inner">
            <CheckCircle size={40} />
          </div>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Séance Planifiée !</h3>
          <p className="text-slate-500 dark:text-slate-400 mb-8 font-medium">
            La séance a été ajoutée à votre calendrier et à celui de votre athlète.
          </p>
          <button 
            onClick={() => {
              setSuccessModalOpen(false);
              navigate('/calendar'); // Redirection vers l'agenda pour voir le résultat
            }}
            className="w-full bg-[#FF6A00] hover:bg-orange-600 text-white py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-orange-500/20 cursor-pointer mb-2"
          >
            Voir mon calendrier
          </button>
          <button 
            onClick={() => setSuccessModalOpen(false)}
            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 py-3.5 rounded-xl font-bold transition-all cursor-pointer"
          >
            Fermer
          </button>
        </div>
      </div>
{/* LA MODALE D'ERREUR (Anti-chevauchement) */}
      <div className={`fixed inset-0 z-[1000] grid place-items-center bg-slate-900/60 backdrop-blur-sm transition-all duration-300 ${errorModal.show ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}>
        <div className={`relative bg-white dark:bg-[#16161A] p-8 w-full max-w-sm rounded-3xl shadow-2xl border border-red-100 dark:border-[#26262B] text-center transform transition-all duration-300 ${errorModal.show ? 'scale-100 translate-y-0' : 'scale-95 translate-y-8'}`}>
          <div className="w-20 h-20 mx-auto bg-red-100 dark:bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mb-6 shadow-inner">
            <AlertTriangle size={40} strokeWidth={2.5} />
          </div>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Impossible</h3>
          <p className="text-slate-500 dark:text-slate-400 mb-8 font-medium">
            {errorModal.message}
          </p>
          <button 
            onClick={() => setErrorModal({ show: false, message: '' })}
            className="w-full bg-red-500 hover:bg-red-600 text-white py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-red-500/20 cursor-pointer"
          >
            J'ai compris
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProgrammeList;

import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom'; 
import { Search, GripVertical, Trash2, Save, Dumbbell, Clock, CalendarDays, ListTodo, AlertTriangle } from 'lucide-react';
import api from '../services/api';

const SessionBuilder = () => {
  const location = useLocation();
  const navigate = useNavigate(); // Pour rediriger après sauvegarde

  // --- ÉTATS ---
  const [exercicesLib, setExercicesLib] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const [sessionTitle, setSessionTitle] = useState('');
  const [sessionExos, setSessionExos] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  // ÉTATS POUR LE PROGRAMME
  const [programmes, setProgrammes] = useState([]);
  const [selectedProgrammeId, setSelectedProgrammeId] = useState('');

  // NOUVEAUX ÉTATS POUR LE MODE "ÉDITION DE CALENDRIER"
  const [editMode, setEditMode] = useState(false);
  const [seanceId, setSeanceId] = useState(null);
  const [successModal, setSuccessModal] = useState({ show: false, isEditRedirect: false });
  const [errorModal, setErrorModal] = useState({ show: false, message: '' });

  // --- CHARGEMENT DES DONNÉES ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [exosRes, progsRes] = await Promise.all([
          api.get('/exercices/'),
          api.get('/programmes/')
        ]);
        setExercicesLib(exosRes.data);
        setProgrammes(progsRes.data);

        // Lecture de l'URL
        const searchParams = new URLSearchParams(location.search);
        const progIdFromUrl = searchParams.get('progId');
        const seanceIdFromUrl = searchParams.get('seance_id'); // <-- LECTURE DU PONT

        if (progIdFromUrl) {
          setSelectedProgrammeId(progIdFromUrl);
        }

        // --- SI ON VIENT DU CALENDRIER ---
        if (seanceIdFromUrl) {
            setEditMode(true);
            setSeanceId(seanceIdFromUrl);

            // On va chercher les infos de la séance existante
            const seanceRes = await api.get(`/seances/${seanceIdFromUrl}/`);
            setSessionTitle(seanceRes.data.titre || 'Séance sans titre');

            // Si la séance avait DÉJÀ des exercices, on les charge !
            if (seanceRes.data.exercices_details && seanceRes.data.exercices_details.length > 0) {
                const loadedExos = seanceRes.data.exercices_details.map(e => ({
                    uid: crypto.randomUUID(),
                    exercice: e.exercice_details, // On récupère l'objet complet via "exercice_details"
                    series: e.series,
                    repetitions: e.repetitions,
                    poids: e.poids,
                    repos: e.repos || "60s"
                }));
                setSessionExos(loadedExos);
            }
        }

      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
      }
    };
    fetchData();
  }, [location.search]);

  // --- FILTRE RECHERCHE ---
  const filteredExercices = exercicesLib.filter(exo =>
    exo.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (exo.muscle_principal && exo.muscle_principal.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // --- LOGIQUE DRAG & DROP NATIVE ---
  const handleDragStart = (e, exo) => {
    e.dataTransfer.setData('exo_id', exo.id);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const exoId = e.dataTransfer.getData('exo_id');
    const exo = exercicesLib.find(e => e.id === parseInt(exoId));

    if (exo) {
      setSessionExos([...sessionExos, {
        uid: crypto.randomUUID(),
        exercice: exo,
        series: 3,
        repetitions: "10",
        poids: "",
        repos: "60s"
      }]);
    }
  };

  const updateExoField = (uid, field, value) => {
    setSessionExos(sessionExos.map(item =>
      item.uid === uid ? { ...item, [field]: value } : item
    ));
  };

  const removeExo = (uid) => {
    setSessionExos(sessionExos.filter(item => item.uid !== uid));
  };

  // --- SAUVEGARDE DE LA SÉANCE ---
  const handleSaveSession = async () => {
    // Vérification adaptée : on n'exige le programme que si on N'EST PAS en mode édition
    if (!editMode && !selectedProgrammeId) {
      alert("Veuillez sélectionner un programme pour cette séance.");
      return;
    }
    if (!sessionTitle || sessionExos.length === 0) {
      alert("Veuillez donner un titre et ajouter au moins un exercice.");
      return;
    }

   setIsSaving(true);
    try {
      const payload = {
        titre: sessionTitle,
        exercices: sessionExos.map((item, index) => ({
          exercice_id: item.exercice.id,
          series: item.series,
          repetitions: item.repetitions,
          poids: item.poids || "Poids du corps",
          repos: item.repos || "60s",
          ordre: index + 1
        }))
      };

      if (editMode) {
        // MODE CALENDRIER (PATCH)
        await api.patch(`/seances/${seanceId}/`, payload);
        setSuccessModal({ show: true, isEditRedirect: true });
      } else {
        // MODE PROGRAMME (POST)
        payload.programme = parseInt(selectedProgrammeId);
        await api.post('/seances/', payload);
        setSuccessModal({ show: true, isEditRedirect: false });
        setSessionTitle('');
        setSessionExos([]);
      }

    } catch (error) {
      console.error("Erreur de sauvegarde:", error);
      setIsSaving(false);
            const errorMsg = error.response?.data?.horaire_conflit 
        ? error.response.data.horaire_conflit 
        : "Erreur lors de la sauvegarde de la séance.";
        
      setErrorModal({ show: true, message: errorMsg });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto h-[calc(100vh-5rem)] flex flex-col gap-6 animate-in fade-in duration-500">

      <div className="flex justify-between items-end shrink-0">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            Créateur de Séance
            {/* Petit badge dynamique */}
            {editMode ? (
              <span className="text-sm bg-orange-100 text-orange-600 px-3 py-1 rounded-full flex items-center gap-1 font-bold">
                <CalendarDays size={16}/> Mode Calendrier
              </span>
            ) : (
              <span className="text-sm bg-indigo-100 text-indigo-600 px-3 py-1 rounded-full flex items-center gap-1 font-bold">
                <ListTodo size={16}/> Mode Programme
              </span>
            )}
          </h1>
          <p className="text-slate-500 text-sm">
            {editMode
              ? 'Ajoutez des exercices à votre séance du calendrier.'
              : 'Construisez une nouvelle séance pour votre programme.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* BOUTON RETOUR UNIVERSEL */}
          <button
            onClick={() => {
              if (editMode) {
                navigate(-1); // Retour au calendrier (historique)
              } else {
                navigate('/programmes'); // Retour direct à la liste des programmes
              }
            }}
            className="px-6 py-3 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 dark:bg-[#26262B] dark:text-slate-300 dark:hover:bg-[#323238] transition-all cursor-pointer"
          >
            Annuler
          </button>

          {/* BOUTON SAUVEGARDER */}
          <button
            onClick={handleSaveSession}
            disabled={isSaving || sessionExos.length === 0 || (!editMode && !selectedProgrammeId)}
            className="bg-[#FF6A00] hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-orange-500/20 transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            <Save size={18} />
            {isSaving ? "Enregistrement..." : "Sauvegarder la séance"}
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 flex-1 min-h-0">

        {/* COLONNE GAUCHE : BIBLIOTHÈQUE (INCHANGÉE) */}
        <div className="w-full lg:w-1/3 flex flex-col bg-white dark:bg-[#16161A] border border-slate-200 dark:border-[#26262B] rounded-2xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-200 dark:border-[#26262B]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Rechercher un exercice..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 dark:bg-[#0B0B0F] border border-slate-200 dark:border-[#26262B] rounded-lg py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-[#FF6A00]/50 outline-none transition-all dark:text-white"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scroll">
            {filteredExercices.length === 0 ? (
              <p className="text-center text-slate-500 text-sm mt-10">Aucun exercice trouvé.</p>
            ) : (
              filteredExercices.map(exo => (
                <div
                  key={exo.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, exo)}
                  className="p-3 bg-slate-50 dark:bg-[#0B0B0F] border border-slate-200 dark:border-[#26262B] rounded-xl cursor-grab active:cursor-grabbing hover:border-[#FF6A00]/50 transition-colors group flex items-center gap-3"
                >
                  <GripVertical size={16} className="text-slate-400 group-hover:text-[#FF6A00]" />
                  <div>
                    <p className="font-bold text-sm text-slate-900 dark:text-white">{exo.nom}</p>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#FF6A00] mt-0.5">{exo.muscle_principal || exo.categorie}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* COLONNE DROITE : LE BUILDER DRAG & DROP */}
        <div className="w-full lg:w-2/3 flex flex-col bg-white dark:bg-[#16161A] border border-slate-200 dark:border-[#26262B] rounded-2xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-200 dark:border-[#26262B] bg-slate-50/50 dark:bg-[#0B0B0F]/30 space-y-4">

            {/* SÉLECTION DU PROGRAMME - CACHÉE EN MODE ÉDITION DE CALENDRIER */}
            {!editMode && (
                <select
                value={selectedProgrammeId}
                onChange={(e) => setSelectedProgrammeId(e.target.value)}
                className="w-full bg-white dark:bg-[#0B0B0F] border border-slate-200 dark:border-[#26262B] rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-[#FF6A00]/50 outline-none text-slate-900 dark:text-white transition-all font-medium"
                >
                <option value="" disabled>-- Sélectionner le programme cible --</option>
                {programmes.map(prog => (
                    <option key={prog.id} value={prog.id}>{prog.titre}</option>
                ))}
                </select>
            )}

            {/* TITRE DE LA SÉANCE */}
            <input
              type="text"
              placeholder="Titre de la séance (ex: Push Day - Force)"
              value={sessionTitle}
              onChange={(e) => setSessionTitle(e.target.value)}
              className={`w-full bg-transparent text-2xl font-black text-slate-900 dark:text-white placeholder-slate-400 outline-none ${editMode ? 'text-opacity-70' : ''}`}
            />
          </div>

          <div
            className={`flex-1 overflow-y-auto p-6 transition-all custom-scroll ${sessionExos.length === 0 ? 'flex flex-col items-center justify-center' : ''}`}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            {sessionExos.length === 0 ? (
              <div className="border-2 border-dashed border-slate-300 dark:border-[#26262B] rounded-2xl w-full max-w-md p-10 flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-slate-100 dark:bg-[#0B0B0F] rounded-full flex items-center justify-center mb-4 text-slate-400">
                  <Dumbbell size={24} />
                </div>
                <p className="text-lg font-bold text-slate-700 dark:text-slate-300">Construisez votre séance</p>
                <p className="text-sm text-slate-500 mt-2">Glissez et déposez des exercices depuis la bibliothèque à gauche vers cette zone.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {sessionExos.map((item, index) => (
                  <div key={item.uid} className="p-5 bg-slate-50 dark:bg-[#0B0B0F] border border-slate-200 dark:border-[#26262B] rounded-xl relative group">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-[#FF6A00]/10 text-[#FF6A00] font-black flex items-center justify-center text-sm">
                          {index + 1}
                        </div>
                        <h3 className="font-bold text-lg dark:text-white">{item.exercice.nom}</h3>
                      </div>
                      <button onClick={() => removeExo(item.uid)} className="text-slate-400 hover:text-red-500 hover:bg-red-500/10 p-2 rounded-lg transition-colors">
                        <Trash2 size={18} />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Séries</label>
                        <input type="number" min="1" value={item.series} onChange={(e) => updateExoField(item.uid, 'series', parseInt(e.target.value))} className="w-full bg-white dark:bg-[#16161A] border border-slate-200 dark:border-[#26262B] rounded-lg p-2.5 text-sm outline-none focus:border-[#FF6A00] dark:text-white" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Reps / Temps</label>
                        <input type="text" value={item.repetitions} onChange={(e) => updateExoField(item.uid, 'repetitions', e.target.value)} placeholder="ex: 10, ou 45s" className="w-full bg-white dark:bg-[#16161A] border border-slate-200 dark:border-[#26262B] rounded-lg p-2.5 text-sm outline-none focus:border-[#FF6A00] dark:text-white" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Charge</label>
                        <input type="text" value={item.poids} onChange={(e) => updateExoField(item.uid, 'poids', e.target.value)} placeholder="ex: 20kg" className="w-full bg-white dark:bg-[#16161A] border border-slate-200 dark:border-[#26262B] rounded-lg p-2.5 text-sm outline-none focus:border-[#FF6A00] dark:text-white" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1"><Clock size={12}/> Repos</label>
                        <input type="text" value={item.repos} onChange={(e) => updateExoField(item.uid, 'repos', e.target.value)} placeholder="ex: 90s" className="w-full bg-white dark:bg-[#16161A] border border-slate-200 dark:border-[#26262B] rounded-lg p-2.5 text-sm outline-none focus:border-[#FF6A00] dark:text-white" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
      <div className={`fixed inset-0 z-[999] grid place-items-center bg-slate-900/60 backdrop-blur-sm transition-all duration-300 ${successModal.show ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}>
        <div className={`relative bg-white dark:bg-[#16161A] p-8 w-full max-w-sm rounded-3xl shadow-2xl border border-slate-100 dark:border-[#26262B] text-center transform transition-all duration-300 ${successModal.show ? 'scale-100 translate-y-0' : 'scale-95 translate-y-8'}`}>
          <div className="w-20 h-20 mx-auto bg-green-100 dark:bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mb-6 shadow-inner">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
          </div>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Succès !</h3>
          <p className="text-slate-500 dark:text-slate-400 mb-8 font-medium">
            {successModal.isEditRedirect ? "Les exercices ont été ajoutés à votre calendrier." : "La séance a été ajoutée au programme."}
          </p>
          <button
            onClick={() => {
              setSuccessModal({ show: false, isEditRedirect: false });
              if (successModal.isEditRedirect) {
                navigate('/calendar');
              }
            }}
            className="w-full bg-[#FF6A00] hover:bg-orange-600 text-white py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-orange-500/20 cursor-pointer"
          >
            {successModal.isEditRedirect ? "Retour au calendrier" : "Continuer"}
          </button>
        </div>
      </div>
      {/* MODALE D'ERREUR (Chevauchement) */}
      <div className={`fixed inset-0 z-[1000] grid place-items-center bg-slate-900/60 backdrop-blur-sm transition-all duration-300 ${errorModal.show ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}>
        <div className={`relative bg-white dark:bg-[#16161A] p-8 w-full max-w-sm rounded-3xl shadow-2xl border border-red-100 dark:border-[#26262B] text-center transform transition-all duration-300 ${errorModal.show ? 'scale-100 translate-y-0' : 'scale-95 translate-y-8'}`}>
          <div className="w-20 h-20 mx-auto bg-red-100 dark:bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mb-6 shadow-inner">
            <AlertTriangle size={40} strokeWidth={2.5} />
          </div>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Conflit d'horaire</h3>
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

export default SessionBuilder;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { onboardingService } from '../../services/onboardingService';
import api from '../../services/api';

const villes = [
  "Aix-en-Provence", "Amiens", "Angers", "Annecy", "Avignon", "Bayonne", "Belfort",
  "Besançon", "Bordeaux", "Boulogne-Billancourt", "Brest", "Caen", "Clermont-Ferrand",
  "Dijon", "Grenoble", "Le Havre", "Le Mans", "Lille", "Limoges", "Lyon", "Marseille",
  "Metz", "Montpellier", "Mulhouse", "Nancy", "Nantes", "Nice", "Nîmes", "Orléans",
  "Paris", "Perpignan", "Poitiers", "Reims", "Rennes", "Rouen", "Saint-Étienne",
  "Strasbourg", "Toulon", "Toulouse", "Tours", "Villeurbanne"
];

const CoachStep2 = () => {
  const navigate = useNavigate();
  const [selectedTags, setSelectedTags] = useState(["Crossfit"]);
  const availableTags = ["Nutrition", "HIIT", "Pilates", "Boxe", "Méditation", "Yoga", "Force Athlétique"];

  const [tarifs, setTarifs] = useState({ seance: 60, pack: 500, abonnement: 180 });
  const [ville, setVille] = useState("");
  const [searchVille, setSearchVille] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  
  // --- Salles ---
  const [sallesDisponibles, setSallesDisponibles] = useState([]);
  const [selectedSalles, setSelectedSalles] = useState([]);
  const [showSalleDropdown, setShowSalleDropdown] = useState(false);

  const filteredVilles = villes.filter(v => v.toLowerCase().includes(searchVille.toLowerCase()));

  useEffect(() => {
    const fetchSalles = async () => {
      try {
        const response = await api.get('/prospects/salles/');
        setSallesDisponibles(response.data);
      } catch (error) {
        console.error("Erreur chargement des salles:", error);
      }
    };
    fetchSalles();
  }, []);

  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const toggleSalle = (id) => {
    if (selectedSalles.includes(id)) {
      setSelectedSalles(selectedSalles.filter(s => s !== id));
    } else {
      setSelectedSalles([...selectedSalles, id]);
    }
  };

  const handleNext = async () => {
    try {
      await onboardingService.updateCoachProfile({
        specialites_tags: selectedTags,
        specialite: selectedTags[0] || "",
        offres_tarifs: tarifs,
        ville: ville,
        salles: selectedSalles
      });
      navigate('/onboarding/coach/step3');
    } catch (error) {
      console.error("Erreur save:", error);
    }
  };

  // Filtrage des salles en fonction de la ville sélectionnée
  const sallesDeLaVille = sallesDisponibles.filter(
    salle => salle.ville.toLowerCase() === ville.toLowerCase()
  );

  // Salles cochées (pour l'affichage en puces)
  const selectedSallesObjects = sallesDisponibles.filter(s => selectedSalles.includes(s.id));

  return (
    <div className="bg-white dark:bg-[#0B0B0F] min-h-screen text-slate-900 dark:text-white p-8 font-sans">
      <div className="max-w-5xl mx-auto">
        <header className="mb-12">
          <h1 className="text-5xl font-black mb-4">Spécialités & Services</h1>
          <p className="text-lg opacity-60">Définissez votre expertise, vos tarifs et vos lieux d'exercice.</p>
        </header>

        {/* Section Spécialités */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6">Vos Spécialités</h2>
          <div className="flex flex-wrap gap-3">
            {selectedTags.map(tag => (
              <div key={tag} onClick={() => toggleTag(tag)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-500 text-white border border-orange-500 cursor-pointer">
                <span className="font-bold text-sm">{tag}</span>
                <span>✕</span>
              </div>
            ))}
            {availableTags.filter(t => !selectedTags.includes(t)).map(tag => (
              <div key={tag} onClick={() => toggleTag(tag)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-orange-500 cursor-pointer transition-all">
                <span className="font-medium text-sm">{tag}</span>
                <span>+</span>
              </div>
            ))}
          </div>
        </section>

        {/* Section Tarifs */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-8">Tarifs & Offres</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-bold mb-2">Séance Unique</h3>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">€</span>
                <input type="number" value={tarifs.seance} onChange={(e) => setTarifs({...tarifs, seance: e.target.value})} className="w-full bg-slate-50 dark:bg-white/5 border-none rounded-xl py-3 pl-8 pr-4 text-xl font-black outline-none" />
              </div>
            </div>
            <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-bold mb-2">Pack 10 Séances</h3>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">€</span>
                <input type="number" value={tarifs.pack} onChange={(e) => setTarifs({...tarifs, pack: e.target.value})} className="w-full bg-slate-50 dark:bg-white/5 border-none rounded-xl py-3 pl-8 pr-4 text-xl font-black outline-none" />
              </div>
            </div>
            <div className="bg-white dark:bg-white/5 border border-orange-500/40 rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-orange-500 text-white text-[10px] px-3 py-1 font-bold rounded-bl-lg">POPULAIRE</div>
              <h3 className="text-lg font-bold mb-2">Mensuel</h3>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">€</span>
                <input type="number" value={tarifs.abonnement} onChange={(e) => setTarifs({...tarifs, abonnement: e.target.value})} className="w-full bg-slate-50 dark:bg-white/5 border-none rounded-xl py-3 pl-8 pr-4 text-xl font-black outline-none" />
              </div>
            </div>
          </div>
        </section>

        {/* Section Localisation & Salles */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Lieux d'exercice</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Ville principale */}
            <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-6 relative z-10">
              <label className="block text-sm font-medium mb-2 opacity-70">Ville principale</label>
              <input 
                type="text" 
                value={searchVille} 
                onChange={(e) => { 
                  setSearchVille(e.target.value); 
                  setShowDropdown(true); 
                  if(e.target.value === "") setVille(""); // Reset la ville si on efface
                }} 
                onFocus={() => setShowDropdown(true)} 
                placeholder="Rechercher une ville..." 
                className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl py-3 px-4 text-lg outline-none focus:border-orange-500 transition-all" 
              />
              {showDropdown && (
                <div className="absolute z-20 mt-2 w-full bg-white dark:bg-[#0B0B0F] border border-slate-200 dark:border-white/10 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                  {filteredVilles.length > 0 ? (
                    filteredVilles.map((v, index) => (
                      <div 
                        key={index} 
                        onClick={() => { 
                          setVille(v); 
                          setSearchVille(v); 
                          setShowDropdown(false);
                          setSelectedSalles([]); // On vide les salles si on change de ville
                        }} 
                        className="px-4 py-3 cursor-pointer hover:bg-orange-500 hover:text-white transition-all border-b border-slate-100 dark:border-white/5 last:border-0"
                      >
                        {v}
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-gray-400">Aucune ville trouvée</div>
                  )}
                </div>
              )}
            </div>

            {/* Salles Partenaires */}
            <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-6 relative">
              <label className="block text-sm font-medium mb-2 opacity-70">Salles partenaires (Optionnel)</label>
              
              {!ville ? (
                <div className="p-4 bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded-xl text-sm border border-orange-200 dark:border-orange-500/20">
                  Veuillez d'abord sélectionner votre ville d'exercice pour voir les salles disponibles.
                </div>
              ) : (
                <>
                  <div 
                    onClick={() => setShowSalleDropdown(!showSalleDropdown)}
                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl py-3 px-4 text-left cursor-pointer flex justify-between items-center transition-all hover:border-orange-500"
                  >
                    <span className="text-slate-500">Sélectionner des salles à {ville}...</span>
                    <span className={`transition-transform duration-200 ${showSalleDropdown ? 'rotate-180' : ''}`}>▼</span>
                  </div>

                  {showSalleDropdown && (
                    <div className="absolute z-20 mt-2 w-[calc(100%-3rem)] bg-white dark:bg-[#0B0B0F] border border-slate-200 dark:border-white/10 rounded-xl shadow-lg max-h-60 overflow-y-auto p-2">
                      {sallesDeLaVille.length === 0 ? (
                        <p className="text-sm text-slate-500 p-3 text-center italic">Aucune salle partenaire enregistrée à {ville}.</p>
                      ) : (
                        sallesDeLaVille.map(salle => (
                          <label key={salle.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer transition-all">
                            <input 
                              type="checkbox" 
                              className="mt-1 w-4 h-4 text-orange-500 rounded border-slate-300 focus:ring-orange-500"
                              checked={selectedSalles.includes(salle.id)}
                              onChange={() => toggleSalle(salle.id)}
                            />
                            <div>
                              <p className="font-bold text-sm">{salle.nom}</p>
                              <p className="text-xs text-slate-500">{salle.adresse}</p>
                            </div>
                          </label>
                        ))
                      )}
                    </div>
                  )}

                  {/* Affichage des salles sélectionnées */}
                  {selectedSallesObjects.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-white/5">
                      {selectedSallesObjects.map(salle => (
                        <div key={salle.id} className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/10 rounded-lg text-sm">
                          <span className="font-medium text-slate-700 dark:text-slate-300">{salle.nom}</span>
                          <button onClick={() => toggleSalle(salle.id)} className="text-slate-400 hover:text-red-500 flex items-center justify-center">
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

          </div>
        </section>

        <footer className="flex justify-end pt-10 border-t border-slate-200 dark:border-white/10">
          <button onClick={handleNext} className="flex items-center gap-3 px-10 py-4 rounded-xl bg-orange-500 text-white font-black text-lg shadow-xl hover:bg-orange-600 transition-all">
            Étape Suivante →
          </button>
        </footer>
      </div>
    </div>
  );
};

export default CoachStep2;
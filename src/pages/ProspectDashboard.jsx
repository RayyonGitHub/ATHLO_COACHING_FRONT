import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Liste des villes pour la recherche (réutilisée)
const villes = [
  "Aix-en-Provence", "Amiens", "Angers", "Annecy", "Avignon", "Bayonne", "Belfort",
  "Besançon", "Bordeaux", "Boulogne-Billancourt", "Brest", "Caen", "Clermont-Ferrand",
  "Dijon", "Grenoble", "Le Havre", "Le Mans", "Lille", "Limoges", "Lyon", "Marseille",
  "Metz", "Montpellier", "Mulhouse", "Nancy", "Nantes", "Nice", "Nîmes", "Orléans",
  "Paris", "Perpignan", "Poitiers", "Reims", "Rennes", "Rouen", "Saint-Étienne",
  "Strasbourg", "Toulon", "Toulouse", "Tours", "Villeurbanne"
];

const ProspectDashboard = () => {
  const navigate = useNavigate();
  
  // États pour la géolocalisation
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [sallesProches, setSallesProches] = useState([]);
  
  // États pour la recherche
  const [searchVille, setSearchVille] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [villeSelectionnee, setVilleSelectionnee] = useState("");
  
  // États pour les filtres
  const [filters, setFilters] = useState({
    specialite: "",
    distance: 10,
    note_min: 0,
    prix_max: 200,
    type_offre: "tous" // 'seance', 'pack', 'abonnement', 'tous'
  });
  
  // États pour les résultats
  const [coachs, setCoachs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCoach, setSelectedCoach] = useState(null);
  const [showAchatModal, setShowAchatModal] = useState(false);
  const [selectedOffre, setSelectedOffre] = useState(null);

  // Tags de spécialités disponibles
  const specialites = ["Crossfit", "Nutrition", "HIIT", "Pilates", "Boxe", "Méditation", "Yoga", "Force Athlétique"];

  // Filtrer les villes pour l'autocomplétion
  const filteredVilles = villes.filter(ville => 
    ville.toLowerCase().includes(searchVille.toLowerCase())
  );

  // Obtenir la position de l'utilisateur
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setLocationError(null);
          // Simuler des salles proches (à remplacer par appel API)
          setSallesProches([
            { id: 1, nom: "Fitness Park", distance: "1.2 km", adresse: "Centre Commercial" },
            { id: 2, nom: "Basic-Fit", distance: "2.5 km", adresse: "Rue de la République" },
            { id: 3, nom: "L'Appart Fitness", distance: "3.0 km", adresse: "Avenue Jean Jaurès" }
          ]);
        },
        (error) => {
          setLocationError("Impossible d'obtenir votre position");
          console.error(error);
        }
      );
    } else {
      setLocationError("La géolocalisation n'est pas supportée");
    }
  }, []);

  // Rechercher des coachs
  const rechercherCoachs = async () => {
    setLoading(true);
    try {
      // Simulation de données (à remplacer par appel API réel)
      setTimeout(() => {
        setCoachs([
          {
            id: 1,
            nom: "Thomas Dubois",
            specialites: ["Crossfit", "HIIT", "Nutrition"],
            note: 4.8,
            avis: 124,
            distance: "2.3 km",
            tarifs: { seance: 60, pack: 500, abonnement: 180 },
            image: null,
            programmes_gratuits: [
              { id: 1, titre: "Découverte Crossfit", duree: "15 min" },
              { id: 2, titre: "Étirements matinaux", duree: "10 min" }
            ]
          },
          {
            id: 2,
            nom: "Sarah Martin",
            specialites: ["Yoga", "Pilates", "Méditation"],
            note: 4.9,
            avis: 89,
            distance: "1.8 km",
            tarifs: { seance: 55, pack: 450, abonnement: 160 },
            image: null,
            programmes_gratuits: [
              { id: 3, titre: "Yoga débutant", duree: "20 min" },
              { id: 4, titre: "Méditation guidée", duree: "10 min" }
            ]
          },
          {
            id: 3,
            nom: "Marc Lefebvre",
            specialites: ["Force Athlétique", "Nutrition", "Boxe"],
            note: 4.7,
            avis: 56,
            distance: "3.5 km",
            tarifs: { seance: 65, pack: 550, abonnement: 200 },
            image: null,
            programmes_gratuits: [
              { id: 5, titre: "Renforcement musculaire", duree: "25 min" }
            ]
          }
        ]);
        setLoading(false);
      }, 1500);
    } catch (error) {
      console.error("Erreur recherche coachs:", error);
      setLoading(false);
    }
  };

  // Acheter une offre
  const acheterOffre = (coach, typeOffre) => {
    setSelectedCoach(coach);
    setSelectedOffre({
      type: typeOffre,
      prix: coach.tarifs[typeOffre],
      description: typeOffre === 'seance' ? 'Séance unique' : 
                   typeOffre === 'pack' ? 'Pack 10 séances' : 'Abonnement mensuel'
    });
    setShowAchatModal(true);
  };

  // Demander un devis personnalisé
  const demanderDevis = (coach) => {
    navigate('/devis', { state: { coach } });
  };

  // Voir le profil complet
  const voirProfil = (coach) => {
    setSelectedCoach(coach);
    // Ouvrir modal ou naviguer vers page profil
  };

  return (
    <div className="bg-[#121212] text-gray-100 min-h-screen font-sans">
      <div className="flex h-screen overflow-hidden">
        
        {/* SIDEBAR */}
        <aside className="w-20 lg:w-64 flex flex-col justify-between bg-[#1E1E1E] border-r border-[#2D2D2D] transition-all duration-300 z-20">
          <div>
            <div className="h-20 flex items-center justify-center lg:justify-start lg:px-8 border-b border-[#2D2D2D]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-[#FF6B00] to-[#FF9E00] flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-[#FF6B00]/20">
                  P
                </div>
                <span className="hidden lg:block text-2xl font-bold tracking-widest text-white">ATHLO</span>
              </div>
            </div>
            <nav className="mt-8 flex flex-col gap-2 px-3">
              <a className="flex items-center gap-4 px-3 py-3 lg:px-5 lg:py-3 rounded-xl bg-[#FF6B00]/10 text-[#FF6B00] font-medium" href="#explorer">
                <span className="material-icons-round text-2xl">explore</span>
                <span className="hidden lg:block">Explorer</span>
              </a>
              <a className="flex items-center gap-4 px-3 py-3 lg:px-5 lg:py-3 rounded-xl text-gray-400 hover:bg-[#2D2D2D] transition-colors group" href="#salles">
                <span className="material-icons-round text-2xl group-hover:text-[#FF6B00] transition-colors">fitness_center</span>
                <span className="hidden lg:block font-medium">Salles</span>
              </a>
              <a className="flex items-center gap-4 px-3 py-3 lg:px-5 lg:py-3 rounded-xl text-gray-400 hover:bg-[#2D2D2D] transition-colors group" href="#programmes-gratuits">
                <span className="material-icons-round text-2xl group-hover:text-[#FF6B00] transition-colors">school</span>
                <span className="hidden lg:block font-medium">Programmes Gratuits</span>
              </a>
              <a className="flex items-center gap-4 px-3 py-3 lg:px-5 lg:py-3 rounded-xl text-gray-400 hover:bg-[#2D2D2D] transition-colors group" href="#favoris">
                <span className="material-icons-round text-2xl group-hover:text-[#FF6B00] transition-colors">favorite</span>
                <span className="hidden lg:block font-medium">Favoris</span>
              </a>
              <a className="flex items-center gap-4 px-3 py-3 lg:px-5 lg:py-3 rounded-xl text-gray-400 hover:bg-[#2D2D2D] transition-colors group" href="#devis">
                <span className="material-icons-round text-2xl group-hover:text-[#FF6B00] transition-colors">request_quote</span>
                <span className="hidden lg:block font-medium">Mes Devis</span>
              </a>
            </nav>
          </div>
          <div className="p-4 border-t border-[#2D2D2D]">
            <button 
              onClick={() => navigate('/login')}
              className="w-full flex items-center gap-3 px-3 py-3 lg:px-5 lg:py-3 rounded-xl text-gray-400 hover:bg-[#2D2D2D] transition-colors mb-2"
            >
              <span className="material-icons-round text-2xl">login</span>
              <span className="hidden lg:block font-medium">Se connecter</span>
            </button>
            <button
              onClick={() => navigate('/register')}
              className="w-full flex items-center gap-3 px-3 py-3 lg:px-5 lg:py-3 rounded-xl bg-gradient-to-r from-[#FF6B00] to-[#FF9E00] text-white font-medium hover:shadow-lg hover:shadow-[#FF6B00]/20 transition-all"
            >
              <span className="material-icons-round text-2xl">person_add</span>
              <span className="hidden lg:block">S'inscrire</span>
            </button>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 overflow-y-auto relative bg-[#121212]">
          
          {/* HEADER */}
          <header className="sticky top-0 z-10 bg-[#121212]/80 backdrop-blur-md px-8 py-6 flex justify-between items-center border-b border-[#2D2D2D]">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-white">
                Trouvez votre <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF6B00] to-[#FF9E00]">coach idéal</span>
              </h1>
              <p className="text-gray-400 mt-1">
                {userLocation ? "📍 Basé sur votre position" : "Recherchez par ville"}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button className="relative p-2 rounded-full text-gray-400 hover:bg-[#2D2D2D] transition-colors">
                <span className="material-icons-round">notifications_none</span>
              </button>
            </div>
          </header>

          <div className="p-6 lg:p-8">
            
            {/* SECTION GÉOLOCALISATION / SALLES PROCHES */}
            {userLocation && (
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <span className="material-icons-round text-[#FF6B00]">location_on</span>
                    Salles de sport à proximité
                  </h2>
                  <button className="text-sm text-[#FF6B00] hover:text-[#FF9E00] transition-colors">
                    Voir toutes les salles →
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {sallesProches.map(salle => (
                    <div key={salle.id} className="bg-[#1E1E1E] p-4 rounded-xl border border-[#2D2D2D] hover:border-[#FF6B00]/50 transition-all group cursor-pointer">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-white group-hover:text-[#FF6B00] transition-colors">{salle.nom}</h3>
                        <span className="text-xs text-gray-400">{salle.distance}</span>
                      </div>
                      <p className="text-sm text-gray-400">{salle.adresse}</p>
                      <button className="mt-3 text-xs text-[#FF6B00] font-medium">Voir les coachs →</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* BARRE DE RECHERCHE PRINCIPALE */}
            <div className="mb-8">
              <div className="bg-[#1E1E1E] p-6 rounded-2xl border border-[#2D2D2D]">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  
                  {/* Recherche par ville */}
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-400 mb-2">Ville</label>
                    <input
                      type="text"
                      value={searchVille}
                      onChange={(e) => {
                        setSearchVille(e.target.value);
                        setShowDropdown(true);
                      }}
                      onFocus={() => setShowDropdown(true)}
                      placeholder="Paris, Lyon, Marseille..."
                      className="w-full bg-[#2D2D2D] border border-[#3D3D3D] rounded-xl py-3 px-4 text-white placeholder-gray-500 outline-none focus:border-[#FF6B00] transition-all"
                    />
                    {showDropdown && filteredVilles.length > 0 && (
                      <div className="absolute z-20 mt-2 w-full bg-[#2D2D2D] border border-[#3D3D3D] rounded-xl shadow-lg max-h-60 overflow-y-auto">
                        {filteredVilles.map((ville, index) => (
                          <div
                            key={index}
                            onClick={() => {
                              setVilleSelectionnee(ville);
                              setSearchVille(ville);
                              setShowDropdown(false);
                            }}
                            className="px-4 py-3 cursor-pointer hover:bg-[#FF6B00] hover:text-white transition-all"
                          >
                            {ville}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Filtre spécialité */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Spécialité</label>
                    <select 
                      value={filters.specialite}
                      onChange={(e) => setFilters({...filters, specialite: e.target.value})}
                      className="w-full bg-[#2D2D2D] border border-[#3D3D3D] rounded-xl py-3 px-4 text-white outline-none focus:border-[#FF6B00] transition-all"
                    >
                      <option value="">Toutes les spécialités</option>
                      {specialites.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  {/* Filtre distance */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Distance max: {filters.distance} km
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="50"
                      value={filters.distance}
                      onChange={(e) => setFilters({...filters, distance: e.target.value})}
                      className="w-full accent-[#FF6B00]"
                    />
                  </div>

                  {/* Filtre prix max */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Prix max: {filters.prix_max} €
                    </label>
                    <input
                      type="range"
                      min="20"
                      max="300"
                      value={filters.prix_max}
                      onChange={(e) => setFilters({...filters, prix_max: e.target.value})}
                      className="w-full accent-[#FF6B00]"
                    />
                  </div>

                </div>

                {/* Filtres supplémentaires */}
                <div className="flex flex-wrap items-center justify-between mt-4 pt-4 border-t border-[#2D2D2D]">
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 text-sm text-gray-300">
                      <input 
                        type="checkbox" 
                        className="accent-[#FF6B00]"
                        onChange={(e) => setFilters({...filters, note_min: e.target.checked ? 4 : 0})}
                      />
                      Note minimum 4★
                    </label>
                    <select 
                      value={filters.type_offre}
                      onChange={(e) => setFilters({...filters, type_offre: e.target.value})}
                      className="bg-[#2D2D2D] border border-[#3D3D3D] rounded-lg py-2 px-3 text-sm text-white outline-none"
                    >
                      <option value="tous">Tous types</option>
                      <option value="seance">Séance unique</option>
                      <option value="pack">Pack</option>
                      <option value="abonnement">Abonnement</option>
                    </select>
                  </div>
                  <button 
                    onClick={rechercherCoachs}
                    className="flex items-center gap-2 bg-gradient-to-r from-[#FF6B00] to-[#FF9E00] text-white px-8 py-3 rounded-xl font-semibold shadow-lg shadow-[#FF6B00]/20 hover:shadow-[#FF6B00]/40 transition-all"
                  >
                    <span className="material-icons-round">search</span>
                    Rechercher
                  </button>
                </div>
              </div>
            </div>

            {/* RÉSULTATS DE RECHERCHE */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">
                  {coachs.length > 0 ? `${coachs.length} coachs trouvés` : "Coachs recommandés"}
                </h2>
                <span className="text-sm text-gray-400">Trié par: Pertinence</span>
              </div>

              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF6B00]"></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {coachs.map(coach => (
                    <div key={coach.id} className="bg-[#1E1E1E] rounded-2xl border border-[#2D2D2D] overflow-hidden hover:border-[#FF6B00]/50 transition-all group">
                      
                      {/* En-tête coach */}
                      <div className="p-6 pb-4">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#FF6B00] to-[#FF9E00] flex items-center justify-center text-white font-bold text-2xl">
                              {coach.nom.charAt(0)}
                            </div>
                            <div>
                              <h3 className="font-bold text-white text-lg group-hover:text-[#FF6B00] transition-colors">
                                {coach.nom}
                              </h3>
                              <div className="flex items-center gap-2 mt-1">
                                <div className="flex items-center text-[#FFD700]">
                                  {"★".repeat(Math.floor(coach.note))}
                                  {coach.note % 1 !== 0 && "½"}
                                </div>
                                <span className="text-sm text-gray-400">({coach.avis} avis)</span>
                              </div>
                            </div>
                          </div>
                          <button className="text-gray-400 hover:text-red-500 transition-colors">
                            <span className="material-icons-round">favorite_border</span>
                          </button>
                        </div>

                        {/* Spécialités */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {coach.specialites.map(spec => (
                            <span key={spec} className="px-3 py-1 rounded-full text-xs font-medium bg-[#2D2D2D] text-gray-300 border border-[#3D3D3D]">
                              {spec}
                            </span>
                          ))}
                        </div>

                        {/* Distance */}
                        <div className="flex items-center gap-1 text-sm text-gray-400 mb-4">
                          <span className="material-icons-round text-base">location_on</span>
                          {coach.distance} de vous
                        </div>

                        {/* Programmes gratuits */}
                        <div className="mb-4">
                          <p className="text-sm font-medium text-gray-300 mb-2">Programmes gratuits :</p>
                          <div className="space-y-2">
                            {coach.programmes_gratuits.map(prog => (
                              <div key={prog.id} className="flex items-center justify-between text-sm">
                                <span className="text-gray-400">{prog.titre}</span>
                                <button className="text-[#FF6B00] hover:text-[#FF9E00] transition-colors text-xs font-medium">
                                  Essayer
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Tarifs */}
                        <div className="grid grid-cols-3 gap-2 mb-6">
                          <button 
                            onClick={() => acheterOffre(coach, 'seance')}
                            className="text-center p-2 rounded-lg bg-[#2D2D2D] hover:bg-[#3D3D3D] transition-colors"
                          >
                            <span className="block text-xs text-gray-400">Séance</span>
                            <span className="block font-bold text-white">{coach.tarifs.seance}€</span>
                          </button>
                          <button 
                            onClick={() => acheterOffre(coach, 'pack')}
                            className="text-center p-2 rounded-lg bg-[#2D2D2D] hover:bg-[#3D3D3D] transition-colors"
                          >
                            <span className="block text-xs text-gray-400">Pack</span>
                            <span className="block font-bold text-white">{coach.tarifs.pack}€</span>
                          </button>
                          <button 
                            onClick={() => acheterOffre(coach, 'abonnement')}
                            className="text-center p-2 rounded-lg bg-[#FF6B00]/20 border border-[#FF6B00]/40 hover:bg-[#FF6B00]/30 transition-colors"
                          >
                            <span className="block text-xs text-gray-300">Mensuel</span>
                            <span className="block font-bold text-[#FF6B00]">{coach.tarifs.abonnement}€</span>
                          </button>
                        </div>
                      </div>

                      {/* Actions footer */}
                      <div className="flex border-t border-[#2D2D2D]">
                        <button 
                          onClick={() => voirProfil(coach)}
                          className="flex-1 py-3 text-center text-gray-400 hover:text-[#FF6B00] transition-colors border-r border-[#2D2D2D]"
                        >
                          Voir profil
                        </button>
                        <button 
                          onClick={() => demanderDevis(coach)}
                          className="flex-1 py-3 text-center text-gray-400 hover:text-[#FF6B00] transition-colors"
                        >
                          Demander devis
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* SECTION PROGRAMMES GRATUITS */}
            <div className="mt-12">
              <h2 className="text-xl font-bold text-white mb-6">Programmes gratuits populaires</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="bg-[#1E1E1E] p-5 rounded-xl border border-[#2D2D2D] hover:border-[#FF6B00]/50 transition-all cursor-pointer">
                    <div className="w-12 h-12 rounded-lg bg-[#FF6B00]/20 text-[#FF6B00] flex items-center justify-center mb-3">
                      <span className="material-icons-round">fitness_center</span>
                    </div>
                    <h3 className="font-semibold text-white mb-1">Découverte {i}</h3>
                    <p className="text-sm text-gray-400 mb-3">15 min • Débutant</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[#FF6B00] font-medium">Par Thomas D.</span>
                      <button className="text-[#FF6B00] hover:text-[#FF9E00] transition-colors">
                        <span className="material-icons-round text-sm">play_circle</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </main>
      </div>

      {/* MODAL D'ACHAT */}
      {showAchatModal && selectedCoach && selectedOffre && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1E1E1E] rounded-2xl border border-[#2D2D2D] max-w-md w-full">
            <div className="p-6 border-b border-[#2D2D2D]">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Finaliser l'achat</h2>
                <button onClick={() => setShowAchatModal(false)} className="text-gray-400 hover:text-white">
                  <span className="material-icons-round">close</span>
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#FF6B00] to-[#FF9E00] flex items-center justify-center text-white font-bold text-2xl">
                  {selectedCoach.nom.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-white">{selectedCoach.nom}</h3>
                  <p className="text-sm text-gray-400">{selectedOffre.description}</p>
                </div>
              </div>

              <div className="bg-[#2D2D2D] p-4 rounded-xl mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Prix total</span>
                  <span className="text-2xl font-bold text-white">{selectedOffre.prix}€</span>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-sm text-gray-400 text-center">
                  Vous allez être redirigé vers la page de paiement sécurisé.
                </p>
                <div className="flex gap-3">
                  <button 
                    onClick={() => setShowAchatModal(false)}
                    className="flex-1 py-3 rounded-xl border border-[#2D2D2D] text-gray-300 hover:bg-[#2D2D2D] transition-colors"
                  >
                    Annuler
                  </button>
                  <button 
                    onClick={() => {
                      // Logique de paiement
                      alert("Redirection vers le paiement...");
                      setShowAchatModal(false);
                    }}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#FF6B00] to-[#FF9E00] text-white font-semibold hover:shadow-lg hover:shadow-[#FF6B00]/20 transition-all"
                  >
                    Payer
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProspectDashboard;
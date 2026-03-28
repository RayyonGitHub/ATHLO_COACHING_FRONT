import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const villes = [
  'Aix-en-Provence', 'Amiens', 'Angers', 'Annecy', 'Avignon', 'Bayonne',
  'Belfort', 'Besançon', 'Bordeaux', 'Boulogne-Billancourt', 'Brest', 'Caen',
  'Clermont-Ferrand', 'Dijon', 'Grenoble', 'Le Havre', 'Le Mans', 'Lille',
  'Limoges', 'Lyon', 'Marseille', 'Metz', 'Montpellier', 'Mulhouse', 'Nancy',
  'Nantes', 'Nice', 'Nîmes', 'Orléans', 'Paris', 'Perpignan', 'Poitiers',
  'Reims', 'Rennes', 'Rouen', 'Saint-Étienne', 'Strasbourg', 'Toulon',
  'Toulouse', 'Tours', 'Villeurbanne',
];

const specialites = [
  'Crossfit',
  'Nutrition',
  'HIIT',
  'Pilates',
  'Boxe',
  'Méditation',
  'Yoga',
  'Force Athlétique',
];

const ProspectDashboard = () => {
  const navigate = useNavigate();

  // États de recherche
  const [searchMode, setSearchMode] = useState('distance'); // 'distance' ou 'ville'
  const [searchVille, setSearchVille] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [distanceMax, setDistanceMax] = useState(50);
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState('');

  const [filters, setFilters] = useState({
    specialite: '',
    note_min: 0,
    prix_max: 200,
    type_offre: 'tous',
  });

  const [coachs, setCoachs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lastSearchParams, setLastSearchParams] = useState(null);

  const [selectedCoach, setSelectedCoach] = useState(null);
  const [showAchatModal, setShowAchatModal] = useState(false);
  const [selectedOffre, setSelectedOffre] = useState('seance');

  const filteredVilles = useMemo(() => {
    if (!searchVille.trim()) return villes;
    return villes.filter((ville) =>
      ville.toLowerCase().includes(searchVille.toLowerCase())
    );
  }, [searchVille]);

  // Activation de la géolocalisation avec gestion explicite
  const enableGeolocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError('La géolocalisation n\'est pas supportée par votre navigateur');
      return;
    }

    setLocationLoading(true);
    setLocationError('');
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLocationEnabled(true);
        setLocationLoading(false);
        
        // Recherche automatique si le mode distance est actif
        if (searchMode === 'distance') {
          rechercherCoachs();
        }
      },
      (error) => {
        console.error('Erreur géolocalisation:', error);
        setLocationError('Impossible d\'obtenir votre position. Activez la localisation ou recherchez par ville.');
        setLocationEnabled(false);
        setLocationLoading(false);
      }
    );
  }, [searchMode]);

  // Désactiver la géolocalisation
  const disableGeolocation = useCallback(() => {
    setUserLocation(null);
    setLocationEnabled(false);
    setLocationError('');
    
    // Recherche par ville si le mode est ville et qu'une ville est saisie
    if (searchMode === 'ville' && searchVille.trim()) {
      rechercherCoachs();
    }
  }, [searchMode, searchVille]);

  const rechercherCoachs = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const params = new URLSearchParams();

      // Mode de recherche selon l'option choisie
      if (searchMode === 'distance' && userLocation) {
        params.append('lat', userLocation.lat);
        params.append('lng', userLocation.lng);
        params.append('distance_max', distanceMax);
        setLastSearchParams(`Recherche à ${distanceMax}km autour de votre position`);
      } 
      else if (searchMode === 'ville' && searchVille.trim()) {
        params.append('ville', searchVille.trim());
        setLastSearchParams(`Recherche dans ${searchVille.trim()}`);
      }
      else {
        setError('Veuillez activer la localisation ou saisir une ville');
        setLoading(false);
        return;
      }

      // Ajout des filtres
      if (filters.specialite) {
        params.append('specialite', filters.specialite);
      }
      if (filters.note_min > 0) {
        params.append('note_min', filters.note_min);
      }
      if (filters.prix_max) {
        params.append('prix_max', filters.prix_max);
      }
      if (filters.type_offre) {
        params.append('type_offre', filters.type_offre);
      }

      const response = await fetch(
        `http://127.0.0.1:8000/api/prospect/coachs/?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error('Erreur lors du chargement des coachs');
      }

      const data = await response.json();

      const formattedData = data.map((coach) => ({
        id: coach.id,
        nom: coach.nom,
        ville: coach.ville || '',
        distance: coach.distance_km,
        specialites: coach.specialites_tags || [],
        note: coach.note_moyenne || 0,
        avis: coach.nombre_avis || 0,
        tarifs: coach.offres_tarifs || { seance: 0, pack: 0, abonnement: 0 },
        description: coach.specialite || 'Coach sportif',
        programmes_gratuits: coach.programmes_gratuits || [],
      }));

      setCoachs(formattedData);
      
      if (formattedData.length === 0) {
        setError('Aucun coach trouvé dans cette zone');
      }
    } catch (err) {
      console.error(err);
      setError('Impossible de charger les coachs.');
      setCoachs([]);
    } finally {
      setLoading(false);
    }
  }, [searchMode, userLocation, searchVille, distanceMax, filters]);

  // Recherche manuelle déclenchée par l'utilisateur
  const handleSearch = useCallback(() => {
    if (searchMode === 'distance' && !userLocation) {
      setLocationError('Veuillez activer la localisation pour rechercher autour de vous');
      return;
    }
    if (searchMode === 'ville' && !searchVille.trim()) {
      setError('Veuillez saisir une ville');
      return;
    }
    rechercherCoachs();
  }, [searchMode, userLocation, searchVille, rechercherCoachs]);

  const ouvrirAchat = (coach, offre = 'seance') => {
    setSelectedCoach(coach);
    setSelectedOffre(offre);
    setShowAchatModal(true);
  };

  const demanderDevis = (coach) => {
    navigate('/prospect/devis', { state: { coach } });
  };

  return (
    <>
      <header className="sticky top-0 z-10 bg-[#121212]/80 backdrop-blur-md px-8 py-6 border-b border-[#2D2D2D]">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white">
              Trouvez votre{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF6B00] to-[#FF9E00]">
                coach idéal
              </span>
            </h1>
            <p className="text-gray-400 mt-1">
              Choisissez votre mode de recherche
            </p>
          </div>

          <div className="bg-[#1E1E1E] border border-[#2D2D2D] rounded-2xl px-4 py-3 text-sm text-gray-300 inline-flex items-center gap-2">
            <span className="material-icons-round text-[#FF6B00] text-base">insights</span>
            {coachs.length} résultat{coachs.length > 1 ? 's' : ''}
          </div>
        </div>
      </header>

      <div className="p-6 lg:p-8 space-y-8">
        <section className="bg-[#1E1E1E] border border-[#2D2D2D] rounded-3xl p-6 lg:p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-[#FF6B00]/10 rounded-full blur-3xl"></div>

          <div className="relative z-10 max-w-3xl">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-[#FF6B00]/20 to-[#FF9E00]/20 text-[#FF6B00] flex items-center justify-center mb-5">
              <span className="material-icons-round text-3xl">explore</span>
            </div>

            <h2 className="text-2xl lg:text-3xl font-bold text-white mb-3">
              Rechercher un accompagnement sportif adapté
            </h2>

            <p className="text-gray-400 leading-relaxed">
              Comparez les coachs, consultez leurs spécialités, découvrez leurs
              programmes gratuits et choisissez la formule qui vous convient.
            </p>
          </div>
        </section>

        {/* Section mode de recherche */}
        <section className="bg-[#1E1E1E] border border-[#2D2D2D] rounded-3xl p-6">
          <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setSearchMode('distance');
                  setError('');
                }}
                className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                  searchMode === 'distance'
                    ? 'bg-gradient-to-r from-[#FF6B00] to-[#FF9E00] text-white'
                    : 'bg-[#2D2D2D] text-gray-300 hover:bg-[#3D3D3D]'
                }`}
              >
                📍 Autour de moi
              </button>
              <button
                onClick={() => {
                  setSearchMode('ville');
                  setError('');
                  if (!locationEnabled) {
                    disableGeolocation();
                  }
                }}
                className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                  searchMode === 'ville'
                    ? 'bg-gradient-to-r from-[#FF6B00] to-[#FF9E00] text-white'
                    : 'bg-[#2D2D2D] text-gray-300 hover:bg-[#3D3D3D]'
                }`}
              >
                🏙️ Par ville
              </button>
            </div>

            {lastSearchParams && (
              <div className="text-sm text-gray-400 bg-[#2D2D2D] px-4 py-2 rounded-xl">
                {lastSearchParams}
              </div>
            )}
          </div>
        </section>

        {/* Section recherche */}
        <section className="bg-[#1E1E1E] border border-[#2D2D2D] rounded-3xl p-6">
          <div className="space-y-6">
            {/* Mode distance */}
            {searchMode === 'distance' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-semibold">Géolocalisation</h3>
                    <p className="text-sm text-gray-400">
                      Activez pour trouver des coachs autour de vous
                    </p>
                  </div>
                  {!locationEnabled ? (
                    <button
                      onClick={enableGeolocation}
                      disabled={locationLoading}
                      className="px-6 py-2 rounded-xl bg-[#FF6B00] text-white font-semibold hover:bg-[#FF8C00] transition-all disabled:opacity-50"
                    >
                      {locationLoading ? 'Chargement...' : 'Activer la localisation'}
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-green-500">✓ Localisation active</span>
                      <button
                        onClick={disableGeolocation}
                        className="px-4 py-2 rounded-xl bg-[#2D2D2D] text-gray-300 hover:bg-[#3D3D3D] transition-all"
                      >
                        Désactiver
                      </button>
                    </div>
                  )}
                </div>

                {locationEnabled && userLocation && (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-400">
                      Rayon de recherche : {distanceMax} km
                    </label>
                    <input
                      type="range"
                      min="5"
                      max="100"
                      step="5"
                      value={distanceMax}
                      onChange={(e) => setDistanceMax(Number(e.target.value))}
                      className="w-full accent-[#FF6B00]"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>5km</span>
                      <span>50km</span>
                      <span>100km</span>
                    </div>
                  </div>
                )}

                {locationError && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                    <p className="text-red-300 text-sm">{locationError}</p>
                  </div>
                )}
              </div>
            )}

            {/* Mode ville */}
            {searchMode === 'ville' && (
              <div className="relative">
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Ville
                </label>
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
                    {filteredVilles.slice(0, 8).map((ville, index) => (
                      <div
                        key={index}
                        onClick={() => {
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
            )}

            {/* Filtres communs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-[#2D2D2D]">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Spécialité
                </label>
                <select
                  value={filters.specialite}
                  onChange={(e) =>
                    setFilters({ ...filters, specialite: e.target.value })
                  }
                  className="w-full bg-[#2D2D2D] border border-[#3D3D3D] rounded-xl py-3 px-4 text-white outline-none focus:border-[#FF6B00] transition-all"
                >
                  <option value="">Toutes les spécialités</option>
                  {specialites.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Prix max : {filters.prix_max} €
                </label>
                <input
                  type="range"
                  min="20"
                  max="600"
                  value={filters.prix_max}
                  onChange={(e) =>
                    setFilters({ ...filters, prix_max: Number(e.target.value) })
                  }
                  className="w-full accent-[#FF6B00]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Type d’offre
                </label>
                <select
                  value={filters.type_offre}
                  onChange={(e) =>
                    setFilters({ ...filters, type_offre: e.target.value })
                  }
                  className="w-full bg-[#2D2D2D] border border-[#3D3D3D] rounded-xl py-3 px-4 text-white outline-none focus:border-[#FF6B00] transition-all"
                >
                  <option value="tous">Tous types</option>
                  <option value="seance">Séance</option>
                  <option value="pack">Pack</option>
                  <option value="abonnement">Abonnement</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pt-2">
              <label className="flex items-center gap-2 text-sm text-gray-300">
                <input
                  type="checkbox"
                  className="accent-[#FF6B00]"
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      note_min: e.target.checked ? 4 : 0,
                    })
                  }
                />
                Note minimum 4★
              </label>

              <button
                onClick={handleSearch}
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#FF6B00] to-[#FF9E00] text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-[#FF6B00]/20 transition-all"
              >
                <span className="material-icons-round">search</span>
                Rechercher
              </button>
            </div>
          </div>
        </section>

        {/* Le reste du code reste identique pour l'affichage des coachs */}
        <section>
          {/* ... Le même code que précédemment pour l'affichage des résultats ... */}
          {loading ? (
            <div className="bg-[#1E1E1E] border border-[#2D2D2D] rounded-3xl p-10 text-center">
              <p className="text-white font-medium">Chargement des coachs...</p>
            </div>
          ) : error ? (
            <div className="bg-red-500/10 border border-red-500/20 rounded-3xl p-10 text-center">
              <p className="text-red-300 font-medium">{error}</p>
            </div>
          ) : coachs.length === 0 ? (
            <div className="bg-[#1E1E1E] border border-[#2D2D2D] rounded-3xl p-10 text-center">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-[#2D2D2D] text-gray-400 flex items-center justify-center mb-4">
                <span className="material-icons-round text-3xl">search_off</span>
              </div>
              <p className="text-white font-medium">Aucun coach trouvé.</p>
              <p className="text-gray-500 text-sm mt-2">
                {searchMode === 'distance' 
                  ? "Essayez d'augmenter le rayon de recherche ou modifiez les filtres."
                  : "Essayez une autre ville ou modifiez les filtres."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {/* Même code d'affichage des coachs */}
              {coachs.map((coach) => (
                <div
                  key={coach.id}
                  className="bg-[#1E1E1E] rounded-3xl border border-[#2D2D2D] overflow-hidden hover:border-[#FF6B00]/40 transition-all"
                >
                  <div className="p-6">
                    <div className="flex items-start gap-4 mb-5">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#FF6B00] to-[#FF9E00] flex items-center justify-center text-white font-bold text-2xl shrink-0">
                        {coach.nom?.charAt(0) || 'C'}
                      </div>

                      <div className="min-w-0">
                        <h3 className="font-bold text-white text-lg">{coach.nom}</h3>
                        <p className="text-sm text-gray-400">{coach.ville}</p>
                        {coach.distance && (
                          <p className="text-sm text-[#FF6B00]">
                            {coach.distance.toFixed(1)} km de vous
                          </p>
                        )}
                        <p className="text-sm text-gray-400 mt-1">
                          {coach.note} ★ • {coach.avis} avis
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {coach.specialites.length > 0 ? (
                        coach.specialites.map((spec) => (
                          <span
                            key={spec}
                            className="px-3 py-1 rounded-full text-xs font-medium bg-[#2D2D2D] text-gray-300 border border-[#3D3D3D]"
                          >
                            {spec}
                          </span>
                        ))
                      ) : (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#2D2D2D] text-gray-400 border border-[#3D3D3D]">
                          Non renseigné
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-gray-400 mb-5 line-clamp-2">
                      {coach.description}
                    </p>

                    <div className="bg-[#181818] border border-[#2D2D2D] rounded-2xl p-4 mb-5">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-400">Tarif séance</span>
                        <span className="font-bold text-white">{coach.tarifs.seance || 0}€</span>
                      </div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-400">Pack</span>
                        <span className="font-medium text-gray-200">{coach.tarifs.pack || 0}€</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Abonnement</span>
                        <span className="font-medium text-[#FF6B00]">
                          {coach.tarifs.abonnement || 0}€
                        </span>
                      </div>
                    </div>

                    <div className="mb-5">
                      <p className="text-sm font-medium text-gray-300 mb-2">
                        Programmes gratuits
                      </p>
                      <div className="space-y-2">
                        {coach.programmes_gratuits.length > 0 ? (
                          coach.programmes_gratuits.slice(0, 2).map((prog) => (
                            <div
                              key={prog.id}
                              className="flex items-center justify-between text-sm bg-[#181818] border border-[#2D2D2D] rounded-xl px-3 py-2"
                            >
                              <span className="text-gray-300">{prog.titre}</span>
                              <span className="text-[#FF6B00] text-xs">Gratuit</span>
                            </div>
                          ))
                        ) : (
                          <div className="text-sm bg-[#181818] border border-[#2D2D2D] rounded-xl px-3 py-2 text-gray-500">
                            Aucun programme gratuit
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <button
                        onClick={() => ouvrirAchat(coach, 'seance')}
                        className="py-3 rounded-xl bg-gradient-to-r from-[#FF6B00] to-[#FF9E00] text-white font-semibold hover:shadow-lg hover:shadow-[#FF6B00]/20 transition-all"
                      >
                        Acheter
                      </button>

                      <button
                        onClick={() => demanderDevis(coach)}
                        className="py-3 rounded-xl border border-[#2D2D2D] text-gray-300 hover:bg-[#2D2D2D] transition-colors"
                      >
                        Devis
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Section programmes gratuits */}
        {coachs.length > 0 && (
          <section className="bg-[#1E1E1E] border border-[#2D2D2D] rounded-3xl p-6 lg:p-8">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-white">Programmes gratuits populaires</h2>
              <p className="text-sm text-gray-400 mt-1">
                Un aperçu rapide pour découvrir le style d’accompagnement proposé.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {coachs
                .flatMap((coach) => coach.programmes_gratuits || [])
                .slice(0, 4)
                .map((prog) => (
                  <div
                    key={prog.id}
                    className="bg-[#181818] p-5 rounded-2xl border border-[#2D2D2D] hover:border-[#FF6B00]/40 transition-all"
                  >
                    <div className="w-12 h-12 rounded-xl bg-[#FF6B00]/20 text-[#FF6B00] flex items-center justify-center mb-3">
                      <span className="material-icons-round">fitness_center</span>
                    </div>
                    <h3 className="font-semibold text-white mb-1">{prog.titre}</h3>
                    <p className="text-sm text-gray-400 mb-3 line-clamp-2">
                      {prog.description || 'Programme gratuit'}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[#FF6B00] font-medium">Accès gratuit</span>
                      <span className="material-icons-round text-[#FF6B00] text-sm">play_circle</span>
                    </div>
                  </div>
                ))}
            </div>
          </section>
        )}
      </div>

      {/* Modal d'achat - identique */}
      {showAchatModal && selectedCoach && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1E1E1E] rounded-3xl border border-[#2D2D2D] max-w-md w-full">
            <div className="p-6 border-b border-[#2D2D2D] flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Acheter une offre</h2>
              <button
                onClick={() => setShowAchatModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <span className="material-icons-round">close</span>
              </button>
            </div>

            <div className="p-6">
              <div className="mb-5">
                <h3 className="font-bold text-white">{selectedCoach.nom}</h3>
                <p className="text-sm text-gray-400">{selectedCoach.ville}</p>
              </div>

              <div className="space-y-3 mb-6">
                <button
                  onClick={() => setSelectedOffre('seance')}
                  className={`w-full rounded-xl border p-4 text-left ${
                    selectedOffre === 'seance'
                      ? 'border-[#FF6B00] bg-[#FF6B00]/10'
                      : 'border-[#2D2D2D] bg-[#2D2D2D]'
                  }`}
                >
                  <p className="text-white font-medium">Séance unique</p>
                  <p className="text-sm text-gray-400">{selectedCoach.tarifs.seance || 0}€</p>
                </button>

                <button
                  onClick={() => setSelectedOffre('pack')}
                  className={`w-full rounded-xl border p-4 text-left ${
                    selectedOffre === 'pack'
                      ? 'border-[#FF6B00] bg-[#FF6B00]/10'
                      : 'border-[#2D2D2D] bg-[#2D2D2D]'
                  }`}
                >
                  <p className="text-white font-medium">Pack</p>
                  <p className="text-sm text-gray-400">{selectedCoach.tarifs.pack || 0}€</p>
                </button>

                <button
                  onClick={() => setSelectedOffre('abonnement')}
                  className={`w-full rounded-xl border p-4 text-left ${
                    selectedOffre === 'abonnement'
                      ? 'border-[#FF6B00] bg-[#FF6B00]/10'
                      : 'border-[#2D2D2D] bg-[#2D2D2D]'
                  }`}
                >
                  <p className="text-white font-medium">Abonnement mensuel</p>
                  <p className="text-sm text-gray-400">
                    {selectedCoach.tarifs.abonnement || 0}€
                  </p>
                </button>
              </div>

              <button
                onClick={() => {
                  alert(`Offre "${selectedOffre}" sélectionnée pour ${selectedCoach.nom}`);
                  setShowAchatModal(false);
                }}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#FF6B00] to-[#FF9E00] text-white font-semibold"
              >
                Continuer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProspectDashboard;
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { API_BASE_URL } from '../services/api';

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
  'Crossfit', 'Nutrition', 'HIIT', 'Pilates', 'Boxe', 
  'Méditation', 'Yoga', 'Force Athlétique',
];
const getCoachDisplayName = (coach) =>
  coach?.full_name ||
  `${coach?.first_name || coach?.prenom || ''} ${coach?.last_name || ''}`.trim() ||
  coach?.nom ||
  coach?.email ||
  'Coach';

const ProspectDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state || {}; // Récupération des filtres depuis la page Salles

  // Si on vient de la page Salles, on passe par défaut en mode 'ville' avec la ville et la salle pré-remplies
  const [searchMode, setSearchMode] = useState(state.villeFiltree ? 'ville' : 'distance');
  const [searchVille, setSearchVille] = useState(state.villeFiltree || '');
  const [searchSalle, setSearchSalle] = useState(state.salleFiltree || '');
  
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

  const filteredVilles = useMemo(() => {
    if (!searchVille.trim()) return villes;
    return villes.filter((ville) =>
      ville.toLowerCase().includes(searchVille.toLowerCase())
    );
  }, [searchVille]);

  const enableGeolocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError("La géolocalisation n'est pas supportée par votre navigateur");
      return;
    }
    setLocationLoading(true);
    setLocationError('');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
        setLocationEnabled(true);
        setLocationLoading(false);
        setLocationError('');
        setSearchSalle(''); // On reset le filtre salle si on passe en géolocalisation pure
      },
      (geoError) => {
        setLocationError("Impossible d'obtenir votre position. Activez la localisation ou recherchez par ville.");
        setLocationEnabled(false);
        setLocationLoading(false);
      }
    );
  }, []);

  const disableGeolocation = useCallback(() => {
    setUserLocation(null);
    setLocationEnabled(false);
    setLocationError('');
    if (searchMode === 'ville' && searchVille.trim()) {
      rechercherCoachs();
    }
  }, [searchMode, searchVille]);

  const rechercherCoachs = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const params = new URLSearchParams();

      if (searchMode === 'distance' && userLocation) {
        params.append('lat', userLocation.lat);
        params.append('lng', userLocation.lng);
        params.append('distance_max', distanceMax);
        setLastSearchParams(`Recherche à ${distanceMax}km autour de vous`);
      } else if (searchMode === 'ville') {
        if (searchVille.trim()) {
          params.append('ville', searchVille.trim());
          setLastSearchParams(searchSalle ? `Recherche dans la salle : ${searchSalle}` : `Recherche dans ${searchVille.trim()}`);
        } else {
          setLastSearchParams('Recherche dans toutes les villes');
        }
      } else {
        setError('Veuillez activer la localisation');
        setLoading(false);
        return;
      }

      // Appliquer les filtres
      if (searchSalle) params.append('salle', searchSalle);
      if (filters.specialite) params.append('specialite', filters.specialite);
      if (filters.note_min > 0) params.append('note_min', filters.note_min);
      if (filters.prix_max) params.append('prix_max', filters.prix_max);
      if (filters.type_offre) params.append('type_offre', filters.type_offre);

      const response = await fetch(`${API_BASE_URL}/prospects/coachs/?${params.toString()}`);
      if (!response.ok) throw new Error('Erreur lors du chargement des coachs');

      const data = await response.json();
      setCoachs(data);

      if (data.length === 0) setError('Aucun coach trouvé dans cette zone');
    } catch (err) {
      setError('Impossible de charger les coachs.');
      setCoachs([]);
    } finally {
      setLoading(false);
    }
  }, [searchMode, userLocation, searchVille, searchSalle, distanceMax, filters]);

  // Déclencher la recherche automatiquement si on arrive depuis la page des Salles
  useEffect(() => {
    if (searchMode === 'ville' && searchVille) {
      rechercherCoachs();
    } else if (searchMode === 'distance' && locationEnabled && userLocation) {
      rechercherCoachs();
    }
  }, [searchMode, locationEnabled, userLocation, distanceMax, searchVille]); // On retire rechercherCoachs pour éviter les boucles

  const handleSearch = useCallback(() => {
    if (searchMode === 'distance' && !userLocation) {
      setLocationError('Veuillez activer la localisation pour rechercher autour de vous');
      return;
    }
    rechercherCoachs();
  }, [searchMode, userLocation, rechercherCoachs]);

  const clearSalleFilter = () => {
    setSearchSalle('');
    rechercherCoachs();
  };

  const acheterOffre = (coach, typeOffre = 'seance') => {
    const prix = coach?.tarifs?.[typeOffre] || 0;
    navigate('/prospect/checkout', {
      state: { coach, selectedOffre: { type: typeOffre, prix, description: typeOffre === 'seance' ? 'Séance unique' : typeOffre === 'pack' ? 'Pack 10 séances' : 'Abonnement mensuel'} },
    });
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
              Trouvez votre <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF6B00] to-[#FF9E00]">coach idéal</span>
            </h1>
          </div>
          <div className="bg-[#1E1E1E] border border-[#2D2D2D] rounded-2xl px-4 py-3 text-sm text-gray-300 inline-flex items-center gap-2">
            <span className="material-icons-round text-[#FF6B00] text-base">insights</span>
            {coachs.length} résultat{coachs.length > 1 ? 's' : ''}
          </div>
        </div>
      </header>

      <div className="p-6 lg:p-8 space-y-8">
        
        {/* Encart Filtre actif si on vient d'une salle */}
        {searchSalle && (
           <div className="bg-[#FF6B00]/10 border border-[#FF6B00]/30 rounded-2xl p-4 flex items-center justify-between">
             <div className="flex items-center gap-3">
                <span className="material-icons-round text-[#FF6B00]">fitness_center</span>
                <div>
                  <p className="text-sm font-bold text-white">Recherche ciblée dans la salle : {searchSalle}</p>
                  <p className="text-xs text-gray-400">Seuls les coachs affiliés à cette salle sont affichés.</p>
                </div>
             </div>
             <button onClick={clearSalleFilter} className="px-4 py-2 bg-[#2D2D2D] text-white text-sm rounded-xl hover:bg-[#3D3D3D] transition">Voir tous les coachs</button>
           </div>
        )}

        <section className="bg-[#1E1E1E] border border-[#2D2D2D] rounded-3xl p-6">
          <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
            <div className="flex gap-2">
              <button
                onClick={() => { setSearchMode('distance'); setError(''); setSearchSalle(''); }}
                className={`px-6 py-3 rounded-xl font-semibold transition-all ${searchMode === 'distance' ? 'bg-gradient-to-r from-[#FF6B00] to-[#FF9E00] text-white' : 'bg-[#2D2D2D] text-gray-300 hover:bg-[#3D3D3D]'}`}
              >📍 Autour de moi</button>
              <button
                onClick={() => { setSearchMode('ville'); setError(''); if(locationEnabled) disableGeolocation(); }}
                className={`px-6 py-3 rounded-xl font-semibold transition-all ${searchMode === 'ville' ? 'bg-gradient-to-r from-[#FF6B00] to-[#FF9E00] text-white' : 'bg-[#2D2D2D] text-gray-300 hover:bg-[#3D3D3D]'}`}
              >🏙️ Par ville</button>
            </div>
            {lastSearchParams && <div className="text-sm text-gray-400 bg-[#2D2D2D] px-4 py-2 rounded-xl">{lastSearchParams}</div>}
          </div>
        </section>

        <section className="bg-[#1E1E1E] border border-[#2D2D2D] rounded-3xl p-6">
          <div className="space-y-6">
            {searchMode === 'distance' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-semibold">Géolocalisation</h3>
                    <p className="text-sm text-gray-400">Activez pour trouver des coachs autour de vous</p>
                  </div>
                  {!locationEnabled ? (
                    <button onClick={enableGeolocation} disabled={locationLoading} className="px-6 py-2 rounded-xl bg-[#FF6B00] text-white font-semibold hover:bg-[#FF8C00] transition-all disabled:opacity-50">
                      {locationLoading ? 'Chargement...' : 'Activer la localisation'}
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-green-500">✓ Localisation active</span>
                      <button onClick={disableGeolocation} className="px-4 py-2 rounded-xl bg-[#2D2D2D] text-gray-300 hover:bg-[#3D3D3D]">Désactiver</button>
                    </div>
                  )}
                </div>
                {locationEnabled && userLocation && (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-400">Rayon : {distanceMax} km</label>
                    <input type="range" min="5" max="100" step="5" value={distanceMax} onChange={(e) => setDistanceMax(Number(e.target.value))} className="w-full accent-[#FF6B00]" />
                  </div>
                )}
              </div>
            )}

            {searchMode === 'ville' && (
              <div className="relative">
                <label className="block text-sm font-medium text-gray-400 mb-2">Ville</label>
                <input
                  type="text" value={searchVille}
                  onChange={(e) => { setSearchVille(e.target.value); setShowDropdown(true); }}
                  onFocus={() => setShowDropdown(true)}
                  placeholder="Paris, Lyon, Marseille..."
                  className="w-full bg-[#2D2D2D] border border-[#3D3D3D] rounded-xl py-3 px-4 text-white outline-none focus:border-[#FF6B00]"
                />
                {showDropdown && filteredVilles.length > 0 && (
                  <div className="absolute z-20 mt-2 w-full bg-[#2D2D2D] border border-[#3D3D3D] rounded-xl shadow-lg max-h-60 overflow-y-auto">
                    {filteredVilles.slice(0, 8).map((ville, index) => (
                      <div key={index} onClick={() => { setSearchVille(ville); setShowDropdown(false); }} className="px-4 py-3 cursor-pointer hover:bg-[#FF6B00] hover:text-white transition-all">{ville}</div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-[#2D2D2D]">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Spécialité</label>
                <select value={filters.specialite} onChange={(e) => setFilters({ ...filters, specialite: e.target.value })} className="w-full bg-[#2D2D2D] border border-[#3D3D3D] rounded-xl py-3 px-4 text-white outline-none focus:border-[#FF6B00]">
                  <option value="">Toutes</option>
                  {specialites.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Prix max : {filters.prix_max} €</label>
                <input type="range" min="20" max="600" value={filters.prix_max} onChange={(e) => setFilters({ ...filters, prix_max: Number(e.target.value) })} className="w-full accent-[#FF6B00]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Type d’offre</label>
                <select value={filters.type_offre} onChange={(e) => setFilters({ ...filters, type_offre: e.target.value })} className="w-full bg-[#2D2D2D] border border-[#3D3D3D] rounded-xl py-3 px-4 text-white outline-none focus:border-[#FF6B00]">
                  <option value="tous">Tous types</option><option value="seance">Séance</option><option value="pack">Pack</option><option value="abonnement">Abonnement</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pt-2">
              <label className="flex items-center gap-2 text-sm text-gray-300">
                <input type="checkbox" className="accent-[#FF6B00]" onChange={(e) => setFilters({ ...filters, note_min: e.target.checked ? 4 : 0 })} /> Note minimum 4★
              </label>
              <button onClick={handleSearch} className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#FF6B00] to-[#FF9E00] text-white px-8 py-3 rounded-xl font-semibold">
                <span className="material-icons-round">search</span> Rechercher
              </button>
            </div>
          </div>
        </section>

        <section>
          {loading ? (
            <div className="bg-[#1E1E1E] rounded-3xl p-10 text-center"><p className="text-white">Chargement...</p></div>
          ) : error ? (
            <div className="bg-red-500/10 rounded-3xl p-10 text-center"><p className="text-red-300">{error}</p></div>
          ) : coachs.length === 0 ? (
            <div className="bg-[#1E1E1E] rounded-3xl p-10 text-center"><p className="text-white">Aucun coach trouvé.</p></div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {coachs.map((coach) => (
                <div key={coach.id} className="bg-[#1E1E1E] rounded-3xl border border-[#2D2D2D] overflow-hidden hover:border-[#FF6B00]/40 transition-all flex flex-col h-full">
                  <div className="p-6 flex-grow">
                    <div className="flex items-start gap-4 mb-5">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#FF6B00] to-[#FF9E00] flex items-center justify-center text-white font-bold text-2xl shrink-0">
                        {getCoachDisplayName(coach).charAt(0) || 'C'}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-white text-lg">{getCoachDisplayName(coach)}</h3>
                        <p className="text-sm text-gray-400">{coach.ville}</p>
                        <p className="text-sm text-gray-400 mt-1">{coach.note} ★ • {coach.avis} avis</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {coach.specialites.length > 0 ? (
                        coach.specialites.map((spec) => <span key={spec} className="px-3 py-1 rounded-full text-xs font-medium bg-[#2D2D2D] text-gray-300 border border-[#3D3D3D]">{spec}</span>)
                      ) : (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#2D2D2D] text-gray-400 border border-[#3D3D3D]">Non renseigné</span>
                      )}
                    </div>
                    
                    {/* AFFICHAGE DES SALLES */}
                    {coach.salles && coach.salles.length > 0 && (
                      <div className="mb-4 bg-[#181818] rounded-xl p-3 border border-[#2D2D2D]">
                        <p className="text-xs text-gray-500 mb-1 flex items-center gap-1"><span className="material-icons-round text-[14px]">fitness_center</span> Salles d'exercice</p>
                        <div className="flex flex-wrap gap-1">
                           {coach.salles.map(salle => (
                             <span key={salle.id} className="text-xs font-medium text-gray-300 bg-[#2D2D2D] px-2 py-0.5 rounded-md">{salle.nom}</span>
                           ))}
                        </div>
                      </div>
                    )}

                    <p className="text-sm text-gray-400 mb-5 line-clamp-2">{coach.description}</p>

                    <div className="bg-[#181818] border border-[#2D2D2D] rounded-2xl p-4 mb-5">
                      <div className="flex justify-between mb-2"><span className="text-sm text-gray-400">Tarif séance</span><span className="font-bold text-white">{coach.tarifs.seance || 0}€</span></div>
                      <div className="flex justify-between mb-2"><span className="text-sm text-gray-400">Pack</span><span className="font-medium text-gray-200">{coach.tarifs.pack || 0}€</span></div>
                      <div className="flex justify-between"><span className="text-sm text-gray-400">Abonnement</span><span className="font-medium text-[#FF6B00]">{coach.tarifs.abonnement || 0}€</span></div>
                    </div>
                  </div>

                  <div className="p-6 pt-0 mt-auto">
                    <div className="grid grid-cols-3 gap-2 mt-4">
                      <button onClick={() => acheterOffre(coach, 'seance')} className="bg-[#2D2D2D] p-2 rounded-lg text-center hover:bg-[#3D3D3D]"><span className="block text-[10px] text-gray-400">Séance</span><span className="font-bold text-white">{coach.tarifs?.seance || 0}€</span></button>
                      <button onClick={() => acheterOffre(coach, 'pack')} className="bg-[#2D2D2D] p-2 rounded-lg text-center hover:bg-[#3D3D3D]"><span className="block text-[10px] text-gray-400">Pack</span><span className="font-bold text-white">{coach.tarifs?.pack || 0}€</span></button>
                      <button onClick={() => acheterOffre(coach, 'abonnement')} className="bg-[#FF6B00]/20 border border-[#FF6B00]/40 p-2 rounded-lg text-center"><span className="block text-[10px] text-orange-300">Mensuel</span><span className="font-bold text-orange-500">{coach.tarifs?.abonnement || 0}€</span></button>
                    </div>
                    <button onClick={() => demanderDevis(coach)} className="w-full mt-4 py-2 text-sm text-gray-400 hover:text-white transition-colors">Demander un devis personnalisé</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
};

export default ProspectDashboard;

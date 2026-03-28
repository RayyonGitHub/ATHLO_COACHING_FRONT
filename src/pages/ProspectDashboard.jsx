import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import prospectService from '../services/prospectService';

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
  'Crossfit', 'Nutrition', 'HIIT', 'Pilates', 'Boxe', 'Méditation', 'Yoga', 'Force Athlétique',
];

const ProspectDashboard = () => {
  const navigate = useNavigate();

  const [searchVille, setSearchVille] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [coachs, setCoachs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedCoach, setSelectedCoach] = useState(null);

  const [filters, setFilters] = useState({
    specialite: '',
    distance: 10,
    note_min: 0,
    prix_max: 500,
    type_offre: 'tous',
  });

  const filteredVilles = useMemo(() => {
    if (!searchVille.trim()) return villes;
    return villes.filter((ville) =>
      ville.toLowerCase().includes(searchVille.toLowerCase())
    );
  }, [searchVille]);

  const rechercherCoachs = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await prospectService.getPublicCoaches({
        ville: searchVille || '',
        specialite: filters.specialite || '',
        note_min: filters.note_min || 0,
        prix_max: filters.prix_max || 9999,
        type_offre: filters.type_offre || 'tous',
      });
      setCoachs(data);
    } catch (err) {
      console.error(err);
      setError("Impossible de charger les coachs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    rechercherCoachs();
  }, []);

  const acheterOffre = (coach, typeOffre) => {
    const prix = coach?.tarifs?.[typeOffre];
    navigate('/prospect/checkout', {
      state: {
        coach,
        selectedOffre: {
          type: typeOffre,
          prix,
          description: typeOffre === 'seance' ? 'Séance unique' : typeOffre === 'pack' ? 'Pack 10 séances' : 'Abonnement mensuel',
        },
      },
    });
  };

  const demanderDevis = (coach) => {
    navigate('/prospect/devis', { state: { coach } });
  };

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <header className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-[#2D2D2D] pb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white">
            Trouvez votre <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF6B00] to-[#FF9E00]">coach idéal</span>
          </h1>
          <p className="text-gray-400 mt-1">Explorez les coachs selon votre ville et vos objectifs.</p>
        </div>
      </header>

      {/* Barre de Recherche et Filtres */}
      <section className="bg-[#1E1E1E] border border-[#2D2D2D] rounded-3xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <label className="block text-sm font-medium text-gray-400 mb-2">Ville</label>
            <input
              type="text"
              value={searchVille}
              onChange={(e) => { setSearchVille(e.target.value); setShowDropdown(true); }}
              placeholder="Paris, Lyon..."
              className="w-full bg-[#2D2D2D] border border-[#3D3D3D] rounded-xl py-3 px-4 text-white outline-none focus:border-[#FF6B00]"
            />
            {showDropdown && filteredVilles.length > 0 && (
              <div className="absolute z-20 mt-2 w-full bg-[#2D2D2D] border border-[#3D3D3D] rounded-xl shadow-lg max-h-60 overflow-y-auto">
                {filteredVilles.slice(0, 8).map((v, i) => (
                  <div key={i} onClick={() => { setSearchVille(v); setShowDropdown(false); }} className="px-4 py-3 cursor-pointer hover:bg-[#FF6B00]">
                    {v}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Spécialité</label>
            <select
              value={filters.specialite}
              onChange={(e) => setFilters({ ...filters, specialite: e.target.value })}
              className="w-full bg-[#2D2D2D] border border-[#3D3D3D] rounded-xl py-3 px-4 text-white outline-none"
            >
              <option value="">Toutes</option>
              {specialites.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Prix max : {filters.prix_max}€</label>
            <input
              type="range" min="20" max="500" step="5"
              value={filters.prix_max}
              onChange={(e) => setFilters({ ...filters, prix_max: Number(e.target.value) })}
              className="w-full accent-[#FF6B00]"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={rechercherCoachs}
              className="w-full bg-gradient-to-r from-[#FF6B00] to-[#FF9E00] text-white py-3 rounded-xl font-bold hover:shadow-lg transition-all"
            >
              Rechercher
            </button>
          </div>
        </div>
      </section>

      {/* Liste des Coachs */}
      <section>
        {loading ? (
          <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#FF6B00]"></div></div>
        ) : coachs.length === 0 ? (
          <div className="text-center py-12 text-gray-500 bg-[#1E1E1E] rounded-3xl">Aucun coach trouvé.</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {coachs.map((coach) => (
              <div key={coach.id} className="bg-[#1E1E1E] rounded-3xl border border-[#2D2D2D] overflow-hidden hover:border-[#FF6B00]/40 transition-all">
                <div className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 rounded-full bg-orange-500 flex items-center justify-center font-bold text-xl">
                      {(coach.full_name || coach.nom).charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-white">{coach.full_name || coach.nom}</h3>
                      <p className="text-sm text-gray-400">{coach.ville}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {(coach.specialites || []).map(s => (
                      <span key={s} className="px-2 py-1 text-xs bg-[#2D2D2D] rounded-md text-gray-300">{s}</span>
                    ))}
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-6">
                    <button onClick={() => acheterOffre(coach, 'seance')} className="bg-[#2D2D2D] p-2 rounded-lg text-center hover:bg-[#3D3D3D]">
                      <span className="block text-[10px] text-gray-400">Séance</span>
                      <span className="font-bold">{coach.tarifs?.seance}€</span>
                    </button>
                    <button onClick={() => acheterOffre(coach, 'pack')} className="bg-[#2D2D2D] p-2 rounded-lg text-center hover:bg-[#3D3D3D]">
                      <span className="block text-[10px] text-gray-400">Pack</span>
                      <span className="font-bold">{coach.tarifs?.pack}€</span>
                    </button>
                    <button onClick={() => acheterOffre(coach, 'abonnement')} className="bg-[#FF6B00]/20 border border-[#FF6B00]/40 p-2 rounded-lg text-center">
                      <span className="block text-[10px] text-orange-300">Mensuel</span>
                      <span className="font-bold text-orange-500">{coach.tarifs?.abonnement}€</span>
                    </button>
                  </div>
                  <button onClick={() => demanderDevis(coach)} className="w-full mt-4 py-2 text-sm text-gray-400 hover:text-white transition-colors">
                    Demander un devis personnalisé
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default ProspectDashboard;
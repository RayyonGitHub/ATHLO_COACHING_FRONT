import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const coachsMock = [
  {
    id: 1,
    nom: 'Thomas Dubois',
    ville: 'Paris',
    specialites: ['Crossfit', 'HIIT', 'Nutrition'],
    note: 4.8,
    avis: 124,
    tarifs: { seance: 60, pack: 500, abonnement: 180 },
    description:
      'Coach spécialisé en performance, remise en forme et nutrition sportive.',
    programmes_gratuits: [
      { id: 1, titre: 'Découverte Crossfit', duree: '15 min' },
      { id: 2, titre: 'Étirements matinaux', duree: '10 min' },
    ],
  },
  {
    id: 2,
    nom: 'Sarah Martin',
    ville: 'Lyon',
    specialites: ['Yoga', 'Pilates', 'Méditation'],
    note: 4.9,
    avis: 89,
    tarifs: { seance: 55, pack: 450, abonnement: 160 },
    description:
      'Coach bien-être pour retrouver mobilité, sérénité et équilibre.',
    programmes_gratuits: [
      { id: 3, titre: 'Yoga débutant', duree: '20 min' },
      { id: 4, titre: 'Méditation guidée', duree: '10 min' },
    ],
  },
  {
    id: 3,
    nom: 'Marc Lefebvre',
    ville: 'Marseille',
    specialites: ['Force Athlétique', 'Nutrition', 'Boxe'],
    note: 4.7,
    avis: 56,
    tarifs: { seance: 65, pack: 550, abonnement: 200 },
    description:
      'Coach orienté force, boxe et transformation physique progressive.',
    programmes_gratuits: [
      { id: 5, titre: 'Renforcement musculaire', duree: '25 min' },
    ],
  },
];

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

  const [searchVille, setSearchVille] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  const [filters, setFilters] = useState({
    specialite: '',
    note_min: 0,
    prix_max: 200,
    type_offre: 'tous',
  });

  const [coachs, setCoachs] = useState(coachsMock);
  const [selectedCoach, setSelectedCoach] = useState(null);
  const [showAchatModal, setShowAchatModal] = useState(false);
  const [selectedOffre, setSelectedOffre] = useState('seance');

  const filteredVilles = useMemo(() => {
    if (!searchVille.trim()) return villes;
    return villes.filter((ville) =>
      ville.toLowerCase().includes(searchVille.toLowerCase())
    );
  }, [searchVille]);

  const rechercherCoachs = () => {
    let resultats = [...coachsMock];

    if (searchVille.trim()) {
      resultats = resultats.filter((coach) =>
        coach.ville.toLowerCase().includes(searchVille.toLowerCase())
      );
    }

    if (filters.specialite) {
      resultats = resultats.filter((coach) =>
        coach.specialites.includes(filters.specialite)
      );
    }

    if (filters.note_min > 0) {
      resultats = resultats.filter((coach) => coach.note >= filters.note_min);
    }

    if (filters.type_offre !== 'tous') {
      resultats = resultats.filter(
        (coach) => coach.tarifs[filters.type_offre] <= Number(filters.prix_max)
      );
    } else {
      resultats = resultats.filter(
        (coach) =>
          coach.tarifs.seance <= Number(filters.prix_max) ||
          coach.tarifs.pack <= Number(filters.prix_max) ||
          coach.tarifs.abonnement <= Number(filters.prix_max)
      );
    }

    setCoachs(resultats);
  };

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
              Explorez les coachs selon votre ville, vos objectifs et votre budget.
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

        <section className="bg-[#1E1E1E] border border-[#2D2D2D] rounded-3xl p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                  setFilters({ ...filters, prix_max: e.target.value })
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

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mt-5 pt-5 border-t border-[#2D2D2D]">
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
              onClick={rechercherCoachs}
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#FF6B00] to-[#FF9E00] text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-[#FF6B00]/20 transition-all"
            >
              <span className="material-icons-round">search</span>
              Rechercher
            </button>
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-white">Coachs disponibles</h2>
              <p className="text-sm text-gray-400 mt-1">
                Une sélection simple et lisible pour comparer rapidement.
              </p>
            </div>
          </div>

          {coachs.length === 0 ? (
            <div className="bg-[#1E1E1E] border border-[#2D2D2D] rounded-3xl p-10 text-center">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-[#2D2D2D] text-gray-400 flex items-center justify-center mb-4">
                <span className="material-icons-round text-3xl">search_off</span>
              </div>
              <p className="text-white font-medium">Aucun coach trouvé.</p>
              <p className="text-gray-500 text-sm mt-2">
                Essaie de modifier la ville ou les filtres.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {coachs.map((coach) => (
                <div
                  key={coach.id}
                  className="bg-[#1E1E1E] rounded-3xl border border-[#2D2D2D] overflow-hidden hover:border-[#FF6B00]/40 transition-all"
                >
                  <div className="p-6">
                    <div className="flex items-start gap-4 mb-5">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#FF6B00] to-[#FF9E00] flex items-center justify-center text-white font-bold text-2xl shrink-0">
                        {coach.nom.charAt(0)}
                      </div>

                      <div className="min-w-0">
                        <h3 className="font-bold text-white text-lg">{coach.nom}</h3>
                        <p className="text-sm text-gray-400">{coach.ville}</p>
                        <p className="text-sm text-gray-400 mt-1">
                          {coach.note} ★ • {coach.avis} avis
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {coach.specialites.map((spec) => (
                        <span
                          key={spec}
                          className="px-3 py-1 rounded-full text-xs font-medium bg-[#2D2D2D] text-gray-300 border border-[#3D3D3D]"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>

                    <p className="text-sm text-gray-400 mb-5 line-clamp-2">
                      {coach.description}
                    </p>

                    <div className="bg-[#181818] border border-[#2D2D2D] rounded-2xl p-4 mb-5">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-400">Tarif séance</span>
                        <span className="font-bold text-white">{coach.tarifs.seance}€</span>
                      </div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-400">Pack</span>
                        <span className="font-medium text-gray-200">{coach.tarifs.pack}€</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Abonnement</span>
                        <span className="font-medium text-[#FF6B00]">
                          {coach.tarifs.abonnement}€
                        </span>
                      </div>
                    </div>

                    <div className="mb-5">
                      <p className="text-sm font-medium text-gray-300 mb-2">
                        Programmes gratuits
                      </p>
                      <div className="space-y-2">
                        {coach.programmes_gratuits.slice(0, 2).map((prog) => (
                          <div
                            key={prog.id}
                            className="flex items-center justify-between text-sm bg-[#181818] border border-[#2D2D2D] rounded-xl px-3 py-2"
                          >
                            <span className="text-gray-300">{prog.titre}</span>
                            <span className="text-[#FF6B00] text-xs">{prog.duree}</span>
                          </div>
                        ))}
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

        <section className="bg-[#1E1E1E] border border-[#2D2D2D] rounded-3xl p-6 lg:p-8">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white">Programmes gratuits populaires</h2>
            <p className="text-sm text-gray-400 mt-1">
              Un aperçu rapide pour découvrir le style d’accompagnement proposé.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-[#181818] p-5 rounded-2xl border border-[#2D2D2D] hover:border-[#FF6B00]/40 transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-[#FF6B00]/20 text-[#FF6B00] flex items-center justify-center mb-3">
                  <span className="material-icons-round">fitness_center</span>
                </div>
                <h3 className="font-semibold text-white mb-1">Programme découverte {i}</h3>
                <p className="text-sm text-gray-400 mb-3">15 min • Débutant</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#FF6B00] font-medium">Accès gratuit</span>
                  <span className="material-icons-round text-[#FF6B00] text-sm">play_circle</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

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
                  <p className="text-sm text-gray-400">{selectedCoach.tarifs.seance}€</p>
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
                  <p className="text-sm text-gray-400">{selectedCoach.tarifs.pack}€</p>
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
                    {selectedCoach.tarifs.abonnement}€
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
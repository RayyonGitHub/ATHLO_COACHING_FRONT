import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import prospectService from '../services/prospectService';

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

  const [searchVille, setSearchVille] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  const [filters, setFilters] = useState({
    specialite: '',
    distance: 10,
    note_min: 0,
    prix_max: 200,
    type_offre: 'tous',
  });

  const [coachs, setCoachs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCoach, setSelectedCoach] = useState(null);
  const [error, setError] = useState('');

  const specialites = ["Crossfit", "Nutrition", "HIIT", "Pilates", "Boxe", "Méditation", "Yoga", "Force Athlétique"];

  const filteredVilles = useMemo(() => {
    return villes.filter(ville => ville.toLowerCase().includes(searchVille.toLowerCase()));
  }, [searchVille]);

  const rechercherCoachs = async () => {
    setLoading(true);
    setError('');

    try {
      const data = await prospectService.getPublicCoaches({
        ville: searchVille || '',
        specialite: filters.specialite || '',
        note_min: filters.note_min || 0,
        prix_max: filters.prix_max || 999999,
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
          description:
            typeOffre === 'seance'
              ? 'Séance unique'
              : typeOffre === 'pack'
              ? 'Pack 10 séances'
              : 'Abonnement mensuel',
        },
      },
    });
  };

  const demanderDevis = (coach) => {
    setSelectedCoach(coach);
  };

  const voirProfil = (coach) => {
    setSelectedCoach(coach);
  };

  return (
    <div className="bg-[#121212] text-gray-100 min-h-screen font-sans">
      <div className="flex h-screen overflow-hidden">
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
              <a className="flex items-center gap-4 px-3 py-3 lg:px-5 lg:py-3 rounded-xl text-gray-400 hover:bg-[#2D2D2D] transition-colors group" href="#coachs">
                <span className="material-icons-round text-2xl group-hover:text-[#FF6B00] transition-colors">fitness_center</span>
                <span className="hidden lg:block font-medium">Coachs</span>
              </a>
              <a className="flex items-center gap-4 px-3 py-3 lg:px-5 lg:py-3 rounded-xl text-gray-400 hover:bg-[#2D2D2D] transition-colors group" href="#programmes-gratuits">
                <span className="material-icons-round text-2xl group-hover:text-[#FF6B00] transition-colors">school</span>
                <span className="hidden lg:block font-medium">Programmes</span>
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

        <main className="flex-1 overflow-y-auto relative bg-[#121212]">
          <header className="sticky top-0 z-10 bg-[#121212]/80 backdrop-blur-md px-8 py-6 flex justify-between items-center border-b border-[#2D2D2D]">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-white">
                Trouvez votre <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF6B00] to-[#FF9E00]">coach idéal</span>
              </h1>
              <p className="text-gray-400 mt-1">
                Paiement sécurisé puis activation immédiate de votre espace athlète.
              </p>
            </div>
          </header>

          <div className="p-6 lg:p-8">
            <div className="mb-8">
              <div className="bg-[#1E1E1E] p-6 rounded-2xl border border-[#2D2D2D]">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                    <label className="block text-sm font-medium text-gray-400 mb-2">Spécialité</label>
                    <select
                      value={filters.specialite}
                      onChange={(e) => setFilters({ ...filters, specialite: e.target.value })}
                      className="w-full bg-[#2D2D2D] border border-[#3D3D3D] rounded-xl py-3 px-4 text-white outline-none focus:border-[#FF6B00] transition-all"
                    >
                      <option value="">Toutes les spécialités</option>
                      {specialites.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Note minimum : {filters.note_min > 0 ? `${filters.note_min}★` : 'Aucune'}
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="5"
                      step="1"
                      value={filters.note_min}
                      onChange={(e) => setFilters({ ...filters, note_min: Number(e.target.value) })}
                      className="w-full accent-[#FF6B00]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Prix max : {filters.prix_max} €
                    </label>
                    <input
                      type="range"
                      min="20"
                      max="500"
                      step="5"
                      value={filters.prix_max}
                      onChange={(e) => setFilters({ ...filters, prix_max: Number(e.target.value) })}
                      className="w-full accent-[#FF6B00]"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between mt-4 pt-4 border-t border-[#2D2D2D] gap-4">
                  <select
                    value={filters.type_offre}
                    onChange={(e) => setFilters({ ...filters, type_offre: e.target.value })}
                    className="bg-[#2D2D2D] border border-[#3D3D3D] rounded-lg py-2 px-3 text-sm text-white outline-none"
                  >
                    <option value="tous">Tous types</option>
                    <option value="seance">Séance unique</option>
                    <option value="pack">Pack</option>
                    <option value="abonnement">Abonnement</option>
                  </select>

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

            <div className="mb-8" id="coachs">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">
                  {coachs.length > 0 ? `${coachs.length} coach(s) trouvé(s)` : "Aucun coach pour l'instant"}
                </h2>
                <span className="text-sm text-gray-400">Trié par note / avis</span>
              </div>

              {error && (
                <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300">
                  {error}
                </div>
              )}

              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF6B00]"></div>
                </div>
              ) : coachs.length === 0 ? (
                <div className="bg-[#1E1E1E] border border-[#2D2D2D] rounded-2xl p-8 text-center text-gray-400">
                  Aucun coach ne correspond aux filtres actuels.
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {coachs.map((coach) => (
                    <div
                      key={coach.id}
                      className="bg-[#1E1E1E] rounded-2xl border border-[#2D2D2D] overflow-hidden hover:border-[#FF6B00]/50 transition-all group"
                    >
                      <div className="p-6 pb-4">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#FF6B00] to-[#FF9E00] flex items-center justify-center text-white font-bold text-2xl">
                              {(coach.full_name || coach.nom || 'C').charAt(0)}
                            </div>
                            <div>
                              <h3 className="font-bold text-white text-lg group-hover:text-[#FF6B00] transition-colors">
                                {coach.full_name}
                              </h3>
                              <div className="flex items-center gap-2 mt-1">
                                <div className="flex items-center text-[#FFD700]">
                                  {"★".repeat(Math.max(1, Math.floor(coach.note || 0)))}
                                </div>
                                <span className="text-sm text-gray-400">
                                  {coach.note?.toFixed?.(1) || coach.note} ({coach.avis} avis)
                                </span>
                              </div>
                            </div>
                          </div>

                          <button className="text-gray-400 hover:text-red-500 transition-colors">
                            <span className="material-icons-round">favorite_border</span>
                          </button>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-4">
                          {(coach.specialites || []).map((spec) => (
                            <span
                              key={spec}
                              className="px-3 py-1 rounded-full text-xs font-medium bg-[#2D2D2D] text-gray-300 border border-[#3D3D3D]"
                            >
                              {spec}
                            </span>
                          ))}
                        </div>

                        <div className="flex items-center gap-1 text-sm text-gray-400 mb-4">
                          <span className="material-icons-round text-base">location_on</span>
                          {coach.ville || 'En ligne / non renseigné'}
                        </div>

                        <div className="mb-4">
                          <p className="text-sm font-medium text-gray-300 mb-2">Programmes visibles :</p>
                          <div className="space-y-2">
                            {(coach.programmes_gratuits || []).length > 0 ? (
                              coach.programmes_gratuits.map((prog) => (
                                <div key={prog.id} className="flex items-center justify-between text-sm">
                                  <span className="text-gray-400">{prog.titre}</span>
                                  <span className="text-[#FF6B00] text-xs font-medium">{prog.duree}</span>
                                </div>
                              ))
                            ) : (
                              <div className="text-sm text-gray-500">Aucun programme affiché</div>
                            )}
                          </div>
                        </div>

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

            {selectedCoach && (
              <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-[#1E1E1E] rounded-2xl border border-[#2D2D2D] max-w-lg w-full">
                  <div className="p-6 border-b border-[#2D2D2D] flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white">{selectedCoach.full_name}</h2>
                    <button onClick={() => setSelectedCoach(null)} className="text-gray-400 hover:text-white">
                      <span className="material-icons-round">close</span>
                    </button>
                  </div>

                  <div className="p-6 space-y-4">
                    <div>
                      <p className="text-sm text-gray-400 mb-2">Ville</p>
                      <p className="text-white font-medium">{selectedCoach.ville || 'Non renseignée'}</p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-400 mb-2">Spécialités</p>
                      <div className="flex flex-wrap gap-2">
                        {(selectedCoach.specialites || []).map((spec) => (
                          <span key={spec} className="px-3 py-1 rounded-full text-xs bg-[#2D2D2D] text-gray-300">
                            {spec}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 pt-4">
                      <button
                        onClick={() => acheterOffre(selectedCoach, 'seance')}
                        className="rounded-xl bg-[#2D2D2D] hover:bg-[#3D3D3D] text-white py-3 font-bold"
                      >
                        {selectedCoach.tarifs.seance}€
                      </button>
                      <button
                        onClick={() => acheterOffre(selectedCoach, 'pack')}
                        className="rounded-xl bg-[#2D2D2D] hover:bg-[#3D3D3D] text-white py-3 font-bold"
                      >
                        {selectedCoach.tarifs.pack}€
                      </button>
                      <button
                        onClick={() => acheterOffre(selectedCoach, 'abonnement')}
                        className="rounded-xl bg-[#FF6B00] hover:bg-[#FF8533] text-white py-3 font-bold"
                      >
                        {selectedCoach.tarifs.abonnement}€
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ProspectDashboard;
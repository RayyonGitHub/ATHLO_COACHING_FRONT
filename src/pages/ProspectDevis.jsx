import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';

const ProspectDevis = () => {
  const location = useLocation();
  const coachSelectionne = location.state?.coach || null;

  const devis = [];

  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    age: '',
    taille: '',
    poids: '',
    niveauActivite: '',
    typeEntrainement: '',
    objectifSportif: '',
    budget: '',
    pathologiesBlessures: '',
    message: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = () => {
    alert("Demande de devis à brancher au back");
    console.log(formData);
  };

  return (
    <>
      <header className="sticky top-0 z-10 bg-[#121212]/80 backdrop-blur-md px-8 py-6 border-b border-[#2D2D2D]">
        <h1 className="text-2xl lg:text-3xl font-bold text-white">
          Mes{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF6B00] to-[#FF9E00]">
            devis
          </span>
        </h1>
        <p className="text-gray-400 mt-1">
          Décrivez votre profil et votre besoin pour recevoir une proposition adaptée
        </p>
      </header>

      <div className="p-6 lg:p-8 space-y-8">
        <section className="bg-[#1E1E1E] border border-[#2D2D2D] rounded-3xl p-8 lg:p-10 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-40 h-40 bg-[#FF6B00]/10 rounded-full blur-3xl"></div>

          <div className="relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-[#FF6B00]/20 to-[#FF9E00]/20 text-[#FF6B00] flex items-center justify-center mb-5">
              <span className="material-icons-round text-3xl">request_quote</span>
            </div>

            <h2 className="text-2xl lg:text-3xl font-bold text-white mb-3">
              Demander un devis personnalisé
            </h2>

            <p className="text-gray-400 text-base leading-relaxed mb-6 max-w-3xl">
              Renseignez les informations essentielles sur votre profil et vos objectifs.
              Cela permettra au coach de vous proposer un accompagnement plus pertinent.
            </p>

            {coachSelectionne && (
              <div className="mb-8 bg-[#181818] border border-[#2D2D2D] rounded-2xl p-4">
                <p className="text-sm text-gray-400 mb-1">Coach sélectionné</p>
                <p className="text-white font-semibold">{coachSelectionne.nom}</p>
                <p className="text-sm text-gray-400">{coachSelectionne.ville}</p>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* INFOS PERSONNELLES */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Informations personnelles</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Nom</label>
                    <input
                      type="text"
                      name="nom"
                      value={formData.nom}
                      onChange={handleChange}
                      className="w-full bg-[#2D2D2D] border border-[#3D3D3D] rounded-xl py-3 px-4 text-white outline-none focus:border-[#FF6B00]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Prénom</label>
                    <input
                      type="text"
                      name="prenom"
                      value={formData.prenom}
                      onChange={handleChange}
                      className="w-full bg-[#2D2D2D] border border-[#3D3D3D] rounded-xl py-3 px-4 text-white outline-none focus:border-[#FF6B00]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-[#2D2D2D] border border-[#3D3D3D] rounded-xl py-3 px-4 text-white outline-none focus:border-[#FF6B00]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Téléphone</label>
                  <input
                    type="text"
                    name="telephone"
                    value={formData.telephone}
                    onChange={handleChange}
                    className="w-full bg-[#2D2D2D] border border-[#3D3D3D] rounded-xl py-3 px-4 text-white outline-none focus:border-[#FF6B00]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Âge</label>
                    <input
                      type="number"
                      name="age"
                      value={formData.age}
                      onChange={handleChange}
                      className="w-full bg-[#2D2D2D] border border-[#3D3D3D] rounded-xl py-3 px-4 text-white outline-none focus:border-[#FF6B00]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Taille (cm)</label>
                    <input
                      type="number"
                      name="taille"
                      value={formData.taille}
                      onChange={handleChange}
                      className="w-full bg-[#2D2D2D] border border-[#3D3D3D] rounded-xl py-3 px-4 text-white outline-none focus:border-[#FF6B00]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Poids (kg)</label>
                    <input
                      type="number"
                      name="poids"
                      value={formData.poids}
                      onChange={handleChange}
                      className="w-full bg-[#2D2D2D] border border-[#3D3D3D] rounded-xl py-3 px-4 text-white outline-none focus:border-[#FF6B00]"
                    />
                  </div>
                </div>
              </div>

              {/* BESOIN SPORTIF */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Votre besoin</h3>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Niveau d’activité
                  </label>
                  <select
                    name="niveauActivite"
                    value={formData.niveauActivite}
                    onChange={handleChange}
                    className="w-full bg-[#2D2D2D] border border-[#3D3D3D] rounded-xl py-3 px-4 text-white outline-none focus:border-[#FF6B00]"
                  >
                    <option value="">Sélectionner</option>
                    <option value="sedentaire">Sédentaire</option>
                    <option value="leger">Légèrement actif</option>
                    <option value="modere">Modérément actif</option>
                    <option value="tres_actif">Très actif</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Type d’entraînement recherché
                  </label>
                  <input
                    type="text"
                    name="typeEntrainement"
                    value={formData.typeEntrainement}
                    onChange={handleChange}
                    placeholder="Ex : musculation, cardio, yoga..."
                    className="w-full bg-[#2D2D2D] border border-[#3D3D3D] rounded-xl py-3 px-4 text-white outline-none focus:border-[#FF6B00]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Objectif sportif
                  </label>
                  <input
                    type="text"
                    name="objectifSportif"
                    value={formData.objectifSportif}
                    onChange={handleChange}
                    placeholder="Ex : perte de poids, prise de masse, remise en forme..."
                    className="w-full bg-[#2D2D2D] border border-[#3D3D3D] rounded-xl py-3 px-4 text-white outline-none focus:border-[#FF6B00]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Budget estimé</label>
                  <input
                    type="text"
                    name="budget"
                    value={formData.budget}
                    onChange={handleChange}
                    placeholder="Ex : 100€ / mois"
                    className="w-full bg-[#2D2D2D] border border-[#3D3D3D] rounded-xl py-3 px-4 text-white outline-none focus:border-[#FF6B00]"
                  />
                </div>
              </div>
            </div>

            {/* INFOS COMPLEMENTAIRES */}
            <div className="mt-8 space-y-4">
              <h3 className="text-lg font-semibold text-white">Informations complémentaires</h3>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Pathologies / blessures / contraintes
                </label>
                <textarea
                  rows="3"
                  name="pathologiesBlessures"
                  value={formData.pathologiesBlessures}
                  onChange={handleChange}
                  placeholder="Précisez s’il y a des douleurs, blessures ou contraintes particulières..."
                  className="w-full bg-[#2D2D2D] border border-[#3D3D3D] rounded-xl py-3 px-4 text-white outline-none focus:border-[#FF6B00] resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Message
                </label>
                <textarea
                  rows="4"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Décrivez votre besoin en quelques lignes..."
                  className="w-full bg-[#2D2D2D] border border-[#3D3D3D] rounded-xl py-3 px-4 text-white outline-none focus:border-[#FF6B00] resize-none"
                />
              </div>

              <button
                type="button"
                onClick={handleSubmit}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#FF6B00] to-[#FF9E00] text-white font-semibold hover:shadow-lg hover:shadow-[#FF6B00]/20 transition-all"
              >
                <span className="material-icons-round text-xl">send</span>
                Envoyer la demande
              </button>
            </div>
          </div>
        </section>

        <section className="bg-[#1E1E1E] border border-[#2D2D2D] rounded-3xl p-6 lg:p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-white">Historique des devis</h2>
              <p className="text-sm text-gray-400 mt-1">
                Retrouvez ici vos demandes déjà envoyées.
              </p>
            </div>

            <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg bg-[#2D2D2D] text-sm text-gray-300">
              <span className="material-icons-round text-base">description</span>
              {devis.length} demande{devis.length > 1 ? 's' : ''}
            </div>
          </div>

          {devis.length === 0 ? (
            <div className="border border-dashed border-[#3A3A3A] rounded-2xl p-10 text-center bg-[#181818]">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-[#2D2D2D] text-gray-400 flex items-center justify-center mb-4">
                <span className="material-icons-round text-3xl">inventory_2</span>
              </div>

              <h3 className="text-white font-semibold text-lg mb-2">
                Aucun devis pour le moment
              </h3>

              <p className="text-gray-400 text-sm max-w-md mx-auto">
                Tu n’as encore envoyé aucune demande de devis personnalisé.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {devis.map((devisItem) => (
                <div
                  key={devisItem.id}
                  className="bg-[#181818] border border-[#2D2D2D] rounded-2xl p-4 flex items-center justify-between"
                >
                  <div>
                    <p className="text-white font-medium">{devisItem.coach}</p>
                    <p className="text-sm text-gray-400">{devisItem.date}</p>
                  </div>

                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#FF6B00]/10 text-[#FF6B00] border border-[#FF6B00]/20">
                    {devisItem.statut}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
};

export default ProspectDevis;
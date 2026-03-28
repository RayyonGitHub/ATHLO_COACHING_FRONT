import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import prospectService from '../services/prospectService';
import api from '../services/api';

const ProspectPaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const [checkout, setCheckout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [profileForm, setProfileForm] = useState({
    prenom: '',
    nom: '',
    telephone: '',
    age: '',
    taille: '',
    poids: '',
    genre: 'M',
    niveau_activite: '1.55',
    poids_cible: '',
    type_entrainement: 'Musculation',
    objectifs_sportifs: '',
    pathologies_blessures: '',
    consentement_rgpd: true,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [preview, prospect] = await Promise.all([
          prospectService.getCheckoutPreview(token),
          api.get('/prospect/me/'),
        ]);

        setCheckout(preview);

        const fullName = prospect.data?.name || '';
        const parts = fullName.trim().split(' ');

        setProfileForm((prev) => ({
          ...prev,
          prenom: prospect.data?.prenom || parts[0] || '',
          nom: prospect.data?.nom || parts.slice(1).join(' ') || '',
          telephone: preview?.phone || '',
        }));
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || 'Impossible de charger le paiement.');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchData();
    } else {
      setError('Token de paiement manquant.');
      setLoading(false);
    }
  }, [token]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProfileForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleActivateAthlete = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const response = await prospectService.activateAthleteProfile({
        checkout_token: token,
        prenom: profileForm.prenom,
        nom: profileForm.nom,
        telephone: profileForm.telephone,
        age: profileForm.age ? Number(profileForm.age) : null,
        taille: profileForm.taille ? Number(profileForm.taille) : null,
        poids: profileForm.poids ? Number(profileForm.poids) : null,
        genre: profileForm.genre,
        niveau_activite: profileForm.niveau_activite,
        poids_cible: profileForm.poids_cible ? Number(profileForm.poids_cible) : null,
        type_entrainement: profileForm.type_entrainement,
        objectifs_sportifs: profileForm.objectifs_sportifs,
        pathologies_blessures: profileForm.pathologies_blessures,
        consentement_rgpd: profileForm.consentement_rgpd,
      });

      localStorage.setItem('authToken', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));

      navigate('/athlete/dashboard');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Impossible d'activer le profil athlète.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0e0e12] text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF6A00]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0e0e12] text-white antialiased relative overflow-hidden">
      <header className="bg-[#131317] shadow-[0_40px_60px_-15px_rgba(0,0,0,0.3)] flex justify-between items-center px-6 py-4 fixed top-0 w-full z-50">
        <div className="text-2xl font-black italic tracking-tighter text-[#FF6A00]">ATHLO</div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/prospect/dashboard')}
            className="text-gray-400 hover:text-white transition"
          >
            Retour
          </button>
        </div>
      </header>

      <main className="min-h-screen pt-28 pb-20 px-6 flex flex-col items-center justify-center">
        <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          <div className="md:col-span-12 flex flex-col items-center text-center mb-8">
            

            <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter text-white mb-4 uppercase">
              Paiement réussi
            </h1>

            <p className="text-gray-400 max-w-md text-lg">
              Le paiement a bien été traité. Il reste une dernière étape pour activer votre espace athlète.
            </p>
          </div>

          <div className="md:col-span-7 flex flex-col gap-4">
            <div className="bg-[#131317] p-8 rounded-xl border border-white/5">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Coach</p>
                  <p className="text-xl text-[#FF915A] font-bold">{checkout?.coach?.full_name}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Offre</p>
                  <p className="text-white">{checkout?.offer?.label}</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-4 group">
                 
                  <div className="flex-grow">
                    <p className="font-bold text-white">{checkout?.coach?.full_name}</p>
                    <p className="text-sm text-gray-400">{checkout?.offer?.label}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{Number(checkout?.offer?.price || 0).toFixed(2)} €</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-white/10 space-y-3">
                <div className="flex justify-between text-gray-400">
                  <span>Sous-total</span>
                  <span>{Number(checkout?.offer?.price || 0).toFixed(2)} €</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Carte</span>
                  <span>•••• {checkout?.card_last4 || '----'}</span>
                </div>
                <div className="flex justify-between text-2xl font-black italic tracking-tighter pt-2 border-t border-white/10">
                  <span>TOTAL</span>
                  <span className="text-[#FF915A]">{Number(checkout?.offer?.price || 0).toFixed(2)} €</span>
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-5 flex flex-col gap-4">
            <div className="bg-[#1f1f25] p-6 rounded-xl relative overflow-hidden group">
              <p className="text-xs font-bold uppercase tracking-widest text-[#FF915A] mb-4">Étape finale</p>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-3xl font-black italic tracking-tight">Compléter</span>
                <span className="text-gray-400 font-bold uppercase text-sm">le profil</span>
              </div>
              <p className="text-sm text-gray-400">
                Une fois le profil envoyé, le compte sera converti en athlète et redirigé vers le dashboard.
              </p>
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300">
                {error}
              </div>
            )}

            <button
              onClick={() => setShowProfileModal(true)}
              className="w-full bg-gradient-to-r from-[#ff7a31] to-[#ff915a] py-6 rounded-xl flex items-center justify-center gap-3 active:scale-95 transition-transform group shadow-lg text-black font-black tracking-widest"
            >
              <span className="material-symbols-outlined"></span>
              COMPLÉTER MON PROFIL
            </button>

            <button
              onClick={() => navigate('/prospect/dashboard')}
              className="w-full bg-[#25252b] border border-white/10 py-4 rounded-xl text-gray-300 font-bold hover:bg-[#2c2b32] transition-colors"
            >
              Retourner au dashboard prospect
            </button>
          </div>
        </div>
      </main>

      {showProfileModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="absolute inset-0" onClick={() => setShowProfileModal(false)}></div>

          <div className="relative bg-[#16161A] border border-[#26262B] rounded-3xl shadow-2xl w-full max-w-2xl p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-white">Finaliser le profil athlète</h2>
              <button onClick={() => setShowProfileModal(false)} className="text-slate-400 hover:text-red-500 transition-colors p-2 bg-slate-50 dark:bg-white/5 rounded-full">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleActivateAthlete} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-300 mb-2">Prénom</label>
                  <input
                    type="text"
                    name="prenom"
                    value={profileForm.prenom}
                    onChange={handleChange}
                    required
                    className="w-full bg-[#0B0B0F] border border-[#26262B] rounded-xl px-4 py-3 outline-none focus:border-[#FF6A00] text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-300 mb-2">Nom</label>
                  <input
                    type="text"
                    name="nom"
                    value={profileForm.nom}
                    onChange={handleChange}
                    required
                    className="w-full bg-[#0B0B0F] border border-[#26262B] rounded-xl px-4 py-3 outline-none focus:border-[#FF6A00] text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-300 mb-2">Téléphone</label>
                <input
                  type="text"
                  name="telephone"
                  value={profileForm.telephone}
                  onChange={handleChange}
                  className="w-full bg-[#0B0B0F] border border-[#26262B] rounded-xl px-4 py-3 outline-none focus:border-[#FF6A00] text-white"
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-300 mb-2">Genre</label>
                  <select
                    name="genre"
                    value={profileForm.genre}
                    onChange={handleChange}
                    className="w-full bg-[#0B0B0F] border border-[#26262B] rounded-xl px-4 py-3 outline-none focus:border-[#FF6A00] text-white"
                  >
                    <option value="M">Homme</option>
                    <option value="F">Femme</option>
                    <option value="O">Autre</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-300 mb-2">Âge</label>
                  <input
                    type="number"
                    name="age"
                    value={profileForm.age}
                    onChange={handleChange}
                    className="w-full bg-[#0B0B0F] border border-[#26262B] rounded-xl px-4 py-3 outline-none focus:border-[#FF6A00] text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-300 mb-2">Taille (cm)</label>
                  <input
                    type="number"
                    name="taille"
                    value={profileForm.taille}
                    onChange={handleChange}
                    className="w-full bg-[#0B0B0F] border border-[#26262B] rounded-xl px-4 py-3 outline-none focus:border-[#FF6A00] text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-300 mb-2">Poids (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    name="poids"
                    value={profileForm.poids}
                    onChange={handleChange}
                    className="w-full bg-[#0B0B0F] border border-[#26262B] rounded-xl px-4 py-3 outline-none focus:border-[#FF6A00] text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-300 mb-2">Niveau d'activité</label>
                <select
                  name="niveau_activite"
                  value={profileForm.niveau_activite}
                  onChange={handleChange}
                  className="w-full bg-[#0B0B0F] border border-[#26262B] rounded-xl px-4 py-3 outline-none focus:border-[#FF6A00] text-white"
                >
                  <option value="1.2">Sédentaire</option>
                  <option value="1.375">Légèrement actif</option>
                  <option value="1.55">Modérément actif</option>
                  <option value="1.725">Très actif</option>
                  <option value="1.9">Extrêmement actif</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-300 mb-2">Poids cible</label>
                  <input
                    type="number"
                    step="0.1"
                    name="poids_cible"
                    value={profileForm.poids_cible}
                    onChange={handleChange}
                    className="w-full bg-[#0B0B0F] border border-[#26262B] rounded-xl px-4 py-3 outline-none focus:border-[#FF6A00] text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-300 mb-2">Type d'entraînement</label>
                  <input
                    type="text"
                    name="type_entrainement"
                    value={profileForm.type_entrainement}
                    onChange={handleChange}
                    className="w-full bg-[#0B0B0F] border border-[#26262B] rounded-xl px-4 py-3 outline-none focus:border-[#FF6A00] text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-300 mb-2">Objectifs sportifs</label>
                <textarea
                  rows="3"
                  name="objectifs_sportifs"
                  value={profileForm.objectifs_sportifs}
                  onChange={handleChange}
                  className="w-full bg-[#0B0B0F] border border-[#26262B] rounded-xl px-4 py-3 outline-none focus:border-[#FF6A00] text-white resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-300 mb-2">Pathologies / blessures</label>
                <textarea
                  rows="3"
                  name="pathologies_blessures"
                  value={profileForm.pathologies_blessures}
                  onChange={handleChange}
                  className="w-full bg-[#0B0B0F] border border-[#26262B] rounded-xl px-4 py-3 outline-none focus:border-[#FF6A00] text-white resize-none"
                />
              </div>

              <label className="flex items-center gap-3 text-sm text-gray-300">
                <input
                  type="checkbox"
                  name="consentement_rgpd"
                  checked={profileForm.consentement_rgpd}
                  onChange={handleChange}
                  className="accent-[#FF6A00]"
                />
                J'accepte le traitement de mes données pour activer mon espace athlète.
              </label>

              <button
                type="submit"
                disabled={saving}
                className="w-full bg-[#FF6A00] hover:bg-orange-600 text-white font-black py-4 rounded-xl shadow-lg mt-2 transition-transform active:scale-95 disabled:opacity-50"
              >
                {saving ? 'Activation...' : 'Activer mon compte athlète'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProspectPaymentSuccess;
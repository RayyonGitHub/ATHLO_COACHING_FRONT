import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Save, User, Briefcase, MapPin, Tag, Phone, 
  Loader2, AlertCircle, Settings, Lock, CheckCircle2, X, DollarSign, Dumbbell, Zap
} from 'lucide-react';
import api from '../services/api';

const CoachSettings = () => {
  const [formData, setFormData] = useState({
    prenom: '', nom: '', email: '',
    telephone: '', specialite: '', ville: '',
    specialites_tags: '', offres_tarifs: '',
    salles: [], // Nouvel état pour les salles
    stripe_onboarding_complete: false
  });

  const [sallesDisponibles, setSallesDisponibles] = useState([]);
  const [villeSearch, setVilleSearch] = useState('');
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isSaveSuccessModalOpen, setIsSaveSuccessModalOpen] = useState(false);
  const [isSubLoading, setIsSubLoading] = useState(false);
  const [passwordData, setPasswordData] = useState({ old_password: '', new_password: '', confirm_password: '' });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchSallesDisponibles = async (ville = '') => {
    const params = {};
    if (ville && ville.trim()) {
      params.ville = ville.trim();
    }

    const res = await api.get('/coach/salles-disponibles/', { params });
    setSallesDisponibles(res.data || []);
  };


  const handleUpgradePremium = async () => {
    setIsSubLoading(true);
    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('access_token');
      const res = await axios.post('http://127.0.0.1:8000/api/stripe/create-subscription/', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.checkout_url) {
        window.location.href = res.data.checkout_url;
      }
    } catch (err) {
      console.error(err);
      setError("Erreur lors de la redirection vers le paiement.");
    } finally {
      setIsSubLoading(false);
    }
  };
const handleStripeConnect = async () => {
    setIsSubLoading(true);
    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('access_token');
      const res = await axios.post('http://127.0.0.1:8000/api/stripe/connect-onboarding/', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.checkout_url) {
        window.location.href = res.data.checkout_url;
      }
    } catch (err) {
      // Affichage du VRAI message d'erreur du backend dans la console
      console.error("Erreur détaillée Stripe :", err.response?.data || err.message);
      setError(err.response?.data?.error || "Erreur lors de la redirection vers Stripe Connect.");
    } finally {
      setIsSubLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('authToken') || localStorage.getItem('access_token');

        const profileRes = await axios.get('http://127.0.0.1:8000/api/coach/me/', { headers: { Authorization: `Bearer ${token}` } });

        let data = profileRes.data;
        let offres = data.offres_tarifs;

        if (typeof offres === 'object' && offres !== null) {
          if (Object.keys(offres).length === 0) {
            offres = '';
          } else {
            offres = JSON.stringify(offres, null, 2);
          }
        }

        setFormData(prev => ({
          ...prev,
          ...data,
          offres_tarifs: offres || '',
          salles: data.salles || [] // On charge les IDs des salles du coach
        }));

        await fetchSallesDisponibles(data.ville || '');

      } catch (err) {
        setError("Impossible de charger vos informations.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!loading && !formData.ville) {
      const timeoutId = setTimeout(() => {
        fetchSallesDisponibles(villeSearch).catch(() => {
          setError("Impossible de charger les salles.");
        });
      }, 250);

      return () => clearTimeout(timeoutId);
    }
  }, [villeSearch, formData.ville, loading]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const toggleSalle = (id) => {
    setFormData(prev => {
      const isSelected = prev.salles.includes(id);
      return {
        ...prev,
        salles: isSelected 
          ? prev.salles.filter(salleId => salleId !== id)
          : [...prev.salles, id]
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('access_token');
      
      await axios.patch('http://127.0.0.1:8000/api/coach/me/', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const storedUser = JSON.parse(localStorage.getItem('user'));
      if (storedUser) {
        storedUser.first_name = formData.prenom;
        storedUser.last_name = formData.nom;
        storedUser.name = `${formData.prenom} ${formData.nom}`;
        localStorage.setItem('user', JSON.stringify(storedUser));
      }

      setIsSaveSuccessModalOpen(true);
    } catch (err) {
      setError("Erreur lors de la sauvegarde.");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError('');
    if (passwordData.new_password !== passwordData.confirm_password) {
      setPasswordError("Les nouveaux mots de passe ne correspondent pas.");
      return;
    }
    setIsPasswordLoading(true);
    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('access_token');
      await axios.post('http://127.0.0.1:8000/api/auth/change-password/', {
        old_password: passwordData.old_password,
        new_password: passwordData.new_password
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      setPasswordSuccess(true);
      setTimeout(() => {
        setIsPasswordModalOpen(false);
        setPasswordSuccess(false);
        setPasswordData({ old_password: '', new_password: '', confirm_password: '' });
      }, 2000);
    } catch (err) {
      setPasswordError(err.response?.data?.error || "Erreur lors du changement de mot de passe.");
    } finally {
      setIsPasswordLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-[#FF6B00]" size={48} /></div>;

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-8 pb-32 pt-6 px-4 animate-in fade-in duration-500 overflow-y-auto">
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-bold text-gray-900">Mon <span className="text-[#FF6B00]">Profil</span></h2>
        <p className="text-gray-500 text-sm">Gérez vos informations personnelles et professionnelles.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* SECTION 1 : INFORMATIONS PERSONNELLES */}
        <section className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
          <div className="p-5 border-b border-gray-100 flex items-center gap-3">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl"><User size={20} /></div>
            <h3 className="font-semibold text-gray-900 text-lg">Informations personnelles</h3>
          </div>
          <div className="p-6 md:p-8 space-y-6 bg-gray-50/30">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Prénom</label>
                <input type="text" name="prenom" value={formData.prenom || ''} onChange={handleChange} className="w-full bg-white border border-gray-200 text-gray-900 px-4 py-2.5 rounded-xl focus:border-[#FF6B00] focus:ring-4 focus:ring-[#FF6B00]/10 outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nom</label>
                <input type="text" name="nom" value={formData.nom || ''} onChange={handleChange} className="w-full bg-white border border-gray-200 text-gray-900 px-4 py-2.5 rounded-xl focus:border-[#FF6B00] focus:ring-4 focus:ring-[#FF6B00]/10 outline-none transition-all" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5"><Phone size={14} className="text-gray-400"/> Téléphone</label>
                <input type="text" name="telephone" value={formData.telephone || ''} onChange={handleChange} className="w-full bg-white border border-gray-200 text-gray-900 px-4 py-2.5 rounded-xl focus:border-[#FF6B00] focus:ring-4 focus:ring-[#FF6B00]/10 outline-none transition-all" />
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5"><MapPin size={14} className="text-gray-400"/> Ville principale</label>
                <input type="text" name="ville" value={formData.ville || ''} onChange={handleChange} className="w-full bg-white border border-gray-200 text-gray-900 px-4 py-2.5 rounded-xl focus:border-[#FF6B00] focus:ring-4 focus:ring-[#FF6B00]/10 outline-none transition-all" />
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2 : ACTIVITÉ & SALLES */}
        <section className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
          <div className="p-5 border-b border-gray-100 flex items-center gap-3">
            <div className="p-2 bg-orange-50 text-[#FF6B00] rounded-xl"><Briefcase size={20} /></div>
            <h3 className="font-semibold text-gray-900 text-lg">Activité & Lieux</h3>
          </div>
          <div className="p-6 md:p-8 space-y-6 bg-gray-50/30">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Spécialité principale</label>
              <input type="text" name="specialite" value={formData.specialite || ''} onChange={handleChange} className="w-full bg-white border border-gray-200 text-gray-900 px-4 py-2.5 rounded-xl focus:border-[#FF6B00] focus:ring-4 focus:ring-[#FF6B00]/10 outline-none transition-all" />
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5"><Tag size={14} className="text-gray-400"/> Mots-clés / Tags</label>
              <input type="text" name="specialites_tags" value={formData.specialites_tags || ''} onChange={handleChange} className="w-full bg-white border border-gray-200 text-gray-900 px-4 py-2.5 rounded-xl focus:border-[#FF6B00] focus:ring-4 focus:ring-[#FF6B00]/10 outline-none transition-all" />
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5"><DollarSign size={14} className="text-gray-400"/> Offres et tarifs</label>
              <textarea name="offres_tarifs" value={formData.offres_tarifs || ''} onChange={handleChange} rows="4" className="w-full bg-white border border-gray-200 text-gray-900 px-4 py-3 rounded-xl focus:border-[#FF6B00] focus:ring-4 focus:ring-[#FF6B00]/10 outline-none transition-all resize-none" />
            </div>
            
            {/* NOUVEAU BLOC : Salles Partenaires */}
            <div className="pt-4 border-t border-gray-200">
              <label className="flex items-center gap-1.5 text-sm font-bold text-gray-900 mb-3"><Dumbbell size={16} className="text-[#FF6B00]"/> Salles Partenaires</label>
              <p className="text-sm text-gray-500 mb-4">Sélectionnez les salles dans lesquelles vous donnez vos coachings.</p>
              {!formData.ville && (
                <div className="mb-4">
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Filtrer par ville</label>
                  <input
                    type="text"
                    value={villeSearch}
                    onChange={(e) => setVilleSearch(e.target.value)}
                    placeholder="Ex: Amiens"
                    className="w-full bg-white border border-gray-200 text-gray-900 px-4 py-2.5 rounded-xl focus:border-[#FF6B00] focus:ring-4 focus:ring-[#FF6B00]/10 outline-none transition-all"
                  />
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto p-1">
                {sallesDisponibles.length === 0 ? (
                  <p className="text-sm text-gray-400 italic">Aucune salle disponible.</p>
                ) : (
                  sallesDisponibles.map(salle => (
                    <label key={salle.id} className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${formData.salles.includes(salle.id) ? 'bg-orange-50 border-orange-200 shadow-sm' : 'bg-white border-gray-200 hover:border-orange-300'}`}>
                      <input 
                        type="checkbox" 
                        className="mt-1 w-4 h-4 text-[#FF6B00] rounded border-gray-300 focus:ring-[#FF6B00]"
                        checked={formData.salles.includes(salle.id)}
                        onChange={() => toggleSalle(salle.id)}
                      />
                      <div>
                        <p className={`text-sm font-bold ${formData.salles.includes(salle.id) ? 'text-[#FF6B00]' : 'text-gray-900'}`}>{salle.nom}</p>
                        <p className="text-xs text-gray-500">{salle.ville}</p>
                      </div>
                    </label>
                  ))
                )}
              </div>
            </div>

          </div>
        </section>
    {/* SECTION : ABONNEMENT PLATEFORME */}
        <section className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-50 text-yellow-600 rounded-xl"><Zap size={20} /></div>
              <h3 className="font-semibold text-gray-900 text-lg">Abonnement Plateforme</h3>
            </div>
            <div>
              {formData.platform_plan === 'premium' ? (
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold border border-green-200">PREMIUM ACTIF</span>
              ) : (
                <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-bold border border-gray-200">FREEMIUM (Gratuit)</span>
              )}
            </div>
          </div>
          <div className="p-6 md:p-8 bg-gray-50/30">
            {formData.platform_plan === 'premium' ? (
               <div className="flex flex-col gap-2">
                 <p className="text-sm text-gray-700 font-medium">Vous bénéficiez du plan Premium. 🎉</p>
                 <p className="text-sm text-gray-500">Aucune commission n'est prélevée sur vos ventes (0%). Vous gardez 100% de vos revenus.</p>
               </div>
            ) : (
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex flex-col gap-2">
                  <p className="text-sm text-gray-700 font-medium">Passez au niveau supérieur pour maximiser vos revenus.</p>
                  <p className="text-sm text-gray-500">Vous êtes actuellement sur le plan gratuit. Une commission de 10% est appliquée sur chaque paiement de vos athlètes. Passez Premium pour annuler ces frais.</p>
                </div>
                <button 
                  type="button" 
                  onClick={handleUpgradePremium} 
                  disabled={isSubLoading}
                  className="shrink-0 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-white px-6 py-3 rounded-xl font-bold shadow-md shadow-yellow-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer"
                >
                  {isSubLoading ? <Loader2 className="animate-spin" size={18}/> : <Zap size={18} className="fill-white"/>}
                  Passer Premium (29€/mois)
                </button>
              </div>
            )}
          </div>
        </section>

{/* NOUVELLE SECTION : CONFIGURATION DES VERSEMENTS */}
        <section className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-xl"><DollarSign size={20} /></div>
              <h3 className="font-semibold text-gray-900 text-lg">Configuration des versements</h3>
            </div>
            <div>
              {formData.stripe_onboarding_complete ? (
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold border border-green-200">COMPTE BANCAIRE LIÉ</span>
              ) : (
                <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold border border-red-200">À CONFIGURER</span>
              )}
            </div>
          </div>
          <div className="p-6 md:p-8 bg-gray-50/30">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex flex-col gap-2">
                <p className="text-sm text-gray-700 font-medium">Où doit être envoyé votre argent ?</p>
                <p className="text-sm text-gray-500">Pour recevoir automatiquement les paiements de vos athlètes (abonnements, packs, boutique) directement sur votre compte bancaire, vous devez configurer votre compte Stripe Connect.</p>
              </div>
              <button 
                type="button" 
                onClick={handleStripeConnect} 
                disabled={isSubLoading}
                className={`shrink-0 text-white px-6 py-3 rounded-xl font-bold shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer ${
                  formData.stripe_onboarding_complete 
                    ? "bg-gray-800 hover:bg-gray-900 shadow-gray-800/20" 
                    : "bg-blue-600 hover:bg-blue-700 shadow-blue-500/20"
                }`}
              >
                {isSubLoading ? <Loader2 className="animate-spin" size={18}/> : <DollarSign size={18}/>}
                {formData.stripe_onboarding_complete ? "Mettre à jour mon compte bancaire" : "Connecter mon compte bancaire"}
              </button>
            </div>
          </div>
        </section>
        {/* SECTION 3 : COMPTE */}
        <section className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
          <div className="p-5 border-b border-gray-100 flex items-center gap-3">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl"><Settings size={20} /></div>
            <h3 className="font-semibold text-gray-900 text-lg">Paramètres du compte</h3>
          </div>
          <div className="p-6 md:p-8 space-y-6 bg-gray-50/30">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Adresse email</label>
              <input type="email" name="email" value={formData.email || ''} onChange={handleChange} className="w-full bg-white border border-gray-200 text-gray-900 px-4 py-2.5 rounded-xl focus:border-[#FF6B00] focus:ring-4 focus:ring-[#FF6B00]/10 outline-none transition-all" />
            </div>
            <div className="pt-2">
              <button type="button" onClick={() => setIsPasswordModalOpen(true)} className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-[#FF6B00] transition-colors group px-4 py-2 rounded-lg bg-white border border-gray-200 hover:border-[#FF6B00]/30 shadow-sm cursor-pointer">
                <Lock size={16} className="text-gray-400 group-hover:text-[#FF6B00] transition-colors" /> Modifier mon mot de passe
              </button>
            </div>
          </div>
        </section>

        <div className="pt-4 flex justify-end">
          <button type="submit" disabled={saving} className="w-full md:w-auto bg-[#FF6B00] hover:bg-[#e66000] text-white px-8 py-3 rounded-xl font-semibold shadow-md shadow-orange-500/20 flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer disabled:opacity-70">
            {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />} Enregistrer les modifications
          </button>
        </div>
      </form>

      {/* MODALES */}
      {isSaveSuccessModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <div className="bg-white border border-gray-100 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Profil mis à jour</h3>
            <p className="text-gray-500 text-sm mb-6">Vos informations professionnelles ont été enregistrées avec succès.</p>
            <button onClick={() => { setIsSaveSuccessModalOpen(false); window.location.reload(); }} className="w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-2.5 rounded-xl transition-colors cursor-pointer">Fermer</button>
          </div>
        </div>
      )}

      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <div className="bg-white border border-gray-100 rounded-3xl p-8 max-w-md w-full relative shadow-2xl animate-in zoom-in-95 duration-200">
            <button onClick={() => setIsPasswordModalOpen(false)} className="absolute top-5 right-5 text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"><X size={20}/></button>
            <h3 className="text-xl font-bold text-gray-900 mb-6">Modifier le mot de passe</h3>
            
            {passwordError && <div className="mb-5 p-3.5 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm flex gap-2.5"><AlertCircle size={18} className="shrink-0"/>{passwordError}</div>}
            {passwordSuccess && <div className="mb-5 p-3.5 bg-green-50 border border-green-100 rounded-xl text-green-600 text-sm flex gap-2.5"><CheckCircle2 size={18} className="shrink-0"/>Mot de passe modifié avec succès.</div>}

            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Ancien mot de passe</label>
                <input type="password" placeholder="••••••••" className="w-full bg-white border border-gray-200 text-gray-900 px-4 py-2.5 rounded-xl outline-none focus:border-[#FF6B00] focus:ring-4 focus:ring-[#FF6B00]/10 transition-all" value={passwordData.old_password} onChange={(e) => setPasswordData({...passwordData, old_password: e.target.value})} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nouveau mot de passe</label>
                <input type="password" placeholder="••••••••" className="w-full bg-white border border-gray-200 text-gray-900 px-4 py-2.5 rounded-xl outline-none focus:border-[#FF6B00] focus:ring-4 focus:ring-[#FF6B00]/10 transition-all" value={passwordData.new_password} onChange={(e) => setPasswordData({...passwordData, new_password: e.target.value})} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirmer le nouveau mot de passe</label>
                <input type="password" placeholder="••••••••" className="w-full bg-white border border-gray-200 text-gray-900 px-4 py-2.5 rounded-xl outline-none focus:border-[#FF6B00] focus:ring-4 focus:ring-[#FF6B00]/10 transition-all" value={passwordData.confirm_password} onChange={(e) => setPasswordData({...passwordData, confirm_password: e.target.value})} required />
              </div>
              <div className="pt-2">
                <button type="submit" disabled={isPasswordLoading} className="w-full bg-[#FF6B00] hover:bg-[#e66000] text-white p-3 rounded-xl font-semibold flex justify-center items-center gap-2 cursor-pointer transition-colors disabled:opacity-70 shadow-md shadow-orange-500/20">
                  {isPasswordLoading ? <Loader2 className="animate-spin" size={18}/> : <Lock size={18}/>} Mettre à jour le mot de passe
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoachSettings;
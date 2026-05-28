import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Save, User, Scale, Ruler, Calendar, CheckCircle2, 
  Loader2, AlertCircle, Target, Settings, Lock, Bell, Activity, X, PartyPopper, Link as LinkIcon, CreditCard
} from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import api from '../services/api';
// --- NOUVEAU : Import du service Strava ---
import stravaService from '../services/stravaService';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || '');

const AthleteTopUpPaymentForm = ({ offer, onSuccess, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isPaying, setIsPaying] = useState(false);
  const [paymentError, setPaymentError] = useState('');

  const handlePay = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsPaying(true);
    setPaymentError('');

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
    });

    if (error) {
      setPaymentError(error.message || "Paiement refuse.");
      setIsPaying(false);
      return;
    }

    if (paymentIntent?.status === 'succeeded') {
      try {
        const res = await api.post('/athlete/topup/confirm/', { payment_intent_id: paymentIntent.id });
        onSuccess(res.data);
      } catch (err) {
        setPaymentError(err.response?.data?.message || "Paiement confirme, mais mise a jour du solde impossible.");
        setIsPaying(false);
      }
      return;
    }

    setPaymentError("Paiement non confirme.");
    setIsPaying(false);
  };

  return (
    <form onSubmit={handlePay} className="space-y-6">
      <div className="bg-black/30 border border-[#2D2D2D] rounded-2xl p-4">
        <PaymentElement />
      </div>
      {paymentError && <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-bold">{paymentError}</div>}
      <div className="flex gap-3">
        <button type="button" onClick={onCancel} className="flex-1 bg-[#2D2D2D] text-white font-bold py-3 rounded-xl hover:bg-[#3D3D3D] transition-colors">
          Annuler
        </button>
        <button type="submit" disabled={!stripe || !elements || isPaying} className="flex-1 bg-[#FF6B00] text-white font-black py-3 rounded-xl hover:bg-[#FF8533] disabled:opacity-50 transition-colors">
          {isPaying ? "Paiement..." : `Payer ${Number(offer?.price || 0).toFixed(2)} EUR`}
        </button>
      </div>
    </form>
  );
};

const AthleteSettings = () => {
  const [formData, setFormData] = useState({
    prenom: '', nom: '', poids: '', taille: '', age: '',
    genre: 'M', niveau_activite: '1.55', poids_cible: '',
    type_entrainement: 'Musculation', email: '', notifications_activees: true
  });

  const [isSyncing, setIsSyncing] = useState(false);
const [syncMessage, setSyncMessage] = useState('');

  // --- NOUVEAU : États pour les intégrations ---
  const [integrationsStatus, setIntegrationsStatus] = useState({ strava_connected: false, garmin_connected: false });
  const [isStravaLoading, setIsStravaLoading] = useState(false);

  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isSaveSuccessModalOpen, setIsSaveSuccessModalOpen] = useState(false);

  const [passwordData, setPasswordData] = useState({ old_password: '', new_password: '', confirm_password: '' });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [topUpClientSecret, setTopUpClientSecret] = useState('');
  const [topUpOffer, setTopUpOffer] = useState(null);
  const [topUpLoading, setTopUpLoading] = useState('');
  const [topUpMessage, setTopUpMessage] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('authToken') || localStorage.getItem('access_token');
        const response = await axios.get('http://127.0.0.1:8000/api/athlete/me/', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setFormData(prev => ({
          ...prev,
          ...Object.fromEntries(
            Object.entries(response.data || {}).map(([key, value]) => [key, value ?? ''])
          )
        }));

        // --- NOUVEAU : Récupération du statut des intégrations ---
        try {
          const status = await stravaService.getStatus();
          setIntegrationsStatus(status);
        } catch (statusErr) {
          console.error("Erreur chargement statut intégrations:", statusErr);
        }

      } catch (err) {
        setError("Impossible de charger vos informations.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('access_token');
      await axios.patch('http://127.0.0.1:8000/api/athlete/me/', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsSaveSuccessModalOpen(true);
    } catch (err) {
      setError("Erreur lors de la sauvegarde.");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    // ... (Votre code original pour le mot de passe, inchangé)
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
      setPasswordError(err.response?.data?.error || "Erreur.");
    } finally {
      setIsPasswordLoading(false);
    }
  };

  // --- NOUVEAU : Fonctions de connexion/déconnexion Strava ---
  const handleConnectStrava = () => {
    window.location.href = stravaService.getAuthUrl();
  };

  const handleDisconnectStrava = async () => {
    setIsStravaLoading(true);
    try {
      await stravaService.disconnect();
      setIntegrationsStatus(prev => ({ ...prev, strava_connected: false }));
    } catch (error) {
      console.error("Erreur lors de la déconnexion de Strava");
    } finally {
      setIsStravaLoading(false);
    }
  };
  const handleSyncStrava = async () => {
  setIsSyncing(true);
  setSyncMessage('');
  try {
    const data = await stravaService.sync();
    setSyncMessage(`${data.nouvelles_activites} nouvelles activités importées !`);
    // On efface le message après 5 secondes
    setTimeout(() => setSyncMessage(''), 5000);
  } catch (error) {
    console.error("Erreur de synchronisation Strava", error);
    setSyncMessage("Erreur lors de la synchronisation.");
  } finally {
    setIsSyncing(false);
  }
};

  const topUpOptions = [
    { type: 'abonnement', title: 'Renouveler abonnement', description: '+30 jours' },
    { type: 'pack', title: 'Racheter un pack', description: '+10 seances' },
    { type: 'seance', title: 'Seance a l unite', description: '+1 seance' },
  ];

  const handleStartTopUp = async (offerType) => {
    setTopUpLoading(offerType);
    setTopUpMessage('');
    try {
      const res = await api.post('/athlete/topup/create-intent/', { offer_type: offerType });
      setTopUpClientSecret(res.data.client_secret);
      setTopUpOffer(res.data.offer);
    } catch (err) {
      setTopUpMessage(err.response?.data?.message || "Impossible de lancer le paiement.");
    } finally {
      setTopUpLoading('');
    }
  };

  const handleTopUpSuccess = (payload) => {
    setTopUpClientSecret('');
    setTopUpOffer(null);
    setFormData(prev => ({ ...prev, seances_restantes: payload.seances_restantes }));
    setTopUpMessage(`Paiement confirme. Solde : ${payload.seances_restantes} seance(s).`);
  };

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-[#FF6B00]" size={48} /></div>;

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-8 pb-20 animate-in fade-in duration-500">
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter">Mon <span className="text-[#FF6B00]">Profil</span></h2>
          <p className="text-gray-500 text-sm mt-1 font-medium italic">Paramètres avancés pour le calcul de votre métabolisme.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* ... (Toutes vos sections PHYSIQUE et OBJECTIFS restent inchangées ici) ... */}
        {/* PHYSIQUE */}
        <section className="bg-[#1E1E1E] border border-[#2D2D2D] rounded-3xl overflow-hidden shadow-xl">
          <div className="p-6 border-b border-[#2D2D2D] bg-[#252525] flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg"><User size={20} /></div>
            <h3 className="font-bold text-white tracking-wide">Profil Physique</h3>
          </div>
          <div className="p-6 md:p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Prénom</label>
                <input type="text" name="prenom" value={formData.prenom} onChange={handleChange} className="w-full bg-black/30 border border-[#2D2D2D] text-white p-3 rounded-xl focus:border-[#FF6B00] outline-none transition-all" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Nom</label>
                <input type="text" name="nom" value={formData.nom} onChange={handleChange} className="w-full bg-black/30 border border-[#2D2D2D] text-white p-3 rounded-xl focus:border-[#FF6B00] outline-none transition-all" />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Genre</label>
                <select name="genre" value={formData.genre} onChange={handleChange} className="w-full bg-black/30 border border-[#2D2D2D] text-white p-3 rounded-xl outline-none">
                  <option value="M">Homme</option>
                  <option value="F">Femme</option>
                  <option value="O">Autre</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Poids (kg)</label>
                <input type="number" name="poids" value={formData.poids} onChange={handleChange} className="w-full bg-black/30 border border-[#2D2D2D] text-white p-3 rounded-xl outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Taille (cm)</label>
                <input type="number" name="taille" value={formData.taille} onChange={handleChange} className="w-full bg-black/30 border border-[#2D2D2D] text-white p-3 rounded-xl outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Âge</label>
                <input type="number" name="age" value={formData.age} onChange={handleChange} className="w-full bg-black/30 border border-[#2D2D2D] text-white p-3 rounded-xl outline-none" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Niveau d'activité quotidien</label>
              <select name="niveau_activite" value={formData.niveau_activite} onChange={handleChange} className="w-full bg-black/30 border border-[#2D2D2D] text-white p-3 rounded-xl outline-none focus:border-[#FF6B00]">
                  <option value="1.2">Sédentaire (Bureau, peu de sport)</option>
                  <option value="1.375">Légèrement actif (1-3 j/semaine)</option>
                  <option value="1.55">Modérément actif (3-5 j/semaine)</option>
                  <option value="1.725">Très actif (Sport quotidien)</option>
                  <option value="1.9">Extrêmement actif (Athlète / Physique)</option>
              </select>
            </div>
          </div>
        </section>

        {/* OBJECTIFS */}
        <section className="bg-[#1E1E1E] border border-[#2D2D2D] rounded-3xl overflow-hidden shadow-xl">
          <div className="p-6 border-b border-[#2D2D2D] bg-[#252525] flex items-center gap-3">
            <div className="p-2 bg-[#FF6B00]/10 text-[#FF6B00] rounded-lg"><Target size={20} /></div>
            <h3 className="font-bold text-white tracking-wide">Objectifs Sportifs</h3>
          </div>
          <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Poids Cible (kg)</label>
              <input type="number" name="poids_cible" value={formData.poids_cible} onChange={handleChange} className="w-full bg-black/30 border border-[#2D2D2D] text-white p-3 rounded-xl outline-none focus:border-[#FF6B00]" placeholder="Ex: 80" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Discipline favorite</label>
              <select name="type_entrainement" value={formData.type_entrainement} onChange={handleChange} className="w-full bg-black/30 border border-[#2D2D2D] text-white p-3 rounded-xl outline-none focus:border-[#FF6B00]">
                <option value="Musculation">Musculation (Hypertrophie)</option>
                <option value="Force">Force Athlétique (Powerlifting)</option>
                <option value="Haltérophilie">Haltérophilie</option>
                <option value="Crossfit">Crossfit / HIIT</option>
                <option value="Cardio">Cardio (Course, Vélo, Natation)</option>
                <option value="Souplesse">Souplesse / Yoga / Pilates</option>
              </select>
            </div>
          </div>
        </section>

        {/* --- NOUVEAU : SECTION APPLICATIONS CONNECTÉES --- */}
        <section className="bg-[#1E1E1E] border border-[#2D2D2D] rounded-3xl overflow-hidden shadow-xl">
          <div className="p-6 border-b border-[#2D2D2D] bg-[#252525] flex items-center gap-3">
            <div className="p-2 bg-orange-500/10 text-orange-500 rounded-lg"><LinkIcon size={20} /></div>
            <h3 className="font-bold text-white tracking-wide">Applications Connectées</h3>
          </div>
          <div className="p-6 md:p-8 space-y-6">
            <p className="text-gray-400 text-sm mb-4">Connectez vos montres et applications pour importer automatiquement vos performances cardio (distance, temps, fréquence cardiaque).</p>
            
            {/* Strava Block */}
            <div className="flex items-center justify-between p-4 bg-black/30 border border-[#2D2D2D] rounded-xl">
              <div className="flex items-center gap-4">
                {/* Icône factice Strava, vous pouvez remplacer par le vrai logo SVG si vous l'avez */}
                <div className="w-10 h-10 bg-[#FC4C02] rounded-lg flex items-center justify-center text-white font-black text-xl">S</div>
                <div>
                  <h4 className="text-white font-bold">Strava</h4>
                  <p className="text-[11px] text-gray-500">Importer les courses et sorties vélo</p>
                </div>
              </div>
              
              {integrationsStatus.strava_connected ? (
                <div className="flex flex-col items-end gap-2">
                  <div className="flex gap-2">
                    <button 
                      type="button" 
                      onClick={handleSyncStrava}
                      disabled={isSyncing}
                      className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm font-bold flex items-center gap-2 transition-colors"
                    >
                      {isSyncing ? <Loader2 size={16} className="animate-spin" /> : <Activity size={16} />}
                      Synchroniser
                    </button>
                    
                    <button 
                      type="button" 
                      onClick={handleDisconnectStrava} 
                      disabled={isStravaLoading}
                      className="px-4 py-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors"
                    >
                      {isStravaLoading ? <Loader2 size={16} className="animate-spin" /> : 'Déconnecter'}
                    </button>
                  </div>
                  {syncMessage && <p className="text-[10px] font-bold text-green-500 animate-bounce">{syncMessage}</p>}
                </div>
              ) : (
                <button 
                  type="button" 
                  onClick={handleConnectStrava} 
                  className="px-4 py-2 bg-[#FC4C02] hover:bg-[#FC4C02]/80 text-white rounded-lg text-sm font-bold transition-colors"
                >
                  Connecter
                </button>
              )}
            </div>

            {/* Garmin Block (Préparation pour plus tard) */}
            <div className="flex items-center justify-between p-4 bg-black/30 border border-[#2D2D2D] rounded-xl opacity-50">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-[#007CC3] rounded-lg flex items-center justify-center text-white font-black">G</div>
                <div>
                  <h4 className="text-white font-bold">Garmin Connect</h4>
                  <p className="text-[11px] text-gray-500">Bientôt disponible</p>
                </div>
              </div>
              <button type="button" disabled className="px-4 py-2 bg-gray-700 text-gray-400 rounded-lg text-sm font-bold cursor-not-allowed">
                Connecter
              </button>
            </div>
          </div>
        </section>
        {/* --- FIN NOUVEAU --- */}

        {/* COMPTE */}
        <section className="bg-[#1E1E1E] border border-[#2D2D2D] rounded-3xl overflow-hidden shadow-xl">
          <div className="p-6 border-b border-[#2D2D2D] bg-[#252525] flex items-center gap-3">
            <div className="p-2 bg-purple-500/10 text-purple-500 rounded-lg"><Settings size={20} /></div>
            <h3 className="font-bold text-white tracking-wide">Paramètres Compte</h3>
          </div>
          <div className="p-6 md:p-8 space-y-6">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Adresse Email</label>
              <input type="email" value={formData.email} disabled className="w-full bg-black/10 border border-[#2D2D2D] text-gray-500 p-3 rounded-xl cursor-not-allowed italic" />
            </div>
            <button type="button" onClick={() => setIsPasswordModalOpen(true)} className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-white transition-colors group">
              <Lock size={16} className="group-hover:text-[#FF6B00]" /> Modifier le mot de passe
            </button>
          </div>
        </section>

        <button type="submit" disabled={saving} className="w-full md:w-auto bg-[#FF6B00] hover:bg-[#FF8533] text-white px-12 py-4 rounded-2xl font-black text-lg shadow-lg flex items-center justify-center gap-3 transition-all active:scale-95">
          {saving ? <Loader2 className="animate-spin" /> : <Save />} Sauvegarder mon profil
        </button>
      </form>

      <section className="bg-[#1E1E1E] border border-[#2D2D2D] rounded-3xl overflow-hidden shadow-xl">
        <div className="p-6 border-b border-[#2D2D2D] bg-[#252525] flex items-center gap-3">
          <div className="p-2 bg-[#FF6B00]/10 text-[#FF6B00] rounded-lg"><CreditCard size={20} /></div>
          <h3 className="font-bold text-white tracking-wide">Abonnement & seances</h3>
        </div>
        <div className="p-6 md:p-8 space-y-5">
          <div className="flex items-center justify-between gap-4 bg-black/30 border border-[#2D2D2D] rounded-2xl p-5">
            <div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Solde actuel</p>
              <p className="text-3xl font-black text-white italic">{formData.seances_restantes || 0} <span className="text-sm text-[#FF6B00] not-italic">seance(s)</span></p>
            </div>
            {!formData.coach_stripe_onboarding_complete && (
              <div className="text-xs font-bold text-red-400 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
                Paiement indisponible pour ce coach.
              </div>
            )}
          </div>

          {topUpMessage && <div className="p-3 rounded-xl bg-[#FF6B00]/10 border border-[#FF6B00]/30 text-[#FFB27A] text-sm font-bold">{topUpMessage}</div>}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {topUpOptions.map((option) => {
              const price = Number(formData.coach_offres_tarifs?.[option.type] || 0);
              return (
                <button
                  key={option.type}
                  type="button"
                  disabled={!formData.coach_stripe_onboarding_complete || !price || topUpLoading === option.type}
                  onClick={() => handleStartTopUp(option.type)}
                  className="text-left bg-black/30 border border-[#2D2D2D] rounded-2xl p-5 hover:border-[#FF6B00] disabled:opacity-50 disabled:hover:border-[#2D2D2D] transition-colors"
                >
                  <p className="text-white font-black uppercase italic">{option.title}</p>
                  <p className="text-xs text-gray-500 font-bold mt-1">{option.description}</p>
                  <p className="text-2xl font-black text-[#FF6B00] mt-4">{price.toFixed(2)} EUR</p>
                  <p className="text-[10px] text-gray-500 font-bold uppercase mt-2">{topUpLoading === option.type ? 'Initialisation...' : 'Payer maintenant'}</p>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {topUpClientSecret && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
          <div className="bg-[#1E1E1E] border border-[#2D2D2D] rounded-3xl p-6 max-w-lg w-full">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <h3 className="text-2xl font-black text-white uppercase italic">{topUpOffer?.label}</h3>
                <p className="text-sm text-gray-500 font-bold mt-1">{topUpOffer?.credits} seance(s) - {Number(topUpOffer?.price || 0).toFixed(2)} EUR</p>
              </div>
              <button type="button" onClick={() => { setTopUpClientSecret(''); setTopUpOffer(null); }} className="text-gray-500 hover:text-white">
                <X />
              </button>
            </div>
            <Elements stripe={stripePromise} options={{ clientSecret: topUpClientSecret, appearance: { theme: 'night' } }}>
              <AthleteTopUpPaymentForm
                offer={topUpOffer}
                onSuccess={handleTopUpSuccess}
                onCancel={() => { setTopUpClientSecret(''); setTopUpOffer(null); }}
              />
            </Elements>
          </div>
        </div>
      )}

      {/* MODALE DE SUCCÈS SAUVEGARDE */}
      {isSaveSuccessModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
          <div className="bg-[#1E1E1E] border-2 border-green-500/30 rounded-3xl p-8 max-w-sm w-full text-center animate-in zoom-in duration-300">
            <div className="w-20 h-20 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={48} />
            </div>
            <h3 className="text-2xl font-black text-white mb-2 italic uppercase">Profil Mis à jour !</h3>
            <p className="text-gray-400 text-sm mb-8">Vos paramètres ont été enregistrés. Votre objectif calorique a été recalculé.</p>
            <button onClick={() => setIsSaveSuccessModalOpen(false)} className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-xl transition-all">Parfait !</button>
          </div>
        </div>
      )}

      {/* MODALE MOT DE PASSE */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#1E1E1E] border border-[#2D2D2D] rounded-3xl p-8 max-w-md w-full relative">
            <button onClick={() => setIsPasswordModalOpen(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white"><X /></button>
            <h3 className="text-2xl font-black text-white mb-6 uppercase italic text-[#FF6B00]">Changer le mot de passe</h3>
            
            {passwordError && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-xl text-red-500 text-sm flex gap-2"><AlertCircle size={16}/>{passwordError}</div>}
            {passwordSuccess && <div className="mb-4 p-3 bg-green-500/10 border border-green-500/50 rounded-xl text-green-500 text-sm flex gap-2"><CheckCircle2 size={16}/>Succès ! Fermeture...</div>}

            <form onSubmit={handlePasswordChange} className="space-y-4">
              <input type="password" placeholder="Ancien mot de passe" className="w-full bg-black/30 border border-[#2D2D2D] text-white p-3 rounded-xl outline-none focus:border-[#FF6B00]" value={passwordData.old_password} onChange={(e) => setPasswordData({...passwordData, old_password: e.target.value})} required />
              <input type="password" placeholder="Nouveau mot de passe" className="w-full bg-black/30 border border-[#2D2D2D] text-white p-3 rounded-xl outline-none focus:border-[#FF6B00]" value={passwordData.new_password} onChange={(e) => setPasswordData({...passwordData, new_password: e.target.value})} required />
              <input type="password" placeholder="Confirmer le nouveau" className="w-full bg-black/30 border border-[#2D2D2D] text-white p-3 rounded-xl outline-none focus:border-[#FF6B00]" value={passwordData.confirm_password} onChange={(e) => setPasswordData({...passwordData, confirm_password: e.target.value})} required />
              <button type="submit" disabled={isPasswordLoading} className="w-full bg-[#FF6B00] text-white p-3 rounded-xl font-bold flex justify-center items-center gap-2">
                {isPasswordLoading ? <Loader2 className="animate-spin"/> : <Lock size={18}/>} Mettre à jour
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AthleteSettings;

import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import prospectService from '../services/prospectService';

// Chargement de la clé publique Stripe depuis le .env
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_VOTRE_CLE');
const getCoachDisplayName = (coach) =>
  coach?.full_name ||
  `${coach?.first_name || coach?.prenom || ''} ${coach?.last_name || ''}`.trim() ||
  coach?.nom ||
  coach?.email ||
  'votre coach';

// --- 1. SOUS-COMPOSANT : LE FORMULAIRE DE PAIEMENT STRIPE ---
const StripeInviteForm = ({ token, preview, total }) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    email: preview?.email || '',
    phone: preview?.phone || '',
    cardholder_name: preview?.full_name || '',
    country: 'France',
    address: '',
    city: '',
    zip_code: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePay = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setError('');

    // Confirmation du paiement directement avec Stripe
    const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        payment_method_data: {
          billing_details: {
            name: formData.cardholder_name,
            email: formData.email,
            phone: formData.phone,
            address: {
              country: formData.country === 'France' ? 'FR' : formData.country === 'Belgique' ? 'BE' : 'CH',
              city: formData.city,
              postal_code: formData.zip_code,
              line1: formData.address,
            }
          }
        },
        receipt_email: formData.email, // Stripe enverra le reçu à cette adresse
      },
      redirect: "if_required",
    });

    if (stripeError) {
      setError(stripeError.message);
      setLoading(false);
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      // Paiement réussi ! On redirige l'utilisateur pour qu'il crée son mot de passe
      navigate(`/invite/set-password?token=${encodeURIComponent(token)}`);
    } else {
      setLoading(false);
    }
  };

  return (
    <>
      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 mb-6">
          {error}
        </div>
      )}
      <form onSubmit={handlePay} className="space-y-10">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-[#ff7a31] flex items-center justify-center text-black font-bold text-sm">1</span>
            <h2 className="text-xl font-bold tracking-tight">Contact</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-400 ml-1">Adresse email</label>
              <input name="email" value={formData.email} onChange={handleChange} className="w-full bg-[#131317] border-none rounded-xl px-4 py-3 outline-none text-white" placeholder="email@athlo.com" type="email" required />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-400 ml-1">Téléphone</label>
              <input name="phone" value={formData.phone} onChange={handleChange} className="w-full bg-[#131317] border-none rounded-xl px-4 py-3 outline-none text-white" placeholder="+33 6 00 00 00 00" type="tel" />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-[#ff7a31] flex items-center justify-center text-black font-bold text-sm">2</span>
            <h2 className="text-xl font-bold tracking-tight">Paiement</h2>
          </div>
          <div className="bg-[#131317] p-6 rounded-2xl space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-400 ml-1">Carte Bancaire</label>
              <div className="p-3 bg-[#1f1f25] rounded-xl border border-transparent focus-within:border-[#ff6a00]/30 transition-colors">
                 <PaymentElement />
              </div>
            </div>
            <div className="space-y-2 pt-2">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-400 ml-1">Porteur</label>
              <input name="cardholder_name" value={formData.cardholder_name} onChange={handleChange} className="w-full bg-[#1f1f25] border-none rounded-xl px-4 py-3 outline-none text-white" placeholder="Nom sur la carte" type="text" required />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-[#ff7a31] flex items-center justify-center text-black font-bold text-sm">3</span>
            <h2 className="text-xl font-bold tracking-tight">Adresse de facturation</h2>
          </div>
          <div className="grid grid-cols-1 gap-4">
            <select name="country" value={formData.country} onChange={handleChange} className="w-full bg-[#131317] border-none rounded-xl px-4 py-3 outline-none text-white">
              <option value="France">France</option>
              <option value="Belgique">Belgique</option>
              <option value="Suisse">Suisse</option>
            </select>
            <input name="address" value={formData.address} onChange={handleChange} className="w-full bg-[#131317] border-none rounded-xl px-4 py-3 outline-none text-white" placeholder="Adresse" type="text" />
            <div className="grid grid-cols-2 gap-4">
              <input name="city" value={formData.city} onChange={handleChange} className="w-full bg-[#131317] border-none rounded-xl px-4 py-3 outline-none text-white" placeholder="Ville" type="text" />
              <input name="zip_code" value={formData.zip_code} onChange={handleChange} className="w-full bg-[#131317] border-none rounded-xl px-4 py-3 outline-none text-white" placeholder="Code postal" type="text" />
            </div>
          </div>
        </div>

        <button
          className="w-full py-5 rounded-xl bg-gradient-to-r from-[#ff7526] to-[#ff915a] text-black font-black uppercase tracking-widest text-lg shadow-xl hover:shadow-[#ff915a]/20 active:scale-[0.98] transition-all disabled:opacity-50"
          type="submit"
          disabled={loading || !stripe || !elements}
        >
          {loading ? 'Paiement en cours...' : `Payer ${total.toFixed(2)} €`}
        </button>
        <p className="text-center text-xs text-gray-400">
          Après paiement, vous définirez directement votre mot de passe pour activer votre compte.
        </p>
      </form>
    </>
  );
};


// --- 2. COMPOSANT PRINCIPAL ---
const InviteCheckout = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const [loadingPreview, setLoadingPreview] = useState(true);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    const fetchPreview = async () => {
      if (!token) {
        setError("Lien d'invitation invalide ou manquant.");
        setLoadingPreview(false);
        return;
      }
      try {
        const data = await prospectService.getInvitationCheckoutPreview(token);
        setPreview(data);
      } catch (err) {
        setError(err.response?.data?.message || "Impossible de charger l'invitation de paiement.");
      } finally {
        setLoadingPreview(false);
      }
    };
    fetchPreview();
  }, [token]);

  const total = useMemo(() => Number(preview?.offer?.price || 0), [preview]);
  const coachDisplayName = getCoachDisplayName(preview?.coach);

  if (loadingPreview) {
    return (
      <div className="min-h-screen bg-[#0e0e12] text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF6A00]"></div>
      </div>
    );
  }

  if (!preview || error) {
    return (
      <div className="min-h-screen bg-[#0e0e12] text-white flex items-center justify-center p-6">
        <div className="bg-[#19191e] border border-white/10 rounded-2xl p-8 max-w-md w-full text-center">
          <h1 className="text-2xl font-black mb-3">Invitation introuvable</h1>
          <p className="text-gray-400 mb-6">{error || "Cette invitation est invalide, expirée ou déjà utilisée."}</p>
          <button onClick={() => navigate('/login')} className="w-full py-3 rounded-xl bg-[#ff6a00] hover:bg-orange-600 font-bold">
            Aller à la connexion
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#0e0e12] text-[#fcf8fe] min-h-screen">
      <header className="bg-[#0e0e12] fixed top-0 w-full z-50 shadow-[0_40px_60px_-15px_rgba(0,0,0,0.3)]">
        <div className="flex justify-between items-center px-6 py-4 w-full">
          <div className="text-2xl font-black italic tracking-tighter text-[#FF6A00]">ATHLO</div>
          <div className="text-sm text-gray-400">Invitation coach</div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12 md:py-20 min-h-[calc(100vh-80px)] pt-28">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          
          <div className="lg:col-span-7 space-y-12">
            <section>
              <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter text-white mb-4">
                Finaliser l'accès à votre espace
              </h1>
              <p className="text-gray-400 uppercase tracking-widest text-sm">
                Invitation envoyée par {coachDisplayName}
              </p>
            </section>

            {preview?.client_secret ? (
                <Elements stripe={stripePromise} options={{ clientSecret: preview.client_secret, appearance: { theme: 'night' } }}>
                   <StripeInviteForm token={token} preview={preview} total={total} />
                </Elements>
            ) : (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300">
                    Erreur de connexion sécurisée au paiement.
                </div>
            )}
          </div>

          <div className="lg:col-span-5 sticky top-32">
            <div className="bg-[#131317] rounded-3xl p-8 border border-white/5 shadow-2xl relative overflow-hidden">
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#ff915a]/5 rounded-full blur-3xl"></div>
              <h3 className="text-2xl font-black tracking-tight mb-8">Résumé</h3>
              <div className="space-y-6">
                <div className="flex gap-4 group">
                  <div className="flex-grow flex flex-col justify-center">
                    <div className="flex justify-between">
                      <h4 className="font-bold">{coachDisplayName}</h4>
                      <span className="font-bold">{total.toFixed(2)} €</span>
                    </div>
                    <p className="text-sm text-gray-400">{preview?.offer?.label || '-'}</p>
                    <p className="text-xs font-bold text-[#ff915a] mt-1">
                      {preview?.coach?.ville || 'Coach disponible en ligne'}
                    </p>
                  </div>
                </div>
              </div>
              <div className="my-8 h-px bg-white/10"></div>
              <div className="space-y-4">
                <div className="flex justify-between text-gray-400">
                  <span>Sous-total</span>
                  <span className="font-medium">{total.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Frais</span>
                  <span className="font-medium">0.00 €</span>
                </div>
                <div className="pt-4 border-t border-white/10">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-xs uppercase font-bold tracking-[0.2em] text-gray-400">Total</p>
                      <p className="text-3xl font-black italic tracking-tighter text-[#ff915a]">
                        {total.toFixed(2)} €
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default InviteCheckout;

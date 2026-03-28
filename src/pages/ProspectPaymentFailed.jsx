import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import prospectService from '../services/prospectService';

const ProspectPaymentFailed = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const [checkout, setCheckout] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPreview = async () => {
      try {
        const data = await prospectService.getCheckoutPreview(token);
        setCheckout(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchPreview();
    } else {
      setLoading(false);
    }
  }, [token]);

  const retryPayment = () => {
    if (!checkout?.coach || !checkout?.offer) {
      navigate('/prospect/dashboard');
      return;
    }

    navigate('/prospect/checkout', {
      state: {
        coach: checkout.coach,
        selectedOffre: {
          type: checkout.offer.type,
          prix: checkout.offer.price,
          description: checkout.offer.label,
        },
      },
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0e0e12] text-[#fcf8fe]">
      <nav className="bg-[#131317] shadow-[0_40px_60px_-15px_rgba(0,0,0,0.3)] flex justify-between items-center px-6 py-4 w-full fixed top-0 z-50">
        <div className="text-2xl font-black italic tracking-tighter text-[#FF6A00]">ATHLO</div>
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/prospect/dashboard')} className="text-gray-400 hover:text-white transition">
            Dashboard
          </button>
        </div>
      </nav>

      <main className="flex-grow flex items-center justify-center px-6 pt-24 pb-12">
        <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-5 flex flex-col items-center md:items-start space-y-6">
            <div className="relative">
              <div className="absolute inset-0 bg-red-500/20 blur-3xl rounded-full"></div>
              
            </div>

            <div className="text-center md:text-left">
              <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-2 text-white">Échec paiement</h1>
              <p className="text-gray-400 text-lg max-w-xs">
                Une erreur est survenue pendant la transaction. Vous pouvez réessayer ou revenir au dashboard.
              </p>
            </div>
          </div>

          <div className="md:col-span-7">
            <div className="bg-[#1f1f25]/80 backdrop-blur-xl p-8 rounded-xl border border-white/5 shadow-2xl space-y-8">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <span className="text-gray-400 text-sm font-bold tracking-widest uppercase">Détails</span>
                  <span className="text-red-400 font-mono text-xs px-2 py-1 bg-red-500/10 rounded">
                    CODE: 402_PAYMENT_REQUIRED
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-white font-bold">Transaction refusée</div>
                      <div className="text-gray-400 text-sm">Votre moyen de paiement a été refusé ou la simulation a généré un échec.</div>
                    </div>
                    <span className="material-symbols-outlined text-gray-500">info</span>
                  </div>

                  <div className="bg-[#0B0B0F] p-4 rounded-lg space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Coach</span>
                      <span className="text-white font-medium">{loading ? '...' : checkout?.coach?.full_name || '-'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Offre</span>
                      <span className="text-white font-medium">{loading ? '...' : checkout?.offer?.label || '-'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Montant</span>
                      <span className="text-white font-medium">
                        {loading ? '...' : `${Number(checkout?.offer?.price || 0).toFixed(2)} €`}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Carte</span>
                      <span className="text-white font-medium">•••• {checkout?.card_last4 || '----'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4">
              

                <div className="flex gap-4">
                  <button
                    onClick={retryPayment}
                    className="flex-1 bg-[#25252b] py-3 rounded-xl text-white font-bold border border-white/10 hover:bg-[#2c2b32] transition-colors active:scale-95"
                  >
                    Changer de carte
                  </button>
                  <button
                    onClick={() => navigate('/prospect/dashboard')}
                    className="flex-1 text-[#FF915A] py-3 font-bold hover:underline"
                  >
                    Annuler
                  </button>
                </div>
              </div>

              <div className="pt-4 text-center">
                <p className="text-gray-400 text-xs">
                  Besoin d'aide ? Réessayez avec une autre carte ou revenez au dashboard prospect.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <div className="fixed inset-0 -z-10 opacity-5 grayscale pointer-events-none">
        <div className="w-full h-full bg-[radial-gradient(circle_at_bottom_left,rgba(255,106,0,0.2),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(255,0,0,0.18),transparent_30%)]"></div>
      </div>
    </div>
  );
};

export default ProspectPaymentFailed;
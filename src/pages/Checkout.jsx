import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { MapPin, Phone, User, ArrowLeft, Truck, Package, CheckCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import api from '../services/api';

// Initialisation de Stripe en dehors du composant
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || '');

// --- 1. SOUS-COMPOSANT : FORMULAIRE DE PAIEMENT STRIPE ---
const StripeShopForm = ({ cartTotal, clearCart, cart, hasPhysicalProduct }) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    nom: '',
    adresse: '',
    ville: '',
    codePostal: '',
    telephone: ''
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setError('');

    const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        payment_method_data: {
          billing_details: {
            name: formData.nom,
            phone: formData.telephone,
            address: {
              line1: formData.adresse,
              city: formData.ville,
              postal_code: formData.codePostal,
              country: 'FR',
            }
          }
        }
      },
      redirect: "if_required",
    });

    if (stripeError) {
      setError(stripeError.message);
      setLoading(false);
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      try {
        // Préparer les données de commande
        const orderData = {
          payment_intent_id: paymentIntent.id,
          items: cart.map(item => ({ produit_id: item.id, quantite: item.quantite }))
        };
        
        // Ajouter l'adresse seulement si produit physique
        if (hasPhysicalProduct) {
          orderData.adresse_livraison = {
            nom: formData.nom,
            adresse: formData.adresse,
            ville: formData.ville,
            code_postal: formData.codePostal,
            telephone: formData.telephone
          };
        }
        
        await api.post('/shop/confirm-order/', orderData);
        clearCart();
        navigate('/athlete/factures'); 
      } catch (err) {
        setError(err.response?.data?.error || err.response?.data?.detail || 'Erreur lors de la confirmation de la commande');
        setLoading(false);
      }
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
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* INFOS DE LIVRAISON - Conditionnel selon type de produit */}
        {hasPhysicalProduct ? (
          <div>
            <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter mb-2">
              Livrai<span className="text-[#FF6B00]">son</span>
            </h1>
            <p className="text-gray-400 font-medium mb-6">Où devons-nous envoyer votre commande ?</p>
            
            <div className="space-y-4">
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                <input type="text" name="nom" placeholder="Nom complet" required className="w-full bg-[#1E1E1E] border border-[#2D2D2D] rounded-2xl py-4 pl-12 pr-4 text-white focus:border-[#FF6B00] outline-none" onChange={handleChange} />
              </div>
              <div className="relative group">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                <input type="text" name="adresse" placeholder="Adresse de livraison" required className="w-full bg-[#1E1E1E] border border-[#2D2D2D] rounded-2xl py-4 pl-12 pr-4 text-white focus:border-[#FF6B00] outline-none" onChange={handleChange} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input type="text" name="codePostal" placeholder="Code Postal" required className="w-full bg-[#1E1E1E] border border-[#2D2D2D] rounded-2xl py-4 px-6 text-white focus:border-[#FF6B00] outline-none" onChange={handleChange} />
                <input type="text" name="ville" placeholder="Ville" required className="w-full bg-[#1E1E1E] border border-[#2D2D2D] rounded-2xl py-4 px-6 text-white focus:border-[#FF6B00] outline-none" onChange={handleChange} />
              </div>
              <div className="relative group">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                <input type="tel" name="telephone" placeholder="Numéro de téléphone" required className="w-full bg-[#1E1E1E] border border-[#2D2D2D] rounded-2xl py-4 pl-12 pr-4 text-white focus:border-[#FF6B00] outline-none" onChange={handleChange} />
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-green-500/10 border-2 border-green-500/30 rounded-2xl p-6 text-center">
            <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
            <h2 className="text-2xl font-black text-white mb-2">Produits Numériques</h2>
            <p className="text-gray-400">Aucune livraison nécessaire. Vos produits seront disponibles immédiatement après paiement.</p>
          </div>
        )}

        {/* PAIEMENT STRIPE */}
        <div>
          <h2 className="text-xl font-bold text-white mb-4">Paiement sécurisé</h2>
          <div className="bg-[#1E1E1E] p-4 rounded-2xl border border-[#2D2D2D]">
            <PaymentElement />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !stripe || !elements}
          className="w-full bg-white text-black font-black py-5 rounded-2xl hover:bg-[#FF6B00] hover:text-white transition-all disabled:opacity-50 uppercase italic"
        >
          {loading ? 'Traitement...' : `Payer ${cartTotal.toFixed(2)} €`}
        </button>
      </form>
    </>
  );
};


// --- 2. COMPOSANT PRINCIPAL ---
const Checkout = () => {
  const { cart, subTotal, shippingFee, cartTotal, clearCart, hasPhysicalProduct } = useCart();
  const [clientSecret, setClientSecret] = useState('');
  const [initError, setInitError] = useState('');

  // Demande à Django de créer l'intention avec les articles du panier
  useEffect(() => {
    if (cart.length > 0) {
      const itemsPayload = cart.map(item => ({ id: item.id, quantite: item.quantite }));
      
      api.post('/shop/create-intent/', { items: itemsPayload })
        .then(res => setClientSecret(res.data.client_secret))
        .catch(err => {
          setInitError(err.response?.data?.error || "Erreur lors de l'initialisation du paiement sécurisé.");
        });
    }
  }, [cart]);

  if (cart.length === 0) {
    return (
      <div className="max-w-6xl mx-auto py-20 px-4 text-center">
        <h2 className="text-2xl font-bold text-white mb-4">Votre panier est vide.</h2>
        <Link to="/athlete/boutique" className="text-[#FF6B00] hover:underline">Retour à la boutique</Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-10 px-4 relative">
      <Link to="/athlete/cart" className="flex items-center gap-2 text-gray-500 hover:text-white mb-8 transition-colors font-bold uppercase text-xs tracking-widest">
        <ArrowLeft size={18} /> Retour au panier
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        
        {/* COLONNE GAUCHE (FORMULAIRE) */}
        <div>
          {initError ? (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300">
              {initError}
            </div>
          ) : clientSecret ? (
            <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'night' } }}>
              <StripeShopForm cartTotal={cartTotal} clearCart={clearCart} cart={cart} hasPhysicalProduct={hasPhysicalProduct} />
            </Elements>
          ) : (
            <div className="flex items-center gap-3 text-[#FF6B00] font-bold">
              <span className="material-symbols-outlined animate-spin">sync</span>
              Génération du paiement sécurisé...
            </div>
          )}
        </div>

        {/* COLONNE DROITE (RÉSUMÉ) */}
        <div className="bg-[#1E1E1E] border border-[#2D2D2D] rounded-3xl p-8 sticky top-24">
          <h2 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
            <Package className="text-[#FF6B00]" />
            Récapitulatif
          </h2>
          
          <div className="space-y-6 mb-8 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            {cart.map(item => (
              <div key={item.id} className="flex justify-between items-center bg-[#121212] p-4 rounded-xl border border-[#2D2D2D]">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <img src={item.image} alt={item.nom} className="w-10 h-10 object-cover rounded-lg" />
                    <span className="absolute -top-2 -right-2 bg-[#FF6B00] text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full">
                      {item.quantite}
                    </span>
                  </div>
                  <span className="text-white font-bold text-sm truncate max-w-[120px]">{item.nom}</span>
                </div>
                <span className="text-white font-black">{(item.prix * item.quantite).toFixed(2)} €</span>
              </div>
            ))}
          </div>

          <div className="border-t border-[#2D2D2D] pt-6 space-y-4 font-medium">
            <div className="flex justify-between text-gray-400 text-sm">
              <span>Sous-total</span>
              <span className="text-white">{subTotal.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between text-gray-400 text-sm pb-4 border-b border-[#2D2D2D]">
              <div className="flex items-center gap-2">
                <Truck size={16} />
                <span>Livraison</span>
              </div>
              <span className="text-white">{shippingFee.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="text-white font-black text-xl uppercase italic tracking-tighter">Total final</span>
              <span className="text-3xl font-black text-[#FF6B00] italic">{cartTotal.toFixed(2)} €</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Checkout;

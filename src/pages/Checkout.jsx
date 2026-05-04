import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { MapPin, Phone, User, CreditCard, ArrowLeft, Truck, Loader2, ShieldCheck, Lock, Package } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Checkout = () => {
  const { cart, subTotal, shippingFee, cartTotal } = useCart();
  const navigate = useNavigate();
  
  // --- NOUVEAU : État pour la modale de chargement ---
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [formData, setFormData] = useState({
    nom: '',
    adresse: '',
    ville: '',
    codePostal: '',
    telephone: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // On déclenche l'animation de chargement
    setIsProcessing(true);

    // Simulation du délai pour préparer la session Stripe
    setTimeout(() => {
      console.log("Données prêtes pour Stripe :", formData);
      // Ici, tu feras ta redirection Stripe plus tard
      // setIsProcessing(false); 
    }, 2500);
  };

  return (
    <div className="max-w-6xl mx-auto py-10 px-4 relative">
      
      {/* --- NOUVELLE MODALE DE CHARGEMENT --- */}
      {isProcessing && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-[#1E1E1E] border border-[#2D2D2D] p-10 rounded-[40px] max-w-sm w-full text-center shadow-2xl shadow-[#FF6B00]/10 animate-in zoom-in duration-300">
            <div className="relative w-24 h-24 mx-auto mb-8">
              {/* Le cercle orange qui tourne */}
              <div className="absolute inset-0 border-4 border-[#FF6B00]/10 rounded-full"></div>
              <Loader2 className="text-[#FF6B00] animate-spin absolute inset-0" size={96} strokeWidth={1} />
              <div className="absolute inset-0 flex items-center justify-center">
                <Lock className="text-white opacity-50" size={28} />
              </div>
            </div>
            
            <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-4">
              Paiement <span className="text-[#FF6B00]">Sécurisé</span>
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed mb-8 font-medium">
              Nous préparons votre tunnel de paiement chiffré. Ne fermez pas cette page.
            </p>
            
            <div className="flex items-center justify-center gap-2 text-[10px] text-gray-500 font-black uppercase tracking-widest bg-[#121212] py-3 rounded-2xl border border-[#2D2D2D]">
              <ShieldCheck size={14} className="text-[#00C853]" />
              Protocole SSL / Chiffrement AES-256
            </div>
          </div>
        </div>
      )}

      <Link to="/athlete/cart" className="flex items-center gap-2 text-gray-500 hover:text-white mb-8 transition-colors font-bold uppercase text-xs tracking-widest">
        <ArrowLeft size={18} /> Retour au panier
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        
        {/* FORMULAIRE DE LIVRAISON */}
        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter mb-2">
              Livrai<span className="text-[#FF6B00]">son</span>
            </h1>
            <p className="text-gray-400 font-medium">Où devons-nous envoyer votre commande Athlo ?</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#FF6B00] transition-colors" size={20} />
              <input 
                type="text" name="nom" placeholder="Nom complet" required
                className="w-full bg-[#1E1E1E] border border-[#2D2D2D] rounded-2xl py-4 pl-12 pr-4 text-white focus:border-[#FF6B00] outline-none transition-all"
                onChange={handleChange}
              />
            </div>

            <div className="relative group">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#FF6B00] transition-colors" size={20} />
              <input 
                type="text" name="adresse" placeholder="Adresse de livraison" required
                className="w-full bg-[#1E1E1E] border border-[#2D2D2D] rounded-2xl py-4 pl-12 pr-4 text-white focus:border-[#FF6B00] outline-none transition-all"
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <input 
                type="text" name="codePostal" placeholder="Code Postal" required
                className="w-full bg-[#1E1E1E] border border-[#2D2D2D] rounded-2xl py-4 px-6 text-white focus:border-[#FF6B00] outline-none transition-all"
                onChange={handleChange}
              />
              <input 
                type="text" name="ville" placeholder="Ville" required
                className="w-full bg-[#1E1E1E] border border-[#2D2D2D] rounded-2xl py-4 px-6 text-white focus:border-[#FF6B00] outline-none transition-all"
                onChange={handleChange}
              />
            </div>

            <div className="relative group">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#FF6B00] transition-colors" size={20} />
              <input 
                type="tel" name="telephone" placeholder="Numéro de téléphone" required
                className="w-full bg-[#1E1E1E] border border-[#2D2D2D] rounded-2xl py-4 pl-12 pr-4 text-white focus:border-[#FF6B00] outline-none transition-all"
                onChange={handleChange}
              />
            </div>

            <button type="submit" className="w-full bg-white text-black font-black py-5 rounded-2xl hover:bg-[#FF6B00] hover:text-white transition-all flex items-center justify-center gap-3 mt-8 shadow-xl uppercase italic">
              <CreditCard size={22} />
              Payer {cartTotal.toFixed(2)} €
            </button>
          </form>
        </div>

        {/* RÉCAPITULATIF DE COMMANDE */}
        <div className="bg-[#1E1E1E] border border-[#2D2D2D] rounded-3xl p-8 sticky top-24">
          <h2 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
            <Package className="text-[#FF6B00]" />
            Récapitulatif
          </h2>
          
          <div className="space-y-6 mb-8 max-h-[300px] overflow-y-auto pr-2">
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
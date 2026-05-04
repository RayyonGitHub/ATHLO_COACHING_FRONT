import React from 'react';
import { Link } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowRight, Minus, Plus } from 'lucide-react';
import { useCart } from '../context/CartContext';

const CartPage = () => {
  // On récupère toutes les nouvelles valeurs depuis le CartContext
  const { 
    cart, 
    removeItemCompletely, 
    decrementQuantity, 
    addToCart, 
    subTotal, 
    shippingFee, 
    cartTotal 
  } = useCart();

  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in duration-500">
        <div className="p-6 bg-[#1E1E1E] rounded-full mb-6 border border-[#2D2D2D]">
          <ShoppingBag size={64} className="text-gray-600" />
        </div>
        <h2 className="text-2xl font-black text-white uppercase italic mb-2">Votre panier est vide</h2>
        <p className="text-gray-400 mb-8 max-w-xs">Il semble que vous n'ayez pas encore ajouté d'articles à votre équipement.</p>
        <Link to="/athlete/boutique" className="bg-[#FF6B00] text-white px-10 py-4 rounded-2xl font-black uppercase italic hover:bg-[#ff8c3a] transition-all shadow-lg shadow-[#FF6B00]/20">
          Retour à la boutique
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 animate-in fade-in duration-700">
      <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-8">
        Mon <span className="text-[#FF6B00]">Panier</span>
      </h1>
      
      {/* LISTE DES ARTICLES */}
      <div className="bg-[#1E1E1E] rounded-3xl border border-[#2D2D2D] p-6 mb-8 shadow-xl">
        {cart.map((item) => (
          <div key={item.id} className="flex flex-col sm:flex-row items-center gap-6 py-6 border-b border-[#2D2D2D] last:border-0">
            {/* Image du produit */}
            <img src={item.image} alt={item.nom} className="w-24 h-24 object-cover rounded-2xl border border-[#2D2D2D]" />
            
            {/* Nom et prix */}
            <div className="flex-1 text-center sm:text-left">
              <h3 className="text-xl font-bold text-white mb-1">{item.nom}</h3>
              <p className="text-[#FF6B00] font-black text-lg">{item.prix} €</p>
            </div>
            
            {/* Contrôle des quantités */}
            <div className="flex items-center gap-4 bg-[#121212] p-2 rounded-xl border border-[#2D2D2D]">
              <button 
                onClick={() => decrementQuantity(item.id)} 
                className="p-2 text-gray-400 hover:text-white hover:bg-[#1E1E1E] rounded-lg transition-all"
              >
                <Minus size={18} />
              </button>
              
              <span className="font-black text-white w-8 text-center text-lg">{item.quantite}</span>
              
              <button 
                onClick={() => addToCart(item)} 
                className="p-2 text-gray-400 hover:text-white hover:bg-[#1E1E1E] rounded-lg transition-all"
              >
                <Plus size={18} />
              </button>
            </div>
            
            {/* Bouton de suppression totale */}
            <button 
              onClick={() => removeItemCompletely(item.id)} 
              className="text-gray-600 hover:text-red-500 p-2 transition-colors"
              title="Supprimer l'article"
            >
              <Trash2 size={22} />
            </button>
          </div>
        ))}
      </div>

      {/* RÉSUMÉ FINANCIER */}
      <div className="bg-[#1E1E1E] rounded-3xl border border-[#2D2D2D] p-8 space-y-4 shadow-xl">
        <div className="flex justify-between text-gray-400 font-medium">
          <span>Sous-total</span>
          <span>{subTotal.toFixed(2)} €</span>
        </div>
        
        <div className="flex justify-between text-gray-400 font-medium pb-4 border-b border-[#2D2D2D]">
          <div className="flex items-center gap-2">
            <span>Frais de livraison</span>
          </div>
          <span>{shippingFee.toFixed(2)} €</span>
        </div>

        <div className="pt-4 flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <p className="text-xs text-gray-500 uppercase font-black tracking-[0.2em] mb-1">Total à régler</p>
            <p className="text-5xl font-black text-white italic tracking-tighter">
              {cartTotal.toFixed(2)} <span className="text-sm not-italic ml-1 text-[#FF6B00]">€</span>
            </p>
          </div>
          
          <Link 
            to="/athlete/checkout" 
            className="w-full md:w-auto bg-white text-black px-12 py-5 rounded-2xl font-black uppercase italic flex items-center justify-center gap-3 hover:bg-[#FF6B00] hover:text-white hover:shadow-2xl hover:shadow-[#FF6B00]/40 transition-all group"
          >
            Valider la commande
            <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
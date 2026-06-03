import React, { useState, useEffect } from 'react';
import { ShoppingCart, Package, Search, Tag, Loader2, CreditCard, X, CheckCircle, ArrowRight, ZoomIn } from 'lucide-react';
import productService from '../services/productService';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';

const AthleteShop = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  
  // États pour le Toast
  const [showToast, setShowToast] = useState(false);
  const [addedProduct, setAddedProduct] = useState(null);
  
  // État pour la lightbox
  const [selectedImage, setSelectedImage] = useState(null);

  const { addToCart, cart, cartCount } = useCart();

  useEffect(() => {
    fetchData();
  }, []);

 const fetchData = async () => {
    try {
      const [productsData, categoriesData] = await Promise.all([
        productService.getProducts(),
        productService.getCategories()
      ]);

      setProducts(productsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error("Erreur de chargement de la boutique :", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = selectedCategory 
    ? products.filter(p => p.categorie === parseInt(selectedCategory))
    : products;

  // --- MODIFICATION ICI : Gestion du Toast au lieu de l'alert ---
  const handleBuyClick = (product) => {
    const quantitePanier = cart.find(item => item.id === product.id)?.quantite || 0;
    if (product.type_produit === 'PHYSIQUE' && quantitePanier >= Number(product.stock || 0)) {
      setAddedProduct({ ...product, nom: `Stock insuffisant pour ${product.nom}` });
      setShowToast(true);
      setTimeout(() => setShowToast(false), 4000);
      return;
    }

    addToCart(product);
    setAddedProduct(product);
    setShowToast(true);

    // Auto-fermeture après 4 secondes
    setTimeout(() => {
      setShowToast(false);
    }, 4000);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin text-[#FF6B00]" size={48} /></div>;
  }

  return (
    <div className="flex flex-col gap-8 pb-20 animate-in fade-in duration-700 max-w-6xl mx-auto relative">
      
      {/* HEADER BOUTIQUE */}
      <div className="bg-gradient-to-r from-[#1E1E1E] to-[#252525] p-8 rounded-3xl border border-[#2D2D2D] shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-2">
            La <span className="text-[#FF6B00]">Boutique</span>
          </h2>
          <p className="text-gray-400 font-medium">Découvrez les équipements et programmes de vos coachs.</p>
        </div>

        <Link 
          to="/athlete/cart" 
          className="relative p-4 bg-[#121212] border border-[#2D2D2D] rounded-2xl hover:border-[#FF6B00]/50 transition-all group"
        >
          <ShoppingCart size={30} className="text-[#FF6B00] group-hover:scale-110 transition-transform" />
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-[#FF6B00] text-white text-[10px] font-black w-6 h-6 flex items-center justify-center rounded-full border-2 border-[#1E1E1E] shadow-lg animate-in zoom-in duration-300">
              {cartCount}
            </span>
          )}
        </Link>
      </div>

      {/* FILTRES */}
      <div className="flex items-center gap-4 overflow-x-auto pb-2 scrollbar-hide">
        <button 
          onClick={() => setSelectedCategory('')}
          className={`px-6 py-2 rounded-full font-bold whitespace-nowrap transition-colors ${selectedCategory === '' ? 'bg-[#FF6B00] text-white' : 'bg-[#1E1E1E] text-gray-400 hover:text-white border border-[#2D2D2D]'}`}
        >
          Tout voir
        </button>
        {categories.map(cat => (
          <button 
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id.toString())}
            className={`px-6 py-2 rounded-full font-bold whitespace-nowrap transition-colors ${selectedCategory === cat.id.toString() ? 'bg-[#FF6B00] text-white' : 'bg-[#1E1E1E] text-gray-400 hover:text-white border border-[#2D2D2D]'}`}
          >
            {cat.nom}
          </button>
        ))}
      </div>

      {/* GRILLE DES PRODUITS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map(product => (
          <div key={product.id} className="bg-[#1E1E1E] border border-[#2D2D2D] rounded-3xl overflow-hidden group hover:border-[#FF6B00]/50 transition-all hover:shadow-xl hover:shadow-[#FF6B00]/10 flex flex-col">
            <div className="h-56 bg-[#252525] relative overflow-hidden flex items-center justify-center cursor-pointer" onClick={() => product.image && setSelectedImage(product.image)}>
              {product.image ? (
                <>
                  <img src={product.image} alt={product.nom} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                    <ZoomIn className="text-white opacity-0 group-hover:opacity-100 transition-opacity" size={32} />
                  </div>
                </>
              ) : (
                <Package size={64} className="text-gray-600" />
              )}
              <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-md text-white text-xs font-black px-3 py-1.5 rounded-lg border border-white/10 uppercase tracking-wider">
                {product.type_produit === 'PHYSIQUE' ? 'Livraison' : 'Téléchargement'}
              </div>
            </div>
            
            <div className="p-6 flex-1 flex flex-col">
              <div className="flex justify-between items-start gap-4 mb-2">
                <h4 className="text-white font-black text-xl leading-tight line-clamp-2">{product.nom}</h4>
                <span className="text-[#FF6B00] font-black text-xl whitespace-nowrap">{product.prix} €</span>
              </div>
              <p className="text-sm text-gray-500 mb-6 line-clamp-2 flex-1">{product.description}</p>
              
              <button 
                onClick={() => handleBuyClick(product)} 
                disabled={product.stock === 0 && product.type_produit === 'PHYSIQUE'}
                className="w-full py-4 rounded-xl font-black flex items-center justify-center gap-2 transition-all bg-white text-black hover:bg-[#FF6B00] hover:text-white"
              >
                <CreditCard size={20} />
                Ajouter au panier
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* --- NOUVEAU MODAL TOAST --- */}
      {showToast && addedProduct && (
        <div className="fixed bottom-8 right-8 z-[100] animate-in slide-in-from-bottom-10 fade-in duration-500">
          <div className="bg-[#1E1E1E] border-l-4 border-l-[#FF6B00] border border-[#2D2D2D] rounded-2xl p-4 shadow-2xl flex items-center gap-4 min-w-[340px]">
            {/* Image miniature */}
            <div className="w-14 h-14 bg-[#252525] rounded-xl overflow-hidden border border-[#2D2D2D]">
              <img src={addedProduct.image} className="w-full h-full object-cover" alt="" />
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 text-[#FF6B00] mb-0.5">
                <CheckCircle size={14} strokeWidth={3} />
                <span className="text-[10px] font-black uppercase tracking-widest">Produit ajouté</span>
              </div>
              <h4 className="text-white font-bold text-sm line-clamp-1">{addedProduct.nom}</h4>
              <Link to="/athlete/cart" className="text-[11px] text-gray-400 hover:text-white flex items-center gap-1 mt-1 font-bold transition-colors">
                Voir mon panier <ArrowRight size={12} />
              </Link>
            </div>

            <button onClick={() => setShowToast(false)} className="text-gray-500 hover:text-white p-1">
              <X size={20} />
            </button>
          </div>
        </div>
      )}

      {/* --- LIGHTBOX POUR AGRANDIR L'IMAGE --- */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/95 backdrop-blur-sm animate-in fade-in duration-300"
          onClick={() => setSelectedImage(null)}
        >
          <button 
            onClick={() => setSelectedImage(null)}
            className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all z-10"
          >
            <X size={24} />
          </button>
          
          <div className="relative flex justify-center items-center w-full h-full p-4 animate-in zoom-in-95 duration-300">
            <img 
              src={selectedImage} 
              alt="Agrandissement" 
              className="max-w-full max-h-[85vh] object-contain mx-auto rounded-2xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AthleteShop;

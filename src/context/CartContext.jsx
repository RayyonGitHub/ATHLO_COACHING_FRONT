import React, { createContext, useState, useEffect, useContext } from 'react';

const CartContext = createContext();
export const useCart = () => useContext(CartContext);

// On définit les frais de port ici pour pouvoir les changer facilement plus tard
const SHIPPING_FEE = 4.00;

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('athlo_cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  useEffect(() => {
    localStorage.setItem('athlo_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find(item => item.id === product.id);
      const stock = Number(product.stock ?? existingItem?.stock ?? 0);
      const isPhysical = (product.type_produit || existingItem?.type_produit) === 'PHYSIQUE';
      if (existingItem) {
        if (isPhysical && existingItem.quantite >= stock) return prevCart;
        return prevCart.map(item => 
          item.id === product.id ? { ...item, quantite: item.quantite + 1 } : item
        );
      }
      if (isPhysical && stock <= 0) return prevCart;
      return [...prevCart, { ...product, quantite: 1 }];
    });
  };

  const decrementQuantity = (productId) => {
    setCart((prevCart) => {
      const item = prevCart.find(i => i.id === productId);
      if (!item) return prevCart;
      
      if (item.quantite > 1) {
        return prevCart.map(i => 
          i.id === productId ? { ...i, quantite: i.quantite - 1 } : i
        );
      }
      return prevCart.filter(i => i.id !== productId);
    });
  };

  const removeItemCompletely = (productId) => {
    setCart((prevCart) => prevCart.filter(item => item.id !== productId));
  };

  const clearCart = () => setCart([]);

  // --- CALCULS MIS À JOUR ---
  
  // 1. Le prix total des articles uniquement
  const subTotal = cart.reduce((total, item) => total + (parseFloat(item.prix) * item.quantite), 0);
  
  // 2. Le prix total final (Articles + Livraison)
  // On n'ajoute les 4€ que si le panier n'est pas vide !
  const cartTotal = subTotal > 0 ? subTotal + SHIPPING_FEE : 0;
  
  // 3. Le nombre d'articles
  const cartCount = cart.reduce((count, item) => count + item.quantite, 0);

  return (
    <CartContext.Provider value={{ 
      cart, 
      addToCart, 
      decrementQuantity,
      removeItemCompletely,
      clearCart, 
      subTotal,      // Nouveau : On expose le sous-total
      cartTotal,     // Total avec livraison
      cartCount,
      shippingFee: SHIPPING_FEE // Nouveau : On expose la valeur des frais
    }}>
      {children}
    </CartContext.Provider>
  );
};

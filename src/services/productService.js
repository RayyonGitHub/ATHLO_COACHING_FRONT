import api from './api';

const productService = {
  // ---------------------------------------------------------
  // POUR TOUT LE MONDE (Catalogue)
  // ---------------------------------------------------------
  
  // Récupérer la liste des produits
  getProducts: async () => {
    const response = await api.get('/shop/products/');
    return response.data;
  },

  // Récupérer un produit spécifique
  getProduct: async (id) => {
    const response = await api.get(`/shop/products/${id}/`);
    return response.data;
  },

  // Récupérer les catégories (pour les filtres et formulaires)
  getCategories: async () => {
    const response = await api.get('/shop/categories/');
    return response.data;
  },


  // ---------------------------------------------------------
  // POUR LE COACH (Gestion de la boutique)
  // ---------------------------------------------------------

  // Créer un produit (Attention : on utilise multipart/form-data pour l'image)
  createProduct: async (productData) => {
    const response = await api.post('/shop/products/', productData, {
      headers: { 'Content-Type': 'multipart/form-data' } 
    });
    return response.data;
  },

  // Mettre à jour le stock
  updateStock: async (id, newStock) => {
    const response = await api.patch(`/shop/products/${id}/`, { stock: newStock });
    return response.data;
  },

  // Supprimer un produit
  deleteProduct: async (id) => {
    const response = await api.delete(`/shop/products/${id}/`);
    return response.data;
  },


  // ---------------------------------------------------------
  // POUR L'ATHLÈTE (Commandes - On les utilisera plus tard)
  // ---------------------------------------------------------

  createOrder: async (orderData) => {
    const response = await api.post('/shop/orders/', orderData);
    return response.data;
  },

  getMyOrders: async () => {
    const response = await api.get('/shop/my-orders/');
    return response.data;
  }
};

export default productService;
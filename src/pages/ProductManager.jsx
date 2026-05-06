import React, { useState, useEffect } from 'react';
import { 
  Package, Plus, Image as ImageIcon, Trash2, Edit, AlertCircle, 
  Loader2, CheckCircle2, TrendingUp, X 
} from 'lucide-react';
import productService from '../services/productService';
import api from '../services/api';

// --- COMPOSANT : Gestionnaire de création rapide de catégories ---
// Corrigé pour éviter l'imbrication de balises <form>
const CategoryManager = ({ onCategoryAdded }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;

    setLoading(true);
    try {
      // 1. On génère le slug automatiquement à partir du nom
      const generatedSlug = newCategoryName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

      // 2. On envoie le nom ET le slug à l'API Django
      const response = await api.post('/shop/categories/', { 
        nom: newCategoryName,
        slug: generatedSlug
      });
      
      onCategoryAdded(response.data); 
      setNewCategoryName('');
      setIsAdding(false);
    } catch (error) {
      console.error("Erreur création catégorie :", error.response?.data || error);
      alert("Erreur lors de l'ajout de la catégorie.");
    } finally {
      setLoading(false);
    }
  };

  if (!isAdding) {
    return (
      <button 
        type="button" 
        onClick={() => setIsAdding(true)}
        className="flex items-center gap-1 mt-2 text-xs text-[#FF6B00] hover:text-white transition-colors font-bold"
      >
        <Plus size={14} /> Nouvelle catégorie
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2 mt-2">
      <input
        type="text"
        value={newCategoryName}
        onChange={(e) => setNewCategoryName(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            handleAddCategory();
          }
        }}
        placeholder="Nom de la catégorie..."
        className="flex-1 bg-black/50 border border-[#2D2D2D] rounded-lg px-2 py-1 text-white text-xs outline-none focus:border-[#FF6B00]"
        autoFocus
      />
      <button 
        type="button" 
        onClick={handleAddCategory}
        disabled={loading}
        className="bg-[#FF6B00] text-white p-1 rounded hover:bg-[#e66000] disabled:opacity-50"
      >
        <CheckCircle2 size={16} />
      </button>
      <button 
        type="button" 
        onClick={() => setIsAdding(false)}
        className="text-gray-500 hover:text-red-500 p-1"
      >
        <X size={16} />
      </button>
    </div>
  );
};

// --- COMPOSANT PRINCIPAL : ProductManager ---
const ProductManager = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    nom: '',
    description: '',
    prix: '',
    categorie: '',
    type_produit: 'PHYSIQUE',
    stock: 0,
    image: null
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [productsData, categoriesData] = await Promise.all([
        productService.getProducts(),
        productService.getCategories ? productService.getCategories() : api.get('/shop/categories/').then(res => res.data)
      ]);
      setProducts(productsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error("Erreur de chargement :", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewCategory = (newCategory) => {
    setCategories(prev => [...prev, newCategory]);
    setFormData(prev => ({ ...prev, categorie: newCategory.id }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    setFormData(prev => ({ ...prev, image: e.target.files[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const data = new FormData();
    data.append('nom', formData.nom);
    data.append('description', formData.description);
    data.append('prix', formData.prix);
    
    // Correction pour éviter l'erreur 500 si la catégorie est vide
    if (formData.categorie && formData.categorie !== "") {
      data.append('categorie', parseInt(formData.categorie, 10));
    }
    
    data.append('type_produit', formData.type_produit);
    data.append('stock', formData.stock);
    if (formData.image) data.append('image', formData.image);
    data.append('est_actif', 'true');

    try {
      await productService.createProduct(data);
      await fetchData();
      setIsModalOpen(false);
      setFormData({ nom: '', description: '', prix: '', categorie: '', type_produit: 'PHYSIQUE', stock: 0, image: null });
    } catch (error) {
      console.error("Erreur lors de la création :", error);
      alert("Erreur lors de l'ajout du produit.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if(window.confirm("Êtes-vous sûr de vouloir supprimer ce produit ?")) {
      try {
        await productService.deleteProduct(id);
        setProducts(products.filter(p => p.id !== id));
      } catch (error) {
        console.error("Erreur de suppression :", error);
      }
    }
  };

  if (loading) {
    return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-[#FF6B00]" size={48} /></div>;
  }

  return (
    <div className="flex flex-col gap-8 pb-20 animate-in fade-in duration-700 max-w-6xl mx-auto">
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">
            Gestion <span className="text-[#FF6B00]">Boutique</span>
          </h2>
          <p className="text-gray-500 text-sm font-medium">Gérez votre inventaire et vos ventes.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-[#FF6B00] hover:bg-[#FF8533] text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#FF6B00]/20"
        >
          <Plus size={20} /> Ajouter un produit
        </button>
      </div>

      <div className="bg-[#1E1E1E] border border-[#2D2D2D] rounded-3xl overflow-hidden shadow-xl">
        <div className="p-6 border-b border-[#2D2D2D] bg-[#252525] flex items-center gap-3">
          <div className="p-2 bg-[#FF6B00]/10 text-[#FF6B00] rounded-lg"><Package size={20} /></div>
          <h3 className="font-bold text-white tracking-wide">Mon Inventaire</h3>
        </div>
        
        <div className="p-6">
          {products.length === 0 ? (
            <div className="text-center py-12">
              <Package size={48} className="mx-auto text-gray-600 mb-4" />
              <p className="text-gray-400 font-medium mb-4">Votre boutique est vide.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map(product => (
                <div key={product.id} className="bg-black/30 border border-[#2D2D2D] rounded-2xl overflow-hidden group hover:border-[#FF6B00]/50 transition-colors flex flex-col">
                  <div className="h-48 bg-[#252525] flex items-center justify-center relative overflow-hidden">
                    {product.image ? (
                      <img src={product.image} alt={product.nom} className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon size={48} className="text-gray-600" />
                    )}
                    <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded-md">
                      {product.type_produit === 'PHYSIQUE' ? '📦 Physique' : '📄 Numérique'}
                    </div>
                  </div>
                  
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-white font-bold text-lg line-clamp-1">{product.nom}</h4>
                      <span className="text-[#FF6B00] font-black">{product.prix} €</span>
                    </div>
                    <p className="text-xs text-gray-500 mb-4 line-clamp-2 flex-1">{product.description}</p>
                    
                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-[#2D2D2D]">
                      <div className={`text-xs font-bold flex items-center gap-1 ${product.stock <= 5 && product.type_produit === 'PHYSIQUE' ? 'text-red-500' : 'text-green-500'}`}>
                        {product.type_produit === 'NUMERIQUE' ? (
                          <><CheckCircle2 size={14}/> Illimité</>
                        ) : product.stock <= 5 ? (
                          <><AlertCircle size={14} className="animate-pulse"/> Reste {product.stock}</>
                        ) : (
                          <><Package size={14}/> En stock ({product.stock})</>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleDelete(product.id)} className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#1E1E1E] border border-[#2D2D2D] rounded-3xl p-6 w-full max-w-2xl relative my-8">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-gray-500 hover:text-white"><X size={24}/></button>
            <h3 className="text-2xl font-black text-white mb-6 uppercase italic tracking-tighter">Nouveau <span className="text-[#FF6B00]">Produit</span></h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Nom du produit *</label>
                  <input type="text" name="nom" required value={formData.nom} onChange={handleChange} className="w-full bg-black/30 border border-[#2D2D2D] text-white p-3 rounded-xl focus:border-[#FF6B00] outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Prix (€) *</label>
                  <input type="number" step="0.01" name="prix" required value={formData.prix} onChange={handleChange} className="w-full bg-black/30 border border-[#2D2D2D] text-white p-3 rounded-xl focus:border-[#FF6B00] outline-none" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Description *</label>
                <textarea name="description" required value={formData.description} onChange={handleChange} rows="3" className="w-full bg-black/30 border border-[#2D2D2D] text-white p-3 rounded-xl focus:border-[#FF6B00] outline-none resize-none" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Type *</label>
                  <select name="type_produit" value={formData.type_produit} onChange={handleChange} className="w-full bg-black/30 border border-[#2D2D2D] text-white p-3 rounded-xl focus:border-[#FF6B00] outline-none">
                    <option value="PHYSIQUE">Physique (T-shirt, etc.)</option>
                    <option value="NUMERIQUE">Numérique (PDF, Vidéo)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Catégorie</label>
                  <select name="categorie" value={formData.categorie} onChange={handleChange} className="w-full bg-black/30 border border-[#2D2D2D] text-white p-3 rounded-xl focus:border-[#FF6B00] outline-none">
                    <option value="">-- Choisir --</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.nom}</option>
                    ))}
                  </select>
                  <CategoryManager onCategoryAdded={handleNewCategory} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Stock Initial</label>
                  <input type="number" name="stock" disabled={formData.type_produit === 'NUMERIQUE'} value={formData.type_produit === 'NUMERIQUE' ? 9999 : formData.stock} onChange={handleChange} className="w-full bg-black/30 border border-[#2D2D2D] text-white p-3 rounded-xl focus:border-[#FF6B00] outline-none disabled:opacity-50" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Image du produit</label>
                <input type="file" accept="image/*" onChange={handleImageChange} className="w-full bg-black/30 border border-[#2D2D2D] text-gray-400 p-3 rounded-xl outline-none file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-[#FF6B00]/10 file:text-[#FF6B00] hover:file:bg-[#FF6B00]/20 transition-colors" />
              </div>

              <button type="submit" disabled={isSubmitting} className="w-full bg-[#FF6B00] hover:bg-[#FF8533] text-white p-4 rounded-xl font-black flex items-center justify-center gap-2 mt-4 transition-colors">
                {isSubmitting ? <Loader2 className="animate-spin" /> : <CheckCircle2 />} 
                Enregistrer le produit
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManager;
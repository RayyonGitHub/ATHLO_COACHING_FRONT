import React, { useState, useEffect } from 'react';
import { Plus, Utensils, Search, Loader2, X, Save, FileText, ClipboardList, CheckCircle, ChevronRight, ArrowLeft, Flame, Pencil, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import nutritionService from '../services/nutritionService';

const CATEGORIES = ['Petit-déjeuner', 'Déjeuner', 'Dîner', 'Collation', 'Pre-workout'];

const RecipeManager = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('recipes'); 
  const [selectedPlan, setSelectedPlan] = useState(null);
  
  const [recipes, setRecipes] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState(null);
  const [formData, setFormData] = useState({
    nom: '', type: 'Petit-déjeuner', calories: '', proteines: '', glucides: '', lipides: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const recipesData = await nutritionService.getRecipes();
        const plansData = await nutritionService.getPlans();
        setRecipes(recipesData);
        setPlans(plansData);
      } catch (error) {
        console.error("Erreur chargement", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getFullRecipesForPlan = (planRecetteIds) => {
    return recipes.filter(r => planRecetteIds.includes(r.id));
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const newRecipe = {
      ...formData,
      calories: parseInt(formData.calories) || 0,
      proteines: parseInt(formData.proteines) || 0,
      glucides: parseInt(formData.glucides) || 0,
      lipides: parseInt(formData.lipides) || 0,
    };

    try {
      const savedRecipe = editingRecipe
        ? await nutritionService.updateRecipe(editingRecipe.id, newRecipe)
        : await nutritionService.saveRecipe(newRecipe);
      setIsSuccess(true);
      setRecipes(editingRecipe ? recipes.map(r => r.id === savedRecipe.id ? savedRecipe : r) : [savedRecipe, ...recipes]);
      setTimeout(() => {
        setIsSuccess(false);
        setShowForm(false);
        setIsSubmitting(false);
        setEditingRecipe(null);
        setFormData({ nom: '', type: 'Petit-déjeuner', calories: '', proteines: '', glucides: '', lipides: '' });
      }, 1500);
    } catch (error) {
      setIsSubmitting(false);
      alert("Erreur lors de l'enregistrement.");
    }
  };

  const openRecipeForm = (recipe = null) => {
    setEditingRecipe(recipe);
    setFormData(recipe ? {
      nom: recipe.nom || '',
      type: recipe.type || 'Petit-déjeuner',
      calories: recipe.calories || '',
      proteines: recipe.proteines || '',
      glucides: recipe.glucides || '',
      lipides: recipe.lipides || ''
    } : { nom: '', type: 'Petit-déjeuner', calories: '', proteines: '', glucides: '', lipides: '' });
    setShowForm(true);
  };

  const handleDeleteRecipe = async (recipeId) => {
    if (!window.confirm("Supprimer cette recette ?")) return;
    await nutritionService.deleteRecipe(recipeId);
    setRecipes(recipes.filter(r => r.id !== recipeId));
  };

  const handleDeletePlan = async (planId) => {
    if (!window.confirm("Supprimer ce plan alimentaire ?")) return;
    await nutritionService.deletePlan(planId);
    setPlans(plans.filter(p => p.id !== planId));
    setSelectedPlan(null);
  };

  const filteredRecipes = recipes.filter(recipe => {
    const matchCat = selectedCategory === '' || recipe.type === selectedCategory;
    const matchSearch = recipe.nom.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      
      {/* HEADER ADAPTÉ (Style Carte Blanche) */}
      <div className="bg-[#131317] p-8 rounded-3xl border border-[#2A2A32] shadow-sm">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div>
            <h2 className="text-2xl font-black text-[#FCF8FE] uppercase tracking-tight mb-4">
              Gestion <span className="text-[#FF6A00]">Nutritionnelle</span>
            </h2>
            <div className="flex bg-[#1F1F25] p-1.5 rounded-2xl w-fit border border-[#2A2A32]">
              <button 
                onClick={() => { setActiveTab('recipes'); setSelectedPlan(null); }}
                className={`px-6 py-2.5 rounded-xl font-bold uppercase text-[11px] transition-all ${activeTab === 'recipes' ? 'bg-[#131317] text-[#FF6A00] shadow-sm' : 'text-[#ACAAB0] hover:text-[#FCF8FE]'}`}
              >
                Recettes ({recipes.length})
              </button>
              <button 
                onClick={() => { setActiveTab('plans'); setSelectedPlan(null); }}
                className={`px-6 py-2.5 rounded-xl font-bold uppercase text-[11px] transition-all ${activeTab === 'plans' ? 'bg-[#131317] text-[#FF6A00] shadow-sm' : 'text-[#ACAAB0] hover:text-[#FCF8FE]'}`}
              >
                Plans ({plans.length})
              </button>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <button onClick={() => navigate('/nutrition/builder')} className="w-full sm:w-auto bg-[#2A2A32] text-white px-6 py-4 rounded-2xl font-bold uppercase text-sm flex items-center justify-center gap-2 hover:bg-[#1F1F25] transition-all shadow-md shadow-slate-200">
              <ClipboardList size={18} /> Nouveau Plan
            </button>
            <button onClick={() => openRecipeForm()} className="w-full sm:w-auto bg-[#FF6A00] text-white px-6 py-4 rounded-2xl font-bold uppercase text-sm flex items-center justify-center gap-2 hover:bg-[#e66000] transition-all shadow-md shadow-orange-100">
              <Plus size={18} /> Nouvelle Recette
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#FF6A00]" size={40} /></div>
      ) : activeTab === 'recipes' ? (
        /* --- VUE RECETTES --- */
        <>
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-6">
            <div className="flex items-center gap-2 overflow-x-auto w-full pb-2 scrollbar-hide">
              <button onClick={() => setSelectedCategory('')} className={`px-4 py-2 rounded-full font-bold text-xs whitespace-nowrap transition-all ${selectedCategory === '' ? 'bg-[#FF6A00] text-white' : 'bg-[#131317] text-[#ACAAB0] border border-[#2A2A32] hover:bg-[#1F1F25]'}`}>Toutes</button>
              {CATEGORIES.map(cat => (
                <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-4 py-2 rounded-full font-bold text-xs whitespace-nowrap transition-all ${selectedCategory === cat ? 'bg-[#FF6A00] text-white' : 'bg-[#131317] text-[#ACAAB0] border border-[#2A2A32] hover:bg-[#1F1F25]'}`}>{cat}</button>
              ))}
            </div>
            <div className="relative w-full md:w-72 shrink-0">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#ACAAB0]" size={18} />
              <input type="text" placeholder="Rechercher une recette..." className="w-full bg-[#0B0B0E] border border-[#2A2A32] rounded-2xl py-3 pl-11 pr-4 text-[#FCF8FE] text-sm outline-none focus:border-[#FF6A00] shadow-sm" onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecipes.map(recipe => (
              <div key={recipe.id} className="bg-[#131317] border border-[#2A2A32] rounded-[32px] p-6 hover:shadow-xl hover:shadow-[#FF6A00]/10 transition-all group">
                <div className="flex justify-between items-start mb-6">
                  <div className="p-3 bg-[#FF6A00]/20 text-[#FF6A00] rounded-2xl group-hover:scale-110 transition-transform"><Utensils size={22} /></div>
                  <span className="text-[10px] font-bold uppercase bg-[#1F1F25] px-3 py-1.5 rounded-lg text-[#ACAAB0] border border-[#2A2A32]">{recipe.type}</span>
                </div>
                <h3 className="text-[#FCF8FE] font-bold text-lg mb-6 line-clamp-1">{recipe.nom}</h3>
                <div className="flex gap-2 mb-4">
                  <button onClick={() => openRecipeForm(recipe)} className="flex-1 bg-[#1F1F25] text-[#ACAAB0] px-3 py-2 rounded-xl text-xs font-black uppercase hover:bg-[#1F1F25] flex items-center justify-center gap-2"><Pencil size={14} /> Modifier</button>
                  <button onClick={() => handleDeleteRecipe(recipe.id)} className="flex-1 bg-red-50 text-red-600 px-3 py-2 rounded-xl text-xs font-black uppercase hover:bg-red-100 flex items-center justify-center gap-2"><Trash2 size={14} /> Supprimer</button>
                </div>
                <div className="grid grid-cols-4 gap-1 bg-[#1F1F25] p-4 rounded-2xl border border-[#2A2A32]">
                  <div className="text-center"><p className="text-[#FF6A00] font-bold text-base">{recipe.calories}</p><p className="text-[8px] text-[#ACAAB0] uppercase font-bold">Kcal</p></div>
                  <div className="text-center border-l border-[#2A2A32]"><p className="text-[#FCF8FE] font-bold text-base">{recipe.proteines}g</p><p className="text-[8px] text-[#ACAAB0] uppercase font-bold">Prot</p></div>
                  <div className="text-center border-l border-[#2A2A32]"><p className="text-[#FCF8FE] font-bold text-base">{recipe.glucides}g</p><p className="text-[8px] text-[#ACAAB0] uppercase font-bold">Gluc</p></div>
                  <div className="text-center border-l border-[#2A2A32]"><p className="text-[#FCF8FE] font-bold text-base">{recipe.lipides}g</p><p className="text-[8px] text-[#ACAAB0] uppercase font-bold">Lip</p></div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : selectedPlan ? (
        /* --- VUE DÉTAILLÉE DU PLAN --- */
        <div className="animate-in slide-in-from-right duration-500 space-y-6">
          <button onClick={() => setSelectedPlan(null)} className="flex items-center gap-2 text-[#ACAAB0] hover:text-[#FF6A00] transition-colors font-bold uppercase text-[10px] mb-2"><ArrowLeft size={14} /> Revenir aux plans</button>
          
          <div className="bg-[#131317] border border-[#2A2A32] rounded-[40px] p-8 md:p-12 shadow-sm">
            <div className="flex flex-col lg:flex-row justify-between gap-8 mb-12">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <span className="bg-orange-100 text-[#FF6A00] px-3 py-1 rounded-lg text-[10px] font-black uppercase italic">Plan Actif</span>
                  <span className="text-slate-300">/</span>
                  <span className="text-[#ACAAB0] text-[10px] font-bold uppercase tracking-widest">{getFullRecipesForPlan(selectedPlan.recettes).length} Repas</span>
                </div>
                <h3 className="text-3xl md:text-4xl font-black text-[#FCF8FE] uppercase italic mb-4">{selectedPlan.titre}</h3>
                <p className="text-[#ACAAB0] text-sm leading-relaxed max-w-2xl">{selectedPlan.description || "Aucune description."}</p>
              </div>
              <div className="bg-[#1F1F25] p-8 rounded-[32px] border border-[#2A2A32] text-center min-w-[180px] h-fit">
                <p className="text-[#ACAAB0] text-[10px] font-black uppercase mb-2">Prix Boutique</p>
                <p className="text-4xl font-black text-[#FF6A00] italic">{selectedPlan.prix}€</p>
                <div className="grid grid-cols-2 gap-2 mt-6">
                  <button onClick={() => navigate(`/nutrition/builder?planId=${selectedPlan.id}`)} className="bg-[#131317] text-[#ACAAB0] px-3 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-[#1F1F25] flex items-center justify-center gap-1"><Pencil size={12} /> Modifier</button>
                  <button onClick={() => handleDeletePlan(selectedPlan.id)} className="bg-red-50 text-red-600 px-3 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-red-100 flex items-center justify-center gap-1"><Trash2 size={12} /> Supprimer</button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
              <div className="xl:col-span-2 space-y-4">
                <h4 className="text-[#FCF8FE] font-black uppercase text-xs flex items-center gap-2 mb-6">Contenu du programme</h4>
                {getFullRecipesForPlan(selectedPlan.recettes).map((recipe, idx) => (
                  <div key={recipe.id} className="bg-[#131317] border border-[#2A2A32] p-5 rounded-2xl flex items-center justify-between hover:bg-[#1F1F25] transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-9 h-9 bg-[#2A2A32] text-white rounded-xl flex items-center justify-center font-bold text-xs italic">{idx + 1}</div>
                      <div>
                        <p className="text-[#FCF8FE] font-bold text-sm">{recipe.nom}</p>
                        <p className="text-[9px] text-[#ACAAB0] font-black uppercase">{recipe.type}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[#FF6A00] font-black text-sm">{recipe.calories} kcal</p>
                      <p className="text-[9px] text-[#ACAAB0] font-bold">P:{recipe.proteines} G:{recipe.glucides} L:{recipe.lipides}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="bg-slate-900 rounded-[32px] p-8 text-white h-fit">
                <h4 className="text-[#ACAAB0] font-black uppercase text-[10px] text-center mb-8 tracking-widest border-b border-slate-800 pb-4">Résumé Nutritionnel</h4>
                <div className="flex flex-col items-center mb-8">
                   <div className="w-16 h-16 bg-[#FF6A00]/10 rounded-full flex items-center justify-center mb-4">
                      <Flame size={32} className="text-[#FF6A00]" />
                   </div>
                   <p className="text-5xl font-black italic">{getFullRecipesForPlan(selectedPlan.recettes).reduce((acc, r) => acc + r.calories, 0)}</p>
                   <p className="text-[#ACAAB0] font-bold uppercase text-[9px] mt-1">Calories / jour</p>
                </div>
                <div className="space-y-4">
                   <div className="flex justify-between items-center text-xs px-2"><span className="text-[#ACAAB0] font-bold">Protéines</span><span className="font-black">{getFullRecipesForPlan(selectedPlan.recettes).reduce((acc, r) => acc + r.proteines, 0)}g</span></div>
                   <div className="flex justify-between items-center text-xs px-2"><span className="text-[#ACAAB0] font-bold">Glucides</span><span className="font-black">{getFullRecipesForPlan(selectedPlan.recettes).reduce((acc, r) => acc + r.glucides, 0)}g</span></div>
                   <div className="flex justify-between items-center text-xs px-2"><span className="text-[#ACAAB0] font-bold">Lipides</span><span className="font-black">{getFullRecipesForPlan(selectedPlan.recettes).reduce((acc, r) => acc + r.lipides, 0)}g</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* --- LISTE DES PLANS --- */
        <div className="grid grid-cols-1 gap-4">
          {plans.length === 0 ? (
            <div className="text-center py-20 bg-[#131317] rounded-3xl border border-[#2A2A32] shadow-sm"><ClipboardList size={48} className="mx-auto text-slate-200 mb-4" /><h3 className="text-[#ACAAB0] font-bold">Aucun plan</h3></div>
          ) : (
            plans.map(plan => (
              <div key={plan.id} onClick={() => setSelectedPlan(plan)} className="bg-[#131317] border border-[#2A2A32] p-6 rounded-[28px] flex items-center justify-between hover:shadow-lg hover:shadow-[#FF6A00]/10 transition-all group cursor-pointer">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-[#1F1F25] text-[#FCF8FE] rounded-2xl flex items-center justify-center group-hover:bg-[#FF6A00] group-hover:text-white transition-all shadow-sm"><ClipboardList size={28} /></div>
                  <div>
                    <h3 className="text-lg font-black text-[#FCF8FE] uppercase italic tracking-tight">{plan.titre}</h3>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-[#ACAAB0] text-[10px] font-bold flex items-center gap-1.5 uppercase"><Utensils size={12} /> {plan.recettes.length} repas</span>
                      <span className="text-[#FF6A00] text-sm font-black italic">{plan.prix}€</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={(e) => { e.stopPropagation(); navigate(`/nutrition/builder?planId=${plan.id}`); }} className="bg-[#1F1F25] p-3 rounded-xl text-[#ACAAB0] hover:text-[#FF6A00] hover:bg-[#131317] border border-transparent hover:border-[#2A2A32] transition-all"><Pencil size={18} /></button>
                  <button onClick={(e) => { e.stopPropagation(); handleDeletePlan(plan.id); }} className="bg-red-50 p-3 rounded-xl text-red-400 hover:text-red-600 hover:bg-red-100 transition-all"><Trash2 size={18} /></button>
                  <div className="bg-[#1F1F25] p-4 rounded-xl text-[#ACAAB0] group-hover:bg-[#131317] group-hover:text-[#FF6A00] group-hover:shadow-sm border border-transparent group-hover:border-[#2A2A32] transition-all"><ChevronRight size={20} /></div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* MODALE RECETTE (Version Light) */}
      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#131317] rounded-[40px] p-10 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95">
            {isSuccess ? (
              <div className="py-12 flex flex-col items-center text-center"><div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mb-6"><CheckCircle size={40} /></div><h3 className="text-xl font-black text-[#FCF8FE] uppercase">Recette Ajoutée !</h3></div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-8"><h3 className="text-2xl font-black text-[#FCF8FE] italic uppercase">{editingRecipe ? 'Modifier' : 'Nouvelle'} <span className="text-[#FF6A00]">Recette</span></h3><button onClick={() => { setShowForm(false); setEditingRecipe(null); }} className="text-slate-300 hover:text-[#ACAAB0] transition-colors"><X size={24} /></button></div>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-[#ACAAB0] uppercase ml-1">Nom de la recette</label>
                    <input type="text" name="nom" required value={formData.nom} onChange={handleInputChange} className="w-full bg-[#0B0B0E] border border-[#2A2A32] rounded-2xl py-4 px-4 text-[#FCF8FE] font-bold outline-none focus:border-[#FF6A00]" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-[#ACAAB0] uppercase ml-1">Catégorie</label>
                    <select name="type" value={formData.type} onChange={handleInputChange} className="w-full bg-[#0B0B0E] border border-[#2A2A32] rounded-2xl py-4 px-4 text-[#FCF8FE] font-bold outline-none cursor-pointer">
                      {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <input type="number" name="calories" required value={formData.calories} onChange={handleInputChange} className="bg-[#0B0B0E] border border-[#2A2A32] rounded-2xl py-4 px-4 text-[#FCF8FE] font-bold outline-none" placeholder="Kcal" />
                    <input type="number" name="proteines" required value={formData.proteines} onChange={handleInputChange} className="bg-[#0B0B0E] border border-[#2A2A32] rounded-2xl py-4 px-4 text-[#FCF8FE] font-bold outline-none" placeholder="Prot (g)" />
                    <input type="number" name="glucides" required value={formData.glucides} onChange={handleInputChange} className="bg-[#0B0B0E] border border-[#2A2A32] rounded-2xl py-4 px-4 text-[#FCF8FE] font-bold outline-none" placeholder="Gluc (g)" />
                    <input type="number" name="lipides" required value={formData.lipides} onChange={handleInputChange} className="bg-[#0B0B0E] border border-[#2A2A32] rounded-2xl py-4 px-4 text-[#FCF8FE] font-bold outline-none" placeholder="Lip (g)" />
                  </div>
                  <button type="submit" disabled={isSubmitting} className="w-full bg-[#FF6A00] text-white font-black py-5 rounded-2xl mt-6 hover:shadow-lg hover:shadow-orange-100 transition-all flex justify-center items-center gap-2">
                    {isSubmitting ? <Loader2 className="animate-spin" /> : "Enregistrer la recette"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RecipeManager;

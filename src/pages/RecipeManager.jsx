import React, { useState, useEffect } from 'react';
import { Plus, Utensils, Search, Loader2, X, Save, FileText, ClipboardList, CheckCircle, ChevronRight, ArrowLeft, Flame } from 'lucide-react';
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
      const savedRecipe = await nutritionService.saveRecipe(newRecipe);
      setIsSuccess(true);
      setRecipes([savedRecipe, ...recipes]);
      setTimeout(() => {
        setIsSuccess(false);
        setShowForm(false);
        setIsSubmitting(false);
        setFormData({ nom: '', type: 'Petit-déjeuner', calories: '', proteines: '', glucides: '', lipides: '' });
      }, 1500);
    } catch (error) {
      setIsSubmitting(false);
      alert("Erreur lors de l'enregistrement.");
    }
  };

  const filteredRecipes = recipes.filter(recipe => {
    const matchCat = selectedCategory === '' || recipe.type === selectedCategory;
    const matchSearch = recipe.nom.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      
      {/* HEADER ADAPTÉ (Style Carte Blanche) */}
      <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div>
            <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight mb-4">
              Gestion <span className="text-[#FF6B00]">Nutritionnelle</span>
            </h2>
            <div className="flex bg-gray-50 p-1.5 rounded-2xl w-fit border border-gray-100">
              <button 
                onClick={() => { setActiveTab('recipes'); setSelectedPlan(null); }}
                className={`px-6 py-2.5 rounded-xl font-bold uppercase text-[11px] transition-all ${activeTab === 'recipes' ? 'bg-white text-[#FF6B00] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                Recettes ({recipes.length})
              </button>
              <button 
                onClick={() => { setActiveTab('plans'); setSelectedPlan(null); }}
                className={`px-6 py-2.5 rounded-xl font-bold uppercase text-[11px] transition-all ${activeTab === 'plans' ? 'bg-white text-[#FF6B00] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                Plans ({plans.length})
              </button>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <button onClick={() => navigate('/nutrition/builder')} className="w-full sm:w-auto bg-slate-800 text-white px-6 py-4 rounded-2xl font-bold uppercase text-sm flex items-center justify-center gap-2 hover:bg-slate-900 transition-all shadow-md shadow-slate-200">
              <ClipboardList size={18} /> Nouveau Plan
            </button>
            <button onClick={() => setShowForm(true)} className="w-full sm:w-auto bg-[#FF6B00] text-white px-6 py-4 rounded-2xl font-bold uppercase text-sm flex items-center justify-center gap-2 hover:bg-[#e65a00] transition-all shadow-md shadow-orange-100">
              <Plus size={18} /> Nouvelle Recette
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#FF6B00]" size={40} /></div>
      ) : activeTab === 'recipes' ? (
        /* --- VUE RECETTES --- */
        <>
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-6">
            <div className="flex items-center gap-2 overflow-x-auto w-full pb-2 scrollbar-hide">
              <button onClick={() => setSelectedCategory('')} className={`px-4 py-2 rounded-full font-bold text-xs whitespace-nowrap transition-all ${selectedCategory === '' ? 'bg-[#FF6B00] text-white' : 'bg-white text-slate-500 border border-gray-100 hover:bg-gray-50'}`}>Toutes</button>
              {CATEGORIES.map(cat => (
                <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-4 py-2 rounded-full font-bold text-xs whitespace-nowrap transition-all ${selectedCategory === cat ? 'bg-[#FF6B00] text-white' : 'bg-white text-slate-500 border border-gray-100 hover:bg-gray-50'}`}>{cat}</button>
              ))}
            </div>
            <div className="relative w-full md:w-72 shrink-0">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input type="text" placeholder="Rechercher une recette..." className="w-full bg-white border border-gray-100 rounded-2xl py-3 pl-11 pr-4 text-slate-700 text-sm outline-none focus:border-[#FF6B00] shadow-sm" onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecipes.map(recipe => (
              <div key={recipe.id} className="bg-white border border-gray-100 rounded-[32px] p-6 hover:shadow-xl hover:shadow-indigo-50/50 transition-all group">
                <div className="flex justify-between items-start mb-6">
                  <div className="p-3 bg-orange-50 text-[#FF6B00] rounded-2xl group-hover:scale-110 transition-transform"><Utensils size={22} /></div>
                  <span className="text-[10px] font-bold uppercase bg-slate-50 px-3 py-1.5 rounded-lg text-slate-500 border border-slate-100">{recipe.type}</span>
                </div>
                <h3 className="text-slate-800 font-bold text-lg mb-6 line-clamp-1">{recipe.nom}</h3>
                <div className="grid grid-cols-4 gap-1 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <div className="text-center"><p className="text-[#FF6B00] font-bold text-base">{recipe.calories}</p><p className="text-[8px] text-slate-400 uppercase font-bold">Kcal</p></div>
                  <div className="text-center border-l border-slate-200"><p className="text-slate-700 font-bold text-base">{recipe.proteines}g</p><p className="text-[8px] text-slate-400 uppercase font-bold">Prot</p></div>
                  <div className="text-center border-l border-slate-200"><p className="text-slate-700 font-bold text-base">{recipe.glucides}g</p><p className="text-[8px] text-slate-400 uppercase font-bold">Gluc</p></div>
                  <div className="text-center border-l border-slate-200"><p className="text-slate-700 font-bold text-base">{recipe.lipides}g</p><p className="text-[8px] text-slate-400 uppercase font-bold">Lip</p></div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : selectedPlan ? (
        /* --- VUE DÉTAILLÉE DU PLAN --- */
        <div className="animate-in slide-in-from-right duration-500 space-y-6">
          <button onClick={() => setSelectedPlan(null)} className="flex items-center gap-2 text-slate-400 hover:text-[#FF6B00] transition-colors font-bold uppercase text-[10px] mb-2"><ArrowLeft size={14} /> Revenir aux plans</button>
          
          <div className="bg-white border border-gray-100 rounded-[40px] p-8 md:p-12 shadow-sm">
            <div className="flex flex-col lg:flex-row justify-between gap-8 mb-12">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <span className="bg-orange-100 text-[#FF6B00] px-3 py-1 rounded-lg text-[10px] font-black uppercase italic">Plan Actif</span>
                  <span className="text-slate-300">/</span>
                  <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">{getFullRecipesForPlan(selectedPlan.recettes).length} Repas</span>
                </div>
                <h3 className="text-3xl md:text-4xl font-black text-slate-800 uppercase italic mb-4">{selectedPlan.titre}</h3>
                <p className="text-slate-500 text-sm leading-relaxed max-w-2xl">{selectedPlan.description || "Aucune description."}</p>
              </div>
              <div className="bg-slate-50 p-8 rounded-[32px] border border-slate-100 text-center min-w-[180px] h-fit">
                <p className="text-slate-400 text-[10px] font-black uppercase mb-2">Prix Boutique</p>
                <p className="text-4xl font-black text-[#FF6B00] italic">{selectedPlan.prix}€</p>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
              <div className="xl:col-span-2 space-y-4">
                <h4 className="text-slate-800 font-black uppercase text-xs flex items-center gap-2 mb-6">Contenu du programme</h4>
                {getFullRecipesForPlan(selectedPlan.recettes).map((recipe, idx) => (
                  <div key={recipe.id} className="bg-white border border-gray-100 p-5 rounded-2xl flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-9 h-9 bg-slate-800 text-white rounded-xl flex items-center justify-center font-bold text-xs italic">{idx + 1}</div>
                      <div>
                        <p className="text-slate-800 font-bold text-sm">{recipe.nom}</p>
                        <p className="text-[9px] text-slate-400 font-black uppercase">{recipe.type}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[#FF6B00] font-black text-sm">{recipe.calories} kcal</p>
                      <p className="text-[9px] text-slate-400 font-bold">P:{recipe.proteines} G:{recipe.glucides} L:{recipe.lipides}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="bg-slate-900 rounded-[32px] p-8 text-white h-fit">
                <h4 className="text-slate-400 font-black uppercase text-[10px] text-center mb-8 tracking-widest border-b border-slate-800 pb-4">Résumé Nutritionnel</h4>
                <div className="flex flex-col items-center mb-8">
                   <div className="w-16 h-16 bg-[#FF6B00]/10 rounded-full flex items-center justify-center mb-4">
                      <Flame size={32} className="text-[#FF6B00]" />
                   </div>
                   <p className="text-5xl font-black italic">{getFullRecipesForPlan(selectedPlan.recettes).reduce((acc, r) => acc + r.calories, 0)}</p>
                   <p className="text-slate-500 font-bold uppercase text-[9px] mt-1">Calories / jour</p>
                </div>
                <div className="space-y-4">
                   <div className="flex justify-between items-center text-xs px-2"><span className="text-slate-400 font-bold">Protéines</span><span className="font-black">{getFullRecipesForPlan(selectedPlan.recettes).reduce((acc, r) => acc + r.proteines, 0)}g</span></div>
                   <div className="flex justify-between items-center text-xs px-2"><span className="text-slate-400 font-bold">Glucides</span><span className="font-black">{getFullRecipesForPlan(selectedPlan.recettes).reduce((acc, r) => acc + r.glucides, 0)}g</span></div>
                   <div className="flex justify-between items-center text-xs px-2"><span className="text-slate-400 font-bold">Lipides</span><span className="font-black">{getFullRecipesForPlan(selectedPlan.recettes).reduce((acc, r) => acc + r.lipides, 0)}g</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* --- LISTE DES PLANS --- */
        <div className="grid grid-cols-1 gap-4">
          {plans.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm"><ClipboardList size={48} className="mx-auto text-slate-200 mb-4" /><h3 className="text-slate-500 font-bold">Aucun plan</h3></div>
          ) : (
            plans.map(plan => (
              <div key={plan.id} onClick={() => setSelectedPlan(plan)} className="bg-white border border-gray-100 p-6 rounded-[28px] flex items-center justify-between hover:shadow-lg hover:shadow-indigo-50/50 transition-all group cursor-pointer">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-slate-50 text-slate-700 rounded-2xl flex items-center justify-center group-hover:bg-[#FF6B00] group-hover:text-white transition-all shadow-sm"><ClipboardList size={28} /></div>
                  <div>
                    <h3 className="text-lg font-black text-slate-800 uppercase italic tracking-tight">{plan.titre}</h3>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-slate-400 text-[10px] font-bold flex items-center gap-1.5 uppercase"><Utensils size={12} /> {plan.recettes.length} repas</span>
                      <span className="text-[#FF6B00] text-sm font-black italic">{plan.prix}€</span>
                    </div>
                  </div>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl text-slate-400 group-hover:bg-white group-hover:text-[#FF6B00] group-hover:shadow-sm border border-transparent group-hover:border-gray-100 transition-all"><ChevronRight size={20} /></div>
              </div>
            ))
          )}
        </div>
      )}

      {/* MODALE RECETTE (Version Light) */}
      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-[40px] p-10 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95">
            {isSuccess ? (
              <div className="py-12 flex flex-col items-center text-center"><div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mb-6"><CheckCircle size={40} /></div><h3 className="text-xl font-black text-slate-800 uppercase">Recette Ajoutée !</h3></div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-8"><h3 className="text-2xl font-black text-slate-800 italic uppercase">Nouvelle <span className="text-[#FF6B00]">Recette</span></h3><button onClick={() => setShowForm(false)} className="text-slate-300 hover:text-slate-600 transition-colors"><X size={24} /></button></div>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Nom de la recette</label>
                    <input type="text" name="nom" required value={formData.nom} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-4 text-slate-800 font-bold outline-none focus:border-[#FF6B00]" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Catégorie</label>
                    <select name="type" value={formData.type} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-4 text-slate-800 font-bold outline-none cursor-pointer">
                      {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <input type="number" name="calories" required value={formData.calories} onChange={handleInputChange} className="bg-slate-50 border border-slate-100 rounded-2xl py-4 px-4 text-slate-800 font-bold outline-none" placeholder="Kcal" />
                    <input type="number" name="proteines" required value={formData.proteines} onChange={handleInputChange} className="bg-slate-50 border border-slate-100 rounded-2xl py-4 px-4 text-slate-800 font-bold outline-none" placeholder="Prot (g)" />
                    <input type="number" name="glucides" required value={formData.glucides} onChange={handleInputChange} className="bg-slate-50 border border-slate-100 rounded-2xl py-4 px-4 text-slate-800 font-bold outline-none" placeholder="Gluc (g)" />
                    <input type="number" name="lipides" required value={formData.lipides} onChange={handleInputChange} className="bg-slate-50 border border-slate-100 rounded-2xl py-4 px-4 text-slate-800 font-bold outline-none" placeholder="Lip (g)" />
                  </div>
                  <button type="submit" disabled={isSubmitting} className="w-full bg-[#FF6B00] text-white font-black py-5 rounded-2xl mt-6 hover:shadow-lg hover:shadow-orange-100 transition-all flex justify-center items-center gap-2">
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
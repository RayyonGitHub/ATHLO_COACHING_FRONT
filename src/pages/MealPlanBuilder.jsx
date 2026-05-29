import React, { useState, useEffect } from 'react';
import { Save, Plus, Utensils, Trash2, ArrowLeft, Euro, Flame, Loader2, CheckCircle, Image as ImageIcon, X } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import nutritionService from '../services/nutritionService';

const MealPlanBuilder = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const planId = searchParams.get('planId');
  const [availableRecipes, setAvailableRecipes] = useState([]);
  const [planRecipes, setPlanRecipes] = useState([]);
  
  // États pour la gestion de l'enregistrement, de l'image et de la modale
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [planDetails, setPlanDetails] = useState({
    titre: '',
    description: '',
    prix: ''
  });

  useEffect(() => {
    const loadRecipes = async () => {
      const [recipesData, plansData] = await Promise.all([
        nutritionService.getRecipes(),
        nutritionService.getPlans()
      ]);
      setAvailableRecipes(recipesData);
      if (planId) {
        const plan = plansData.find(p => String(p.id) === String(planId));
        if (plan) {
          setPlanDetails({
            titre: plan.titre || '',
            description: plan.description || '',
            prix: plan.prix || ''
          });
          setPlanRecipes((plan.recettes_details || recipesData.filter(r => (plan.recettes || []).includes(r.id)))
            .map(r => ({ ...r, uniqueId: Date.now() + Math.random() })));
          setImagePreview(plan.image || null);
        }
      }
    };
    loadRecipes();
  }, [planId]);

  // Gestion du changement d'image
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const addRecipeToPlan = (recipe) => {
    setPlanRecipes([...planRecipes, { ...recipe, uniqueId: Date.now() + Math.random() }]);
  };

  const removeRecipeFromPlan = (uniqueId) => {
    setPlanRecipes(planRecipes.filter(r => r.uniqueId !== uniqueId));
  };

  const totals = planRecipes.reduce((acc, recipe) => {
    acc.calories += recipe.calories;
    acc.proteines += recipe.proteines;
    acc.glucides += recipe.glucides;
    acc.lipides += recipe.lipides;
    return acc;
  }, { calories: 0, proteines: 0, glucides: 0, lipides: 0 });

  const handleSavePlan = async () => {
    if (!planDetails.titre || planRecipes.length === 0) {
      alert("Veuillez donner un titre et ajouter au moins une recette.");
      return;
    }
    
    setIsSubmitting(true);

    const newPlan = {
      titre: planDetails.titre,
      description: planDetails.description || "",
      prix: parseFloat(planDetails.prix) || 0,
      recettes: planRecipes.map(r => r.id),
      image: selectedImage // Ajout de l'image ici
    };

    try {
      if (planId) {
        await nutritionService.updatePlan(planId, newPlan);
      } else {
        await nutritionService.savePlan(newPlan);
      }
      setIsSuccess(true);
      
      setTimeout(() => {
        setIsSuccess(false);
        navigate('/nutrition');
      }, 2000);
    } catch (error) {
      console.error("Erreur sauvegarde plan:", error);
      alert("❌ Erreur lors de la création du plan. Vérifiez les champs.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-700 relative">
      
      {/* MODALE DE SUCCÈS VERSION CLAIRE */}
      {isSuccess && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0B0B0E]/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#131317] rounded-[40px] p-12 max-w-sm w-full shadow-2xl text-center animate-in zoom-in-95 duration-300">
            <div className="w-24 h-24 bg-[#22C55E]/20 text-green-500 rounded-full flex items-center justify-center mb-8 mx-auto">
              <CheckCircle size={56} />
            </div>
            <h3 className="text-2xl font-black text-[#FCF8FE] uppercase italic mb-3">Plan {planId ? 'Modifié' : 'Créé'} !</h3>
            <p className="text-[#ACAAB0] text-sm font-medium">Votre programme est prêt pour la vente.</p>
          </div>
        </div>
      )}

      <Link to="/nutrition" className="flex items-center gap-2 text-[#ACAAB0] hover:text-[#FF6A00] transition-colors font-bold uppercase text-[10px] tracking-widest mb-4">
        <ArrowLeft size={14} /> Retour à la gestion
      </Link>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* COLONNE GAUCHE */}
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-[#131317] border border-[#2A2A32] rounded-[32px] p-8 shadow-sm">
            <h2 className="text-xl font-black text-[#FCF8FE] italic uppercase mb-6">{planId ? 'Modification' : 'Configuration'} du <span className="text-[#FF6A00]">Plan</span></h2>
            
            <div className="space-y-6">
              {/* ZONE D'UPLOAD IMAGE */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-[#ACAAB0] uppercase tracking-widest ml-1">Image de couverture</label>
                <div className="relative group">
                  {imagePreview ? (
                    <div className="relative h-48 w-full rounded-2xl overflow-hidden border border-[#2A2A32] shadow-inner bg-[#1F1F25]">
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      <button 
                        onClick={removeImage}
                        className="absolute top-3 right-3 p-2 bg-[#131317]/90 backdrop-blur-sm rounded-full text-red-500 shadow-sm hover:bg-red-50 transition-all"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-48 bg-[#1F1F25] border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:bg-[#1F1F25] hover:border-[#FF6A00]/50 transition-all">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <ImageIcon size={32} className="text-slate-300 mb-2" />
                        <p className="text-xs text-[#ACAAB0] font-bold uppercase tracking-wider">Ajouter une photo</p>
                        <p className="text-[10px] text-slate-300 uppercase mt-1">PNG, JPG (Format Paysage conseillé)</p>
                      </div>
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                    </label>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <input 
                  type="text" placeholder="Titre du programme (ex: Prise de masse sèche)" 
                  className="w-full bg-[#0B0B0E] border border-[#2A2A32] rounded-2xl py-4 px-5 text-[#FCF8FE] focus:border-[#FF6A00] outline-none text-lg font-bold transition-all"
                  value={planDetails.titre} onChange={e => setPlanDetails({...planDetails, titre: e.target.value})}
                />
                <textarea 
                  placeholder="Description pour vos athlètes..." rows="2"
                  className="w-full bg-[#0B0B0E] border border-[#2A2A32] rounded-2xl py-4 px-5 text-[#FCF8FE] focus:border-[#FF6A00] outline-none text-sm transition-all"
                  value={planDetails.description} onChange={e => setPlanDetails({...planDetails, description: e.target.value})}
                ></textarea>
                
                <div className="flex items-center gap-4">
                  <div className="relative w-1/3">
                    <Euro className="absolute left-4 top-1/2 -translate-y-1/2 text-[#ACAAB0]" size={18} />
                    <input 
                      type="number" placeholder="0.00" 
                      className="w-full bg-[#0B0B0E] border border-[#2A2A32] rounded-2xl py-4 pl-12 pr-4 text-[#FCF8FE] focus:border-[#FF6A00] outline-none font-black text-lg"
                      value={planDetails.prix} onChange={e => setPlanDetails({...planDetails, prix: e.target.value})}
                    />
                  </div>
                  <p className="text-[#ACAAB0] text-[10px] font-bold uppercase tracking-wider">Prix de vente boutique</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#131317] border border-[#2A2A32] rounded-[32px] p-8 shadow-sm min-h-[400px]">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <h3 className="text-lg font-black text-[#FCF8FE] uppercase italic flex items-center gap-2">
                <Utensils className="text-[#FF6A00]" size={20} /> Composition journalière
              </h3>
              
              <div className="bg-[#2A2A32] px-5 py-3 rounded-2xl flex items-center gap-5 shadow-lg shadow-slate-200">
                <div className="flex items-center gap-2 text-[#FF6A00] font-black italic">
                  <Flame size={16} /> {totals.calories} <span className="text-[10px] uppercase not-italic text-[#ACAAB0]">kcal</span>
                </div>
                <div className="text-white text-[10px] font-bold uppercase border-l border-slate-700 pl-5 flex gap-3">
                  <span>P: {totals.proteines}g</span>
                  <span>G: {totals.glucides}g</span>
                  <span>L: {totals.lipides}g</span>
                </div>
              </div>
            </div>

            {planRecipes.length === 0 ? (
              <div className="text-center py-20 border-2 border-dashed border-[#2A2A32] rounded-[32px]">
                <p className="text-[#ACAAB0] font-bold uppercase text-[10px] tracking-[0.2em]">Sélectionnez des repas dans la bibliothèque 👉</p>
              </div>
            ) : (
              <div className="space-y-3">
                {planRecipes.map((recipe, index) => (
                  <div key={recipe.uniqueId} className="flex items-center justify-between bg-[#1F1F25] p-4 rounded-2xl border border-transparent hover:border-gray-200 hover:bg-[#131317] hover:shadow-md transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 bg-[#131317] text-[#FCF8FE] rounded-xl flex items-center justify-center font-black text-xs shadow-sm">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="text-[#FCF8FE] font-bold text-sm">{recipe.nom}</h4>
                        <p className="text-[9px] text-[#ACAAB0] uppercase font-black tracking-widest">{recipe.type} • {recipe.calories} kcal</p>
                      </div>
                    </div>
                    <button onClick={() => removeRecipeFromPlan(recipe.uniqueId)} className="text-slate-300 hover:text-red-500 p-2 transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button 
            onClick={handleSavePlan}
            disabled={isSubmitting}
            className="w-full bg-[#FF6A00] text-white font-black py-5 rounded-[24px] hover:bg-[#e66000] transition-all flex items-center justify-center gap-3 uppercase italic text-lg shadow-lg shadow-orange-100 disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 className="animate-spin" /> : <><Save size={22} /> {planId ? 'Enregistrer les modifications' : 'Mettre en vente le plan'}</>}
          </button>
        </div>

        {/* COLONNE DROITE : BIBLIOTHÈQUE */}
        <div className="bg-[#131317] border border-[#2A2A32] rounded-[32px] p-6 shadow-sm h-fit sticky top-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xs font-black text-[#FCF8FE] uppercase italic tracking-widest">Ma Bibliothèque</h3>
            <span className="bg-[#1F1F25] text-[#ACAAB0] px-2 py-1 rounded text-[9px] font-bold">{availableRecipes.length}</span>
          </div>
          <div className="space-y-3 max-h-[65vh] overflow-y-auto pr-1 custom-scrollbar">
            {availableRecipes.map(recipe => (
              <div key={recipe.id} className="bg-[#1F1F25] border border-transparent p-4 rounded-2xl hover:border-[#FF6A00]/30 hover:bg-[#131317] hover:shadow-sm transition-all cursor-pointer group"
                   onClick={() => addRecipeToPlan(recipe)}>
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-[#FCF8FE] font-bold text-xs line-clamp-1">{recipe.nom}</h4>
                  <Plus className="text-[#FF6A00] opacity-0 group-hover:opacity-100 transition-opacity" size={16} />
                </div>
                <div className="flex gap-2 text-[9px] uppercase font-black tracking-wider">
                  <span className="text-[#FF6A00]">{recipe.calories} kcal</span>
                  <span className="text-[#ACAAB0]">{recipe.type}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MealPlanBuilder;

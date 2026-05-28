import React, { useState, useEffect } from 'react';
import { Utensils, ClipboardList, ChevronRight, ArrowLeft, Flame, Loader2, Target } from 'lucide-react';
import nutritionService from '../services/nutritionService';

const AthleteNutrition = () => {
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPlans = async () => {
      try {
        const data = await nutritionService.getAthletePlans();
        setPlans(data);
      } catch (error) {
        console.error("Erreur chargement plans", error);
      } finally {
        setLoading(false);
      }
    };
    loadPlans();
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#FF6B00]" size={40} /></div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      
      {/* HEADER */}
      <div className="bg-[#1E1E1E] p-8 rounded-3xl border border-[#2D2D2D] shadow-xl">
        <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-2">
          Ma <span className="text-[#FF6B00]">Nutrition</span>
        </h2>
        <p className="text-gray-400 font-medium">Consultez vos programmes alimentaires personnalisés.</p>
      </div>

      {!selectedPlan ? (
        /* LISTE DES PLANS ACHETÉS */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {plans.length === 0 ? (
            <div className="col-span-full text-center py-20 bg-[#1E1E1E] rounded-3xl border border-[#2D2D2D]">
               <ClipboardList size={48} className="mx-auto text-gray-700 mb-4" />
               <h3 className="text-xl font-bold text-white mb-2">Aucun plan pour le moment</h3>
               <p className="text-gray-400">Vos plans achetés en boutique apparaîtront ici.</p>
            </div>
          ) : (
            plans.map(plan => (
              <div 
                key={plan.id} 
                onClick={() => setSelectedPlan(plan)}
                className="bg-[#1E1E1E] border border-[#2D2D2D] p-6 rounded-[30px] flex items-center justify-between hover:border-[#FF6B00]/50 transition-all cursor-pointer group shadow-lg"
              >
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-[#FF6B00]/10 text-[#FF6B00] rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Utensils size={32} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white uppercase italic tracking-tight">{plan.titre}</h3>
                    <p className="text-gray-500 text-sm font-bold uppercase">{plan.recettes.length} Repas prévus</p>
                  </div>
                </div>
                <ChevronRight className="text-gray-600 group-hover:text-[#FF6B00] transition-colors" />
              </div>
            ))
          )}
        </div>
      ) : (
        /* DÉTAIL DU PLAN SÉLECTIONNÉ */
        <div className="animate-in slide-in-from-right duration-500 space-y-6">
          <button 
            onClick={() => setSelectedPlan(null)} 
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors font-black uppercase text-xs italic"
          >
            <ArrowLeft size={16} /> Retour à mes plans
          </button>
          
          <div className="bg-[#1E1E1E] border border-[#2D2D2D] rounded-[40px] p-8 md:p-12 shadow-2xl">
            <div className="flex flex-col lg:flex-row justify-between gap-10 mb-12">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <Target size={16} className="text-[#FF6B00]" />
                  <span className="text-[#FF6B00] font-black uppercase text-xs tracking-widest italic">Objectif Nutritionnel</span>
                </div>
                <h3 className="text-4xl font-black text-white italic uppercase tracking-tighter mb-4">{selectedPlan.titre}</h3>
                <p className="text-gray-400 text-sm leading-relaxed max-w-2xl">{selectedPlan.description}</p>
              </div>

              {/* RÉSUMÉ DES MACROS */}
              <div className="bg-[#121212] border border-[#2D2D2D] rounded-[32px] p-8 min-w-[240px] text-center">
                <Flame size={32} className="text-[#FF6B00] mx-auto mb-4" />
                <p className="text-5xl font-black text-white italic mb-1">
                  {/* Total calculé (on peut le passer via l'API ou le calculer ici) */}
                  {selectedPlan.total_calories || '---'} 
                </p>
                <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Calories / Jour</p>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-white font-black uppercase text-xs tracking-widest mb-6 border-b border-[#2D2D2D] pb-4">Planning des repas</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(selectedPlan.recettes_details || []).map((recipe, idx) => (
                  <button key={recipe.id || idx} onClick={() => setSelectedRecipe(recipe)} className="bg-[#121212] border border-[#2D2D2D] p-5 rounded-2xl flex justify-between items-center hover:border-[#FF6B00]/30 transition-colors text-left">
                    <div className="flex items-center gap-4">
                      <div className="w-9 h-9 bg-[#FF6B00] text-black rounded-xl flex items-center justify-center font-black italic">{idx + 1}</div>
                      <div>
                        <p className="text-white font-bold text-sm">{recipe.nom}</p>
                        <p className="text-[10px] text-gray-500 uppercase font-black">{recipe.type}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[#FF6B00] font-black text-sm">{recipe.calories} kcal</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      {selectedRecipe && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#1E1E1E] border border-[#2D2D2D] rounded-[32px] p-8 w-full max-w-md shadow-2xl">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <p className="text-[#FF6B00] text-[10px] font-black uppercase tracking-widest">{selectedRecipe.type}</p>
                <h3 className="text-2xl font-black text-white italic uppercase mt-2">{selectedRecipe.nom}</h3>
              </div>
              <button onClick={() => setSelectedRecipe(null)} className="text-gray-500 hover:text-white text-2xl leading-none">×</button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#121212] rounded-2xl p-4 border border-[#2D2D2D]"><p className="text-[#FF6B00] text-2xl font-black">{selectedRecipe.calories}</p><p className="text-gray-500 text-[10px] font-black uppercase">Kcal</p></div>
              <div className="bg-[#121212] rounded-2xl p-4 border border-[#2D2D2D]"><p className="text-white text-2xl font-black">{selectedRecipe.proteines}g</p><p className="text-gray-500 text-[10px] font-black uppercase">Protéines</p></div>
              <div className="bg-[#121212] rounded-2xl p-4 border border-[#2D2D2D]"><p className="text-white text-2xl font-black">{selectedRecipe.glucides}g</p><p className="text-gray-500 text-[10px] font-black uppercase">Glucides</p></div>
              <div className="bg-[#121212] rounded-2xl p-4 border border-[#2D2D2D]"><p className="text-white text-2xl font-black">{selectedRecipe.lipides}g</p><p className="text-gray-500 text-[10px] font-black uppercase">Lipides</p></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AthleteNutrition;

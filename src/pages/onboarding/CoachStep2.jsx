import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { onboardingService } from '../../services/onboardingService';

const CoachStep2 = () => {
  const navigate = useNavigate();
  // State pour les spécialités
  const [selectedTags, setSelectedTags] = useState(["Crossfit"]);
  const availableTags = ["Nutrition", "HIIT", "Pilates", "Boxe", "Méditation", "Yoga", "Force Athlétique"];

  // State pour les tarifs
  const [tarifs, setTarifs] = useState({ seance: 60, pack: 500, abonnement: 180 });

  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleNext = async () => {
    try {
      await onboardingService.updateCoachProfile({
        specialites_tags: selectedTags,
        offres_tarifs: tarifs
      });
      navigate('/onboarding/coach/step3');
    } catch (error) {
      console.error("Erreur save:", error);
    }
  };

  return (
    <div className="bg-white dark:bg-[#0B0B0F] min-h-screen text-slate-900 dark:text-white p-8 font-sans">
      <div className="max-w-5xl mx-auto">
        <header className="mb-12">
          <h1 className="text-5xl font-black mb-4">Spécialités & Services</h1>
          <p className="text-lg opacity-60">Définissez votre expertise et vos offres tarifaires.</p>
        </header>

        {/* Section Spécialités */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6">Vos Spécialités</h2>
          <div className="flex flex-wrap gap-3">
            {selectedTags.map(tag => (
              <div key={tag} onClick={() => toggleTag(tag)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-500 text-white border border-orange-500 cursor-pointer">
                <span className="font-bold text-sm">{tag}</span>
                <span>✕</span>
              </div>
            ))}
            {availableTags.filter(t => !selectedTags.includes(t)).map(tag => (
              <div key={tag} onClick={() => toggleTag(tag)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-orange-500 cursor-pointer transition-all">
                <span className="font-medium text-sm">{tag}</span>
                <span>+</span>
              </div>
            ))}
          </div>
        </section>

        {/* Section Tarifs */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-8">Tarifs & Offres</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-bold mb-2">Séance Unique</h3>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">€</span>
                <input 
                  type="number" 
                  value={tarifs.seance} 
                  onChange={(e) => setTarifs({...tarifs, seance: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-white/5 border-none rounded-xl py-3 pl-8 pr-4 text-xl font-black outline-none" 
                />
              </div>
            </div>
            <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-bold mb-2">Pack 10 Séances</h3>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">€</span>
                <input 
                  type="number" 
                  value={tarifs.pack} 
                  onChange={(e) => setTarifs({...tarifs, pack: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-white/5 border-none rounded-xl py-3 pl-8 pr-4 text-xl font-black outline-none" 
                />
              </div>
            </div>
            <div className="bg-white dark:bg-white/5 border border-orange-500/40 rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-orange-500 text-white text-[10px] px-3 py-1 font-bold rounded-bl-lg">POPULAIRE</div>
              <h3 className="text-lg font-bold mb-2">Mensuel</h3>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">€</span>
                <input 
                  type="number" 
                  value={tarifs.abonnement} 
                  onChange={(e) => setTarifs({...tarifs, abonnement: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-white/5 border-none rounded-xl py-3 pl-8 pr-4 text-xl font-black outline-none" 
                />
              </div>
            </div>
          </div>
        </section>

        <footer className="flex justify-end pt-10 border-t border-slate-200 dark:border-white/10">
          <button onClick={handleNext} className="flex items-center gap-3 px-10 py-4 rounded-xl bg-orange-500 text-white font-black text-lg shadow-xl hover:bg-orange-600 transition-all">
            Étape Suivante →
          </button>
        </footer>
      </div>
    </div>
  );
};

export default CoachStep2;
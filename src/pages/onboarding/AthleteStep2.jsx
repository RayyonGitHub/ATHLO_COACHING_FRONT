import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { onboardingService } from '../../services/onboardingService';

const AthleteStep2 = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ age: '', poids: '', taille: '', goal: '' });

  const handleGoalSelect = (goal) => setFormData({ ...formData, goal });

  const handleNext = async () => {
    try {
      await onboardingService.updateAthleteProfile({
        age: formData.age,
        poids: formData.poids,
        taille: formData.taille,
        onboarding_data: { goal: formData.goal, level: 'intermediaire' }
      });
      // On va vers l'étape 3
      navigate('/onboarding/athlete/step3');
    } catch (error) {
      console.error("Erreur update profil:", error);
    }
  };

  return (
    <div className="bg-[#f8f7f5] dark:bg-[#0B0B0F] min-h-screen text-slate-900 dark:text-white font-sans flex flex-col">
      {/* Header Simple */}
      <header className="px-6 py-4 border-b border-slate-200 dark:border-white/10 flex justify-between items-center">
        <span className="font-black text-xl tracking-tight text-[#f96b06]">ATHLO</span>
      </header>

      <div className="flex-1 flex justify-center py-10 px-4">
        <div className="w-full max-w-[640px] flex flex-col">
          
          {/* Progress Bar : Étape 2 sur 3 */}
          <div className="flex flex-col gap-3 mb-8">
            <div className="flex gap-6 justify-between items-end">
              <p className="text-base font-medium">Étape 2 sur 3</p>
              <p className="text-sm font-bold text-[#f96b06]">66%</p>
            </div>
            <div className="rounded-full bg-slate-200 dark:bg-white/10 h-2 w-full overflow-hidden">
              <div className="h-full rounded-full bg-[#f96b06]" style={{ width: '66%' }}></div>
            </div>
            <p className="text-sm opacity-60">Configuration du profil athlète</p>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Votre Profil</h1>
            <p className="opacity-60">Personnalisons votre expérience d'entraînement.</p>
          </div>

          <div className="bg-white dark:bg-[#181411] p-8 rounded-xl border border-slate-200 dark:border-white/10 shadow-xl space-y-8">
            {/* Objectifs */}
            <section>
              <h3 className="font-bold mb-4">Objectif principal</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {['Muscle', 'Poids', 'Endurance'].map(g => (
                  <div 
                    key={g} 
                    onClick={() => handleGoalSelect(g)}
                    className={`cursor-pointer p-4 rounded-lg border-2 text-center font-bold transition-all flex flex-col items-center gap-2 ${formData.goal === g ? 'border-[#f96b06] bg-[#f96b06]/10 text-[#f96b06]' : 'border-slate-200 dark:border-white/10 hover:border-[#f96b06]'}`}
                  >
                    <span>{g}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Stats */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {['age', 'poids', 'taille'].map(field => (
                <div key={field} className="flex flex-col gap-2">
                  <label className="text-sm opacity-60 capitalize">{field} {field === 'poids' ? '(kg)' : field === 'taille' ? '(cm)' : ''}</label>
                  <input 
                    type="number" 
                    className="bg-slate-50 dark:bg-[#23170f] border border-slate-200 dark:border-white/10 rounded-lg p-3 outline-none focus:ring-2 focus:ring-[#f96b06]"
                    placeholder="0"
                    value={formData[field]}
                    onChange={(e) => setFormData({...formData, [field]: e.target.value})}
                  />
                </div>
              ))}
            </section>

            <button onClick={handleNext} className="w-full bg-[#f96b06] hover:bg-orange-600 text-white font-bold py-4 rounded-xl shadow-lg transition-all flex justify-center items-center gap-2">
              Suivant <span>→</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AthleteStep2;
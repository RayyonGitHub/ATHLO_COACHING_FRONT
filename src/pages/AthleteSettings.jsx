import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Save, User, Scale, Ruler, Calendar, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';

const AthleteSettings = () => {
  const [formData, setFormData] = useState({
    prenom: '',
    nom: '',
    poids: '',
    taille: '',
    age: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // 1. Récupération des données actuelles
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('authToken') || localStorage.getItem('access_token');
        // On fait une requête PATCH vide juste pour récupérer ou créer le profil
        const response = await axios.patch('http://127.0.0.1:8000/api/athlete/me/', {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const data = response.data;
        setFormData({
          prenom: data.prenom || '',
          nom: data.nom || '',
          poids: data.poids || '',
          taille: data.taille || '',
          age: data.age || ''
        });
      } catch (err) {
        console.error("Erreur chargement profil:", err);
        setError("Impossible de charger vos informations.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // 2. Gestion des champs du formulaire
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setSuccess(false); // On cache le message de succès s'il modifie à nouveau
  };

  // 3. Sauvegarde des données
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    
    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('access_token');
      await axios.patch('http://127.0.0.1:8000/api/athlete/me/', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess(true);
      
      // Petit effet visuel : le message disparaît après 3s
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("Erreur sauvegarde:", err);
      setError("Une erreur est survenue lors de la sauvegarde.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-[#FF6B00]">
        <Loader2 className="animate-spin mb-4" size={48} />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-8 pb-12 animate-in fade-in duration-500">
      
      <div>
        <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">
          Mon <span className="text-[#FF6B00]">Profil</span>
        </h2>
        <p className="text-gray-500 text-sm mt-1 font-medium">Mettez à jour vos mensurations pour des statistiques précises.</p>
      </div>

      <div className="bg-[#1E1E1E] border border-[#2D2D2D] rounded-3xl p-6 md:p-10">
        
        {/* Messages d'Alerte / Succès */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl flex items-center gap-3 text-red-500 font-medium">
            <AlertCircle size={20} /> {error}
          </div>
        )}
        
        {success && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/50 rounded-xl flex items-center gap-3 text-green-500 font-bold animate-in zoom-in duration-300">
            <CheckCircle2 size={20} /> Profil mis à jour avec succès !
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Prénom */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <User size={14} className="text-[#FF6B00]"/> Prénom
              </label>
              <input 
                type="text" name="prenom" value={formData.prenom} onChange={handleChange}
                className="w-full bg-black/30 border border-[#2D2D2D] text-white px-4 py-3 rounded-xl focus:outline-none focus:border-[#FF6B00] transition-colors"
                placeholder="Votre prénom"
              />
            </div>

            {/* Nom */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <User size={14} className="text-[#FF6B00]"/> Nom
              </label>
              <input 
                type="text" name="nom" value={formData.nom} onChange={handleChange}
                className="w-full bg-black/30 border border-[#2D2D2D] text-white px-4 py-3 rounded-xl focus:outline-none focus:border-[#FF6B00] transition-colors"
                placeholder="Votre nom"
              />
            </div>
          </div>

          <div className="border-t border-[#2D2D2D] my-6"></div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Poids */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <Scale size={14} className="text-blue-400"/> Poids (kg)
              </label>
              <input 
                type="number" step="0.1" name="poids" value={formData.poids} onChange={handleChange}
                className="w-full bg-black/30 border border-[#2D2D2D] text-white px-4 py-3 rounded-xl focus:outline-none focus:border-[#FF6B00] transition-colors"
                placeholder="Ex: 75.5"
              />
            </div>

            {/* Taille */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <Ruler size={14} className="text-green-400"/> Taille (cm)
              </label>
              <input 
                type="number" name="taille" value={formData.taille} onChange={handleChange}
                className="w-full bg-black/30 border border-[#2D2D2D] text-white px-4 py-3 rounded-xl focus:outline-none focus:border-[#FF6B00] transition-colors"
                placeholder="Ex: 180"
              />
            </div>

            {/* Âge */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <Calendar size={14} className="text-purple-400"/> Âge
              </label>
              <input 
                type="number" name="age" value={formData.age} onChange={handleChange}
                className="w-full bg-black/30 border border-[#2D2D2D] text-white px-4 py-3 rounded-xl focus:outline-none focus:border-[#FF6B00] transition-colors"
                placeholder="Ex: 28"
              />
            </div>
          </div>

          <div className="pt-6">
            <button 
              type="submit" 
              disabled={saving}
              className="w-full md:w-auto bg-[#FF6B00] hover:bg-[#FF8533] text-white px-8 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
              {saving ? 'Sauvegarde...' : 'Enregistrer les modifications'}
            </button>
          </div>
          
        </form>
      </div>
    </div>
  );
};

export default AthleteSettings;
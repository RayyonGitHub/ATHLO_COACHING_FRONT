import React, { useState, useEffect } from 'react';
import api from "../../services/api";
import { User, Lock, Save, Phone, Mail, Building } from 'lucide-react';

const ResponsableSettings = () => {
  const [profile, setProfile] = useState({
    first_name: '',
    last_name: '',
    email: '',
    telephone: '',
    salle_nom: ''
  });
  const [passwords, setPasswords] = useState({
    old_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/responsable/me/');
      setProfile(res.data);
    } catch (err) {
      console.error("Erreur profil", err);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.patch('/responsable/me/', profile);
      setMessage({ type: 'success', text: 'Profil mis à jour !' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Erreur lors de la mise à jour.' });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwords.new_password !== passwords.confirm_password) {
      alert("Les mots de passe ne correspondent pas.");
      return;
    }
    try {
      await api.post('/responsable/change-password/', passwords);
      setPasswords({ old_password: '', new_password: '', confirm_password: '' });
      alert("Mot de passe changé !");
    } catch (err) {
      alert("Erreur changement mot de passe.");
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto text-[#fcf8fe] animate-in fade-in duration-500">
      <h1 className="text-3xl font-black mb-8 flex items-center gap-3">
        <span className="material-symbols-outlined text-[#ff915a]">settings</span>
        Paramètres du Compte
      </h1>

      {message.text && (
        <div className={`p-4 rounded-xl mb-6 font-bold ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
          {message.text}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-8">
        {/* Infos Personnelles */}
        <section className="bg-[#131317] p-6 rounded-2xl border border-[#48474c]/10 shadow-xl">
          <h2 className="text-lg font-bold mb-6 flex items-center gap-2 border-b border-[#48474c]/10 pb-4">
            <User size={20} className="text-[#ff915a]" /> Informations Personnelles
          </h2>
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] uppercase font-black text-[#acaab0] mb-1">Prénom</label>
                <input type="text" value={profile.first_name} onChange={e => setProfile({...profile, first_name: e.target.value})} className="w-full bg-[#0e0e12] border border-[#48474c]/20 rounded-xl p-3 outline-none focus:border-[#ff915a] transition-all" />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-black text-[#acaab0] mb-1">Nom</label>
                <input type="text" value={profile.last_name} onChange={e => setProfile({...profile, last_name: e.target.value})} className="w-full bg-[#0e0e12] border border-[#48474c]/20 rounded-xl p-3 outline-none focus:border-[#ff915a] transition-all" />
              </div>
            </div>
            <div>
              <label className="block text-[10px] uppercase font-black text-[#acaab0] mb-1">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#48474c]" />
                <input type="email" value={profile.email} onChange={e => setProfile({...profile, email: e.target.value})} className="w-full bg-[#0e0e12] border border-[#48474c]/20 rounded-xl p-3 pl-10 outline-none focus:border-[#ff915a] transition-all" />
              </div>
            </div>
            <div>
              <label className="block text-[10px] uppercase font-black text-[#acaab0] mb-1">Téléphone</label>
              <div className="relative">
                <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#48474c]" />
                <input type="text" value={profile.telephone} onChange={e => setProfile({...profile, telephone: e.target.value})} className="w-full bg-[#0e0e12] border border-[#48474c]/20 rounded-xl p-3 pl-10 outline-none focus:border-[#ff915a] transition-all" />
              </div>
            </div>
            <div>
              <label className="block text-[10px] uppercase font-black text-[#acaab0] mb-1">Salle (Lecture seule)</label>
              <div className="relative opacity-50">
                <Building size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#48474c]" />
                <input type="text" value={profile.salle_nom} disabled className="w-full bg-[#0e0e12] border border-[#48474c]/20 rounded-xl p-3 pl-10 outline-none cursor-not-allowed" />
              </div>
            </div>
            <button type="submit" disabled={loading} className="w-full bg-[#ff915a] hover:bg-[#ff7351] text-white font-black py-3 rounded-xl transition-all flex items-center justify-center gap-2">
              <Save size={18} /> {loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </button>
          </form>
        </section>

        {/* Sécurité */}
        <section className="bg-[#131317] p-6 rounded-2xl border border-[#48474c]/10 shadow-xl h-fit">
          <h2 className="text-lg font-bold mb-6 flex items-center gap-2 border-b border-[#48474c]/10 pb-4">
            <Lock size={20} className="text-[#ff915a]" /> Sécurité & Mot de passe
          </h2>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] uppercase font-black text-[#acaab0] mb-1">Ancien mot de passe</label>
              <input type="password" value={passwords.old_password} onChange={e => setPasswords({...passwords, old_password: e.target.value})} className="w-full bg-[#0e0e12] border border-[#48474c]/20 rounded-xl p-3 outline-none focus:border-[#ff915a] transition-all" />
            </div>
            <div className="pt-2 border-t border-[#48474c]/10">
              <label className="block text-[10px] uppercase font-black text-[#acaab0] mb-1">Nouveau mot de passe</label>
              <input type="password" value={passwords.new_password} onChange={e => setPasswords({...passwords, new_password: e.target.value})} className="w-full bg-[#0e0e12] border border-[#48474c]/20 rounded-xl p-3 outline-none focus:border-[#ff915a] transition-all" />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-black text-[#acaab0] mb-1">Confirmer le nouveau mot de passe</label>
              <input type="password" value={passwords.confirm_password} onChange={e => setPasswords({...passwords, confirm_password: e.target.value})} className="w-full bg-[#0e0e12] border border-[#48474c]/20 rounded-xl p-3 outline-none focus:border-[#ff915a] transition-all" />
            </div>
            <button type="submit" className="w-full bg-[#1f1f25] hover:bg-[#2a2a33] text-[#ff915a] border border-[#ff915a]/20 font-black py-3 rounded-xl transition-all">
              Modifier le mot de passe
            </button>
          </form>
        </section>
      </div>
    </div>
  );
};

export default ResponsableSettings;
import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { User, Lock, Save, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

const AdminSettings = () => {
  const [profile, setProfile] = useState({ first_name: '', last_name: '', email: '' });
  const [passwords, setPasswords] = useState({ old_password: '', new_password: '', confirm_password: '' });
  
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await adminAPI.getMe();
      setProfile(res.data);
    } catch (error) {
      console.error("Erreur profil", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setMessage({ type: '', text: '' });
    try {
      const res = await adminAPI.updateMe(profile);
      // Mettre à jour l'utilisateur dans le localStorage pour le layout
      const storedUser = JSON.parse(localStorage.getItem('user'));
      localStorage.setItem('user', JSON.stringify({ ...storedUser, ...res.data.user }));
      setMessage({ type: 'success', text: 'Profil mis à jour avec succès.' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur lors de la mise à jour.' });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwords.new_password !== passwords.confirm_password) {
      return setMessage({ type: 'error', text: 'Les nouveaux mots de passe ne correspondent pas.' });
    }
    setSavingPassword(true);
    setMessage({ type: '', text: '' });
    try {
      await adminAPI.changeMyPassword({
        old_password: passwords.old_password,
        new_password: passwords.new_password
      });
      setMessage({ type: 'success', text: 'Mot de passe modifié.' });
      setPasswords({ old_password: '', new_password: '', confirm_password: '' });
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.error || 'Erreur mot de passe.' });
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) return <div className="p-8 text-center"><Loader2 className="animate-spin mx-auto text-[#FF6A00]" /></div>;

  return (
    <div className="p-8 max-w-[800px] mx-auto animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-black dark:text-white">Paramètres Système</h1>
        <p className="text-slate-500">Gérez vos identifiants d'accès et vos informations de sécurité.</p>
      </div>

      {message.text && (
        <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 border ${
          message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-rose-500/10 border-rose-500/20 text-rose-500'
        }`}>
          {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <span className="text-sm font-bold">{message.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-8">
        {/* Section Profil */}
        <section className="bg-white dark:bg-[#16161A] border border-slate-200 dark:border-[#26262B] rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-indigo-500/10 text-indigo-500 rounded-lg"><User size={20} /></div>
            <h2 className="text-lg font-bold dark:text-white">Informations Personnelles</h2>
          </div>
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Prénom</label>
                <input type="text" className="w-full bg-slate-50 dark:bg-[#0B0B0F] border border-slate-200 dark:border-[#26262B] p-3 rounded-xl text-sm dark:text-white outline-none focus:border-[#FF6A00]" value={profile.first_name} onChange={e => setProfile({...profile, first_name: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Nom</label>
                <input type="text" className="w-full bg-slate-50 dark:bg-[#0B0B0F] border border-slate-200 dark:border-[#26262B] p-3 rounded-xl text-sm dark:text-white outline-none focus:border-[#FF6A00]" value={profile.last_name} onChange={e => setProfile({...profile, last_name: e.target.value})} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Email de connexion</label>
              <input type="email" className="w-full bg-slate-50 dark:bg-[#0B0B0F] border border-slate-200 dark:border-[#26262B] p-3 rounded-xl text-sm dark:text-white outline-none focus:border-[#FF6A00]" value={profile.email} onChange={e => setProfile({...profile, email: e.target.value})} />
            </div>
            <button type="submit" disabled={savingProfile} className="flex items-center justify-center gap-2 px-6 py-3 bg-[#FF6A00] text-white font-bold rounded-xl text-sm hover:bg-orange-600 transition disabled:opacity-50">
              {savingProfile ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Sauvegarder le profil
            </button>
          </form>
        </section>

        {/* Section Sécurité */}
        <section className="bg-white dark:bg-[#16161A] border border-slate-200 dark:border-[#26262B] rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-rose-500/10 text-rose-500 rounded-lg"><Lock size={20} /></div>
            <h2 className="text-lg font-bold dark:text-white">Sécurité du compte</h2>
          </div>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Ancien mot de passe</label>
              <input type="password" required className="w-full bg-slate-50 dark:bg-[#0B0B0F] border border-slate-200 dark:border-[#26262B] p-3 rounded-xl text-sm dark:text-white outline-none focus:border-[#FF6A00]" value={passwords.old_password} onChange={e => setPasswords({...passwords, old_password: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Nouveau mot de passe</label>
                <input type="password" required className="w-full bg-slate-50 dark:bg-[#0B0B0F] border border-slate-200 dark:border-[#26262B] p-3 rounded-xl text-sm dark:text-white outline-none focus:border-[#FF6A00]" value={passwords.new_password} onChange={e => setPasswords({...passwords, new_password: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Confirmer</label>
                <input type="password" required className="w-full bg-slate-50 dark:bg-[#0B0B0F] border border-slate-200 dark:border-[#26262B] p-3 rounded-xl text-sm dark:text-white outline-none focus:border-[#FF6A00]" value={passwords.confirm_password} onChange={e => setPasswords({...passwords, confirm_password: e.target.value})} />
              </div>
            </div>
            <button type="submit" disabled={savingPassword} className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 text-white font-bold rounded-xl text-sm hover:bg-slate-800 transition disabled:opacity-50">
              {savingPassword ? <Loader2 size={16} className="animate-spin" /> : <Lock size={16} />} Mettre à jour le mot de passe
            </button>
          </form>
        </section>
      </div>
    </div>
  );
};

export default AdminSettings;
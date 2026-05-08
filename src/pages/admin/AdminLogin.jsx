import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/admin/login/', formData);
      
      // On stocke les infos pour AdminRoute et Axios
      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('access_token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      if (response.data.refresh) {
        localStorage.setItem('refreshToken', response.data.refresh);
      }
      
      // On injecte le token dans axios pour la requête suivante
      api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || "Erreur de connexion.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#f8f7f5] dark:bg-[#0B0B0F] text-slate-900 dark:text-slate-100 min-h-screen flex flex-col font-sans relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-20 z-0">
        <svg height="100%" width="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern height="40" id="grid" patternUnits="userSpaceOnUse" width="40">
              <path className="text-[#FF6A00]/20" d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5"></path>
            </pattern>
          </defs>
          <rect fill="url(#grid)" height="100%" width="100%"></rect>
        </svg>
      </div>

      <header className="w-full px-6 py-4 flex items-center justify-between border-b border-[#2A2A2E] bg-[#0B0B0F]/50 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#FF6A00] rounded-lg flex items-center justify-center">
            <span className="material-symbols-outlined text-white" style={{ fontVariationSettings: "'FILL' 1" }}>shield_person</span>
          </div>
          <div>
            <h2 className="text-white text-lg font-bold leading-tight tracking-tight">ATHLO</h2>
            <p className="text-[#FF6A00] text-[10px] font-bold uppercase tracking-[0.2em] leading-none">Administration</p>
          </div>
        </div>
        <button onClick={() => navigate('/')} className="group flex items-center gap-2 px-4 py-2 rounded-lg border border-[#2A2A2E] hover:bg-white/5 transition-colors text-slate-300 text-sm font-medium">
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          <span>Retour au site</span>
        </button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold tracking-tight text-white mb-2">Accès Administration</h1>
            <p className="text-slate-400">Veuillez entrer vos identifiants pour accéder au cockpit.</p>
          </div>
          
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center font-bold">
              {error}
            </div>
          )}

          <div className="bg-[#1A1A1E] border border-[#2A2A2E] p-8 rounded-xl shadow-2xl">
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-300 ml-1" htmlFor="email">Email professionnel</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-slate-500 group-focus-within:text-[#FF6A00] transition-colors">mail</span>
                  </div>
                  <input className="block w-full pl-12 pr-4 py-4 bg-[#0B0B0F] border border-[#2A2A2E] rounded-lg text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/20 focus:border-[#FF6A00] transition-all" id="email" type="email" placeholder="super-admin@athlo.com" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between ml-1">
                  <label className="text-sm font-semibold text-slate-300" htmlFor="password">Mot de passe</label>
                  <a className="text-xs text-[#FF6A00] hover:underline font-medium" href="#">Oublié ?</a>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-slate-500 group-focus-within:text-[#FF6A00] transition-colors">lock</span>
                  </div>
                  <input className="block w-full pl-12 pr-12 py-4 bg-[#0B0B0F] border border-[#2A2A2E] rounded-lg text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/20 focus:border-[#FF6A00] transition-all" id="password" type={showPassword ? "text" : "password"} placeholder="••••••••" required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                  <button className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-slate-300" type="button" onClick={() => setShowPassword(!showPassword)}>
                    <span className="material-symbols-outlined">{showPassword ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
              </div>
              <button disabled={loading} className="w-full bg-[#FF6A00] hover:bg-[#FF6A00]/90 text-white font-bold py-4 rounded-lg shadow-lg shadow-[#FF6A00]/20 transition-all transform hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-50" type="submit">
                <span>{loading ? "Connexion..." : "Se Connecter au Cockpit"}</span>
                {!loading && <span className="material-symbols-outlined text-xl">login</span>}
              </button>
            </form>
          </div>
          <div className="mt-8 flex items-center justify-center gap-6">
            <div className="flex items-center gap-2 text-slate-500 text-xs">
              <span className="material-symbols-outlined text-sm">encrypted</span>
              <span>SSL 256-bit Encrypted</span>
            </div>
            <div className="w-px h-4 bg-[#2A2A2E]"></div>
            <div className="flex items-center gap-2 text-slate-500 text-xs">
              <span className="material-symbols-outlined text-sm">verified_user</span>
              <span>Staff Only Access</span>
            </div>
          </div>
        </div>
      </main>
      <footer className="w-full p-6 text-center border-t border-[#2A2A2E] bg-[#0B0B0F]/50">
        <p className="text-slate-600 text-xs">© 2026 ATHLO Platform Management. Tous droits réservés.</p>
      </footer>
    </div>
  );
};

export default AdminLogin;
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight, Dumbbell, Users, Zap } from 'lucide-react';
import { authService } from '../services/authService';

const Register = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState('coach');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
  });

  const roles = [
    { id: 'coach', label: 'Coach', icon: Dumbbell },
    { id: 'prospect', label: 'Prospect', icon: Users },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 1. Inscription uniquement
      await authService.register({ ...formData, role: selectedRole });
      
      await authService.login({ email: formData.email, password: formData.password });
      
      // 2. Redirection vers login
      if (selectedRole === 'coach') { 
        navigate('/onboarding/coach/step2'); 
      } else { 
         navigate('/onboarding/athlete/step2');
      }

    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l'inscription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col lg:flex-row bg-[#0B0B0F]">
      {/* Left Side: Visual Branding */}
      <div className="relative hidden lg:flex lg:w-1/2 flex-col justify-between p-12 overflow-hidden bg-[#181410]">
        <div className="absolute inset-0 z-0 opacity-60">
          <img 
            src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&q=80"
            alt="Athlete training"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0F] via-transparent to-transparent"></div>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <div className="bg-gradient-to-br from-orange-400 to-orange-600 p-2.5 rounded-lg shadow-lg shadow-orange-500/20">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold tracking-widest text-white">ATHLO</h2>
        </div>

        <div className="relative z-10">
          <h1 className="text-5xl font-bold leading-tight mb-4 max-w-md text-white">
            Elevate your performance management.
          </h1>
          <p className="text-lg text-gray-400 max-w-sm">
            Join thousands of elite coaches and athletes streamlining their progress with premium tools.
          </p>
        </div>

        <div className="relative z-10 flex gap-4 text-sm text-gray-500">
          <span>© 2026 ATHLO SaaS</span>
          <span>•</span>
          <a className="hover:text-white transition" href="#">Privacy Policy</a>
        </div>
      </div>

      {/* Right Side: Register Form */}
      <div className="flex flex-1 flex-col justify-center items-center px-6 py-12 lg:px-24 bg-[#0B0B0F]">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="flex lg:hidden items-center gap-3 mb-8 justify-center">
            <div className="bg-gradient-to-br from-orange-400 to-orange-600 p-2 rounded-lg">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold tracking-widest text-white">ATHLO</h2>
          </div>

          <div className="mb-10">
            <h2 className="text-3xl font-bold text-white mb-2">Rejoindre ATHLO</h2>
            <p className="text-gray-400">Prêt à transformer vos entraînements ?</p>
          </div>

          {/* Progress Bar STATIQUE (Step 1/3 - 33%) */}
          <div className="flex flex-col gap-3 mb-8">
            <div className="flex gap-6 justify-between items-end">
                <p className="text-white text-sm font-medium">Étape 1 sur 3</p>
                <p className="text-[#ff6a00] text-xs font-bold uppercase tracking-wider">
                    Informations Personnelles
                </p>
            </div>
            <div className="rounded-full bg-[#2a1d15] h-1.5 overflow-hidden">
                <div 
                    className="h-full rounded-full bg-[#ff6a00] transition-all duration-500" 
                    style={{ width: '33.3333%' }}
                ></div>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}

          <div className="space-y-6">
            {/* Role Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Quel est votre rôle ?
              </label>
              <div className="grid grid-cols-3 gap-3">
                {roles.map(role => {
                  const Icon = role.icon;
                  return (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => setSelectedRole(role.id)}
                      className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${
                        selectedRole === role.id
                          ? 'border-[#ff6a00] bg-[#ff6a00]/10 text-white'
                          : 'border-white/10 bg-white/5 text-gray-400 hover:border-[#ff6a00]/50'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${selectedRole === role.id ? 'text-[#ff6a00]' : ''}`} />
                      <span className="text-xs font-semibold">{role.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Name Input */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-400" htmlFor="fullName">
                Nom Complet
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder="John Doe"
                required
                className="w-full rounded-lg bg-white/5 border border-white/10 px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#ff6a00] focus:ring-1 focus:ring-[#ff6a00] transition"
              />
            </div>

            {/* Email Input */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-400" htmlFor="email">
                Adresse Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="john@example.com"
                required
                className="w-full rounded-lg bg-white/5 border border-white/10 px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#ff6a00] focus:ring-1 focus:ring-[#ff6a00] transition"
              />
            </div>

            {/* Password Input */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-400" htmlFor="password">
                Mot de Passe
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  required
                  className="w-full rounded-lg bg-white/5 border border-white/10 px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#ff6a00] focus:ring-1 focus:ring-[#ff6a00] transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-[#ff6a00] hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-lg transition-all shadow-lg shadow-[#ff6a00]/20 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>{loading ? 'Création...' : 'Créer mon compte'}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-gray-500 text-sm">
              Déjà un compte ?{' '}
              <button
                onClick={() => navigate('/login')}
                className="text-[#ff6a00] font-semibold hover:underline decoration-2 underline-offset-4 transition"
              >
                Se connecter
              </button>
            </p>
          </div>

          <p className="mt-12 text-center text-xs text-gray-600">
            En créant un compte, vous acceptez nos{' '}
            <a className="underline" href="#">Conditions d'Utilisation</a> et notre{' '}
            <a className="underline" href="#">Politique de Confidentialité</a>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
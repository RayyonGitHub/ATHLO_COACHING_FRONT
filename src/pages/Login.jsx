import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, Info, Zap } from 'lucide-react';
import { authService } from '../services/authService';

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log("1. Envoi de la demande de connexion..."); // LOG 1

      const response = await authService.login({
        email: formData.email,
        password: formData.password
      });

      console.log("2. Réponse reçue du Back :", response); // LOG 2
      console.log("3. Rôle trouvé :", response.user?.role); // LOG 3

      // Vérification avant redirection
      if (response.user?.role === 'coach') {
        console.log("4. Redirection vers /clients"); // LOG 4
        navigate('/clients');
      } else {
        console.log("4. Redirection vers /"); // LOG 4
        navigate('/');
      }

    } catch (err) {
      console.error("ERREUR :", err); // LOG ERREUR
      setError(err.response?.data?.message || 'Email ou mot de passe incorrect');
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
            Optimisez la performance de vos athlètes.
          </h1>
          <p className="text-lg text-gray-400 max-w-sm">
            La plateforme tout-en-un pour les coachs d'élite et les salles de sport modernes.
          </p>

          <div className="flex gap-2 pt-6">
            <div className="h-1.5 w-12 bg-[#ff6a00] rounded-full"></div>
            <div className="h-1.5 w-12 bg-gray-700 rounded-full"></div>
            <div className="h-1.5 w-12 bg-gray-700 rounded-full"></div>
          </div>
        </div>

        <div className="relative z-10 flex gap-4 text-sm text-gray-500">
          <span>© 2026 ATHLO SaaS</span>
          <span>•</span>
          <a className="hover:text-white transition" href="#">Privacy Policy</a>
        </div>
      </div>

      {/* Right Side: Login Form */}
      <div className="flex flex-1 flex-col justify-center items-center px-6 py-12 lg:px-24 bg-[#0B0B0F]">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="flex lg:hidden items-center gap-3 mb-8 justify-center">
            <div className="bg-gradient-to-br from-orange-400 to-orange-600 p-2 rounded-lg">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold tracking-widest text-white">ATHLO</h2>
          </div>

          <div className="text-center lg:text-left mb-8">
            <h2 className="text-3xl font-bold tracking-tight text-white">Welcome Back</h2>
            <p className="mt-2 text-sm text-gray-400">
              Entrez vos identifiants pour accéder à votre tableau de bord.
            </p>
          </div>

          {/* Info Alert */}
          <div className="mb-6 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-blue-300 leading-relaxed">
              Connectez-vous pour accéder à votre espace de gestion des clients.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}

          <div className="space-y-6">
            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="email">
                Adresse email
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="w-5 h-5 text-gray-500 group-focus-within:text-[#ff6a00] transition-colors" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="coach@athlo.com"
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-[#27272A] rounded-lg bg-[#16161A] placeholder-gray-500 text-white focus:outline-none focus:ring-2 focus:ring-[#ff6a00]/50 focus:border-[#ff6a00] transition duration-200"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-300" htmlFor="password">
                  Mot de passe
                </label>
                <a className="text-xs font-medium text-[#ff6a00] hover:text-orange-600 transition-colors" href="#">
                  Mot de passe oublié ?
                </a>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-gray-500 group-focus-within:text-[#ff6a00] transition-colors" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  required
                  className="block w-full pl-10 pr-10 py-3 border border-[#27272A] rounded-lg bg-[#16161A] placeholder-gray-500 text-white focus:outline-none focus:ring-2 focus:ring-[#ff6a00]/50 focus:border-[#ff6a00] transition duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5 text-gray-500 hover:text-gray-300 transition-colors" />
                  ) : (
                    <Eye className="w-5 h-5 text-gray-500 hover:text-gray-300 transition-colors" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center">
              <input
                id="rememberMe"
                name="rememberMe"
                type="checkbox"
                checked={formData.rememberMe}
                onChange={handleInputChange}
                className="h-4 w-4 text-[#ff6a00] focus:ring-[#ff6a00]/50 border-[#27272A] bg-[#16161A] rounded transition-colors"
              />
              <label className="ml-2 block text-sm text-gray-400" htmlFor="rememberMe">
                Rester connecté
              </label>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-semibold rounded-lg text-white bg-[#ff6a00] hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ff6a00] focus:ring-offset-[#0B0B0F] transition-all duration-200 shadow-lg shadow-orange-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-gray-500 text-sm">
              Pas encore de compte ?{' '}
              <button
                onClick={() => navigate('/register')}
                className="text-[#ff6a00] font-semibold hover:underline decoration-2 underline-offset-4 transition"
              >
                S'inscrire
              </button>
            </p>
            <div className="pt-2 border-t border-[#27272A]/30">
              <button
                onClick={() => navigate('/demo')}
                className="text-gray-400 text-xs hover:text-[#ff6a00] transition-colors flex items-center justify-center gap-2 mx-auto group"
              >
                <Zap className="w-3 h-3 text-[#ff6a00] group-hover:animate-pulse" />
                Pas encore convaincu ? <span className="underline decoration-[#ff6a00]/30 group-hover:decoration-[#ff6a00]">Explorer l'app en mode démo</span>
              </button>
            </div>
          </div>

          <div className="mt-12 flex justify-center gap-6 text-xs text-gray-600">
            <a className="hover:text-gray-400 transition-colors" href="#">Conditions d'utilisation</a>
            <a className="hover:text-gray-400 transition-colors" href="#">Politique de confidentialité</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
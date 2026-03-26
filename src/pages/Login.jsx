import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, Info, Zap, X } from 'lucide-react';
import { authService } from '../services/authService';

const ForgotPasswordModal = ({ isOpen, onClose, onSubmit, loading, successMessage, errorMessage }) => {
  const [email, setEmail] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSubmit(email);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>

      <div className="relative bg-[#0B0B0F] w-full max-w-md p-8 rounded-2xl shadow-2xl border border-white/10">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
          type="button"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-5 h-5 text-[#ff6a00]" />
          </div>
          <h2 className="text-2xl font-bold text-white">Réinitialiser le mot de passe</h2>
          <p className="mt-2 text-sm text-gray-400">
            Entrez votre adresse email pour recevoir un lien de réinitialisation.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {successMessage && (
            <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
              <p className="text-sm text-green-300">{successMessage}</p>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-sm text-red-300">{errorMessage}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5" htmlFor="reset-email">
              Adresse email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="w-5 h-5 text-gray-500" />
              </div>
              <input
                id="reset-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="coach@athlo.com"
                className="block w-full pl-10 pr-3 py-3 bg-[#16161A] border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#ff6a00] focus:border-transparent sm:text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-[#ff6a00] hover:bg-orange-600 text-white font-semibold rounded-lg shadow-lg shadow-orange-500/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Envoi...' : 'Envoyer le lien'}
          </button>

          <div className="text-center">
            <button
              type="button"
              className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
              onClick={onClose}
            >
              Retour à la connexion
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [error, setError] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const openForgotModal = () => {
    setForgotError('');
    setForgotSuccess('');
    setIsForgotModalOpen(true);
  };

  const closeForgotModal = () => {
    setIsForgotModalOpen(false);
    setForgotError('');
    setForgotSuccess('');
  };

  const handleForgotPassword = async (email) => {
    setForgotLoading(true);
    setForgotError('');
    setForgotSuccess('');

    try {
      const response = await authService.forgotPassword(email);
      setForgotSuccess(
        response?.message || 'Si un compte existe avec cet email, un lien de réinitialisation a été envoyé.'
      );
    } catch (err) {
      setForgotError(
        err.response?.data?.message || "Impossible d'envoyer le lien de réinitialisation."
      );
    } finally {
      setForgotLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authService.login({
        email: formData.email,
        password: formData.password,
      });

      const role = response.user?.role;

      if (role === 'coach') {
        navigate('/dashboard');
      } else if (role === 'athlete') {
        navigate('/athlete/dashboard');
      } else if (role === 'prospect') {
        navigate('/prospect/dashboard');
      } else {
        navigate('/login');
      }
    } catch (err) {
      console.error("ERREUR DE CONNEXION :", err);
      setError(err.response?.data?.message || 'Email ou mot de passe incorrect');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex min-h-screen w-full flex-col lg:flex-row bg-[#0B0B0F]">
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

        <div className="flex flex-1 flex-col justify-center items-center px-6 py-12 lg:px-24 bg-[#0B0B0F]">
          <div className="w-full max-w-md">
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

            <div className="mb-6 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-start gap-3">
              <div className="p-1 bg-blue-500/20 rounded">
                <Info className="w-4 h-4 text-blue-400" />
              </div>
              <p className="text-xs text-blue-300 leading-relaxed">
                La redirection s'effectuera automatiquement vers votre espace personnalisé selon votre profil.
              </p>
            </div>

            {error && (
              <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg animate-pulse">
                <p className="text-sm text-red-300">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
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

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-300" htmlFor="password">
                    Mot de passe
                  </label>
                  <button
                    type="button"
                    onClick={openForgotModal}
                    className="text-xs font-medium text-[#ff6a00] hover:text-orange-600 transition-colors"
                  >
                    Mot de passe oublié ?
                  </button>
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

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-semibold rounded-lg text-white bg-[#ff6a00] hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ff6a00] focus:ring-offset-[#0B0B0F] transition-all duration-200 shadow-lg shadow-orange-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Connexion...' : 'Se connecter'}
              </button>
            </form>

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
                  Pas encore convaincu ?{' '}
                  <span className="underline decoration-[#ff6a00]/30 group-hover:decoration-[#ff6a00]">
                    Explorer l'app en mode démo
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ForgotPasswordModal
        isOpen={isForgotModalOpen}
        onClose={closeForgotModal}
        onSubmit={handleForgotPassword}
        loading={forgotLoading}
        successMessage={forgotSuccess}
        errorMessage={forgotError}
      />
    </>
  );
};

export default Login;
import React, { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, ArrowLeft, Trophy } from 'lucide-react';
import prospectService from '../services/prospectService';

const getPasswordStrength = (password) => {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 2) return { label: 'Faible', bars: 1 };
  if (score === 3) return { label: 'Moyen', bars: 2 };
  if (score === 4) return { label: 'Bon', bars: 3 };
  return { label: 'Robuste', bars: 4 };
};

const InviteSetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const token = searchParams.get('token') || '';

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    new_password: '',
    confirm_password: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const strength = useMemo(
    () => getPasswordStrength(formData.new_password),
    [formData.new_password]
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError("Lien d'activation invalide ou incomplet.");
      return;
    }

    if (!formData.new_password || !formData.confirm_password) {
      setError('Veuillez remplir tous les champs.');
      return;
    }

    if (formData.new_password !== formData.confirm_password) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    setLoading(true);

    try {
      await prospectService.setInvitationPassword({
        token,
        new_password: formData.new_password,
        confirm_password: formData.confirm_password,
      });

      setSuccess(true);
    } catch (err) {
      console.error("DÉTAIL DE L'ERREUR 400 :", err.response?.data); // AJOUTE CETTE LIGNE
      setError(
        err.response?.data?.message ||
        err.response?.data?.detail ||
        JSON.stringify(err.response?.data) || // AJOUTE CECI pour voir les erreurs de validation
        "Impossible d'activer le compte."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0e0e12] text-white antialiased selection:bg-[#ff6a00] selection:text-white relative overflow-hidden">
      <div className="fixed inset-0 z-0">
        <img
          className="w-full h-full object-cover opacity-20 grayscale"
          alt="gym"
          src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&q=80"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0e0e12]/80 via-[#0e0e12] to-[#0e0e12]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,106,0,0.08),transparent_40%),radial-gradient(circle_at_bottom_left,rgba(255,106,0,0.05),transparent_40%)]"></div>
      </div>

      <main className="relative z-10 flex min-h-screen flex-col items-center justify-center p-6 lg:p-12">
        <header className="mb-12">
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-[#ff7a31] uppercase italic">
            ATHLO
          </h1>
        </header>

        <section className="w-full max-w-md">
          <div className="bg-[#19191e]/80 backdrop-blur-2xl rounded-xl p-8 md:p-10 shadow-[0_40px_60px_-15px_rgba(0,0,0,0.5)] border border-white/5">
            {success ? (
              <div className="text-center">
                <div className="w-20 h-20 mx-auto bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mb-6 border border-green-500/20">
                  <Trophy size={36} />
                </div>

                <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white leading-tight mb-3">
                  Compte activé
                </h2>
                <p className="text-gray-400 leading-relaxed mb-8">
                  Votre paiement est validé et votre mot de passe a été défini avec succès.
                  Vous pouvez maintenant vous connecter.
                </p>

                <button
                  onClick={() => navigate('/login')}
                  className="w-full h-14 bg-gradient-to-r from-[#ff7a31] to-[#ff915a] text-black font-bold text-base rounded-xl active:scale-[0.98] transition-all duration-200 shadow-lg shadow-orange-500/10"
                >
                  Aller à la connexion
                </button>
              </div>
            ) : (
              <>
                <div className="mb-10 space-y-2">
                  <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white leading-tight">
                    Définir votre mot de passe
                  </h2>
                  <p className="text-gray-400 leading-relaxed">
                    Votre paiement est terminé. Choisissez maintenant votre mot de passe pour activer votre compte.
                  </p>
                </div>

                {error && (
                  <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <p className="text-sm text-red-300">{error}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label
                      className="text-xs font-bold uppercase tracking-widest text-gray-400 block ml-1"
                      htmlFor="new_password"
                    >
                      Nouveau mot de passe
                    </label>
                    <div className="relative group">
                      <input
                        id="new_password"
                        name="new_password"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.new_password}
                        onChange={handleChange}
                        placeholder="••••••••"
                        className="w-full h-14 bg-[#1f1f25] border border-transparent rounded-xl px-4 pr-12 text-white placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-[#ff915a]/30 focus:border-[#ff915a]/20 transition-all duration-200"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#ff915a] transition-colors"
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 px-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400">
                        Force du mot de passe
                      </span>
                      <span className="text-[10px] uppercase tracking-widest font-bold text-[#ff7a31]">
                        {strength.label}
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-2 h-1.5 w-full">
                      {[1, 2, 3, 4].map((bar) => (
                        <div
                          key={bar}
                          className={`rounded-full ${
                            bar <= strength.bars ? 'bg-[#ff7a31]' : 'bg-[#25252b]'
                          }`}
                        ></div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label
                      className="text-xs font-bold uppercase tracking-widest text-gray-400 block ml-1"
                      htmlFor="confirm_password"
                    >
                      Confirmer le mot de passe
                    </label>
                    <div className="relative group">
                      <input
                        id="confirm_password"
                        name="confirm_password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={formData.confirm_password}
                        onChange={handleChange}
                        placeholder="••••••••"
                        className="w-full h-14 bg-[#1f1f25] border border-transparent rounded-xl px-4 pr-12 text-white placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-[#ff915a]/30 focus:border-[#ff915a]/20 transition-all duration-200"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#ff915a] transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full h-14 bg-gradient-to-r from-[#ff7a31] to-[#ff915a] text-black font-bold text-base rounded-xl active:scale-[0.98] transition-all duration-200 shadow-lg shadow-orange-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Activation...' : 'Activer mon compte'}
                    </button>
                  </div>
                </form>

                <div className="mt-8 text-center">
                  <button
                    onClick={() => navigate('/login')}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-[#ff7a31] hover:text-[#ff915a] transition-colors group"
                  >
                    <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                    Retour à la connexion
                  </button>
                </div>
              </>
            )}
          </div>
        </section>

        <footer className="mt-12 text-center max-w-xs opacity-40">
          <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400">
            © 2026 ATHLO Performance Ecosystem. Tous droits réservés.
          </p>
        </footer>
      </main>
    </div>
  );
};

export default InviteSetPassword;
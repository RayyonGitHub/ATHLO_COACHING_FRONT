import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Zap, Dumbbell, Users, Smartphone, TrendingUp, Facebook, Twitter, Instagram, X } from 'lucide-react';

// --- COMPOSANT MODALE POUR LES MENTIONS LÉGALES ---
const LegalModal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#1E1E1E] rounded-3xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-200 border border-white/10">
        <div className="flex justify-between items-center p-6 border-b border-white/10">
          <h3 className="text-2xl font-black text-white italic uppercase tracking-tight">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-orange-500 transition-colors cursor-pointer">
            <X size={24} />
          </button>
        </div>
        <div className="p-6 overflow-y-auto text-gray-300 text-sm space-y-4 custom-scrollbar">
          {children}
        </div>
        <div className="p-6 border-t border-white/10 flex justify-end">
          <button onClick={onClose} className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-all shadow-md active:scale-95 cursor-pointer">
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

const Home = () => {
  // États pour contrôler l'ouverture des modales
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);

  return (
    <div className="bg-[#0B0B0F] text-gray-100 antialiased selection:bg-orange-500 selection:text-white transition-colors duration-300 min-h-screen">
      {/* NAVIGATION */}
      <nav className="fixed w-full z-50 top-0 left-0 bg-[#0B0B0F]/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex-shrink-0 flex items-center gap-3">
              <div className="bg-gradient-to-br from-orange-400 to-orange-600 p-2 rounded-lg shadow-lg shadow-orange-500/20">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight text-white">ATHLO</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-400 hover:text-orange-500 transition-colors text-sm font-medium">Fonctionnalités</a>
              <Link to="/login" className="text-white font-medium text-sm hover:text-orange-500 transition-colors">Connexion</Link>
              <Link to="/register" className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all shadow-lg shadow-orange-500/20">
                Inscription
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <div className="relative pt-32 pb-16 sm:pt-48 sm:pb-32 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 opacity-20">
          <div className="absolute top-24 left-1/4 w-96 h-96 bg-orange-500 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600 rounded-full blur-[120px]"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center px-3 py-1 rounded-full border border-orange-500/30 bg-orange-500/10 text-orange-500 text-xs font-semibold uppercase tracking-wide mb-8">
            <span className="w-2 h-2 rounded-full bg-orange-500 mr-2 animate-pulse"></span>
            Nouveau: Intégration Garmin avancée
          </div>
          <h1 className="text-5xl sm:text-7xl font-black tracking-tight mb-6 text-white leading-tight">
            Dépassez vos limites avec <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">ATHLO</span>
          </h1>
          <p className="mt-4 text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            La plateforme tout-en-un pour coachs sportifs d'élite. Gérez vos athlètes, créez des programmes sur mesure et suivez les progrès en temps réel.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="flex items-center justify-center px-10 py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-2xl shadow-xl shadow-orange-500/25 transition-all transform hover:-translate-y-1">
              <Dumbbell className="mr-2 w-5 h-5" /> Devenir coach
            </Link>
            <Link to="/demo" className="flex items-center justify-center px-10 py-4 bg-white/5 border-2 border-orange-500 text-orange-500 font-bold rounded-2xl hover:bg-orange-500/10 transition-all shadow-lg shadow-orange-500/10">
              <TrendingUp className="mr-2 w-5 h-5" /> Essayer la démo
            </Link>
          </div>
        </div>
      </div>

      {/* STATS SECTION */}
      <section className="py-20 border-y border-white/5 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { val: "500+", label: "Coachs élite" },
            { val: "10k+", label: "Athlètes" },
            { val: "98%", label: "Satisfaction" },
            { val: "24/7", label: "Support" }
          ].map((stat, i) => (
            <div key={i}>
              <div className="text-4xl font-black text-white mb-1">{stat.val}</div>
              <div className="text-xs font-bold text-orange-500 uppercase tracking-widest">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* MARQUES PARTENAIRES */}
      <div className="py-12 border-b border-white/5 w-full bg-[#0B0B0F]">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-sm text-gray-500 font-medium uppercase tracking-widest mb-6">Utilisé par les meilleurs coachs et gyms</p>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
            <div className="flex items-center gap-2 font-black text-xl text-gray-200"><Zap className="w-6 h-6" /> POWERGYM</div>
            <div className="flex items-center gap-2 font-black text-xl text-gray-200"><TrendingUp className="w-6 h-6" /> FLOWSTATE</div>
            <div className="flex items-center gap-2 font-black text-xl text-gray-200"><Users className="w-6 h-6" /> PEAKPERF</div>
          </div>
        </div>
      </div>

      {/* SECTION FONCTIONNALITÉS (Tout-en-un) */}
      <section id="features" className="py-24 bg-[#0f0f13]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-orange-500 font-bold tracking-wide uppercase text-sm mb-2">Tout-en-un</h2>
            <h3 className="text-3xl sm:text-4xl font-black text-white mb-4">Une suite complète pour l'excellence</h3>
            <p className="max-w-2xl mx-auto text-lg text-gray-400">
              Oubliez les feuilles de calcul et les emails dispersés. Centralisez votre coaching.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Carte 1 */}
            <div className="p-8 bg-white/5 rounded-2xl border border-white/10 hover:border-orange-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/5 flex flex-col">
              <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center mb-6 text-orange-500">
                <Users className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold text-white mb-3">CRM Athlètes</h4>
              <p className="text-gray-400 leading-relaxed">
                Gérez les profils, les objectifs et l'historique de chaque athlète. Une vue à 360° pour un suivi ultra-personnalisé.
              </p>
            </div>

            {/* Carte 2 */}
            <div className="p-8 bg-white/5 rounded-2xl border border-white/10 hover:border-orange-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/5 flex flex-col">
              <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center mb-6 text-orange-500">
                <Dumbbell className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold text-white mb-3">Program Builder</h4>
              <p className="text-gray-400 leading-relaxed">
                Créez des programmes d'entraînement complexes en quelques clics. Glissez-déposez, périodisation, et exercices.
              </p>
            </div>

            {/* Carte 3 */}
            <div className="p-8 bg-white/5 rounded-2xl border border-white/10 hover:border-orange-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/5 flex flex-col">
              <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center mb-6 text-orange-500">
                <Smartphone className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold text-white mb-3">Intégrations Smart</h4>
              <p className="text-gray-400 leading-relaxed">
                Synchronisation automatique avec Strava, Garmin, Apple Health. Récupérez les données de performance sans effort.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="relative py-24 overflow-hidden border-t border-white/5">
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-5xl font-black text-white mb-6">Prêt à transformer votre coaching ?</h2>
          <p className="text-xl text-gray-300 mb-10">Rejoignez la communauté ATHLO dès aujourd'hui et faites passer vos athlètes au niveau supérieur.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/register" className="px-8 py-4 bg-orange-500 text-white rounded-xl font-bold text-lg hover:bg-orange-600 shadow-lg shadow-orange-500/30 transition-transform transform hover:scale-105">
              Commencer l'essai gratuit
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER ÉPURÉ */}
      <footer className="bg-[#0B0B0F] border-t border-white/10 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
            
            {/* Colonne Marque */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-6 h-6 text-orange-500" />
                <span className="font-black text-xl text-white">ATHLO</span>
              </div>
              <p className="text-sm text-gray-400 mb-6 max-w-sm">La plateforme de référence pour les professionnels du sport. Gérez vos coachings avec des outils de pointe.</p>
              <div className="flex gap-4">
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                  <Facebook className="w-5 h-5 text-gray-400 hover:text-orange-500 cursor-pointer transition-colors" />
                </a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                  <Twitter className="w-5 h-5 text-gray-400 hover:text-orange-500 cursor-pointer transition-colors" />
                </a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                  <Instagram className="w-5 h-5 text-gray-400 hover:text-orange-500 cursor-pointer transition-colors" />
                </a>
              </div>
            </div>

            {/* Colonne Légal (Boutons Pop-ups) */}
            <div className="md:text-right flex flex-col md:items-end">
              <h5 className="uppercase text-xs font-bold text-white mb-4 tracking-wider">Légal</h5>
              <ul className="space-y-3 text-sm text-gray-400">
                <li>
                  <button onClick={() => setIsPrivacyOpen(true)} className="hover:text-orange-500 transition-colors text-left cursor-pointer">
                    Politique de confidentialité
                  </button>
                </li>
                <li>
                  <button onClick={() => setIsTermsOpen(true)} className="hover:text-orange-500 transition-colors text-left cursor-pointer">
                    Conditions Générales d'Utilisation
                  </button>
                </li>
              </ul>
            </div>

          </div>

          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
            <p>© {new Date().getFullYear()} ATHLO Inc. Tous droits réservés.</p>
            <p className="mt-4 md:mt-0 cursor-pointer hover:text-orange-500 transition-colors">Français</p>
          </div>
        </div>
      </footer>

      {/* --- MODALES LÉGALES --- */}
      <LegalModal 
        isOpen={isPrivacyOpen} 
        onClose={() => setIsPrivacyOpen(false)} 
        title="Politique de confidentialité"
      >
        <div className="space-y-4">
          <p><strong>Dernière mise à jour :</strong> {new Date().toLocaleDateString('fr-FR')}</p>
          <p>Chez ATHLO, nous attachons une grande importance à la protection et au respect de votre vie privée. Cette politique explique comment nous collectons, utilisons, et partageons vos informations personnelles lorsque vous utilisez notre plateforme.</p>
          <h4 className="font-bold text-gray-200 pt-2">1. Données collectées</h4>
          <p>Nous collectons les données que vous nous fournissez directement (nom, email, informations de profil, données d'entraînement) ainsi que les données générées par votre utilisation de la plateforme (statistiques de connexion, appareils utilisés).</p>
          <h4 className="font-bold text-gray-200 pt-2">2. Utilisation des données</h4>
          <p>Vos données sont utilisées pour : fournir, maintenir et améliorer nos services ; traiter les paiements sécurisés via Stripe ; vous envoyer des notifications liées à vos programmes ; assurer le support technique.</p>
          <h4 className="font-bold text-gray-200 pt-2">3. Partage des données</h4>
          <p>Nous ne vendons jamais vos données à des tiers. Nous pouvons partager certaines données strictement nécessaires avec nos prestataires de services sécurisés (hébergement, traitement des paiements).</p>
        </div>
      </LegalModal>

      <LegalModal 
        isOpen={isTermsOpen} 
        onClose={() => setIsTermsOpen(false)} 
        title="Conditions Générales (CGU)"
      >
        <div className="space-y-4">
          <p><strong>Dernière mise à jour :</strong> {new Date().toLocaleDateString('fr-FR')}</p>
          <p>Bienvenue sur ATHLO. En utilisant notre plateforme, vous acceptez les présentes Conditions Générales d'Utilisation.</p>
          <h4 className="font-bold text-gray-200 pt-2">1. Description du service</h4>
          <p>ATHLO fournit une solution logicielle (SaaS) pour les coachs sportifs et leurs clients. Le service permet la création de programmes, le suivi des performances et la gestion des paiements via des partenaires tiers (Stripe).</p>
          <h4 className="font-bold text-gray-200 pt-2">2. Responsabilité de l'utilisateur</h4>
          <p>Vous êtes responsable de l'exactitude des informations fournies et de la sécurité de vos identifiants. Les coachs sont seuls responsables des conseils et programmes sportifs délivrés à leurs athlètes via la plateforme.</p>
          <h4 className="font-bold text-gray-200 pt-2">3. Paiements et Abonnements</h4>
          <p>Certains services d'ATHLO sont soumis à un abonnement payant. Les paiements sont sécurisés et non remboursables, sauf disposition légale contraire ou mention explicite sur la plateforme.</p>
          <h4 className="font-bold text-gray-200 pt-2">4. Propriété intellectuelle</h4>
          <p>Le contenu, le logo et l'architecture logicielle d'ATHLO sont protégés par le droit d'auteur. Toute reproduction non autorisée est strictement interdite.</p>
        </div>
      </LegalModal>

    </div>
  );
};

export default Home;

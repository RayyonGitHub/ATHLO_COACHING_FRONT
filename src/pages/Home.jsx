import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, Dumbbell, Search, Users, Smartphone, TrendingUp, ArrowRight, Github, Twitter, Instagram } from 'lucide-react';

const Home = () => {
  return (
    <div className="bg-background-light dark:bg-[#0B0B0F] text-gray-900 dark:text-gray-100 antialiased selection:bg-orange-500 selection:text-white transition-colors duration-300 min-h-screen">

      {/* NAVIGATION */}
      <nav className="fixed w-full z-50 top-0 left-0 bg-white/80 dark:bg-[#0B0B0F]/80 backdrop-blur-md border-b border-gray-200 dark:border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex-shrink-0 flex items-center gap-3">
              <div className="bg-gradient-to-br from-orange-400 to-orange-600 p-2 rounded-lg shadow-lg shadow-orange-500/20">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight dark:text-white">ATHLO</span>
            </div>

            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-600 dark:text-gray-400 hover:text-orange-500 transition-colors text-sm font-medium">Fonctionnalités</a>
              <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-orange-500 transition-colors text-sm font-medium">Prix</a>
              <Link to="/login" className="text-gray-900 dark:text-white font-medium text-sm hover:text-orange-500 transition-colors">Connexion</Link>
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

          <h1 className="text-5xl sm:text-7xl font-black tracking-tight mb-6 dark:text-white leading-tight">
            Dépassez vos limites avec <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">ATHLO</span>
          </h1>

          <p className="mt-4 text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            La plateforme tout-en-un pour coachs sportifs d’élite. Gérez vos athlètes, créez des programmes sur mesure et suivez les progrès en temps réel.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="flex items-center justify-center px-10 py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-2xl shadow-xl shadow-orange-500/25 transition-all transform hover:-translate-y-1">
              <Dumbbell className="mr-2 w-5 h-5" /> Devenir coach
            </Link>
            {/* On le prépare pour l'Issue #F7 (Le mode Démo / Annuaire public) */}

            <Link to="/demo" className="flex items-center justify-center px-10 py-4 bg-white dark:bg-white/5 border-2 border-orange-500 text-orange-500 font-bold rounded-2xl hover:bg-orange-50 dark:hover:bg-orange-500/10 transition-all shadow-lg shadow-orange-500/10">
              <TrendingUp className="mr-2 w-5 h-5" /> Essayer la démo
            </Link>
          </div>
        </div>
      </div>

      {/* STATS SECTION */}
      <section className="py-20 border-y border-gray-200 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { val: "500+", label: "Coachs Élite" },
            { val: "10k+", label: "Athlètes" },
            { val: "98%", label: "Satisfaction" },
            { val: "24/7", label: "Support" }
          ].map((stat, i) => (
            <div key={i}>
              <div className="text-4xl font-black dark:text-white mb-1">{stat.val}</div>
              <div className="text-xs font-bold text-orange-500 uppercase tracking-widest">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* MARQUES PARTENAIRES */}
      <div className="py-12 border-b border-gray-200 dark:border-white/5 w-full bg-white dark:bg-[#0B0B0F]">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-500 font-medium uppercase tracking-widest mb-6">Utilisé par les meilleurs coachs et gyms</p>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
            <div className="flex items-center gap-2 font-black text-xl text-gray-800 dark:text-gray-200"><Zap className="w-6 h-6" /> POWERGYM</div>
            <div className="flex items-center gap-2 font-black text-xl text-gray-800 dark:text-gray-200"><TrendingUp className="w-6 h-6" /> FLOWSTATE</div>
            <div className="flex items-center gap-2 font-black text-xl text-gray-800 dark:text-gray-200"><Users className="w-6 h-6" /> PEAKPERF</div>
          </div>
        </div>
      </div>

      {/* SECTION FONCTIONNALITÉS (Tout-en-un) */}
      <section id="features" className="py-24 bg-white dark:bg-[#0f0f13]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-orange-500 font-bold tracking-wide uppercase text-sm mb-2">Tout-en-un</h2>
            <h3 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white mb-4">Une suite complète pour l'excellence</h3>
            <p className="max-w-2xl mx-auto text-lg text-gray-500 dark:text-gray-400">
              Oubliez les feuilles de calcul et les emails dispersés. Centralisez votre coaching.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Carte 1 */}
            <div className="p-8 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 hover:border-orange-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/5">
              <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center mb-6 text-orange-500">
                <Users className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-3">CRM Athlètes</h4>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                Gérez les profils, les objectifs et l'historique de chaque athlète. Une vue à 360° pour un suivi ultra-personnalisé.
              </p>
              <a href="#" className="inline-flex items-center text-orange-500 font-bold hover:text-orange-600">En savoir plus <ArrowRight className="w-4 h-4 ml-1" /></a>
            </div>
            {/* Carte 2 */}
            <div className="p-8 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 hover:border-orange-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/5">
              <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center mb-6 text-orange-500">
                <Dumbbell className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Program Builder</h4>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                Créez des programmes d'entraînement complexes en quelques clics. Glissez-déposez, périodisation, et exercices.
              </p>
              <a href="#" className="inline-flex items-center text-orange-500 font-bold hover:text-orange-600">En savoir plus <ArrowRight className="w-4 h-4 ml-1" /></a>
            </div>
            {/* Carte 3 */}
            <div className="p-8 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 hover:border-orange-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/5">
              <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center mb-6 text-orange-500">
                <Smartphone className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Intégrations Smart</h4>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                Synchronisation automatique avec Strava, Garmin, Apple Health. Récupérez les données de performance sans effort.
              </p>
              <a href="#" className="inline-flex items-center text-orange-500 font-bold hover:text-orange-600">En savoir plus <ArrowRight className="w-4 h-4 ml-1" /></a>
            </div>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="relative py-24 overflow-hidden border-t border-gray-200 dark:border-white/5">
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-5xl font-black text-gray-900 dark:text-white mb-6">Prêt à transformer votre coaching ?</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-10">Rejoignez la communauté ATHLO dès aujourd'hui et faites passer vos athlètes au niveau supérieur.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/register" className="px-8 py-4 bg-orange-500 text-white rounded-xl font-bold text-lg hover:bg-orange-600 shadow-lg shadow-orange-500/30 transition-transform transform hover:scale-105">
              Commencer l'essai gratuit
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER COMPLET */}
      <footer className="bg-white dark:bg-[#0B0B0F] border-t border-gray-200 dark:border-white/10 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-6 h-6 text-orange-500" />
                <span className="font-black text-xl dark:text-white">ATHLO</span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">La plateforme de référence pour les professionnels du sport.</p>
              <div className="flex gap-4">
                <Github className="w-5 h-5 text-gray-400 hover:text-orange-500 cursor-pointer" />
                <Twitter className="w-5 h-5 text-gray-400 hover:text-orange-500 cursor-pointer" />
                <Instagram className="w-5 h-5 text-gray-400 hover:text-orange-500 cursor-pointer" />
              </div>
            </div>
            <div>
              <h5 className="uppercase text-xs font-bold text-gray-900 dark:text-white mb-4 tracking-wider">Produit</h5>
              <ul className="space-y-3 text-sm text-gray-500 dark:text-gray-400">
                <li><a href="#" className="hover:text-orange-500">CRM</a></li>
                <li><a href="#" className="hover:text-orange-500">Programmes</a></li>
                <li><a href="#" className="hover:text-orange-500">Analytiques</a></li>
              </ul>
            </div>
            <div>
              <h5 className="uppercase text-xs font-bold text-gray-900 dark:text-white mb-4 tracking-wider">Ressources</h5>
              <ul className="space-y-3 text-sm text-gray-500 dark:text-gray-400">
                <li><a href="#" className="hover:text-orange-500">Blog</a></li>
                <li><a href="#" className="hover:text-orange-500">Guides</a></li>
                <li><a href="#" className="hover:text-orange-500">Support</a></li>
              </ul>
            </div>
            <div>
              <h5 className="uppercase text-xs font-bold text-gray-900 dark:text-white mb-4 tracking-wider">Légal</h5>
              <ul className="space-y-3 text-sm text-gray-500 dark:text-gray-400">
                <li><a href="#" className="hover:text-orange-500">Confidentialité</a></li>
                <li><a href="#" className="hover:text-orange-500">CGU</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 dark:border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
            <p>© 2026 ATHLO Inc. Tous droits réservés.</p>
            <p className="mt-4 md:mt-0 cursor-pointer hover:text-orange-500">Français</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
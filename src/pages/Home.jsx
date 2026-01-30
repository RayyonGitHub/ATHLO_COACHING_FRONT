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
            <Link to="#" className="flex items-center justify-center px-10 py-4 border border-gray-300 dark:border-white/10 dark:text-white font-bold rounded-2xl hover:bg-gray-100 dark:hover:bg-white/5 transition-all">
              <Search className="mr-2 w-5 h-5" /> Trouver un coach
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

      {/* FOOTER SIMPLE */}
      <footer className="py-12 border-t border-gray-200 dark:border-white/5">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6 text-gray-500 text-sm">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-orange-500" />
            <span className="font-bold text-gray-900 dark:text-white">ATHLO</span>
            <span>© 2026</span>
          </div>
          <div className="flex gap-8">
            <a href="#" className="hover:text-orange-500 transition-colors">Confidentialité</a>
            <a href="#" className="hover:text-orange-500 transition-colors">CGU</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';

const ResponsableLayout = () => {
  const location = useLocation();

  const isActive = (path) => location.pathname.includes(path);

  return (
    <div className="flex min-h-screen overflow-x-hidden bg-[#0e0e12] text-[#fcf8fe] font-sans selection:bg-[#ff915a]/30">
      <style>{`
        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
      `}</style>

      {/* SIDEBAR NAVIGATION */}
      <aside className="fixed left-0 top-0 h-full z-40 bg-[#131317] border-r border-[#48474c]/10 w-64 flex flex-col font-sans tracking-tight shadow-none">
        <div className="px-6 py-8">
          <h1 className="text-2xl font-bold text-[#ff915a] tracking-wider">ATHLO</h1>
          <p className="text-[10px] text-[#acaab0] uppercase tracking-[0.2em] -mt-1 font-bold">Responsable Salle</p>
        </div>
        
        <nav className="flex-grow px-3 space-y-1">
          <Link 
            to="/responsable/dashboard" 
            className={`flex items-center px-4 py-3 transition-transform active:scale-95 group ${
              isActive('dashboard') 
                ? 'bg-[#1f1f25] text-[#fcf8fe] border-l-4 border-[#ff915a]' 
                : 'text-[#acaab0] hover:bg-[#1f1f25] transition-colors'
            }`}
          >
            <span className={`material-symbols-outlined mr-3 ${isActive('dashboard') ? 'text-[#ff915a]' : ''}`}>dashboard</span>
            <span>Dashboard</span>
          </Link>
          
          <Link 
            to="/responsable/planning" 
            className={`flex items-center px-4 py-3 transition-transform active:scale-95 group ${
              isActive('planning') 
                ? 'bg-[#1f1f25] text-[#fcf8fe] border-l-4 border-[#ff915a]' 
                : 'text-[#acaab0] hover:bg-[#1f1f25] transition-colors'
            }`}
          >
            <span className="material-symbols-outlined mr-3">calendar_today</span>
            <span>Planning & Salles</span>
          </Link>

          <Link 
            to="/responsable/coachs" 
            className={`flex items-center px-4 py-3 transition-transform active:scale-95 group ${
              isActive('coachs') 
                ? 'bg-[#1f1f25] text-[#fcf8fe] border-l-4 border-[#ff915a]' 
                : 'text-[#acaab0] hover:bg-[#1f1f25] transition-colors'
            }`}
          >
            <span className="material-symbols-outlined mr-3">groups</span>
            <span>Supervision Coachs</span>
          </Link>

          <Link 
            to="/responsable/cours" 
            className={`flex items-center px-4 py-3 transition-transform active:scale-95 group ${
              isActive('cours') 
                ? 'bg-[#1f1f25] text-[#fcf8fe] border-l-4 border-[#ff915a]' 
                : 'text-[#acaab0] hover:bg-[#1f1f25] transition-colors'
            }`}
          >
            <span className="material-symbols-outlined mr-3">fitness_center</span>
            <span>Cours Collectifs</span>
          </Link>

          <Link 
            to="/responsable/ressources" 
            className={`flex items-center px-4 py-3 transition-transform active:scale-95 group ${
              isActive('ressources') 
                ? 'bg-[#1f1f25] text-[#fcf8fe] border-l-4 border-[#ff915a]' 
                : 'text-[#acaab0] hover:bg-[#1f1f25] transition-colors'
            }`}
          >
            <span className="material-symbols-outlined mr-3">folder_shared</span>
            <span>Ressources</span>
          </Link>
        </nav>
        
        <div className="px-3 pb-8 space-y-1 border-t border-[#48474c]/10 pt-4">
          <Link to="/responsable/parametres" className="flex items-center px-4 py-3 text-[#acaab0] hover:bg-[#1f1f25] transition-all duration-200 group">
            <span className="material-symbols-outlined mr-3">settings</span>
            <span>Paramètres</span>
          </Link>
          <button 
            onClick={() => { localStorage.removeItem('user'); localStorage.removeItem('access_token'); window.location.href = '/login'; }} 
            className="w-full flex items-center px-4 py-3 text-[#ff7351] hover:bg-[#1f1f25] transition-all duration-200 group"
          >
            <span className="material-symbols-outlined mr-3">logout</span>
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT WRAPPER */}
      <div className="flex-grow ml-64 flex flex-col min-w-0">
        
        {/* TOP APP BAR */}
        <header className="sticky top-0 z-30 bg-[#0e0e12]/80 backdrop-blur-xl flex justify-between items-center w-full px-8 py-4 shadow-[0_20px_40px_rgba(0,0,0,0.3)] border-b border-[#48474c]/10">
          <div className="flex items-center gap-6">
            <h2 className="font-headline text-lg uppercase tracking-widest text-[#fcf8fe] font-black">ATHLO Management</h2>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex gap-4">
              <span className="material-symbols-outlined text-[#acaab0] hover:text-[#ff915a] cursor-pointer transition-colors">notifications</span>
              <span className="material-symbols-outlined text-[#acaab0] hover:text-[#ff915a] cursor-pointer transition-colors">account_circle</span>
            </div>
            <button className="bg-[#1f1f25] text-[#acaab0] px-6 py-2 rounded-xl text-sm font-bold border border-[#48474c]/20 hover:text-[#ff915a] transition-all">
              Mode Opérationnel
            </button>
          </div>
        </header>

        {/* OUTLET POUR INJECTER LA PAGE COURANTE */}
        <div className="flex-1">
          <Outlet />
        </div>

      </div>
    </div>
  );
};

export default ResponsableLayout;
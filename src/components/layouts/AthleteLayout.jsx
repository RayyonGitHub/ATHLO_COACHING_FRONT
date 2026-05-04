import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
// 1. IMPORTATION DE TA VRAIE CLOCHE
import AthleteNotificationBell from "../AthleteNotificationBell";

const AthleteLayout = ({ user }) => {
  const location = useLocation();
  const userName = user?.prenom || user?.name || "Athlète";

  const isActive = (path) => location.pathname.includes(path);

  return (
    <div className="bg-[#121212] text-gray-100 min-h-screen font-sans">
      <div className="flex h-screen overflow-hidden">

        {/* --- SIDEBAR (ASIDE) --- */}
        <aside className="w-20 lg:w-64 flex flex-col justify-between bg-[#1E1E1E] border-r border-[#2D2D2D] transition-all duration-300 z-20">
          <div>
            <div className="h-20 flex items-center justify-center lg:justify-start lg:px-8 border-b border-[#2D2D2D]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-[#FF6B00] to-[#FF9E00] flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-[#FF6B00]/20">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <span className="hidden lg:block text-2xl font-bold tracking-widest text-white">ATHLO</span>
              </div>
            </div>

            <nav className="mt-8 flex flex-col gap-2 px-3">
              <Link to="/athlete/dashboard" className={`flex items-center gap-4 px-3 py-3 lg:px-5 lg:py-3 rounded-xl transition-colors group ${isActive('dashboard') ? 'bg-[#FF6B00]/10 text-[#FF6B00] font-medium' : 'text-gray-400 hover:bg-[#2D2D2D]'}`}>
                <span className="material-icons-round text-2xl group-hover:text-[#FF6B00]">dashboard</span>
                <span className="hidden lg:block font-medium">Tableau de bord</span>
              </Link>

              
              <Link to="/athlete/calendar" className={`flex items-center gap-4 px-3 py-3 lg:px-5 lg:py-3 rounded-xl transition-colors group ${isActive('calendar') ? 'bg-[#FF6B00]/10 text-[#FF6B00] font-medium' : 'text-gray-400 hover:bg-[#2D2D2D]'}`}>
                <span className="material-icons-round text-2xl group-hover:text-[#FF6B00]">calendar_today</span>
                <span className="hidden lg:block font-medium">Calendrier</span>
              </Link>

              <Link to="/athlete/programmes" className={`flex items-center gap-4 px-3 py-3 lg:px-5 lg:py-3 rounded-xl transition-colors group ${isActive('programmes') ? 'bg-[#FF6B00]/10 text-[#FF6B00] font-medium' : 'text-gray-400 hover:bg-[#2D2D2D]'}`}>
                <span className="material-icons-round text-2xl group-hover:text-[#FF6B00]">fitness_center</span>
                <span className="hidden lg:block font-medium">Programmes</span>
              </Link>

              <Link to="/athlete/statistiques" className={`flex items-center gap-4 px-3 py-3 lg:px-5 lg:py-3 rounded-xl transition-colors group ${isActive('statistiques') ? 'bg-[#FF6B00]/10 text-[#FF6B00] font-medium' : 'text-gray-400 hover:bg-[#2D2D2D]'}`}>
                <span className="material-icons-round text-2xl group-hover:text-[#FF6B00]">bar_chart</span>
                <span className="hidden lg:block font-medium">Statistiques</span>
              </Link>

              <Link to="/athlete/messages" className={`flex items-center gap-4 px-3 py-3 lg:px-5 lg:py-3 rounded-xl transition-colors group ${isActive('messages') ? 'bg-[#FF6B00]/10 text-[#FF6B00] font-medium' : 'text-gray-400 hover:bg-[#2D2D2D]'}`}>
                <span className="material-icons-round text-2xl group-hover:text-[#FF6B00]">chat</span>
                <span className="hidden lg:block font-medium">Messagerie</span>
              </Link>
              {/* --- LIEN FACTURES À AJOUTER --- */}
              <Link 
                to="/athlete/factures" 
                className={`flex items-center gap-4 px-3 py-3 lg:px-5 lg:py-3 rounded-xl transition-colors group ${isActive('factures') ? 'bg-[#FF6B00]/10 text-[#FF6B00] font-medium' : 'text-gray-400 hover:bg-[#2D2D2D]'}`}
              >
                <span className="material-icons-round text-2xl group-hover:text-[#FF6B00]">receipt_long</span>
                <span className="hidden lg:block font-medium">Factures</span>
              </Link>
              <Link to="/athlete/parametres" className={`flex items-center gap-4 px-3 py-3 lg:px-5 lg:py-3 rounded-xl transition-colors group ${isActive('parametres') ? 'bg-[#FF6B00]/10 text-[#FF6B00] font-medium' : 'text-gray-400 hover:bg-[#2D2D2D]'}`}>
                <span className="material-icons-round text-2xl group-hover:text-[#FF6B00]">settings</span>
                <span className="hidden lg:block font-medium">Paramètres</span>
              </Link>
            </nav>
          </div>

          <div className="p-4 border-t border-[#2D2D2D]">
            <button
              onClick={() => { localStorage.clear(); window.location.href='/login'; }}
              className="flex items-center gap-4 px-3 py-3 lg:px-5 lg:py-3 rounded-xl text-red-500 hover:bg-red-500/10 transition-colors w-full group"
            >
              <span className="material-icons-round text-2xl group-hover:text-red-500">logout</span>
              <span className="hidden lg:block font-medium">Déconnexion</span>
            </button>
          </div>
        </aside>

        {/* --- MAIN CONTENT --- */}
        <main className="flex-1 overflow-y-auto relative bg-[#121212] flex flex-col">
          <header className="sticky top-0 z-50 bg-[#121212]/80 backdrop-blur-md px-8 py-6 flex justify-between items-center border-b border-[#2D2D2D]">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-white italic tracking-tighter uppercase">
                Espace <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF6B00] to-[#FF9E00]">Athlète</span>
              </h1>
            </div>

            {/* 2. REMPLACEMENT DU BOUTON STATIQUE PAR TON COMPOSANT DYNAMIQUE */}
            <div className="flex items-center gap-4">
              <AthleteNotificationBell />
            </div>
          </header>

          <div className="flex-1 p-6 lg:p-8 min-h-0">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AthleteLayout;
import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';

const ProspectLayout = () => {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const navClass = (path) =>
    `flex items-center gap-4 px-3 py-3 lg:px-5 lg:py-3 rounded-xl transition-colors group ${
      isActive(path)
        ? 'bg-[#FF6B00]/10 text-[#FF6B00] font-medium'
        : 'text-gray-400 hover:bg-[#2D2D2D]'
    }`;

  return (
    <div className="bg-[#121212] text-gray-100 min-h-screen font-sans">
      <div className="flex h-screen overflow-hidden">
        <aside className="w-20 lg:w-64 flex flex-col justify-between bg-[#1E1E1E] border-r border-[#2D2D2D] transition-all duration-300 z-20">
          <div>
            <div className="h-20 flex items-center justify-center lg:justify-start lg:px-8 border-b border-[#2D2D2D]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-[#FF6B00] to-[#FF9E00] flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-[#FF6B00]/20">
                  A
                </div>
                <span className="hidden lg:block text-2xl font-bold tracking-widest text-white">ATHLO</span>
              </div>
            </div>

            <nav className="mt-8 flex flex-col gap-2 px-3">
              <Link to="/prospect/dashboard" className={navClass('/prospect/dashboard')}>
                <span className="material-icons-round text-2xl">explore</span>
                <span className="hidden lg:block">Explorer</span>
              </Link>

              <Link to="/prospect/salles" className={navClass('/prospect/salles')}>
                <span className="material-icons-round text-2xl">fitness_center</span>
                <span className="hidden lg:block">Salles proches</span>
              </Link>

              <Link to="/prospect/devis" className={navClass('/prospect/devis')}>
                <span className="material-icons-round text-2xl">assignment</span>
                <span className="hidden lg:block">Mes devis</span>
              </Link>
            </nav>
          </div>

          <div className="p-4 border-t border-[#2D2D2D]">
            <button
              onClick={() => {
                localStorage.clear();
                window.location.href = '/login';
              }}
              className="flex items-center gap-4 px-3 py-3 lg:px-5 lg:py-3 rounded-xl text-red-500 hover:bg-red-500/10 transition-colors w-full group"
            >
              <span className="material-icons-round text-2xl group-hover:text-red-500">logout</span>
              <span className="hidden lg:block font-medium">Déconnexion</span>
            </button>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto bg-[#121212]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default ProspectLayout;
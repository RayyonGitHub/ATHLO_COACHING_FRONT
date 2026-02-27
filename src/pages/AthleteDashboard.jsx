import React from 'react';

const AthleteDashboard = () => {
  return (
    <div className="bg-[#121212] text-gray-100 min-h-screen font-sans">
      <div className="flex h-screen overflow-hidden">
        
        {/* SIDEBAR */}
        <aside className="w-20 lg:w-64 flex flex-col justify-between bg-[#1E1E1E] border-r border-[#2D2D2D] transition-all duration-300 z-20">
          <div>
            <div className="h-20 flex items-center justify-center lg:justify-start lg:px-8 border-b border-[#2D2D2D]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#FF6B00] to-[#FF9E00] flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-[#FF6B00]/20">
                  A
                </div>
                <span className="hidden lg:block text-2xl font-bold tracking-widest text-white" style={{ fontFamily: 'Montserrat, sans-serif' }}>ATHLO</span>
              </div>
            </div>
            <nav className="mt-8 flex flex-col gap-2 px-3">
              <a className="flex items-center gap-4 px-3 py-3 lg:px-5 lg:py-3 rounded-xl bg-[#FF6B00]/10 text-[#FF6B00] font-medium" href="#">
                <span className="material-icons-round text-2xl">dashboard</span>
                <span className="hidden lg:block">Tableau de bord</span>
              </a>
              <a className="flex items-center gap-4 px-3 py-3 lg:px-5 lg:py-3 rounded-xl text-gray-400 hover:bg-[#2D2D2D] transition-colors group" href="#">
                <span className="material-icons-round text-2xl group-hover:text-[#FF6B00] transition-colors">calendar_today</span>
                <span className="hidden lg:block font-medium">Calendrier</span>
              </a>
              <a className="flex items-center gap-4 px-3 py-3 lg:px-5 lg:py-3 rounded-xl text-gray-400 hover:bg-[#2D2D2D] transition-colors group" href="#">
                <span className="material-icons-round text-2xl group-hover:text-[#FF6B00] transition-colors">fitness_center</span>
                <span className="hidden lg:block font-medium">Programmes</span>
              </a>
              <a className="flex items-center gap-4 px-3 py-3 lg:px-5 lg:py-3 rounded-xl text-gray-400 hover:bg-[#2D2D2D] transition-colors group" href="#">
                <span className="material-icons-round text-2xl group-hover:text-[#FF6B00] transition-colors">bar_chart</span>
                <span className="hidden lg:block font-medium">Statistiques</span>
              </a>
              <a className="flex items-center gap-4 px-3 py-3 lg:px-5 lg:py-3 rounded-xl text-gray-400 hover:bg-[#2D2D2D] transition-colors group" href="#">
                <span className="material-icons-round text-2xl group-hover:text-[#FF6B00] transition-colors">emoji_events</span>
                <span className="hidden lg:block font-medium">Objectifs</span>
              </a>
            </nav>
          </div>
          <div className="p-4 border-t border-[#2D2D2D]">
            <a className="flex items-center gap-4 px-3 py-3 lg:px-5 lg:py-3 rounded-xl text-gray-400 hover:bg-[#2D2D2D] transition-colors mb-2" href="#">
              <span className="material-icons-round text-2xl">settings</span>
              <span className="hidden lg:block font-medium">Paramètres</span>
            </a>
            <div className="hidden lg:flex items-center gap-3 p-3 bg-[#2D2D2D] rounded-xl">
              <div className="w-10 h-10 rounded-full border-2 border-[#FF6B00] flex items-center justify-center bg-gray-800 text-white font-bold text-sm">
                AM
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">Alex Martin</p>
                <p className="text-xs text-gray-400 truncate">Membre Premium</p>
              </div>
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 overflow-y-auto relative bg-[#121212]">
          <header className="sticky top-0 z-10 bg-[#121212]/80 backdrop-blur-md px-8 py-6 flex justify-between items-center border-b border-[#2D2D2D]">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-white">
                Bonjour, <span className="bg-gradient-to-r from-[#FF6B00] to-[#FF9E00] text-transparent bg-clip-text">Alex!</span>
              </h1>
              <p className="text-gray-400 mt-1 flex items-center gap-2">
                Prêt pour votre séance aujourd'hui ?
                <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button className="relative p-2 rounded-full text-gray-400 hover:bg-[#2D2D2D] transition-colors">
                <span className="material-icons-round">notifications_none</span>
                <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-[#FF6B00] rounded-full border-2 border-[#121212]"></span>
              </button>
              <button className="hidden md:flex items-center gap-2 bg-[#2D2D2D] text-white px-5 py-2.5 rounded-xl border border-gray-700 hover:border-[#FF6B00] transition-all shadow-sm">
                <span className="material-icons-round text-[#FF6B00] text-xl">add</span>
                <span className="font-medium text-sm">Enregistrer une activité</span>
              </button>
            </div>
          </header>

          <div className="p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
            <div className="lg:col-span-8 flex flex-col gap-8">
              
              {/* PROCHAINE SÉANCE */}
              <div className="relative overflow-hidden rounded-2xl bg-[#1E1E1E] border border-[#2D2D2D] group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#FF6B00]/20 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                <div className="relative p-6 lg:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#FF6B00]/10 text-[#FF6B00] border border-[#FF6B00]/20">Prochaine Séance</span>
                      <span className="text-gray-400 text-sm">Aujourd'hui, 18:00</span>
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-2">HIIT & Cardio Explosif</h2>
                    <p className="text-gray-400 flex items-center gap-4 text-sm mb-6">
                      <span className="flex items-center gap-1"><span className="material-icons-round text-base">timer</span> 45 min</span>
                      <span className="flex items-center gap-1"><span className="material-icons-round text-base">local_fire_department</span> 450 kcal</span>
                      <span className="flex items-center gap-1"><span className="material-icons-round text-base">person</span> Coach Sarah</span>
                    </p>
                    <div className="flex gap-3">
                      <button className="bg-gradient-to-r from-[#FF6B00] to-[#FF9E00] text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-[#FF6B00]/30 hover:shadow-[#FF6B00]/50 hover:scale-105 transition-all flex items-center gap-2">
                        <span className="material-icons-round">play_arrow</span> Commencer
                      </button>
                      <button className="px-6 py-3 rounded-xl font-semibold text-gray-300 border border-gray-700 hover:bg-[#2D2D2D] transition-all">
                        Détails
                      </button>
                    </div>
                  </div>
                  <div className="hidden md:flex flex-col items-center p-4 rounded-xl bg-[#2D2D2D] border border-gray-700 min-w-[140px]">
                    <span className="text-xs text-gray-500 uppercase font-bold tracking-wide mb-2">Début dans</span>
                    <div className="text-3xl font-mono font-bold text-white mb-1">04:23:12</div>
                    <div className="w-full bg-gray-700 h-1.5 rounded-full mt-2 overflow-hidden">
                      <div className="bg-[#FF6B00] h-full w-2/3 rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* PROGRAMME ACTUEL */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#1E1E1E] p-6 rounded-2xl border border-[#2D2D2D] flex flex-col justify-between hover:border-gray-700 transition-colors">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-bold text-lg text-white">Mon Programme Actuel</h3>
                    <button className="text-[#FF6B00] hover:text-[#FF8F33] transition-colors">
                      <span className="material-icons-round">arrow_forward</span>
                    </button>
                  </div>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-20 h-20 rounded-lg bg-[#2D2D2D] flex items-center justify-center shadow-md">
                        <span className="material-icons-round text-3xl text-gray-500">fitness_center</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">Force & Hypertrophie</h4>
                      <p className="text-sm text-gray-400 mt-1">Semaine 4 sur 8</p>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-400 font-medium">Progression globale</span>
                      <span className="font-bold text-[#FF6B00]">45%</span>
                    </div>
                    <div className="w-full bg-[#2D2D2D] h-2 rounded-full overflow-hidden">
                      <div className="bg-[#FF6B00] h-full w-[45%] rounded-full shadow-[0_0_10px_rgba(255,107,0,0.5)]"></div>
                    </div>
                  </div>
                </div>

                {/* BOUTONS ACTIONS */}
                <div className="grid grid-cols-2 gap-4">
                  <button className="bg-[#1E1E1E] p-4 rounded-2xl border border-[#2D2D2D] flex flex-col items-center justify-center gap-3 hover:bg-[#2D2D2D] transition-all group text-center">
                    <div className="w-12 h-12 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <span className="material-icons-round text-2xl">calendar_month</span>
                    </div>
                    <span className="font-medium text-sm text-gray-200">Réserver une séance</span>
                  </button>
                  <button className="bg-[#1E1E1E] p-4 rounded-2xl border border-[#2D2D2D] flex flex-col items-center justify-center gap-3 hover:bg-[#2D2D2D] transition-all group text-center">
                    <div className="w-12 h-12 rounded-full bg-purple-500/10 text-purple-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <span className="material-icons-round text-2xl">chat_bubble</span>
                    </div>
                    <span className="font-medium text-sm text-gray-200">Contacter mon coach</span>
                  </button>
                  <button className="bg-[#1E1E1E] p-4 rounded-2xl border border-[#2D2D2D] flex flex-col items-center justify-center gap-3 hover:bg-[#2D2D2D] transition-all group text-center">
                    <div className="w-12 h-12 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <span className="material-icons-round text-2xl">restaurant</span>
                    </div>
                    <span className="font-medium text-sm text-gray-200">Plan Nutrition</span>
                  </button>
                  <button className="bg-[#1E1E1E] p-4 rounded-2xl border border-[#2D2D2D] flex flex-col items-center justify-center gap-3 hover:bg-[#2D2D2D] transition-all group text-center">
                    <div className="w-12 h-12 rounded-full bg-[#FF6B00]/10 text-[#FF6B00] flex items-center justify-center group-hover:scale-110 transition-transform">
                      <span className="material-icons-round text-2xl">monitor_heart</span>
                    </div>
                    <span className="font-medium text-sm text-gray-200">Moniteurs</span>
                  </button>
                </div>
              </div>
            </div>

            {/* SIDEBAR DROITE (Objectifs & Santé) */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              <div className="bg-[#1E1E1E] p-6 rounded-2xl border border-[#2D2D2D]">
                <h3 className="font-bold text-lg text-white mb-6">Objectifs Quotidiens</h3>
                <div className="flex justify-center mb-6 relative">
                  <div className="relative w-48 h-48">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle className="text-[#2D2D2D]" cx="96" cy="96" fill="none" r="88" stroke="currentColor" strokeWidth="12"></circle>
                      <circle cx="96" cy="96" fill="none" r="88" stroke="#FF6B00" strokeDasharray="552" strokeDashoffset="138" strokeLinecap="round" strokeWidth="12"></circle>
                      <circle className="text-[#2D2D2D]" cx="96" cy="96" fill="none" r="66" stroke="currentColor" strokeWidth="12"></circle>
                      <circle cx="96" cy="96" fill="none" r="66" stroke="#FACC15" strokeDasharray="414" strokeDashoffset="100" strokeLinecap="round" strokeWidth="12"></circle>
                      <circle className="text-[#2D2D2D]" cx="96" cy="96" fill="none" r="44" stroke="currentColor" strokeWidth="12"></circle>
                      <circle cx="96" cy="96" fill="none" r="44" stroke="#3B82F6" strokeDasharray="276" strokeDashoffset="180" strokeLinecap="round" strokeWidth="12"></circle>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <span className="text-3xl font-bold text-white">75%</span>
                      <span className="text-xs text-gray-500 uppercase">Complété</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="w-3 h-3 rounded-full bg-[#FF6B00]"></span>
                      <span className="text-sm font-medium text-gray-300">Calories</span>
                    </div>
                    <span className="text-sm font-bold text-white">1840 / 2400</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="w-3 h-3 rounded-full bg-yellow-400"></span>
                      <span className="text-sm font-medium text-gray-300">Pas</span>
                    </div>
                    <span className="text-sm font-bold text-white">8,432 / 10k</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                      <span className="text-sm font-medium text-gray-300">Hydratation</span>
                    </div>
                    <span className="text-sm font-bold text-white">1.2L / 2.5L</span>
                  </div>
                </div>
              </div>

              {/* STATS DE SANTÉ */}
              <div className="bg-[#1E1E1E] p-6 rounded-2xl border border-[#2D2D2D] flex-1">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-lg text-white">Stats de Santé</h3>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-red-500/10 rounded-lg text-red-500">
                        <span className="material-icons-round">favorite</span>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 font-medium">Fréquence Cardiaque</p>
                        <p className="font-bold text-white text-lg">72 <span className="text-xs font-normal text-gray-500">bpm</span></p>
                      </div>
                    </div>
                    <span className="text-xs text-green-500 font-bold bg-green-500/10 px-2 py-1 rounded">-3%</span>
                  </div>
                  <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-500">
                        <span className="material-icons-round">bedtime</span>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 font-medium">Sommeil</p>
                        <p className="font-bold text-white text-lg">7h 42m</p>
                      </div>
                    </div>
                    <span className="text-xs text-green-500 font-bold bg-green-500/10 px-2 py-1 rounded">+12%</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AthleteDashboard;
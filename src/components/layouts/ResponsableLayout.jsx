import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import api from '../../services/api';

const ResponsableLayout = () => {
  const location = useLocation();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const isActive = (path) => location.pathname.includes(path);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/responsable/notifications/');
      setNotifications(res.data);
    } catch (err) {
      console.error('Erreur notifications:', err);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.patch(`/responsable/notifications/${id}/`, { est_lu: true });
      fetchNotifications();
    } catch (err) {
      console.error('Erreur lecture notification:', err);
    }
  };

  const unreadCount = notifications.filter(n => !n.est_lu).length;

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
            to="/responsable/statistiques" 
            className={`flex items-center px-4 py-3 transition-transform active:scale-95 group ${
              isActive('statistiques') 
                ? 'bg-[#1f1f25] text-[#fcf8fe] border-l-4 border-[#ff915a]' 
                : 'text-[#acaab0] hover:bg-[#1f1f25] transition-colors'
            }`}
          >
            <span className="material-symbols-outlined mr-3">bar_chart</span>
            <span>Statistiques</span>
          </Link>
        </nav>
        
        <div className="px-3 pb-8 space-y-1 border-t border-[#48474c]/10 pt-4">
          <Link 
            to="/responsable/parametres" 
            className={`flex items-center px-4 py-3 transition-transform active:scale-95 group ${
              isActive('parametres') 
                ? 'bg-[#1f1f25] text-[#fcf8fe] border-l-4 border-[#ff915a]' 
                : 'text-[#acaab0] hover:bg-[#1f1f25] transition-all duration-200'
            }`}
          >
            <span className={`material-symbols-outlined mr-3 ${isActive('parametres') ? 'text-[#ff915a]' : ''}`}>settings</span>
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
            <div className="relative">
              <button onClick={() => setShowNotifications(!showNotifications)} className="relative">
                <span className="material-symbols-outlined text-[#acaab0] hover:text-[#ff915a] cursor-pointer transition-colors">notifications</span>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#ff915a] text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full">{unreadCount}</span>
                )}
              </button>
              {showNotifications && (
                <div className="absolute right-0 top-12 w-96 bg-[#1f1f25] border border-[#48474c]/20 rounded-2xl shadow-2xl p-4 max-h-96 overflow-y-auto z-50">
                  <h3 className="text-sm font-bold text-[#fcf8fe] mb-3 uppercase tracking-wider">Notifications</h3>
                  {notifications.length === 0 ? (
                    <p className="text-[#acaab0] text-sm">Aucune notification</p>
                  ) : (
                    notifications.map(notif => (
                      <div key={notif.id} onClick={() => markAsRead(notif.id)} className={`p-3 rounded-xl mb-2 cursor-pointer transition-all ${notif.est_lu ? 'bg-[#131317]' : 'bg-[#ff915a]/10 border border-[#ff915a]/20'}`}>
                        <p className="text-sm text-[#fcf8fe]">{notif.message}</p>
                        <span className="text-[10px] text-[#acaab0] mt-1 block">{new Date(notif.date_creation).toLocaleString()}</span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
            <Link to="/responsable/parametres">
              <span className="material-symbols-outlined text-[#acaab0] hover:text-[#ff915a] cursor-pointer transition-colors">account_circle</span>
            </Link>
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
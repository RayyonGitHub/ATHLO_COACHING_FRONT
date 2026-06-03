import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Store, BookOpen, LogOut, Search, Bell, Dumbbell, Settings, CreditCard, FolderOpen } from 'lucide-react';
import { adminAPI } from '../../services/api';

const AdminLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [adminUser, setAdminUser] = useState({ name: 'Admin', email: 'admin@athlo.com' });
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [readNotificationIds, setReadNotificationIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('adminReadNotifications') || '[]');
    } catch {
      return [];
    }
  });

  // Récupérer l'utilisateur connecté depuis le localStorage
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        setAdminUser(JSON.parse(userStr));
      } catch (e) {
        console.error("Erreur de parsing de l'utilisateur");
      }
    }
  }, []);

  useEffect(() => {
    fetchAdminNotifications();
    const interval = setInterval(fetchAdminNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchAdminNotifications = async () => {
    try {
      const response = await adminAPI.getNotifications();
      setNotifications(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Erreur notifications admin:', error);
    }
  };

  const markAdminNotificationsAsRead = () => {
    const ids = notifications.map((notification) => notification.id);
    setReadNotificationIds(ids);
    localStorage.setItem('adminReadNotifications', JSON.stringify(ids));
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    navigate('/admin-login');
  };

  const navItems = [
    { label: 'Overview', icon: <LayoutDashboard size={20} />, path: '/admin/dashboard' },
    { label: 'Coach Directory', icon: <Users size={20} />, path: '/admin/coachs' },
    { label: 'Athlètes & Prospects', icon: <BookOpen size={20} />, path: '/admin/athletes' },
    { label: 'Catalogue Global', icon: <FolderOpen size={20} />, path: '/admin/catalogue' },
    { label: 'Finances & Factures', icon: <CreditCard size={20} />, path: '/admin/finance' },
    { label: 'Gym Management', icon: <Store size={20} />, path: '/admin/salles' },
    { label: 'Responsables Salles', icon: <Users size={20} />, path: '/admin/responsables' },
    
  ];

  // Extraire les initiales (ex: "Alex Rivers" -> "AR", ou juste "A")
  const getInitials = (name) => {
    if (!name) return "AD";
    const parts = name.split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  const unreadCount = notifications.filter((notification) => !readNotificationIds.includes(notification.id)).length;

  const formatNotificationDate = (value) => {
    if (!value) return '';
    return new Date(value).toLocaleString('fr-FR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="flex h-screen bg-[#f8f7f5] dark:bg-[#0B0B0F] text-slate-900 dark:text-slate-100 antialiased font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-200 dark:border-[#262626] flex flex-col bg-white dark:bg-[#0B0B0F] shrink-0">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-[#FF6A00] rounded flex items-center justify-center text-white shadow-lg shadow-[#FF6A00]/20">
            <Dumbbell size={18} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight">ATHLO</h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Super-Admin</p>
          </div>
        </div>
        
        <nav className="flex-1 px-4 space-y-1 mt-2">
          {navItems.map((item) => {
            const isActive = location.pathname.includes(item.path);
            return (
              <Link key={item.path} to={item.path} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${isActive ? 'bg-[#FF6A00]/10 text-[#FF6A00]' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#16161A]'}`}>
                <span className={`${isActive ? 'text-[#FF6A00]' : 'text-slate-400'}`}>{item.icon}</span>
                <span className={`text-sm ${isActive ? 'font-bold' : 'font-medium'}`}>{item.label}</span>
              </Link>
            );
          })}
          
          <div className="pt-6 pb-2 px-3">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">System</p>
          </div>
         
          <Link to="/admin/settings" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${location.pathname === '/admin/settings' ? 'bg-[#FF6A00]/10 text-[#FF6A00]' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#16161A]'}`}>
          <Settings size={20} className={location.pathname === '/admin/settings' ? 'text-[#FF6A00]' : 'text-slate-400'} />
          <span className={`text-sm ${location.pathname === '/admin/settings' ? 'font-bold' : 'font-medium'}`}>Settings</span>
        </Link>
        </nav>

        <div className="p-4 border-t border-slate-200 dark:border-[#262626]">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-50 dark:bg-[#16161A] border border-transparent dark:border-[#262626]">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#FF6A00] to-orange-600 flex items-center justify-center font-bold text-white text-xs shadow-inner">
              {getInitials(adminUser.name)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold truncate dark:text-white">{adminUser.name}</p>
              <p className="text-[10px] text-slate-500 truncate">{adminUser.email}</p>
            </div>
            <button onClick={handleLogout} title="Déconnexion" className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden bg-[#f8f7f5] dark:bg-[#0B0B0F]">
        {/* Header */}
        <header className="h-16 border-b border-slate-200 dark:border-[#262626] flex items-center justify-between px-8 bg-white dark:bg-[#0B0B0F] shrink-0">
          <div className="flex items-center gap-4 flex-1 max-w-xl">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input className="w-full bg-slate-100 dark:bg-[#16161A] border-none rounded-lg py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-[#FF6A00]/50 text-slate-900 dark:text-slate-100 outline-none" placeholder="Recherche globale système..." type="text"/>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifications((open) => !open);
                  if (!showNotifications) markAdminNotificationsAsRead();
                }}
                className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-[#16161A] text-slate-600 dark:text-slate-400 relative transition-colors"
                title="Notifications"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 flex items-center justify-center bg-[#FF6A00] border-2 border-white dark:border-[#0B0B0F] rounded-full text-[10px] font-black text-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 top-12 w-80 max-w-[calc(100vw-2rem)] bg-white dark:bg-[#131317] border border-slate-200 dark:border-[#2A2A32] rounded-xl shadow-2xl overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-slate-200 dark:border-[#2A2A32] flex items-center justify-between">
                    <h3 className="text-sm font-black text-slate-900 dark:text-white">Notifications</h3>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Superadmin</span>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-sm text-slate-500">
                        Aucune notification pour le moment.
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <div key={notification.id} className="px-4 py-3 border-b border-slate-100 dark:border-[#24242A] last:border-b-0 hover:bg-slate-50 dark:hover:bg-[#1F1F25]">
                          <div className="flex items-start gap-3">
                            <span className="mt-1 w-2 h-2 rounded-full bg-[#FF6A00] shrink-0"></span>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-bold text-slate-900 dark:text-white">{notification.title}</p>
                              <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">{notification.message}</p>
                              <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">{formatNotificationDate(notification.date_creation)}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;

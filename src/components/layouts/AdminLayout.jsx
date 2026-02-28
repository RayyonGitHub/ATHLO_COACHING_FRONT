import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Store, BookOpen, LogOut, Search, Bell, HelpCircle, Dumbbell, History, Settings } from 'lucide-react';

const AdminLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [adminUser, setAdminUser] = useState({ name: 'Admin', email: 'admin@athlo.com' });

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

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    navigate('/admin-login');
  };

  const navItems = [
    { label: 'Overview', icon: <LayoutDashboard size={20} />, path: '/admin/dashboard' },
    { label: 'Coach Directory', icon: <Users size={20} />, path: '/admin/coachs' },
    { label: 'Gym Management', icon: <Store size={20} />, path: '/admin/salles' },
    { label: 'Content Library', icon: <BookOpen size={20} />, path: '/admin/library' },
  ];

  // Extraire les initiales (ex: "Alex Rivers" -> "AR", ou juste "A")
  const getInitials = (name) => {
    if (!name) return "AD";
    const parts = name.split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
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
          <Link to="#" className="flex items-center gap-3 px-3 py-2.5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#16161A] rounded-lg transition-colors">
            <History size={20} className="text-slate-400" />
            <span className="text-sm font-medium">System Logs</span>
          </Link>
          <Link to="#" className="flex items-center gap-3 px-3 py-2.5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#16161A] rounded-lg transition-colors">
            <Settings size={20} className="text-slate-400" />
            <span className="text-sm font-medium">Settings</span>
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
            <button className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-[#16161A] text-slate-600 dark:text-slate-400 relative transition-colors">
              <Bell size={20} />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-[#FF6A00] border-2 border-white dark:border-[#0B0B0F] rounded-full"></span>
            </button>
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
import React, { useState } from 'react';
import { LayoutDashboard, Users, Dumbbell, Calendar, Settings, ChevronRight, LogOut, Menu, Activity, MessageCircle, ShoppingBag, Utensils, FileText } from 'lucide-react'; 
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';

const logo = new URL('../../assets/images/logo.png', import.meta.url).href;

interface SidebarProps {
  activePage?: string;
}

const Sidebar = ({ activePage = "Dashboard" }: SidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();

  // --- NOUVEAU : Ajout de la Nutrition dans la liste ---
  const menuItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/dashboard' },
    { icon: <Users size={20} />, label: 'Mes Clients', path: '/clients' },
    { icon: <Dumbbell size={20} />, label: 'Programmes', path: '/programmes' },
    { icon: <Activity size={20} />, label: 'Exercices', path: '/exercices' },
    { icon: <Calendar size={20} />, label: 'Calendrier', path: '/calendar' },
    { icon: <MessageCircle size={20} />, label: 'Messagerie', path: '/messages' },
    { icon: <FileText size={20} />, label: 'Devis', path: '/devis' },
    { icon: <Utensils size={20} />, label: 'Nutrition', path: '/nutrition' }, // <-- AJOUTÉ ICI
    { icon: <ShoppingBag size={20} />, label: 'Boutique', path: '/boutique' }, 
    { icon: <Settings size={20} />, label: 'Paramètres', path: '/parametres' }, 
  ];

  const handleLogout = () => {
    authService.logout();
    navigate('/');
  };

  return (
    <aside
      className={`bg-[#131317] h-screen flex flex-col text-white shadow-2xl z-50 transition-all duration-300 ease-in-out relative border-r border-[#2A2A32] ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div className={`w-full flex items-center py-6 px-4 shrink-0 transition-all duration-300 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
        {!isCollapsed && (
          <div className="w-32 h-auto flex items-center cursor-pointer" onClick={() => navigate('/')}>
            <img src={logo} alt="Logo" className="max-w-full h-auto object-contain brightness-110" />
          </div>
        )}

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-3.5 rounded-xl bg-[#1F1F25] hover:bg-[#2A2A32] text-[#ACAAB0] hover:text-[#FCF8FE] transition-all shadow-sm group"
        >
          <Menu size={20} className="group-hover:text-[#FF6A00] transition-colors" />
        </button>
      </div>

      <nav className="flex-1 px-3 space-y-2 overflow-y-auto max-h-screen">
        {menuItems.map((item, index) => {
          const isActive = activePage === item.label;

          return (
            <button
              key={index}
              onClick={() => item.path && navigate(item.path)}
              className={`w-full flex items-center p-3.5 rounded-xl transition-all duration-200 group relative ${
                isActive
                  ? 'bg-[#FF6A00] text-white shadow-lg shadow-[#FF6A00]/20'
                  : 'hover:bg-[#1F1F25] text-[#ACAAB0] hover:text-[#FCF8FE]'
              } ${isCollapsed ? 'justify-center' : 'justify-between'}`}
            >
              <div className="flex items-center space-x-3">
                <span className={`${isActive ? 'text-white' : 'group-hover:text-[#FF6A00]'} transition-colors shrink-0`}>
                  {item.icon}
                </span>
                {!isCollapsed && <span className="font-bold text-sm tracking-wide">{item.label}</span>}
              </div>
              {!isCollapsed && isActive && <ChevronRight size={16} className="text-white/80" />}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-[#2A2A32]">
        <button
          onClick={handleLogout}
          className={`w-full flex items-center p-3 hover:bg-[#EF4444]/10 rounded-xl transition-colors text-[#EF4444] group ${
            isCollapsed ? 'justify-center' : 'space-x-3'
          }`}
        >
          <LogOut size={20} className="group-hover:scale-110 transition-transform shrink-0" />
          {!isCollapsed && <span className="font-bold text-sm whitespace-nowrap">Déconnexion</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
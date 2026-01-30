import React, { useState } from 'react';
import { LayoutDashboard, Users, Dumbbell, Calendar, Settings, ChevronRight, LogOut, Menu } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../../services/authService';

const logo = new URL('../../assets/images/logo.png', import.meta.url).href;

interface SidebarProps {
  activePage?: string; 
}

const Sidebar = ({ activePage = "Dashboard" }: SidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate(); 

  const menuItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/dashboard' },
    { icon: <Users size={20} />, label: 'Mes Clients', path: '/clients' },
    { icon: <Dumbbell size={20} />, label: 'Programmes', path: '' },
    { icon: <Calendar size={20} />, label: 'Calendrier', path: '' },
    { icon: <Settings size={20} />, label: 'Paramètres', path: '' },
  ];

  const handleLogout = () => {
    authService.logout(); 
    navigate('/'); 
  };

  return (
    <aside 
      className={`bg-indigo-900 h-screen flex flex-col text-white shadow-2xl z-50 transition-all duration-300 ease-in-out relative ${
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
          className="p-3.5 rounded-xl bg-indigo-800/50 hover:bg-indigo-700/50 text-indigo-300 hover:text-white transition-all shadow-sm group"
        >
          <Menu size={20} className="group-hover:text-orange-400 transition-colors" />
        </button>
      </div>

      <nav className="flex-1 px-3 space-y-2">
        {menuItems.map((item, index) => {
          const isActive = activePage === item.label;
          
          return (
            <button
              key={index}
              onClick={() => item.path && navigate(item.path)} 
              className={`w-full flex items-center p-3.5 rounded-xl transition-all duration-200 group relative ${
                isActive 
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-600/20' 
                  : 'hover:bg-indigo-800/50 text-indigo-300 hover:text-white'
              } ${isCollapsed ? 'justify-center' : 'justify-between'}`}
            >
              <div className="flex items-center space-x-3">
                <span className={`${isActive ? 'text-white' : 'group-hover:text-orange-400'} transition-colors shrink-0`}>
                  {item.icon}
                </span>
                {!isCollapsed && <span className="font-bold text-sm tracking-wide">{item.label}</span>}
              </div>
              {!isCollapsed && isActive && <ChevronRight size={16} className="text-orange-200" />}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-indigo-800/50">
        <button 
          onClick={handleLogout}
          className={`w-full flex items-center p-3 hover:bg-red-500/10 rounded-xl transition-colors text-red-400 group ${
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
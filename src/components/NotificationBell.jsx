import React, { useState, useEffect, useRef } from 'react';
import { 
  Bell, UserPlus, UserMinus, Clock, CalendarClock, XCircle, Edit 
} from 'lucide-react';
import coachService from '../services/coachService';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchNotifications();

    const interval = setInterval(() => {
      fetchNotifications();
    }, 3000);

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      clearInterval(interval);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchNotifications = async () => {
    try {
      const data = await coachService.getNotifications();
      setNotifications(data.results || data);
    } catch (error) {
      console.error("Erreur de notifications:", error);
    }
  };

  const marquerToutCommeLu = async () => {
    setNotifications(prevNotifs => prevNotifs.map(notif => ({ ...notif, est_lu: true })));

    try {
      await coachService.markNotificationsAsRead();
    } catch (error) {
      console.error("Erreur de mise à jour:", error);
      fetchNotifications();
    }
  };

  // --- NOUVELLE FONCTION : Marquer UNE SEULE notification comme lue ---
  const marquerCommeLu = async (id) => {
    try {
      // 1. Mise à jour immédiate de l'affichage (pour la fluidité)
      setNotifications(notifications.map(notif => 
        notif.id === id ? { ...notif, est_lu: true } : notif
      ));
      
      // 2. Appel à l'API en arrière-plan
      await coachService.markNotificationAsRead(id);
    } catch (error) {
      console.error("Erreur lors de la lecture de la notification:", error);
    }
  };

  const unreadCount = notifications.filter(n => !n.est_lu).length;

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'INSCRIPTION':
        return <div className="p-2 bg-green-100 rounded-full"><UserPlus className="w-4 h-4 text-green-600" /></div>;
      case 'DESINSCRIPTION':
        return <div className="p-2 bg-red-100 rounded-full"><UserMinus className="w-4 h-4 text-red-600" /></div>;
      case 'LISTE_ATTENTE':
        return <div className="p-2 bg-orange-100 rounded-full"><Clock className="w-4 h-4 text-orange-600" /></div>;
      case 'RAPPEL':
        return <div className="p-2 bg-blue-100 rounded-full"><CalendarClock className="w-4 h-4 text-blue-600" /></div>;
      case 'ANNULATION':
        return <div className="p-2 bg-rose-100 rounded-full"><XCircle className="w-4 h-4 text-rose-600" /></div>;
      case 'MODIFICATION':
        return <div className="p-2 bg-purple-100 rounded-full"><Edit className="w-4 h-4 text-purple-600" /></div>;
      default:
        return <div className="p-2 bg-slate-100 rounded-full"><Bell className="w-4 h-4 text-slate-600" /></div>;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex items-center justify-center p-2 text-slate-400 hover:text-indigo-900 transition-colors  cursor-pointer"
      >
        <Bell className="w-5 h-5" />

        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-orange-500 rounded-full border-2 border-white">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-96 bg-[#131317] rounded-2xl shadow-2xl overflow-hidden z-50 border border-[#2A2A32]">
          <div className="px-4 py-3 bg-[#0B0B0E] flex justify-between items-center border-b border-[#2A2A32]">
            <h3 className="text-sm font-black text-[#FCF8FE] tracking-tighter uppercase">Notifications</h3>
            {unreadCount > 0 && (
              <button 
                onClick={marquerToutCommeLu}
                className="text-xs font-bold text-[#FF6A00] hover:text-[#e66000] transition-colors cursor-pointer"
              >
                Tout marquer lu
              </button>
            )}
          </div>
          
          <div className="max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-[#2A2A32] scrollbar-track-transparent">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-sm font-medium text-center text-[#ACAAB0]">
                Aucune nouvelle notification
              </div>
            ) : (
              [...notifications].sort((a, b) => new Date(b.date_creation) - new Date(a.date_creation)).map((notif) => (
                <div 
                  key={notif.id} 
                  onClick={() => !notif.est_lu && marquerCommeLu(notif.id)}
                  className={`px-4 py-3 border-b border-[#2A2A32] flex gap-3 items-start transition-all duration-300 ${
                    notif.est_lu 
                      ? 'bg-[#131317] opacity-60 cursor-default' 
                      : 'bg-[#1F1F25] hover:bg-[#2A2A32] cursor-pointer'
                  }`}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {getNotificationIcon(notif.type)}
                  </div>
                  
                  <div className="flex-1">
                    <p className={`text-sm leading-snug ${notif.est_lu ? 'text-[#ACAAB0]' : 'text-[#FCF8FE] font-semibold'}`}>
                      {notif.message}
                    </p>
                    <span className="text-[10px] font-bold text-[#ACAAB0] uppercase tracking-widest mt-1.5 block">
                      {new Date(notif.date_creation).toLocaleDateString('fr-FR', { weekday: 'short', hour: '2-digit', minute:'2-digit' })}
                    </span>
                  </div>
                  
                  {!notif.est_lu && (
                    <div className="w-2 h-2 bg-[#FF6A00] rounded-full flex-shrink-0 mt-2 shadow-[0_0_8px_rgba(255,106,0,0.6)]"></div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
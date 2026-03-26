import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Bell, Clock, Zap, Activity, CheckCircle, Info, BellOff } from 'lucide-react';

const AthleteNotificationBell = () => {
  // On initialise avec un tableau vide pour éviter les erreurs de .length
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const API_URL = 'http://127.0.0.1:8000/api/notifications-athlete/';
  const token = localStorage.getItem('token'); 

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(() => fetchNotifications(), 10000);

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setIsOpen(false);
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      clearInterval(interval);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchNotifications = async () => {
  try {
    // UTILISATION DE TA CLÉ EXACTE : authToken
    const token = localStorage.getItem('authToken');

    if (!token) {
      // Si pas de token, on ne fait rien (évite la 401 en boucle)
      return;
    }

    const response = await axios.get(API_URL, {
      headers: { 
        Authorization: `Bearer ${token}` 
      }
    });
    
    const data = response.data.results || response.data || [];
    setNotifications(Array.isArray(data) ? data : []);
    
  } catch (error) {
    if (error.response?.status === 401) {
      console.warn("🔔 Cloche : Problème d'autorisation (401).");
    }
  }
};

  const marquerToutCommeLu = async () => {
  const token = localStorage.getItem('authToken'); // On utilise la bonne clé
  if (!token) return;

  try {
    // On met à jour le visuel immédiatement (Optimistic UI)
    const backup = [...notifications];
    setNotifications(notifications.map(n => ({ ...n, est_lu: true })));

    await axios.post(`${API_URL}marquer_tout_lu/`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log("✅ Backend synchronisé : Tout est lu");
  } catch (error) {
    console.error("❌ Erreur marquage global:", error);
    // Si ça échoue, on recharge les notifs pour remettre les points oranges
    fetchNotifications(); 
  }
};

// 3. Remplace la fonction pour une SEULE notif
const marquerCommeLu = async (id) => {
  const token = localStorage.getItem('authToken'); // Correction ici !
  if (!token) return;

  try {
    // Mise à jour visuelle immédiate
    setNotifications(notifications.map(n => n.id === id ? { ...n, est_lu: true } : n));

    await axios.patch(`${API_URL}${id}/`, { est_lu: true }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`✅ Notif ${id} marquée comme lue`);
  } catch (error) {
    console.error("❌ Erreur marquage unique:", error);
    fetchNotifications();
  }
};

  const unreadCount = notifications.filter(n => !n.est_lu).length;

  const getIcon = (type) => {
    switch (type) {
      case 'SEANCE': return <Zap className="w-4 h-4 text-orange-500" />;
      case 'RAPPEL': return <Clock className="w-4 h-4 text-blue-500" />;
      case 'OBJECTIF': return <CheckCircle className="w-4 h-4 text-green-500" />;
      default: return <Info className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* BOUTON CLOCHE (S'ouvre toujours au clic) */}
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className={`relative p-2 transition-all rounded-xl ${isOpen ? 'bg-[#252525] text-white' : 'text-gray-400 hover:text-white hover:bg-[#252525]'}`}
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex items-center justify-center w-3.5 h-3.5 text-[9px] font-black text-white bg-[#FF6B00] rounded-full border-2 border-[#121212]">
            {unreadCount}
          </span>
        )}
      </button>

      {/* MENU DÉROULANT */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 bg-[#1E1E1E] rounded-2xl shadow-2xl overflow-hidden z-50 border border-[#2D2D2D] animate-in fade-in zoom-in duration-200">
          <div className="px-4 py-3 bg-[#252525] flex justify-between items-center border-b border-[#2D2D2D]">
            <h3 className="text-xs font-black text-white uppercase tracking-widest">Notifications</h3>
            {unreadCount > 0 && (
              <button 
                onClick={marquerToutCommeLu} 
                className="text-[10px] font-black text-[#FF6B00] hover:text-orange-400 uppercase tracking-tighter transition-colors"
              >
                Tout marquer lu
              </button>
            )}
          </div>
          
          <div className="max-h-[350px] overflow-y-auto custom-scrollbar">
            {notifications.length === 0 ? (
              /* --- ÉTAT VIDE AMÉLIORÉ --- */
              <div className="px-6 py-12 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 bg-[#252525] rounded-full flex items-center justify-center mb-4">
                  <BellOff className="w-6 h-6 text-gray-600" />
                </div>
                <p className="text-sm font-bold text-gray-300">C'est le calme plat !</p>
                <p className="text-xs text-gray-500 mt-1 px-4 leading-relaxed">
                  Vous n'avez aucune notification pour le moment.
                </p>
              </div>
            ) : (
              [...notifications].sort((a, b) => new Date(b.date_creation) - new Date(a.date_creation)).map((notif) => (
                <div 
                  key={notif.id} 
                  onClick={() => !notif.est_lu && marquerCommeLu(notif.id)}
                  className={`px-4 py-4 border-b border-[#2D2D2D] flex gap-3 items-start transition-all relative ${
                    notif.est_lu ? 'opacity-40 grayscale-[0.3]' : 'bg-[#FF6B00]/5 hover:bg-[#FF6B00]/10 cursor-pointer'
                  }`}
                >
                  <div className={`mt-0.5 p-1.5 rounded-lg ${notif.est_lu ? 'bg-gray-800' : 'bg-black/40'}`}>
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1">
                    <p className={`text-[13px] leading-snug ${notif.est_lu ? 'text-gray-400' : 'text-gray-200 font-semibold'}`}>
                      {notif.message}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                       <Clock className="w-3 h-3 text-gray-600" />
                       <span className="text-[10px] font-bold text-gray-600 uppercase tracking-tight">
                        {new Date(notif.date_creation).toLocaleDateString('fr-FR', { hour: '2-digit', minute:'2-digit' })}
                      </span>
                    </div>
                  </div>
                  {!notif.est_lu && (
                    <div className="w-2 h-2 bg-[#FF6B00] rounded-full mt-2 shadow-[0_0_10px_#FF6B00]" />
                  )}
                </div>
              ))
            )}
          </div>

          <div className="px-4 py-2 bg-[#252525] text-center border-t border-[#2D2D2D]">
            <p className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">Fin des notifications</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AthleteNotificationBell;
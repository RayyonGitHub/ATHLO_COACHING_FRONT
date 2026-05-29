import React from 'react';
import { Link } from 'react-router-dom';
import NotificationBell from '../NotificationBell';

interface HeaderProps {
  section?: string;
  subSection?: string;
  coachName?: string;
  coachPlan?: string;
  coachInitials?: string;
}

const Header = ({ 
  section = "Coach", 
  subSection = "Aperçu",
  coachName = "Bouthayna C.", 
  coachPlan = "Premium",    
  coachInitials = "BC"        
}: HeaderProps) => {
  return (
    <header className="h-20 bg-[#0B0B0E]/80 backdrop-blur-md border-b border-[#2A2A32] px-8 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center space-x-2 text-sm">
        <span className="text-[#ACAAB0] font-medium">{section}</span>
        <span className="text-[#48474C]">/</span>
        <span className="text-[#FF6A00] font-bold tracking-tight">{subSection}</span>
      </div>

      <div className="flex items-center space-x-5">
        
        {/* LA CLOCHE EST ICI : Elle gère toute seule son clic et son badge rouge ! */}
        <div className="relative p-1 bg-[#1F1F25] rounded-xl hover:bg-[#2A2A32] transition-all flex items-center justify-center">
            <NotificationBell />
        </div>

        <div className="h-10 w-px bg-[#2A2A32] mx-2"></div>
        
        <Link to="/parametres" className="flex items-center space-x-3 bg-[#131317] pr-4 pl-1.5 py-1.5 rounded-2xl border border-[#2A2A32] hover:border-[#FF6A00]/50 transition-all cursor-pointer group">
          <div className="w-9 h-9 bg-[#FF6A00] rounded-xl flex items-center justify-center text-white shadow-inner group-hover:bg-[#e66000] transition-colors text-xs font-bold">
            {coachInitials}
          </div>
          <div className="flex flex-col text-left">
            <span className="text-sm font-black text-[#FCF8FE] leading-tight">
              {coachName}
            </span>
          </div>
        </Link>
      </div>
    </header>
  );
};

export default Header;
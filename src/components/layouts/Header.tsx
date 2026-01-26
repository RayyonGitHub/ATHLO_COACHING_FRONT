import React from 'react';
import { Bell } from 'lucide-react';

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
  coachName = "Bouthayna C.", // Valeur par défaut
  coachPlan = "Premium",      // Valeur par défaut
  coachInitials = "BC"        // Valeur par défaut
}: HeaderProps) => {
  return (
    <header className="h-20 bg-white border-b border-gray-100 px-8 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center space-x-2 text-sm">
        <span className="text-gray-400 font-medium">{section}</span>
        <span className="text-gray-300">/</span>
        <span className="text-indigo-900 font-bold tracking-tight">{subSection}</span>
      </div>

      <div className="flex items-center space-x-5">
        <button className="relative p-2.5 bg-gray-50 text-gray-400 rounded-xl hover:text-orange-500 hover:bg-orange-50 transition-all">
          <Bell size={20} />
          <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-orange-500 rounded-full border-2 border-white animate-pulse"></span>
        </button>
        <div className="h-10 w-px bg-gray-100 mx-2"></div>
        
        <div className="flex items-center space-x-3 bg-gray-50 pr-4 pl-1.5 py-1.5 rounded-2xl border border-gray-100 hover:border-orange-200 transition-all cursor-pointer group">
          {/* Initialies  */}
          <div className="w-9 h-9 bg-indigo-900 rounded-xl flex items-center justify-center text-white shadow-inner group-hover:bg-orange-500 transition-colors text-xs font-bold">
            {coachInitials}
          </div>
          <div className="flex flex-col text-left">
            {/* Nom */}
            <span className="text-sm font-black text-gray-900 leading-tight">
              {coachName}
            </span>
            {/* Plan */}
            <span className="text-[10px] text-orange-500 font-bold uppercase tracking-widest">
              {coachPlan}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
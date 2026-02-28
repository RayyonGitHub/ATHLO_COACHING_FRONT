import React, { useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { authService } from '../../services/authService'; // <-- Vérifie bien ce chemin

interface MainLayoutProps {
  children: React.ReactNode;
  activePageLabel: string;
  headerSection?: string;
  headerSubSection?: string;
  coachName?: string;
  coachPlan?: string;
  coachInitials?: string;
}

const MainLayout = ({ 
  children, 
  activePageLabel, 
  headerSection, 
  headerSubSection
}: MainLayoutProps) => {
  const [coachName, setCoachName] = useState("Coach");
  const [coachInitials, setCoachInitials] = useState("CH");

  useEffect(() => {
    try {
      // 1. On récupère les infos de l'utilisateur connecté
      const user = authService.getCurrentUser();
      
      if (user && user.name) {
        // 2. On met à jour le nom
        setCoachName(user.name);
        
        // 3. On calcule automatiquement les initiales (ex: "Bouthayna C." -> "BC")
        const parts = user.name.trim().split(' ');
        if (parts.length >= 2) {
          setCoachInitials((parts[0][0] + parts[1][0]).toUpperCase());
        } else {
          setCoachInitials(user.name.substring(0, 2).toUpperCase());
        }
      }
    } catch (error) {
      console.error("Erreur lors de la récupération de l'utilisateur :", error);
    }
  }, []);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar activePage={activePageLabel} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header 
          section={headerSection} 
          subSection={headerSubSection || activePageLabel}
          coachName={coachName}
          coachPlan="Premium"
          coachInitials={coachInitials}
        />
        <main className="flex-1 flex flex-col min-h-0 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
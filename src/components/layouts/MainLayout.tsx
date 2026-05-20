import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { authService } from '../../services/authService';
import api from '../../services/api';

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
  const [showStripeWarning, setShowStripeWarning] = useState(false);

  useEffect(() => {
    try {
      const user = authService.getCurrentUser();
      
      if (user && user.name) {
        setCoachName(user.name);
        const parts = user.name.trim().split(' ');
        if (parts.length >= 2) {
          setCoachInitials((parts[0][0] + parts[1][0]).toUpperCase());
        } else {
          setCoachInitials(user.name.substring(0, 2).toUpperCase());
        }
      }

      // Vérification discrète du compte Stripe Connect
    // Vérification discrète du compte Stripe Connect
      const checkStripeConfig = async () => {
        try {
          const res = await api.get('/coach/me/');
          // On vérifie maintenant si l'onboarding complet a été validé par Stripe
          if (!res.data.stripe_onboarding_complete) {
            setShowStripeWarning(true);
          }
        } catch (error) {
          console.error("Erreur de vérification Stripe", error);
        }
      };
      
      checkStripeConfig();

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
        
        {/* BANNIÈRE D'URGENCE STRIPE */}
        {showStripeWarning && (
          <div className="bg-orange-500 text-white px-6 py-3 flex flex-col sm:flex-row items-center justify-between shadow-md z-10 shrink-0 gap-3">
            <div className="flex items-center gap-3 font-medium text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span><strong>Action requise :</strong> Vous ne pouvez pas encore recevoir vos paiements. Connectez votre compte bancaire pour débloquer vos ventes.</span>
            </div>
            <Link to="/parametres" className="shrink-0 bg-white text-orange-600 hover:bg-orange-50 px-4 py-2 rounded-xl text-sm font-bold shadow-sm transition-colors">
              Configurer maintenant
            </Link>
          </div>
        )}

        <main className="flex-1 flex flex-col min-h-0 bg-gray-50 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
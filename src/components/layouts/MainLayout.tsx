import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

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
  headerSubSection,
  coachName,
  coachPlan,
  coachInitials
}: MainLayoutProps) => {
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar activePage={activePageLabel} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header 
          section={headerSection} 
          subSection={headerSubSection || activePageLabel}
          coachName={coachName}
          coachPlan={coachPlan}
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
import React, { useState, useEffect } from 'react';
import MainLayout from './components/layouts/MainLayout';
import ClientList from './components/ClientList';
// Imagine que tu as un composant Login (Issue #F2)
// import Login from './pages/Login'; 

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // On vérifie si un token existe au démarrage
    const token = localStorage.getItem('access_token');
    setIsAuthenticated(!!token);
  }, []);

  // Si pas connecté, on devrait afficher le Login
  if (!isAuthenticated) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h1>Veuillez vous connecter</h1>
        <p>Le Backend est sécurisé (401 Unauthorized détecté)</p>
        {/* Ici, on insérera le composant Login de ton collègue */}
      </div>
    );
  }

  return (
    <MainLayout 
      activePageLabel="Mes Clients" 
      headerSection="Coach" 
      headerSubSection="Annuaire Clients"
    >
      <ClientList />
    </MainLayout>
  );
}

export default App;
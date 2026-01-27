import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Pages et composants
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ClientList from './components/ClientList';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './components/layouts/MainLayout';

function App() {
  return (
    <Router>
      <Routes>
        {/* === Routes publiques === */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* === Routes protégées === */}
        
        {/* Dashboard avec le Layout */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <MainLayout activePageLabel="Tableau de bord" headerSection="Coach" headerSubSection="Vue d'ensemble">
                <Dashboard />
              </MainLayout>
            </ProtectedRoute>
          } 
        />
        
        {/* Liste des clients avec le Layout */}
        <Route 
          path="/clients" 
          element={
            <ProtectedRoute>
              <MainLayout activePageLabel="Mes Clients" headerSection="Coach" headerSubSection="Annuaire Clients">
                <ClientList />
              </MainLayout>
            </ProtectedRoute>
          } 
        />
        
        {/* Redirection par défaut */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
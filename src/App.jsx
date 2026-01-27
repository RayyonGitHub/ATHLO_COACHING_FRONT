import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ClientList from './components/ClientList';

// Onboarding Pages
import CoachStep2 from './pages/onboarding/CoachStep2';
import CoachStep3 from './pages/onboarding/CoachStep3';
import AthleteStep2 from './pages/onboarding/AthleteStep2';
import AthleteStep3 from './pages/onboarding/AthleteStep3';

import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './components/layouts/MainLayout';

function App() {
  return (
    <Router>
      <Routes>
        {/* === Routes publiques === */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* === Onboarding Routes === */}
        
        {/* Onboarding Coach */}
        <Route path="/onboarding/coach/step2" element={<ProtectedRoute><CoachStep2 /></ProtectedRoute>} />
        <Route path="/onboarding/coach/step3" element={<ProtectedRoute><CoachStep3 /></ProtectedRoute>} />

        {/* Onboarding Athlete */}
        <Route path="/onboarding/athlete/step2" element={<ProtectedRoute><AthleteStep2 /></ProtectedRoute>} />
        <Route path="/onboarding/athlete/step3" element={<ProtectedRoute><AthleteStep3 /></ProtectedRoute>} />

        {/* === Routes protégées (App) === */}
        <Route path="/dashboard" element={
            <ProtectedRoute>
              <MainLayout activePageLabel="Tableau de bord" headerSection="Dashboard" headerSubSection="Vue d'ensemble">
                <Dashboard />
              </MainLayout>
            </ProtectedRoute>
        } />
        
        <Route path="/clients" element={
            <ProtectedRoute>
              <MainLayout activePageLabel="Mes Clients" headerSection="Coach" headerSubSection="Annuaire Clients">
                <ClientList />
              </MainLayout>
            </ProtectedRoute>
        } />

        {/* Redirection par défaut */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Pages Publiques
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';

// Pages Protégées Coach/Athlète
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './components/layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import ClientList from './components/ClientList';
import DemoDashboard from './pages/DemoDashboard';
import AthleteDashboard from './pages/AthleteDashboard'; 

// Onboarding Pages
import CoachStep2 from './pages/onboarding/CoachStep2';
import CoachStep3 from './pages/onboarding/CoachStep3';
import AthleteStep2 from './pages/onboarding/AthleteStep2';
import AthleteStep3 from './pages/onboarding/AthleteStep3';

// Pages Admin
import AdminRoute from './components/AdminRoute';
import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './components/layouts/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminCoachList from './pages/admin/AdminCoachList';
import AdminGymList from './pages/admin/AdminGymList';

function App() {
  return (
    <Router>
      <Routes>
        {/* === ROUTES PUBLIQUES === */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* === ROUTES ONBOARDING (Protégées) === */}
        <Route path="/onboarding/coach/step2" element={<ProtectedRoute><CoachStep2 /></ProtectedRoute>} />
        <Route path="/onboarding/coach/step3" element={<ProtectedRoute><CoachStep3 /></ProtectedRoute>} />
        <Route path="/onboarding/athlete/step2" element={<ProtectedRoute><AthleteStep2 /></ProtectedRoute>} />
        <Route path="/onboarding/athlete/step3" element={<ProtectedRoute><AthleteStep3 /></ProtectedRoute>} />

        {/* === ESPACE COACH (Avec Layout latéral) === */}
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

        {/* === ESPACE ATHLÈTE === */}
        {/* Note: On ne met pas de MainLayout ici car l'AthleteDashboard gère son propre design noir/orange */}
        <Route path="/athlete/dashboard" element={
            <ProtectedRoute>
              <AthleteDashboard />
            </ProtectedRoute>
        } />

        {/* === ESPACE SUPER-ADMIN (Isolé) === */}
        <Route path="/admin-login" element={<AdminLogin />} />

        <Route path="/admin/dashboard" element={
          <AdminRoute>
            <AdminLayout>
              <AdminDashboard />
            </AdminLayout>
          </AdminRoute>
        } />

        <Route path="/admin/coachs" element={
          <AdminRoute>
            <AdminLayout>
              <AdminCoachList />
            </AdminLayout>
          </AdminRoute>
        } />

        <Route path="/admin/salles" element={
          <AdminRoute>
            <AdminLayout>
              <AdminGymList />
            </AdminLayout>
          </AdminRoute>
        } />

        <Route path="/admin/library" element={
          <AdminRoute>
            <AdminLayout>
              <div className="p-8 text-white">Modération Exercices (WIP)</div>
            </AdminLayout>
          </AdminRoute>
        } />

        {/* REDIRECTION PAR DÉFAUT */}
        <Route path="*" element={<Navigate to="/login" replace />} />

        <Route path="/demo" element={<DemoDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
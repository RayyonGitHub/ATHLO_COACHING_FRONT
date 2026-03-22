import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Pages Publiques
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import CoachAnalytics from './pages/CoachAnalytics';
import ProgrammeList from './pages/ProgrammeList';
import CoachCalendar from './pages/CoachCalendar';

// Pages Protégées Coach/Athlète
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './components/layouts/MainLayout';
import AthleteLayout from './components/layouts/AthleteLayout'; // <-- NOUVEL IMPORT ICI

import Dashboard from './pages/Dashboard';
import ClientList from './components/ClientList';
import DemoDashboard from './pages/DemoDashboard';
import AthleteDashboard from './pages/AthleteDashboard';
import ProspectDashboard from './pages/ProspectDashboard';

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

import SessionBuilder from './components/SessionBuilder';
import ExerciceManager from './pages/ExerciceManager';

function App() {
  // Optionnel : Récupérer l'utilisateur courant pour le Layout Athlète
  const currentUser = JSON.parse(localStorage.getItem('user')) || {};

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
            <MainLayout
              activePageLabel="Dashboard"
              headerSection="Coach"
              headerSubSection="Analyses & Performance"
            >
              <CoachAnalytics />
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
        <Route path="/exercices" element={
          <ProtectedRoute>
            <MainLayout activePageLabel="Exercices" headerSection="Bibliothèque" headerSubSection="Base de données">
              <ExerciceManager />
            </MainLayout>
          </ProtectedRoute>
        } />
        <Route path="/programmes" element={
          <ProtectedRoute>
            <MainLayout activePageLabel="Programmes" headerSection="Coach" headerSubSection="Gestion des Programmes">
              <ProgrammeList />
            </MainLayout>
          </ProtectedRoute>
        } />
        {/* === ESPACE COACH (Suite) === */}
        <Route path="/calendar" element={
          <ProtectedRoute>
            <MainLayout
              activePageLabel="Calendrier"
              headerSection="Coach"
              headerSubSection="Agenda & Planification"
            >
              <CoachCalendar />
            </MainLayout>
          </ProtectedRoute>
        } />

        {/* === ESPACE ATHLÈTE (NOUVEAU LAYOUT) === */}
        <Route path="/athlete" element={
          <ProtectedRoute>
            <AthleteLayout user={currentUser} />
          </ProtectedRoute>
        }>
          {/* Les sous-routes s'afficheront à la place de l'<Outlet /> dans AthleteLayout */}
          <Route path="dashboard" element={<AthleteDashboard />} />
         <Route path="calendar" element={<div className="text-white text-center mt-20">Page Calendrier en construction 🚧</div>} />
          <Route path="programmes" element={<div className="text-white text-center mt-20">Page Programmes en construction 🚧</div>} />
          <Route path="statistiques" element={<div className="text-white text-center mt-20">Page Statistiques en construction 🚧</div>} />
          </Route>

        {/* === ESPACE PROSPECT === */}
        <Route path="/prospect/dashboard" element={
          <ProtectedRoute>
            <ProspectDashboard />
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

        <Route path="/builder" element={
          <ProtectedRoute>
            <MainLayout activePageLabel="Créateur de Séance" headerSection="Programmes" headerSubSection="Builder">
              <SessionBuilder />
            </MainLayout>
          </ProtectedRoute>
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
        <Route path="/coach/analytics" element={<CoachAnalytics />} />
      </Routes>
    </Router>
  );
}

export default App;
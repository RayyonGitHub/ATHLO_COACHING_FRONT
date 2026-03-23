import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import CoachAnalytics from './pages/CoachAnalytics';
import ProgrammeList from './pages/ProgrammeList';
import CoachCalendar from './pages/CoachCalendar';

import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './components/layouts/MainLayout';
import AthleteLayout from './components/layouts/AthleteLayout';

import ClientList from './components/ClientList';
import DemoDashboard from './pages/DemoDashboard';
import AthleteDashboard from './pages/AthleteDashboard';
import AthleteCalendar from './pages/AthleteCalendar';
import ProspectDashboard from './pages/ProspectDashboard';
import AthleteStats from './pages/AthleteStats';
import AthleteProgrammes from './pages/AthleteProgrammes'; // <-- NOUVEL IMPORT ICI

import CoachStep2 from './pages/onboarding/CoachStep2';
import CoachStep3 from './pages/onboarding/CoachStep3';
import AthleteStep2 from './pages/onboarding/AthleteStep2';
import AthleteStep3 from './pages/onboarding/AthleteStep3';

import AdminRoute from './components/AdminRoute';
import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './components/layouts/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminCoachList from './pages/admin/AdminCoachList';
import AdminGymList from './pages/admin/AdminGymList';

import SessionBuilder from './components/SessionBuilder';
import ExerciceManager from './pages/ExerciceManager';
import Messages from './pages/Messages';

function App() {
  const currentUser = JSON.parse(localStorage.getItem('user')) || {};

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/onboarding/coach/step2" element={<ProtectedRoute><CoachStep2 /></ProtectedRoute>} />
        <Route path="/onboarding/coach/step3" element={<ProtectedRoute><CoachStep3 /></ProtectedRoute>} />
        <Route path="/onboarding/athlete/step2" element={<ProtectedRoute><AthleteStep2 /></ProtectedRoute>} />
        <Route path="/onboarding/athlete/step3" element={<ProtectedRoute><AthleteStep3 /></ProtectedRoute>} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <MainLayout activePageLabel="Dashboard" headerSection="Coach" headerSubSection="Analyses & Performance">
                <CoachAnalytics />
              </MainLayout>
            </ProtectedRoute>
          }
        />

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

        <Route
          path="/exercices"
          element={
            <ProtectedRoute>
              <MainLayout activePageLabel="Exercices" headerSection="Bibliothèque" headerSubSection="Base de données">
                <ExerciceManager />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/programmes"
          element={
            <ProtectedRoute>
              <MainLayout activePageLabel="Programmes" headerSection="Coach" headerSubSection="Gestion des Programmes">
                <ProgrammeList />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/calendar"
          element={
            <ProtectedRoute>
              <MainLayout activePageLabel="Calendrier" headerSection="Coach" headerSubSection="Agenda & Planification">
                <CoachCalendar />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/messages"
          element={
            <ProtectedRoute>
              <MainLayout activePageLabel="Messagerie" headerSection="Coach" headerSubSection="Conversations">
                <Messages />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/builder"
          element={
            <ProtectedRoute>
              <MainLayout activePageLabel="Créateur de Séance" headerSection="Programmes" headerSubSection="Builder">
                <SessionBuilder />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/athlete"
          element={
            <ProtectedRoute roleRequired="athlete">
              <AthleteLayout user={currentUser} />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<AthleteDashboard />} />
          <Route path="calendar" element={<AthleteCalendar />} />
          <Route path="programmes" element={<AthleteProgrammes />} /> {/* <-- ROUTE MISE À JOUR ICI */}
          <Route path="statistiques" element={<AthleteStats />} />
          <Route path="messages" element={<Messages />} />
        </Route>

        <Route
          path="/prospect/dashboard"
          element={
            <ProtectedRoute>
              <ProspectDashboard />
            </ProtectedRoute>
          }
        />

        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminRoute><AdminLayout><AdminDashboard /></AdminLayout></AdminRoute>} />
        <Route path="/admin/coachs" element={<AdminRoute><AdminLayout><AdminCoachList /></AdminLayout></AdminRoute>} />
        <Route path="/admin/salles" element={<AdminRoute><AdminLayout><AdminGymList /></AdminLayout></AdminRoute>} />

        <Route path="/demo" element={<DemoDashboard />} />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Context
import { CartProvider } from './context/CartContext';

// Pages & Components
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ResetPassword from './pages/ResetPassword';
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
import ProspectCheckout from './pages/ProspectCheckout';
import ProspectPaymentSuccess from './pages/ProspectPaymentSuccess';
import ProspectPaymentFailed from './pages/ProspectPaymentFailed';
import AthleteStats from './pages/AthleteStats';
import AthleteProgrammes from './pages/AthleteProgrammes';
import AthleteSettings from './pages/AthleteSettings';
import CoachStep2 from './pages/onboarding/CoachStep2';
import CoachStep3 from './pages/onboarding/CoachStep3';
import ProspectLayout from './components/layouts/ProspectLayout';
import ProspectSalles from './pages/ProspectSalles';
import ProspectDevis from './pages/ProspectDevis';
import AdminRoute from './components/AdminRoute';
import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './components/layouts/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminCoachList from './pages/admin/AdminCoachList';
import AdminGymList from './pages/admin/AdminGymList';
import AdminAthleteList from './pages/admin/AdminAthleteList';
import AdminFinance from './pages/admin/AdminFinance';
import SessionBuilder from './components/SessionBuilder';
import ExerciceManager from './pages/ExerciceManager';
import Messages from './pages/Messages';
import CoachSettings from './pages/CoachSettings';
import InviteCheckout from './pages/InviteCheckout';
import InviteSetPassword from './pages/InviteSetPassword';

// Boutique & Strava
import Checkout from './pages/Checkout';
import ProductManager from './pages/ProductManager';
import StravaCallback from './pages/StravaCallback';
import AthleteShop from './pages/AthleteShop';
import CartPage from './pages/CartPage';
import RecipeManager from './pages/RecipeManager';
import MealPlanBuilder from './pages/MealPlanBuilder'; // Import en haut
import AthleteNutrition from './pages/AthleteNutrition';
import AthleteInvoices from './pages/AthleteInvoices';

function App() {
  const currentUser = JSON.parse(localStorage.getItem('user')) || {};

  return (
    <CartProvider>
      <Router>
        <Routes>
          {/* ROUTES PUBLIQUES */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/invite/checkout" element={<InviteCheckout />} />
          <Route path="/invite/set-password" element={<InviteSetPassword />} />
          <Route path="/demo" element={<DemoDashboard />} />

          {/* STRAVA */}
                <Route 
                  path="/auth/strava/callback" 
                  element={<StravaCallback />} 
                />

          {/* ONBOARDING */}
          <Route path="/onboarding/coach/step2" element={<ProtectedRoute><CoachStep2 /></ProtectedRoute>} />
          <Route path="/onboarding/coach/step3" element={<ProtectedRoute><CoachStep3 /></ProtectedRoute>} />

          {/* ESPACE COACH */}
          <Route path="/dashboard" element={<ProtectedRoute><MainLayout activePageLabel="Dashboard" headerSection="Coach" headerSubSection="Analyses & Performance"><CoachAnalytics /></MainLayout></ProtectedRoute>} />
          <Route path="/clients" element={<ProtectedRoute><MainLayout activePageLabel="Mes Clients" headerSection="Coach" headerSubSection="Annuaire Clients"><ClientList /></MainLayout></ProtectedRoute>} />
          <Route path="/exercices" element={<ProtectedRoute><MainLayout activePageLabel="Exercices" headerSection="Bibliothèque" headerSubSection="Base de données"><ExerciceManager /></MainLayout></ProtectedRoute>} />
          <Route path="/programmes" element={<ProtectedRoute><MainLayout activePageLabel="Programmes" headerSection="Coach" headerSubSection="Gestion des Programmes"><ProgrammeList /></MainLayout></ProtectedRoute>} />
          <Route path="/calendar" element={<ProtectedRoute><MainLayout activePageLabel="Calendrier" headerSection="Coach" headerSubSection="Agenda & Planification"><CoachCalendar /></MainLayout></ProtectedRoute>} />
          <Route path="/messages" element={<ProtectedRoute><MainLayout activePageLabel="Messagerie" headerSection="Coach" headerSubSection="Conversations"><Messages /></MainLayout></ProtectedRoute>} />
          <Route path="/builder" element={<ProtectedRoute><MainLayout activePageLabel="Créateur de Séance" headerSection="Programmes" headerSubSection="Builder"><SessionBuilder /></MainLayout></ProtectedRoute>} />
          <Route path="/boutique" element={<ProtectedRoute><MainLayout activePageLabel="Boutique"><ProductManager /></MainLayout></ProtectedRoute>} />
          <Route path="/parametres" element={<ProtectedRoute><MainLayout activePageLabel="Paramètres" headerSection="Coach" headerSubSection="Mon Compte"><CoachSettings /></MainLayout></ProtectedRoute>} />

          {/* ESPACE ATHLÈTE */}
          <Route
            path="/athlete"
            element={
              <ProtectedRoute roleRequired="athlete">
                <AthleteLayout user={currentUser} />
              </ProtectedRoute>
            }
          >
            <Route path="nutrition" element={<AthleteNutrition />} />
            <Route path="dashboard" element={<AthleteDashboard />} />
            <Route path="calendar" element={<AthleteCalendar />} />
            <Route path="programmes" element={<AthleteProgrammes />} />
            <Route path="statistiques" element={<AthleteStats />} />
            <Route path="messages" element={<Messages />} />
            <Route path="boutique" element={<AthleteShop />} />
            <Route path="cart" element={<CartPage />} />
            <Route path="checkout" element={<Checkout />} />
            <Route path="factures" element={<AthleteInvoices />} />
            <Route path="parametres" element={<AthleteSettings />} />
          </Route>

          {/* ESPACE PROSPECT */}
          <Route path="/prospect" element={<ProtectedRoute><ProspectLayout /></ProtectedRoute>}>
            <Route path="dashboard" element={<ProspectDashboard />} />
            <Route path="salles" element={<ProspectSalles />} />
            <Route path="devis" element={<ProspectDevis />} />
          </Route>
          <Route path="/prospect/checkout" element={<ProtectedRoute><ProspectCheckout /></ProtectedRoute>} />
          <Route path="/prospect/payment/success" element={<ProtectedRoute><ProspectPaymentSuccess /></ProtectedRoute>} />
          <Route path="/prospect/payment/failed" element={<ProtectedRoute><ProspectPaymentFailed /></ProtectedRoute>} />

          {/* ADMIN */}
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminRoute><AdminLayout><AdminDashboard /></AdminLayout></AdminRoute>} />
          <Route path="/admin/coachs" element={<AdminRoute><AdminLayout><AdminCoachList /></AdminLayout></AdminRoute>} />
          <Route path="/admin/salles" element={<AdminRoute><AdminLayout><AdminGymList /></AdminLayout></AdminRoute>} />
          <Route path="/admin/athletes" element={<AdminRoute><AdminLayout><AdminAthleteList /></AdminLayout></AdminRoute>} />
          <Route path="/admin/finance" element={<AdminRoute><AdminLayout><AdminFinance /></AdminLayout></AdminRoute>} />
          <Route path="*" element={<Navigate to="/login" replace />} />
          <Route 
            path="/nutrition" 
            element={
              <ProtectedRoute>
                <MainLayout activePageLabel="Nutrition" headerSection="Bibliothèque" headerSubSection="Base de données">
                  <RecipeManager />
                </MainLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/nutrition/builder" 
            element={
              <ProtectedRoute>
                <MainLayout activePageLabel="Créateur de Plan" headerSection="Nutrition" headerSubSection="Builder">
                  <MealPlanBuilder />
                </MainLayout>
              </ProtectedRoute>
            } 
          />
        
        </Routes>
      </Router>
    </CartProvider>
  );
}

export default App;
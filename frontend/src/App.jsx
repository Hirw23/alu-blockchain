import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import AppShell from './components/layout/AppShell';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import EmailVerificationPending from './pages/EmailVerificationPending';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import OnboardingBusinessSetup from './pages/OnboardingBusinessSetup';
import OnboardingDocumentsUpload from './pages/OnboardingDocumentsUpload';
import OnboardingPendingApproval from './pages/OnboardingPendingApproval';
import Dashboard from './pages/Dashboard';
import BusinessManagement from './pages/business/BusinessManagement';
import CooperativeManagement from './pages/business/CooperativeManagement';
import ProductManagement from './pages/products/ProductManagement';
import CategoryManagement from './pages/products/CategoryManagement';
import ProductRegistrationWizard from './pages/products/ProductRegistrationWizard';
import ProductDetail from './pages/products/ProductDetail';
import QrCodeManagement from './pages/products/QrCodeManagement';
import ProductVerificationHistory from './pages/products/ProductVerificationHistory';
import SupplyChainOverview from './pages/supplychain/SupplyChainOverview';
import SupplyChainTimeline from './pages/supplychain/SupplyChainTimeline';
import AddSupplyChainEvent from './pages/supplychain/AddSupplyChainEvent';
import BusinessOversight from './pages/admin/BusinessOversight';
import UserManagement from './pages/admin/UserManagement';
import RolesPermissions from './pages/admin/RolesPermissions';
import AuditLogs from './pages/admin/AuditLogs';
import NotificationsAnnouncements from './pages/admin/NotificationsAnnouncements';
import PlatformSettings from './pages/admin/PlatformSettings';
import SystemHealthDashboard from './pages/admin/SystemHealthDashboard';
import BlockchainMonitoring from './pages/admin/BlockchainMonitoring';
import AnalyticsDashboard from './pages/analytics/AnalyticsDashboard';
import ReportsCenter from './pages/reports/ReportsCenter';
import NotificationsInbox from './pages/notifications/NotificationsInbox';
import Help from './pages/help/Help';
import PublicVerify from './pages/public/PublicVerify';

// Route Guard to verify user is authenticated
function RequireAuth({ children }) {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

// Route Guard to restrict a route to specific role names (e.g. RequireRole roles={['PlatformAdmin']}).
function RequireRole({ roles, children }) {
  const { role } = useAuth();
  if (!roles.includes(role)) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

// Route Guard to restrict a route to callers holding a specific client-side permission
// (see src/constants/permissions.js — mirrors the server's RBAC matrix for UI gating only;
// the API itself is the real enforcement point).
function RequirePermission({ permission, children }) {
  const { hasPermission } = useAuth();
  if (!hasPermission(permission)) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email-notice" element={<EmailVerificationPending />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/verify/:token" element={<PublicVerify />} />

          {/* Protected Onboarding Routes (no AppShell — business isn't verified/active yet) */}
          <Route
            path="/onboarding/business-setup"
            element={
              <RequireAuth>
                <OnboardingBusinessSetup />
              </RequireAuth>
            }
          />
          <Route
            path="/onboarding/documents-upload/:id"
            element={
              <RequireAuth>
                <OnboardingDocumentsUpload />
              </RequireAuth>
            }
          />
          <Route
            path="/onboarding/pending-approval"
            element={
              <RequireAuth>
                <OnboardingPendingApproval />
              </RequireAuth>
            }
          />
          {/* Reused for registering a second business from inside the app */}
          <Route
            path="/business/new"
            element={
              <RequireAuth>
                <OnboardingBusinessSetup />
              </RequireAuth>
            }
          />

          {/* Main authenticated application — nested under the shared sidebar/topbar shell */}
          <Route
            element={
              <RequireAuth>
                <AppShell />
              </RequireAuth>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />

            <Route path="/business" element={<BusinessManagement />} />
            <Route path="/cooperatives" element={<CooperativeManagement />} />

            <Route path="/products" element={<ProductManagement />} />
            <Route
              path="/products/categories"
              element={
                <RequirePermission permission="product:manage-categories">
                  <CategoryManagement />
                </RequirePermission>
              }
            />
            <Route path="/products/new" element={<ProductRegistrationWizard />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/products/:id/timeline" element={<SupplyChainTimeline />} />
            <Route path="/products/:id/qr" element={<QrCodeManagement />} />
            <Route path="/products/:id/verifications" element={<ProductVerificationHistory />} />

            <Route path="/supply-chain" element={<SupplyChainOverview />} />
            <Route path="/supply-chain/events/new" element={<AddSupplyChainEvent />} />

            <Route path="/businesses" element={<BusinessOversight />} />

            <Route
              path="/admin/users"
              element={
                <RequireRole roles={['PlatformAdmin']}>
                  <UserManagement />
                </RequireRole>
              }
            />
            <Route
              path="/admin/roles"
              element={
                <RequireRole roles={['PlatformAdmin']}>
                  <RolesPermissions />
                </RequireRole>
              }
            />
            <Route
              path="/admin/audit-logs"
              element={
                <RequireRole roles={['PlatformAdmin']}>
                  <AuditLogs />
                </RequireRole>
              }
            />
            <Route
              path="/admin/announcements"
              element={
                <RequireRole roles={['PlatformAdmin']}>
                  <NotificationsAnnouncements />
                </RequireRole>
              }
            />
            <Route
              path="/admin/settings"
              element={
                <RequireRole roles={['PlatformAdmin']}>
                  <PlatformSettings />
                </RequireRole>
              }
            />
            <Route
              path="/admin/system-health"
              element={
                <RequireRole roles={['PlatformAdmin']}>
                  <SystemHealthDashboard />
                </RequireRole>
              }
            />
            <Route
              path="/admin/blockchain"
              element={
                <RequireRole roles={['PlatformAdmin']}>
                  <BlockchainMonitoring />
                </RequireRole>
              }
            />

            <Route path="/analytics" element={<AnalyticsDashboard />} />
            <Route path="/reports" element={<ReportsCenter />} />
            <Route path="/notifications" element={<NotificationsInbox />} />
            <Route path="/help" element={<Help />} />
          </Route>

          {/* Catch all redirect to Landing Page */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export { RequireAuth, RequireRole, RequirePermission };


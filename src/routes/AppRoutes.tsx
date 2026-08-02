import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthLayout } from '../layouts/AuthLayout';
import { AppLayout } from '../layouts/AppLayout';
import { AdminLayout } from '../layouts/AdminLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { AdminRoute } from './AdminRoute';
import { LoadingSpinner } from '../components/LoadingSpinner';

// 🚀 Performance Optimization: Route-Level Code Splitting
// By lazy loading these pages, we split our massive 1.7MB JS bundle into smaller chunks.
// Users only download the JavaScript for the specific page they are visiting.

const Landing = React.lazy(() =>
  import('../pages/Landing').then((module) => ({ default: module.Landing })),
);
const Login = React.lazy(() =>
  import('../pages/Login').then((module) => ({ default: module.Login })),
);
const Register = React.lazy(() =>
  import('../pages/Register').then((module) => ({ default: module.Register })),
);
const AdminSignup = React.lazy(() =>
  import('../pages/AdminSignup').then((module) => ({ default: module.AdminSignup })),
);
const PendingVerification = React.lazy(() =>
  import('../pages/PendingVerification').then((module) => ({
    default: module.PendingVerification,
  })),
);
const ForgotPassword = React.lazy(() =>
  import('../pages/ForgotPassword').then((module) => ({ default: module.ForgotPassword })),
);
const NotFound = React.lazy(() =>
  import('../pages/NotFound').then((module) => ({ default: module.NotFound })),
);
const DesignSystem = React.lazy(() =>
  import('../pages/DesignSystem').then((module) => ({ default: module.DesignSystem })),
);

const BusinessOnboarding = React.lazy(() =>
  import('../pages/BusinessOnboarding').then((module) => ({ default: module.BusinessOnboarding })),
);
const DashboardPage = React.lazy(() =>
  import('../pages/DashboardPage').then((module) => ({ default: module.DashboardPage })),
);
const Settings = React.lazy(() =>
  import('../pages/Settings').then((module) => ({ default: module.Settings })),
);
const Profile = React.lazy(() =>
  import('../pages/Profile').then((module) => ({ default: module.Profile })),
);
const Inventory = React.lazy(() =>
  import('../pages/Inventory').then((module) => ({ default: module.Inventory })),
);
const InventoryHistory = React.lazy(() =>
  import('../pages/InventoryHistory').then((module) => ({ default: module.InventoryHistory })),
);
const NewSale = React.lazy(() =>
  import('../pages/NewSale').then((module) => ({ default: module.NewSale })),
);
const SalesHistory = React.lazy(() =>
  import('../pages/SalesHistory').then((module) => ({ default: module.SalesHistory })),
);
const Expenses = React.lazy(() =>
  import('../pages/Expenses').then((module) => ({ default: module.Expenses })),
);
const NewExpense = React.lazy(() =>
  import('../pages/NewExpense').then((module) => ({ default: module.NewExpense })),
);
const EditExpense = React.lazy(() =>
  import('../pages/EditExpense').then((module) => ({ default: module.EditExpense })),
);
const Financials = React.lazy(() =>
  import('../pages/Financials').then((module) => ({ default: module.Financials })),
);
const ReportsPage = React.lazy(() =>
  import('../pages/ReportsPage').then((module) => ({ default: module.ReportsPage })),
);

// Admin Routes
const AdminDashboard = React.lazy(() =>
  import('../pages/admin/AdminDashboard').then((module) => ({ default: module.AdminDashboard })),
);
const AdminUsers = React.lazy(() =>
  import('../pages/admin/AdminUsers').then((module) => ({ default: module.AdminUsers })),
);
const AdminBusinesses = React.lazy(() =>
  import('../pages/admin/AdminBusinesses').then((module) => ({ default: module.AdminBusinesses })),
);
const AdminFinancials = React.lazy(() =>
  import('../pages/admin/AdminFinancials').then((module) => ({ default: module.AdminFinancials })),
);

const SuspenseFallback = () => (
  <div
    style={{
      height: '100vh',
      width: '100vw',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--bg-app)',
    }}
  >
    <LoadingSpinner size="lg" color="var(--brand-primary)" />
  </div>
);

export const AppRoutes: React.FC = () => {
  return (
    <Suspense fallback={<SuspenseFallback />}>
      <Routes>
        {/* Root Public Landing */}
        <Route path="/" element={<Landing />} />
        <Route path="/design-system" element={<DesignSystem />} />

        {/* Public Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin-signup" element={<AdminSignup />} />
          <Route path="/pending-verification" element={<PendingVerification />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          {/* Protected Onboarding Screen for Authenticated Users without a Business */}
          <Route element={<ProtectedRoute requireBusiness={false} />}>
            <Route path="/onboarding" element={<BusinessOnboarding />} />
          </Route>
        </Route>

        {/* Protected Business Workspace (Requires BOTH Authentication and a Registered Business) */}
        <Route element={<ProtectedRoute requireBusiness={true} />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/inventory-ledger" element={<InventoryHistory />} />
            <Route path="/sales" element={<NewSale />} />
            <Route path="/sales-history" element={<SalesHistory />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/expenses/new" element={<NewExpense />} />
            <Route path="/expenses/edit/:id" element={<EditExpense />} />
            <Route path="/financials" element={<Financials />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Route>

        {/* Protected Admin Routes */}
        <Route element={<AdminRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/businesses" element={<AdminBusinesses />} />
            <Route path="/admin/financials" element={<AdminFinancials />} />
          </Route>
        </Route>

        {/* Fallback 404 Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

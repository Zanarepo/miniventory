import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useBusiness } from '../hooks/useBusiness';
import { LoadingSpinner } from '../components/LoadingSpinner';

interface ProtectedRouteProps {
  /**
   * Whether to enforce that the user has completed Business Onboarding.
   * Defaults to true (used for Dashboard and Settings).
   * Set to false for the Onboarding route itself to prevent infinite redirects.
   */
  requireBusiness?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ requireBusiness = true }) => {
  const { session, profile, isLoading: authLoading } = useAuth();
  const { business, isLoading: businessLoading } = useBusiness();

  if (authLoading || (requireBusiness && businessLoading)) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--bg-app)',
          color: 'var(--text-muted)',
          gap: '14px',
          fontSize: '0.95rem',
        }}
      >
        <LoadingSpinner size="lg" color="var(--brand-primary)" />
        <span style={{ fontWeight: 600 }}>
          Verifying active enterprise session & business profile...
        </span>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  // Enforce business registration before accessing main dashboard modules
  if (requireBusiness && !business) {
    if (profile?.role === 'admin' || profile?.role === 'superadmin') {
      return <Navigate to="/admin" replace />;
    }
    return <Navigate to="/onboarding" replace />;
  }

  // If user visits /onboarding but already owns a registered business, take them to dashboard
  if (!requireBusiness && business) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

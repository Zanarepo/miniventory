import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LoadingSpinner } from '../components/LoadingSpinner';

export const AdminRoute: React.FC = () => {
  const { session, profile, isLoading } = useAuth();

  if (isLoading) {
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
        <span style={{ fontWeight: 600 }}>Verifying admin access...</span>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (!profile || (profile.role !== 'admin' && profile.role !== 'superadmin')) {
    // If authenticated but not an admin, send them to the regular dashboard
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

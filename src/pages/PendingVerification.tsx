import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components';
import { Clock, LogOut } from 'lucide-react';

export const PendingVerification: React.FC = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div style={{ textAlign: 'center', padding: '40px 20px' }}>
      <div
        style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: 'var(--bg-card)',
          border: '4px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px',
          color: 'var(--text-muted)',
        }}
      >
        <Clock size={40} />
      </div>

      <h2
        style={{
          margin: '0 0 16px',
          fontSize: 'clamp(1.5rem, 4vw, 2rem)',
          fontWeight: 800,
          color: 'var(--text-main)',
          letterSpacing: '-0.02em',
        }}
      >
        Account Pending Verification
      </h2>

      <p
        style={{
          margin: '0 auto 32px',
          color: 'var(--text-muted)',
          fontSize: '1.05rem',
          lineHeight: 1.6,
          maxWidth: '500px',
        }}
      >
        Your administrator account has been created successfully, but it requires approval from a
        Superadmin before you can access the platform. Please check back later or contact the system
        administrator.
      </p>

      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <Button variant="outline" onClick={handleLogout} leftIcon={<LogOut size={18} />}>
          Sign Out
        </Button>
      </div>
    </div>
  );
};

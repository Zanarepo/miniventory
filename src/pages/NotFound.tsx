import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/Button';

export const NotFound: React.FC = () => {
  const containerStyle: React.CSSProperties = {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    padding: '24px',
    backgroundColor: 'var(--bg-app)',
  };

  return (
    <div style={containerStyle}>
      <h1 style={{ fontSize: '5rem', fontWeight: 900, color: 'var(--brand-primary)', margin: 0 }}>
        404
      </h1>
      <h2
        style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-main)', margin: '12px 0' }}
      >
        Page Not Found
      </h2>
      <p style={{ color: 'var(--text-muted)', maxWidth: '450px', margin: '0 0 28px' }}>
        The business record or screen you are searching for does not exist or has been archived.
      </p>
      <Link to="/" style={{ textDecoration: 'none' }}>
        <Button variant="primary" size="md">
          🏠 Return to Homepage
        </Button>
      </Link>
    </div>
  );
};

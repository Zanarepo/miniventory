import React, { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button, Input, Toast } from '../components';
import { User, Phone, Lock, Shield, ArrowRight, Eye, EyeOff } from 'lucide-react';

export const AdminSignup: React.FC = () => {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [pinOrPassword, setPinOrPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!identifier.trim()) {
      setErrorMessage('Please provide your mobile phone number or email.');
      return;
    }

    if (pinOrPassword.length < 6) {
      setErrorMessage('Your PIN or password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);

    const isPhone = !identifier.includes('@');
    const phoneValue = isPhone ? identifier : '';

    const { error } = await signUp(identifier, pinOrPassword, {
      full_name: fullName,
      phone: phoneValue,
      requested_role: 'admin',
    });

    setIsLoading(false);

    if (error) {
      setErrorMessage(error.message || 'Error requesting admin access.');
    } else {
      setSuccessMessage('Admin request submitted successfully.');
      setTimeout(() => navigate('/pending-verification'), 2000);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
        <Shield size={24} style={{ color: 'var(--brand-primary)' }} />
        <h2
          style={{
            margin: 0,
            fontSize: 'clamp(1.4rem, 3.5vw, 1.7rem)',
            fontWeight: 800,
            color: 'var(--text-main)',
            letterSpacing: '-0.02em',
          }}
        >
          Admin Access Request
        </h2>
      </div>
      <p
        style={{
          margin: '0 0 24px',
          color: 'var(--text-muted)',
          fontSize: '0.92rem',
          lineHeight: 1.5,
        }}
      >
        Sign up to become a platform administrator. Your account will require approval from a
        Superadmin before you can access the portal.
      </p>

      <form onSubmit={handleSubmit} noValidate className="form-grid-2">
        <div style={{ gridColumn: '1 / -1' }}>
          <Input
            label="Full Name"
            type="text"
            placeholder="e.g. Jane Doe"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            leftIcon={<User size={17} />}
          />
        </div>

        <div style={{ gridColumn: '1 / -1' }}>
          <Input
            label="Phone Number or Email"
            type="text"
            placeholder="080... or name@email.com"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
            leftIcon={<Phone size={17} />}
          />
        </div>

        <div style={{ gridColumn: '1 / -1' }}>
          <Input
            label="Secure Password / PIN"
            type={showPassword ? 'text' : 'password'}
            placeholder="At least 6 characters"
            value={pinOrPassword}
            onChange={(e) => setPinOrPassword(e.target.value)}
            required
            leftIcon={<Lock size={17} />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'inherit',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            }
          />
        </div>

        <div style={{ gridColumn: '1 / -1', marginTop: '16px' }}>
          <Button
            type="submit"
            variant="primary"
            style={{ width: '100%' }}
            isLoading={isLoading}
            rightIcon={<ArrowRight size={18} />}
          >
            Submit Request
          </Button>
        </div>
      </form>

      <div style={{ marginTop: '24px', textAlign: 'center' }}>
        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Already have an account?{' '}
          <Link
            to="/login"
            style={{
              color: 'var(--brand-primary)',
              textDecoration: 'none',
              fontWeight: 600,
            }}
          >
            Sign in
          </Link>
        </p>
      </div>

      {errorMessage && (
        <Toast type="error" message={errorMessage} onClose={() => setErrorMessage(null)} />
      )}
      {successMessage && (
        <Toast type="success" message={successMessage} onClose={() => setSuccessMessage(null)} />
      )}
    </div>
  );
};

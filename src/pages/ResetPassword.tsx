import React, { useState, useEffect, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Button, Input, Toast } from '../components';
import { Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';

export const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [sessionFound, setSessionFound] = useState(true);

  useEffect(() => {
    // Check if we have a valid session (Supabase automatically signs in the user when they click the reset link)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        // If there is a hash in the URL, Supabase might still be processing it.
        if (!window.location.hash.includes('access_token')) {
          setSessionFound(false);
        }
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, _session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setSessionFound(true);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (newPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setIsLoading(true);

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    setIsLoading(false);

    if (error) {
      setErrorMessage(error.message);
    } else {
      setSuccessMessage('Your password has been successfully updated! Redirecting to dashboard...');
      setTimeout(() => navigate('/dashboard'), 2500);
    }
  };

  if (!sessionFound) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px' }}>
        <h2 style={{ color: 'var(--brand-danger)', marginBottom: '16px' }}>
          Invalid or Expired Link
        </h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
          This password reset link is invalid or has expired. Please request a new one.
        </p>
        <Button onClick={() => navigate('/forgot-password')}>Request New Link</Button>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
        <CheckCircle size={24} color="var(--brand-primary)" />
        <h2
          style={{
            margin: 0,
            fontSize: 'clamp(1.4rem, 3.5vw, 1.7rem)',
            fontWeight: 800,
            color: 'var(--text-main)',
            letterSpacing: '-0.02em',
          }}
        >
          Set New Password
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
        Please enter your new password below.
      </p>

      <form onSubmit={handleSubmit} noValidate>
        <div style={{ marginBottom: '16px' }}>
          <Input
            label="New Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
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
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            }
          />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <Input
            label="Confirm New Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            leftIcon={<Lock size={17} />}
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          style={{ width: '100%' }}
          isLoading={isLoading}
        >
          Update Password
        </Button>
      </form>

      {errorMessage && (
        <Toast message={errorMessage} type="error" onClose={() => setErrorMessage(null)} />
      )}
      {successMessage && (
        <Toast message={successMessage} type="success" onClose={() => setSuccessMessage(null)} />
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Loader2, Store } from 'lucide-react';

export const Join: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const code = searchParams.get('code');
  const email = searchParams.get('email');

  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!code || !email) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setError('Invalid invite link. Missing code or email.');
    }
  }, [code, email]);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !code) return;

    setLoading(true);
    setError(null);

    try {
      // Create user account via Supabase Auth
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (signUpError) {
        if (signUpError.message.includes('already registered')) {
          // If already registered, they can just log in
          alert(
            'This email is already registered. Please log in first, then use your invite link again, or click Join Another Store in your dashboard.',
          );
          navigate('/login');
          return;
        }
        throw signUpError;
      }

      setSuccess(true);

      // We will automatically store the code in localStorage so that after verification,
      // the onboarding flow can detect it and apply it.
      localStorage.setItem('pending_join_code', code);
      localStorage.setItem('pending_join_email', email);
    } catch (err: any) {
      setError(err.message || 'Failed to create account.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          backgroundColor: 'var(--bg-app)',
        }}
      >
        <Card style={{ maxWidth: '400px', width: '100%', padding: '32px', textAlign: 'center' }}>
          <div
            style={{
              display: 'inline-flex',
              padding: '16px',
              backgroundColor: 'var(--brand-info-light)',
              borderRadius: '50%',
              marginBottom: '24px',
            }}
          >
            <Store size={48} color="var(--brand-primary)" />
          </div>
          <h1
            style={{
              fontSize: '1.5rem',
              fontWeight: 800,
              color: 'var(--text-main)',
              marginBottom: '16px',
            }}
          >
            Check your email!
          </h1>
          <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '24px' }}>
            We've sent a verification link to <strong>{email}</strong>. Please check your inbox (and
            spam folder) and click the link to verify your account and join the business.
          </p>
          <Button variant="primary" onClick={() => navigate('/login')} style={{ width: '100%' }}>
            Go to Login
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        backgroundColor: 'var(--bg-app)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '32px' }}>
        <Store size={32} color="var(--brand-primary)" />
        <span
          style={{
            fontSize: '1.5rem',
            fontWeight: 800,
            color: 'var(--text-main)',
            letterSpacing: '-0.02em',
          }}
        >
          Miniventory
        </span>
      </div>

      <Card style={{ maxWidth: '400px', width: '100%', padding: '32px' }}>
        <h1
          style={{
            fontSize: '1.5rem',
            fontWeight: 800,
            color: 'var(--text-main)',
            marginBottom: '8px',
          }}
        >
          Join Team
        </h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
          Complete your profile to accept the invitation for <strong>{email}</strong>.
        </p>

        {error && (
          <div
            style={{
              padding: '12px',
              backgroundColor: '#fee2e2',
              color: '#b91c1c',
              borderRadius: 'var(--radius-md)',
              marginBottom: '24px',
              fontSize: '0.875rem',
            }}
          >
            {error}
          </div>
        )}

        <form
          onSubmit={handleJoin}
          style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
        >
          <Input
            label="Full Name"
            type="text"
            required
            placeholder="John Doe"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            disabled={loading || !code}
          />
          <Input
            label="Password"
            type="password"
            required
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading || !code}
            minLength={6}
          />

          <Button
            type="submit"
            variant="primary"
            disabled={loading || !code || !fullName || !password}
            style={{ marginTop: '8px' }}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Loader2 size={16} className="animate-spin" />
                Creating Account...
              </span>
            ) : (
              'Create Account & Join'
            )}
          </Button>
        </form>
      </Card>
    </div>
  );
};

import React, { useState, useEffect, type FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Button, Input, Toast, Card } from '../components';
import { Lock, User, ArrowRight, CheckCircle } from 'lucide-react';

export const JoinSetup: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const businessId = searchParams.get('business_id');
  const businessName = searchParams.get('business_name') || 'the team';

  useEffect(() => {
    // If they arrived without a business ID or not authenticated by the URL hash, redirect
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session || !businessId) {
        navigate('/');
      }
    });
  }, [businessId, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!businessId) return;

    if (!fullName.trim() || password.length < 6) {
      setErrorMessage('Please enter your full name and a password of at least 6 characters.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      // Update their password
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.updateUser({
        password: password,
      });

      if (authError || !user) throw new Error(authError?.message || 'Failed to update password');

      // Update their profile name (include email to prevent not-null constraint errors on upsert)
      const { error: profileError } = await supabase.from('profiles').upsert({
        id: user.id,
        email: user.email,
        full_name: fullName.trim(),
      });

      if (profileError) throw profileError;

      // Accept the invite in the DB
      const { data, error: rpcError } = await supabase.rpc('accept_email_invite', {
        p_business_id: businessId,
      });

      if (rpcError || !data?.success) {
        throw new Error(rpcError?.message || data?.error || 'Failed to join business.');
      }

      setSuccessMessage(`Successfully joined ${businessName}! Redirecting to dashboard...`);

      setTimeout(() => {
        // Full page reload to ensure all providers grab the new user and business state
        window.location.href = '/dashboard';
      }, 1500);
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred');
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        backgroundColor: 'var(--bg-app)',
      }}
    >
      <div style={{ width: '100%', maxWidth: '440px' }}>
        <Card style={{ padding: '40px 32px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                backgroundColor: 'var(--brand-primary-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--brand-primary)',
              }}
            >
              <CheckCircle size={28} />
            </div>
          </div>

          <h1
            style={{
              fontSize: '1.75rem',
              fontWeight: 800,
              textAlign: 'center',
              marginBottom: '8px',
              color: 'var(--text-main)',
              letterSpacing: '-0.03em',
            }}
          >
            Join {businessName}
          </h1>
          <p
            style={{
              color: 'var(--text-muted)',
              textAlign: 'center',
              marginBottom: '32px',
              fontSize: '1rem',
              lineHeight: 1.5,
            }}
          >
            You've been invited! Please set your name and a secure password to join the dashboard.
          </p>

          <form
            onSubmit={handleSubmit}
            style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
          >
            <Input
              label="Full Name"
              type="text"
              placeholder="e.g. John Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              leftIcon={<User size={18} />}
            />
            <Input
              label="Create Password"
              type="password"
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              leftIcon={<Lock size={18} />}
            />
            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              style={{ width: '100%', marginTop: '8px', fontWeight: 800 }}
              rightIcon={<ArrowRight size={18} />}
            >
              Join Dashboard
            </Button>
          </form>
        </Card>
      </div>

      {errorMessage && (
        <Toast message={errorMessage} type="error" onClose={() => setErrorMessage(null)} />
      )}
      {successMessage && (
        <Toast message={successMessage} type="success" onClose={() => setSuccessMessage(null)} />
      )}
    </div>
  );
};

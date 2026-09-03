import React, { useState, useEffect, type FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Button, Input, Toast, Card } from '../components';
import { Lock, User, ArrowRight, CheckCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export const JoinSetup: React.FC = () => {
  const { session, isLoading: authLoading } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const businessId = searchParams.get('business_id');
  const businessName = searchParams.get('business_name') || 'the team';

  const [isExistingUser, setIsExistingUser] = useState(false);
  const [profileName, setProfileName] = useState('');

  useEffect(() => {
    if (!businessId) {
      navigate('/');
      return;
    }

    if (authLoading) return;

    // If they arrived without being authenticated AND without an email in URL, redirect to root
    if (!session && !window.location.hash.includes('access_token') && !searchParams.get('email')) {
      navigate('/');
      return;
    }

    if (session?.user) {
      supabase
        .from('profiles')
        .select('full_name')
        .eq('id', session.user.id)
        .single()
        .then(({ data: profile }) => {
          if (profile?.full_name) {
            setIsExistingUser(true);
            setProfileName(profile.full_name);
          }
        });
    }
  }, [authLoading, session, businessId, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!businessId) return;

    if (!isExistingUser) {
      if (!fullName.trim() || password.length < 6) {
        setErrorMessage('Please enter your full name and a password of at least 6 characters.');
        return;
      }
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      if (!isExistingUser) {
        // Native sign up for a truly new user
        const emailFromUrl = searchParams.get('email');
        if (!emailFromUrl) throw new Error('Missing email from invite');

        // If they somehow have a stale local session (e.g. from a deleted test account), clear it first
        if (session) {
          await supabase.auth.signOut();
        }

        // Save the business ID so we can auto-accept the invite after they confirm their email
        localStorage.setItem('miniventory_pending_invite_business_id', businessId);

        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: emailFromUrl,
          password: password,
          options: {
            data: { full_name: fullName.trim() },
          },
        });

        if (signUpError) throw new Error(signUpError.message);

        if (!signUpData.session) {
          setSuccessMessage(
            'Account created successfully! Please check your email to confirm your account. Once confirmed, you can log in to access the workspace.',
          );
          setIsLoading(false);
          return;
        }
      }

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
            {isExistingUser
              ? `Welcome back, ${profileName}! You've been invited to join the workspace for ${businessName}.`
              : `You've been invited! Please set your name and a secure password to join the dashboard.`}
          </p>

          <form
            onSubmit={handleSubmit}
            style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
          >
            {!isExistingUser && (
              <>
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
              </>
            )}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              style={{ width: '100%', marginTop: '8px', fontWeight: 800 }}
              rightIcon={<ArrowRight size={18} />}
            >
              {isExistingUser ? 'Accept & Join Workspace' : 'Join Dashboard'}
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

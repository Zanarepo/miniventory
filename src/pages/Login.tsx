import React, { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';
import { Button, Input, Toast } from '../components';
import { Phone, Lock, ArrowRight, Mail, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../lib/supabase';

export const Login: React.FC = () => {
  const { signIn } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('');
  const [pinOrPassword, setPinOrPassword] = useState('');
  const [useMagicLink, setUseMagicLink] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    const { error, user } = await signIn(identifier, useMagicLink ? undefined : pinOrPassword);

    setIsLoading(false);
    if (error) {
      setErrorMessage(error.message || 'Unable to sign in. Please verify your phone number / PIN.');
    } else if (useMagicLink) {
      setSuccessMessage('Magic login link sent! Please check your email inbox.');
    } else {
      if (user) {
        const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single();
        if (data && data.role === 'pending_admin') {
          navigate('/pending-verification');
        } else if (data && (data.role === 'admin' || data.role === 'superadmin')) {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      } else {
        navigate('/dashboard');
      }
    }
  };

  return (
    <div>
      <h2
        style={{
          margin: '0 0 6px',
          fontSize: 'clamp(1.4rem, 3.5vw, 1.7rem)',
          fontWeight: 800,
          color: 'var(--text-main)',
          letterSpacing: '-0.02em',
        }}
      >
        {t('signInTitle')}
      </h2>
      <p
        style={{
          margin: '0 0 24px',
          color: 'var(--text-muted)',
          fontSize: '0.92rem',
          lineHeight: 1.5,
        }}
      >
        {useMagicLink
          ? 'Enter your registered email address below to receive an automated passwordless authentication token.'
          : t('signInSubtitle')}
      </p>

      <form onSubmit={handleSubmit} noValidate className={useMagicLink ? undefined : 'form-grid-2'}>
        <div className={useMagicLink ? undefined : 'col-span-1'}>
          <Input
            label={t('phoneLabel')}
            type="text"
            placeholder={t('phonePlaceholder')}
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
            helperText={t('phoneHelper')}
            leftIcon={useMagicLink ? <Mail size={17} /> : <Phone size={17} />}
          />
        </div>

        {!useMagicLink && (
          <div className="col-span-1">
            <Input
              label={t('pinLabel')}
              type={showPassword ? 'text' : 'password'}
              placeholder={t('pinPlaceholder')}
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
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              }
            />
          </div>
        )}

        <div
          className={useMagicLink ? undefined : 'col-span-2'}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px',
            fontSize: '0.875rem',
            flexWrap: 'wrap',
            gap: '8px',
          }}
        >
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              fontWeight: 500,
            }}
          >
            <input
              type="checkbox"
              checked={useMagicLink}
              onChange={(e) => setUseMagicLink(e.target.checked)}
              style={{
                cursor: 'pointer',
                width: '16px',
                height: '16px',
                accentColor: 'var(--brand-primary)',
              }}
            />
            {t('useMagicLink')}
          </label>
          {!useMagicLink && (
            <Link
              to="/forgot-password"
              style={{ color: 'var(--brand-primary)', textDecoration: 'none', fontWeight: 700 }}
            >
              {t('forgotPin')}
            </Link>
          )}
        </div>

        <div className={useMagicLink ? undefined : 'col-span-2'}>
          <Button
            type="submit"
            variant="primary"
            size="lg"
            style={{ width: '100%' }}
            isLoading={isLoading}
            rightIcon={!useMagicLink ? <ArrowRight size={18} /> : undefined}
          >
            {useMagicLink ? 'Send Magic Token 📧' : t('signInButton')}
          </Button>
        </div>
      </form>

      <div
        style={{
          marginTop: '24px',
          textAlign: 'center',
          fontSize: '0.92rem',
          color: 'var(--text-muted)',
          borderTop: '1px solid var(--border-color)',
          paddingTop: '16px',
        }}
      >
        {t('noAccountYet')}{' '}
        <Link
          to="/register"
          style={{ color: 'var(--brand-primary)', fontWeight: 700, textDecoration: 'none' }}
        >
          {t('registerNowLink')}
        </Link>
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

import React, { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';
import { Button, Input, Toast } from '../components';
import { User, Phone, Lock, HelpCircle, ArrowRight, Eye, EyeOff } from 'lucide-react';

const SECURITY_QUESTIONS = [
  "What is your mother's maiden name?",
  'In which market or town did you open your first shop?',
  'What is the name of your best childhood friend?',
  'What is your favourite native food or meal?',
  'What is the name of your oldest child?',
];

export const Register: React.FC = () => {
  const { signUp } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [pinOrPassword, setPinOrPassword] = useState('');
  const [securityQuestion, setSecurityQuestion] = useState(SECURITY_QUESTIONS[0]);
  const [securityAnswer, setSecurityAnswer] = useState('');
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
      setErrorMessage('Your secret PIN or password must be at least 6 digits/characters.');
      return;
    }

    if (!securityAnswer.trim()) {
      setErrorMessage('Please provide an answer to your security recovery question.');
      return;
    }

    setIsLoading(true);

    const isPhone = !identifier.includes('@');
    const phoneValue = isPhone ? identifier : '';

    const { error } = await signUp(identifier, pinOrPassword, {
      full_name: fullName,
      phone: phoneValue,
      security_question: securityQuestion,
      security_answer: securityAnswer.trim().toLowerCase(),
    });
    setIsLoading(false);

    if (error) {
      setErrorMessage(error.message || 'Error creating account. Please check your details.');
    } else {
      setSuccessMessage(
        'Business account registered successfully! You can now sign in with your Phone and PIN.',
      );
      setTimeout(() => navigate('/login'), 2000);
    }
  };

  const selectStyle: React.CSSProperties = {
    width: '100%',
    padding: '11px 14px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-color)',
    backgroundColor: 'var(--bg-card)',
    color: 'var(--text-main)',
    fontSize: '0.95rem',
    fontFamily: 'var(--font-sans)',
    fontWeight: 500,
    outline: 'none',
    boxShadow: 'var(--shadow-sm)',
    transition: 'border-color var(--transition-fast), box-shadow var(--transition-fast)',
    margin: 0,
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
        {t('registerTitle')}
      </h2>
      <p
        style={{
          margin: '0 0 24px',
          color: 'var(--text-muted)',
          fontSize: '0.92rem',
          lineHeight: 1.5,
        }}
      >
        {t('registerSubtitle')}
      </p>

      <form onSubmit={handleSubmit} noValidate className="form-grid-2">
        <Input
          label={t('ownerNameLabel')}
          type="text"
          placeholder={t('ownerNamePlaceholder')}
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
          leftIcon={<User size={17} />}
        />

        <Input
          label={t('phoneLabel')}
          type="text"
          placeholder={t('phonePlaceholder')}
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          required
          helperText={t('phoneHelper')}
          leftIcon={<Phone size={17} />}
        />

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

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>
            {t('securityQuestionLabel')}
          </label>
          <select
            value={securityQuestion}
            onChange={(e) => setSecurityQuestion(e.target.value)}
            style={selectStyle}
            onFocus={(e) => (e.target.style.boxShadow = 'var(--focus-ring)')}
            onBlur={(e) => (e.target.style.boxShadow = 'var(--shadow-sm)')}
          >
            {SECURITY_QUESTIONS.map((q, idx) => (
              <option key={idx} value={q}>
                {q}
              </option>
            ))}
          </select>
        </div>

        <div className="col-span-2">
          <Input
            label={t('secretAnswerLabel')}
            type="text"
            placeholder={t('secretAnswerPlaceholder')}
            value={securityAnswer}
            onChange={(e) => setSecurityAnswer(e.target.value)}
            required
            helperText={t('secretAnswerHelper')}
            leftIcon={<HelpCircle size={17} />}
          />
        </div>

        <div className="col-span-2">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            style={{ width: '100%', marginTop: '4px' }}
            isLoading={isLoading}
            rightIcon={<ArrowRight size={18} />}
          >
            {t('registerButton')}
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
        {t('alreadyRegistered')}{' '}
        <Link
          to="/login"
          style={{ color: 'var(--brand-primary)', fontWeight: 700, textDecoration: 'none' }}
        >
          {t('signInHereLink')}
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

import React, { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button, Input, Toast } from '../components';
import { Phone, HelpCircle, Lock, ArrowRight, ArrowLeft, KeyRound } from 'lucide-react';

export const ForgotPassword: React.FC = () => {
  const { fetchSecurityQuestion, resetPinWithSecurityAnswer, resetPassword } = useAuth();
  const navigate = useNavigate();

  // Step 1: Identify account | Step 2: Answer question & set new PIN
  const [step, setStep] = useState<'identify' | 'verify_and_reset'>('identify');
  const [identifier, setIdentifier] = useState('');
  const [retrievedQuestion, setRetrievedQuestion] = useState<string | null>(null);
  const [secretAnswer, setSecretAnswer] = useState('');
  const [newPinOrPassword, setNewPinOrPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleIdentify = async (e: FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setErrorMessage('Please enter your mobile phone number or email.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setStatusMessage(null);

    // If standard email, offer both options or check question
    const { question, error } = await fetchSecurityQuestion(identifier);
    setIsLoading(false);

    if (error || !question) {
      if (identifier.includes('@')) {
        // Fallback to standard email recovery link if no security question exists
        const { error: emailErr } = await resetPassword(identifier);
        if (emailErr) {
          setErrorMessage('Account not found or error occurred.');
        } else {
          setStatusMessage(
            'Password recovery instructions have been dispatched to your email address.',
          );
        }
      } else {
        setErrorMessage(
          'We could not locate an account or security question for this phone number.',
        );
      }
    } else {
      setRetrievedQuestion(question);
      setStep('verify_and_reset');
    }
  };

  const handleResetPin = async (e: FormEvent) => {
    e.preventDefault();
    if (!secretAnswer.trim() || newPinOrPassword.length < 4) {
      setErrorMessage('Please provide your secret answer and a new 4-Digit PIN.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    const { success, error } = await resetPinWithSecurityAnswer(
      identifier,
      secretAnswer.trim().toLowerCase(),
      newPinOrPassword,
    );
    setIsLoading(false);

    if (error) {
      console.error('PIN Reset RPC Error:', error);
      setErrorMessage(
        `System Database Error: ${error.message || 'RPC execution failed'}. Please execute the latest fix SQL migration in your Supabase SQL Editor.`,
      );
    } else if (!success) {
      setErrorMessage('Incorrect secret answer! Please check your answer and try again.');
    } else {
      setStatusMessage('Your secret PIN has been successfully reset! Redirecting to sign in...');
      setTimeout(() => navigate('/login'), 2500);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
        <KeyRound size={24} color="var(--brand-primary)" />
        <h2
          style={{
            margin: 0,
            fontSize: 'clamp(1.4rem, 3.5vw, 1.7rem)',
            fontWeight: 800,
            color: 'var(--text-main)',
            letterSpacing: '-0.02em',
          }}
        >
          Recover PIN / Password
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
        {step === 'identify'
          ? 'Enter your registered phone number (or email) to instantly retrieve your secret recovery challenge.'
          : 'Answer your security question below to generate a new 4-Digit PIN immediately—no SMS latency needed!'}
      </p>

      {step === 'identify' ? (
        <form onSubmit={handleIdentify} noValidate>
          <Input
            label="Registered Phone Number or Email Address"
            type="text"
            placeholder="e.g., 08012345678"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
            leftIcon={<Phone size={17} />}
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            style={{ width: '100%', marginTop: '12px' }}
            isLoading={isLoading}
            rightIcon={<ArrowRight size={18} />}
          >
            Retrieve Security Challenge
          </Button>
        </form>
      ) : (
        <form onSubmit={handleResetPin} noValidate className="form-grid-2">
          <div
            className="col-span-2"
            style={{
              padding: '16px',
              backgroundColor: 'var(--brand-primary-light)',
              border: '1px solid hsla(158, 85%, 32%, 0.3)',
              borderRadius: 'var(--radius-md)',
              marginBottom: '4px',
            }}
          >
            <p
              style={{
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
                fontWeight: 700,
                margin: 0,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Your Chosen Security Question:
            </p>
            <p
              style={{
                fontSize: '1.05rem',
                fontWeight: 700,
                color: 'var(--brand-primary)',
                margin: '6px 0 0',
              }}
            >
              {retrievedQuestion}
            </p>
          </div>

          <div className="col-span-1">
            <Input
              label="Your Secret Answer"
              type="text"
              placeholder="Enter your secret answer"
              value={secretAnswer}
              onChange={(e) => setSecretAnswer(e.target.value)}
              required
              leftIcon={<HelpCircle size={17} />}
            />
          </div>

          <div className="col-span-1">
            <Input
              label="Create New 4-Digit PIN"
              type="password"
              placeholder="e.g., 4321"
              value={newPinOrPassword}
              onChange={(e) => setNewPinOrPassword(e.target.value)}
              required
              leftIcon={<Lock size={17} />}
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
              Reset PIN & Unlock Account
            </Button>
            <Button
              type="button"
              variant="outline"
              size="md"
              style={{ width: '100%', marginTop: '10px' }}
              onClick={() => setStep('identify')}
              leftIcon={<ArrowLeft size={16} />}
            >
              Back to Account Lookup
            </Button>
          </div>
        </form>
      )}

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
        Remember your PIN?{' '}
        <Link
          to="/login"
          style={{ color: 'var(--brand-primary)', fontWeight: 700, textDecoration: 'none' }}
        >
          Back to Sign In
        </Link>
      </div>

      {errorMessage && (
        <Toast message={errorMessage} type="error" onClose={() => setErrorMessage(null)} />
      )}
      {statusMessage && (
        <Toast message={statusMessage} type="success" onClose={() => setStatusMessage(null)} />
      )}
    </div>
  );
};

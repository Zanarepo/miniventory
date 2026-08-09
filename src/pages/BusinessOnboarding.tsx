import React, { useState, useEffect, type FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useBusiness } from '../hooks/useBusiness';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { Button, Input, Toast, BusinessCategorySelect, CurrencySelect } from '../components';
import type { BusinessCategory } from '../types/business';
import { DEFAULT_COUNTRY, DEFAULT_CURRENCY } from '../constants/businessCategories';
import { Store, Phone, MapPin, ArrowRight, Sparkles } from 'lucide-react';

export const BusinessOnboarding: React.FC = () => {
  const { createBusiness } = useBusiness();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [businessName, setBusinessName] = useState('');
  const [category, setCategory] = useState<BusinessCategory>('Provision Store');
  const [currency, setCurrency] = useState(DEFAULT_CURRENCY);
  const [phone, setPhone] = useState(profile?.phone || '');
  const [address, setAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [mode, setMode] = useState<'create' | 'join'>(
    searchParams.get('join') === 'true' ? 'join' : 'create',
  );
  const [joinCode, setJoinCode] = useState('');
  const handleJoinStore = async (code: string) => {
    setIsLoading(true);
    setErrorMessage(null);
    const { data, error } = await supabase.rpc('join_business_with_code', { join_code: code });
    setIsLoading(false);

    if (error || !data?.success) {
      setErrorMessage(error?.message || data?.error || 'Failed to join business. Invalid code.');
      sessionStorage.removeItem('miniventory_pending_join_code');
      localStorage.removeItem('pending_join_code');
      localStorage.removeItem('pending_join_email');
    } else {
      setSuccessMessage('Successfully joined the store!');
      sessionStorage.removeItem('miniventory_pending_join_code');
      localStorage.removeItem('pending_join_code');
      localStorage.removeItem('pending_join_email');
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1000);
    }
  };

  useEffect(() => {
    const pendingCode =
      sessionStorage.getItem('miniventory_pending_join_code') ||
      localStorage.getItem('pending_join_code');
    if (pendingCode) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMode('join');
      setJoinCode(pendingCode);
      handleJoinStore(pendingCode);
    }
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!businessName.trim()) {
      setErrorMessage('Please enter your official shop or business name.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    const { error } = await createBusiness({
      business_name: businessName.trim(),
      business_category: category,
      currency: currency,
      country: DEFAULT_COUNTRY,
      language: 'en',
      phone: phone.trim() || undefined,
      address: address.trim() || undefined,
    });

    setIsLoading(false);

    if (error) {
      setErrorMessage(error.message || 'Failed to register business profile. Please try again.');
    } else {
      setSuccessMessage(
        'Business successfully registered! Initializing your financial dashboard...',
      );
      setTimeout(() => navigate('/dashboard', { replace: true }), 1500);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
        <Store size={26} color="var(--brand-primary)" />
        <h2
          style={{
            margin: 0,
            fontSize: 'clamp(1.4rem, 3.5vw, 1.7rem)',
            fontWeight: 800,
            color: 'var(--text-main)',
            letterSpacing: '-0.02em',
          }}
        >
          Join or Create a Store
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
        Set up a new store or join an existing one using an invite code.
      </p>

      <div
        style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '24px',
          background: 'rgba(255, 255, 255, 0.05)',
          padding: '6px',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <button
          type="button"
          onClick={() => setMode('create')}
          style={{
            flex: 1,
            padding: '12px',
            borderRadius: '8px',
            border: 'none',
            background: mode === 'create' ? 'var(--brand-primary)' : 'transparent',
            color: mode === 'create' ? '#ffffff' : 'var(--text-muted)',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          Create New Store
        </button>
        <button
          type="button"
          onClick={() => setMode('join')}
          style={{
            flex: 1,
            padding: '12px',
            borderRadius: '8px',
            border: 'none',
            background: mode === 'join' ? 'var(--brand-primary)' : 'transparent',
            color: mode === 'join' ? '#ffffff' : 'var(--text-muted)',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          Join Existing Store
        </button>
      </div>

      {mode === 'create' ? (
        <form onSubmit={handleSubmit} noValidate className="form-grid-2">
          <div className="col-span-1">
            <Input
              label="Business or Store Name"
              type="text"
              placeholder="e.g., Chinedu Superstore & Provision"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              required
              leftIcon={<Store size={17} />}
            />
          </div>

          <div className="col-span-1">
            <Input
              label="Business Phone / WhatsApp"
              type="text"
              placeholder="e.g., 08012345678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              helperText="Used for digital customer invoicing and receipting"
              leftIcon={<Phone size={17} />}
            />
          </div>

          <div className="col-span-1">
            <BusinessCategorySelect value={category} onChange={setCategory} />
          </div>

          <div className="col-span-1">
            <CurrencySelect value={currency} onChange={setCurrency} />
          </div>

          <div className="col-span-2">
            <Input
              label="Shop Address or Market Location (Optional)"
              type="text"
              placeholder="e.g., Shop 14, Onitsha Main Market / Ikeja Plaza, Lagos"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              leftIcon={<MapPin size={17} />}
            />
          </div>

          <div className="col-span-2" style={{ marginTop: '10px' }}>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              style={{ width: '100%' }}
              isLoading={isLoading}
              rightIcon={<ArrowRight size={18} />}
              leftIcon={<Sparkles size={18} />}
            >
              Complete Onboarding & Enter Dashboard
            </Button>
          </div>
        </form>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleJoinStore(joinCode);
          }}
          className="form-grid-2"
        >
          <div className="col-span-2">
            <Input
              label="6-Digit Join Code"
              type="text"
              placeholder="e.g. A1B2C3"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              required
              maxLength={6}
            />
          </div>
          <div className="col-span-2 mt-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              style={{ width: '100%' }}
              isLoading={isLoading}
              disabled={joinCode.length < 6}
            >
              Join Store
            </Button>
          </div>
        </form>
      )}

      {errorMessage && (
        <Toast message={errorMessage} type="error" onClose={() => setErrorMessage(null)} />
      )}
      {successMessage && (
        <Toast message={successMessage} type="success" onClose={() => setSuccessMessage(null)} />
      )}
    </div>
  );
};

import React, { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBusiness } from '../hooks/useBusiness';
import { useAuth } from '../hooks/useAuth';
import { Button, Input, Toast, BusinessCategorySelect, CurrencySelect } from '../components';
import type { BusinessCategory } from '../types/business';
import { DEFAULT_COUNTRY, DEFAULT_CURRENCY } from '../constants/businessCategories';
import { Store, Phone, MapPin, ArrowRight, Sparkles } from 'lucide-react';

export const BusinessOnboarding: React.FC = () => {
  const { createBusiness } = useBusiness();
  const { profile } = useAuth();
  const navigate = useNavigate();

  const [businessName, setBusinessName] = useState('');
  const [category, setCategory] = useState<BusinessCategory>('Provision Store');
  const [currency, setCurrency] = useState(DEFAULT_CURRENCY);
  const [phone, setPhone] = useState(profile?.phone || '');
  const [address, setAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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
          Register Your Business
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
        Set up your commercial trade details and preferred ledger trading currency to unlock your
        automated financial dashboard and offline persistence.
      </p>

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

      {errorMessage && (
        <Toast message={errorMessage} type="error" onClose={() => setErrorMessage(null)} />
      )}
      {successMessage && (
        <Toast message={successMessage} type="success" onClose={() => setSuccessMessage(null)} />
      )}
    </div>
  );
};

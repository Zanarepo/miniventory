import React, { useState, type FormEvent } from 'react';
import { useBusiness } from '../hooks/useBusiness';
import { useNetwork } from '../hooks/useNetwork';
import {
  Button,
  Input,
  Toast,
  Card,
  BusinessCategorySelect,
  CurrencySelect,
  Badge,
} from '../components';
import type { Business, BusinessCategory } from '../types/business';
import { Store, Phone, MapPin, Save, Globe, Wifi, WifiOff } from 'lucide-react';

const SettingsForm: React.FC<{
  initialBusiness: Business;
  isOnline: boolean;
  onUpdate: (data: Partial<Business>) => Promise<{ error: Error | null }>;
}> = ({ initialBusiness, isOnline, onUpdate }) => {
  const [businessName, setBusinessName] = useState(initialBusiness.business_name || '');
  const [category, setCategory] = useState<BusinessCategory>(
    (initialBusiness.business_category as BusinessCategory) || 'Retail',
  );
  const [currency, setCurrency] = useState(initialBusiness.currency || 'NGN');
  const [phone, setPhone] = useState(initialBusiness.phone || '');
  const [address, setAddress] = useState(initialBusiness.address || '');
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!businessName.trim()) {
      setErrorMessage('Business name cannot be empty.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setStatusMessage(null);

    const { error } = await onUpdate({
      business_name: businessName.trim(),
      business_category: category,
      currency: currency,
      phone: phone.trim() || undefined,
      address: address.trim() || undefined,
    });

    setIsLoading(false);

    if (error) {
      setErrorMessage(error.message || 'Error saving business settings.');
    } else {
      setStatusMessage(
        isOnline
          ? '✅ Business settings updated and synced with cloud database!'
          : '📦 Offline edit saved! Changes placed in Dexie sync queue and will upload when internet restores.',
      );
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} noValidate className="form-grid-2">
        <div className="col-span-1">
          <Input
            label="Business / Enterprise Name"
            type="text"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            required
            leftIcon={<Store size={17} />}
          />
        </div>

        <div className="col-span-1">
          <Input
            label="Contact Phone / WhatsApp"
            type="text"
            placeholder="e.g., 08012345678"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
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
            label="Physical Store or Trading Location"
            type="text"
            placeholder="e.g., Block A, Alaba International Market, Lagos"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            leftIcon={<MapPin size={17} />}
          />
        </div>

        <div className="col-span-2 form-action-row">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            style={{ minWidth: '220px' }}
            isLoading={isLoading}
            leftIcon={<Save size={18} />}
          >
            Save Configuration
          </Button>
        </div>
      </form>
      {errorMessage && (
        <Toast message={errorMessage} type="error" onClose={() => setErrorMessage(null)} />
      )}
      {statusMessage && (
        <Toast message={statusMessage} type="success" onClose={() => setStatusMessage(null)} />
      )}
    </>
  );
};

export const Settings: React.FC = () => {
  const { business, updateBusiness } = useBusiness();
  const { isOnline } = useNetwork();

  if (!business) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading business configuration...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '820px', margin: '0 auto' }} className="animate-fade-in">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '24px',
        }}
      >
        <div>
          <h2 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)' }}>
            ⚙️ Business Configuration & Settings
          </h2>
          <p style={{ margin: '6px 0 0', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Manage your commercial profile, ledger currency, and trading category.
          </p>
        </div>

        <Badge
          variant={isOnline ? 'success' : 'warning'}
          showDot
          pulseDot={isOnline}
          style={{ padding: '6px 12px', fontSize: '0.85rem' }}
        >
          {isOnline ? (
            <Wifi size={14} style={{ marginRight: '6px' }} />
          ) : (
            <WifiOff size={14} style={{ marginRight: '6px' }} />
          )}
          {isOnline ? 'Cloud Synced' : 'Offline Cache Mode'}
        </Badge>
      </div>

      <Card title="Commercial Identity & Parameters" style={{ padding: '28px' }}>
        <SettingsForm initialBusiness={business} isOnline={isOnline} onUpdate={updateBusiness} />
      </Card>

      <Card title="System & Region Defaults" style={{ padding: '24px', marginTop: '24px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            color: 'var(--text-muted)',
            fontSize: '0.92rem',
          }}
        >
          <Globe size={24} color="var(--brand-primary)" />
          <div>
            <p style={{ margin: 0, fontWeight: 700, color: 'var(--text-main)' }}>
              Country: {business.country || 'Nigeria'}
            </p>
            <p style={{ margin: '4px 0 0' }}>
              Default taxes, fiscal rules, and regional offline protocols are tailored for{' '}
              {business.country || 'West African commercial standards'}.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

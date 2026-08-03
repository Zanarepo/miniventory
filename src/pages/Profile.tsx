import React, { useState, type FormEvent } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useBusiness } from '../hooks/useBusiness';
import { useNetwork } from '../hooks/useNetwork';
import { Card, Badge, Input, Button, Toast } from '../components';
import { User, Shield, CheckCircle, Mail, Phone, Save, Wifi, WifiOff } from 'lucide-react';
import type { Profile as AuthProfileType } from '../types/auth';

const ProfileForm: React.FC<{
  initialProfile: AuthProfileType | null;
  isOnline: boolean;
  onUpdate: (data: Partial<AuthProfileType>) => Promise<{ error: Error | null }>;
}> = ({ initialProfile, isOnline, onUpdate }) => {
  const [fullName, setFullName] = useState(initialProfile?.full_name || '');
  const [phone, setPhone] = useState(initialProfile?.phone || '');
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    setStatusMessage(null);

    const { error } = await onUpdate({
      full_name: fullName.trim() || undefined,
      phone: phone.trim() || undefined,
    });

    setIsLoading(false);

    if (error) {
      setErrorMessage(error.message || 'Error updating profile details.');
    } else {
      setStatusMessage(
        isOnline
          ? '✅ Owner profile updated and synced with Supabase cloud!'
          : '📦 Offline edit saved to local cache! Changes placed in Dexie sync queue for automatic upload upon reconnection.',
      );
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="form-grid-2">
      <div className="col-span-1">
        <Input
          label="Entrepreneur / Owner Name"
          type="text"
          placeholder="e.g., Madam Chidi Okeke"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          leftIcon={<User size={17} />}
        />
      </div>

      <div className="col-span-1">
        <Input
          label="Primary Mobile Phone"
          type="text"
          placeholder="e.g., 08030001122"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          leftIcon={<Phone size={17} />}
        />
      </div>

      <div className="col-span-2 form-action-row">
        <Button
          type="submit"
          variant="primary"
          size="md"
          style={{ minWidth: '200px' }}
          isLoading={isLoading}
          leftIcon={<Save size={18} />}
        >
          Save Profile Changes
        </Button>
      </div>

      {errorMessage && (
        <Toast message={errorMessage} type="error" onClose={() => setErrorMessage(null)} />
      )}
      {statusMessage && (
        <Toast message={statusMessage} type="success" onClose={() => setStatusMessage(null)} />
      )}
    </form>
  );
};

export const Profile: React.FC = () => {
  const { user, profile, updateProfile } = useAuth();
  const { business } = useBusiness();
  const { isOnline } = useNetwork();

  const isEmail = user?.email && !user.email.endsWith('@miniventory-user.com');

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
            👤 Owner Profile & Credentials
          </h2>
          <p style={{ margin: '6px 0 0', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Manage your personal entrepreneur identity and view active account security permissions.
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

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <Card title="Entrepreneur Account Details" style={{ padding: '28px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              marginBottom: '24px',
              borderBottom: '1px solid var(--border-color)',
              paddingBottom: '20px',
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: 'var(--brand-primary-light)',
                color: 'var(--brand-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '1.6rem',
                border: '2px solid var(--brand-primary)',
              }}
            >
              {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : 'E'}
            </div>
            <div>
              <h3
                style={{
                  margin: 0,
                  fontSize: '1.3rem',
                  fontWeight: 800,
                  color: 'var(--text-main)',
                }}
              >
                {profile?.full_name || 'Verified Entrepreneur'}
              </h3>
              <div style={{ display: 'flex', gap: '8px', marginTop: '6px', flexWrap: 'wrap' }}>
                <Badge variant="success" showDot>
                  Active Enterprise Owner
                </Badge>
                {business && (
                  <Badge variant="info">
                    {business.business_name} ({business.currency})
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <ProfileForm initialProfile={profile} isOnline={isOnline} onUpdate={updateProfile} />
        </Card>

        <Card title="Account Identifiers & Recovery Status" style={{ padding: '24px' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '16px',
              color: 'var(--text-muted)',
              fontSize: '0.9rem',
            }}
          >
            {isEmail && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Mail size={18} color="var(--brand-primary)" />
                <div>
                  <span
                    style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase' }}
                  >
                    Login Email
                  </span>
                  <p style={{ margin: '2px 0 0', fontWeight: 600, color: 'var(--text-main)' }}>
                    {user.email}
                  </p>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Shield size={18} color="var(--brand-secondary)" />
              <div>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase' }}>
                  Database Security
                </span>
                <p style={{ margin: '2px 0 0', fontWeight: 600, color: 'var(--text-main)' }}>
                  RLS Owner-Only Access
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <CheckCircle size={18} color="var(--status-success)" />
              <div>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase' }}>
                  Offline Resilience
                </span>
                <p style={{ margin: '2px 0 0', fontWeight: 600, color: 'var(--text-main)' }}>
                  Dexie v3 IndexedDB Active
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

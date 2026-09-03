import React, { useState, useEffect, useCallback } from 'react';
import { useBusiness } from '../hooks/useBusiness';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { CustomSelect } from '../components/CustomSelect';
import { Users, Copy, Trash2, Loader2, Mail } from 'lucide-react';
import type { BusinessRole } from '../types/business';

interface MemberWithProfile {
  id: string;
  user_id: string;
  role: BusinessRole;
  joined_at: string;
  profile: {
    full_name: string;
    email: string;
    phone: string;
  };
}

interface Invite {
  id: string;
  code: string;
  email?: string;
  role: BusinessRole;
  expires_at: string;
}

export const TeamManagement: React.FC = () => {
  const { business, currentRole } = useBusiness();
  const { profile } = useAuth();
  const [members, setMembers] = useState<MemberWithProfile[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [updatingRole, setUpdatingRole] = useState<string | null>(null);
  const [newInviteRole, setNewInviteRole] = useState<BusinessRole>('cashier');

  const fetchTeamData = useCallback(async () => {
    if (!business?.id) return;
    setLoading(true);

    // Fetch members with profile
    const { data: membersData, error: membersError } = await supabase
      .from('business_members')
      .select('id, user_id, role, joined_at, profiles(full_name, email, phone)')
      .eq('business_id', business.id);

    if (!membersError && membersData) {
      setMembers(
        membersData.map((m: Record<string, unknown>) => ({
          ...(m as any),
          profile: m.profiles || { full_name: 'Unknown', email: '', phone: '' },
        })),
      );
    }

    // Fetch active invites
    const { data: invitesData } = await supabase
      .from('business_invites')
      .select('id, code, email, role, expires_at')
      .eq('business_id', business.id)
      .gt('expires_at', new Date().toISOString());

    if (invitesData) {
      setInvites(invitesData as Invite[]);
    }

    setLoading(false);
  }, [business]);

  const updateMemberRole = async (memberId: string, newRole: BusinessRole) => {
    setUpdatingRole(memberId);
    const { error } = await supabase
      .from('business_members')
      .update({ role: newRole })
      .eq('id', memberId);

    if (!error) {
      await fetchTeamData();
    } else {
      alert('Failed to update role. Please ensure you have permission.');
    }
    setUpdatingRole(null);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchTeamData();
  }, [fetchTeamData]);

  const [inviteEmail, setInviteEmail] = useState('');

  const generateInvite = async () => {
    if (!business?.id) return;

    setIsGenerating(true);

    // Generate random 6 character alphanumeric code
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const currentUser = (await supabase.auth.getUser()).data.user;

    const { error } = await supabase.from('business_invites').insert([
      {
        business_id: business.id,
        code,
        email: inviteEmail || null,
        role: newInviteRole,
        created_by: currentUser?.id,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
      },
    ]);

    if (!error) {
      if (inviteEmail) {
        // Call edge function to send email
        try {
          const inviterName = profile?.full_name || currentUser?.email?.split('@')[0] || 'A team member';

          console.log('Invoking edge function with payload:', {
            email: inviteEmail,
            siteUrl: window.location.origin,
            businessId: business.id,
            businessName: business.business_name,
            inviterName,
          });

          await supabase.functions.invoke('invite-teammate', {
            body: {
              email: inviteEmail,
              siteUrl: window.location.origin,
              businessId: business.id,
              businessName: business.business_name,
              inviterName,
            },
          });
          alert('Invitation sent successfully!');
          setInviteEmail('');
        } catch (err) {
          console.error('Failed to send email', err);
          alert('Code generated but failed to send email.');
        }
      } else {
        alert('Invite code generated successfully! You can copy it from the list below.');
      }
      fetchTeamData();
    } else {
      alert('Failed to generate invite. Maybe this email is already invited?');
    }
    setIsGenerating(false);
  };

  const removeMember = async (memberId: string) => {
    if (window.confirm('Are you sure you want to remove this member?')) {
      await supabase.from('business_members').delete().eq('id', memberId);
      fetchTeamData();
    }
  };

  const removeInvite = async (inviteId: string) => {
    await supabase.from('business_invites').delete().eq('id', inviteId);
    fetchTeamData();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Code copied to clipboard!');
  };

  if (currentRole !== 'owner' && currentRole !== 'manager') {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '32px',
          textAlign: 'center',
        }}
      >
        <Users size={64} color="var(--text-muted)" style={{ marginBottom: '16px' }} />
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
          Access Denied
        </h2>
        <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>
          Only owners and managers can manage the team.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 'clamp(1.5rem, 4vw, 2rem)',
              fontWeight: 800,
              color: 'var(--text-main)',
              margin: '0 0 4px',
              letterSpacing: '-0.02em',
              fontFamily: 'var(--font-heading)',
            }}
          >
            Team & Access
          </h1>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', margin: 0 }}>
            Manage your store staff and their roles
          </p>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '24px',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
            flex: 2,
            minWidth: '300px',
          }}
        >
          <Card style={{ padding: '24px', overflow: 'visible' }}>
            <h2
              style={{
                fontSize: '1.125rem',
                fontWeight: 700,
                marginBottom: '16px',
                color: 'var(--text-main)',
              }}
            >
              Active Team Members
            </h2>
            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    style={{
                      height: '64px',
                      backgroundColor: 'var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      opacity: 0.5,
                    }}
                  ></div>
                ))}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {members.map((member) => (
                  <div
                    key={member.id}
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '12px',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '16px',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-lg)',
                    }}
                  >
                    <div style={{ flex: '1 1 150px', overflow: 'hidden' }}>
                      <p
                        style={{
                          fontWeight: 700,
                          color: 'var(--text-main)',
                          margin: '0 0 4px 0',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {member.profile.full_name}
                      </p>
                      <p
                        style={{
                          fontSize: '0.875rem',
                          color: 'var(--text-muted)',
                          margin: 0,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {member.profile.email || member.profile.phone}
                      </p>
                    </div>
                    <div
                      style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}
                    >
                      {member.role === 'owner' || currentRole !== 'owner' ? (
                        <span
                          style={{
                            padding: '4px 12px',
                            backgroundColor: 'var(--surface-color)',
                            color: 'var(--text-main)',
                            borderRadius: '999px',
                            fontSize: '0.75rem',
                            fontWeight: 800,
                            textTransform: 'uppercase',
                            border: '1px solid var(--border-color)',
                          }}
                        >
                          {member.role}
                        </span>
                      ) : (
                        <div style={{ position: 'relative' }}>
                          <CustomSelect
                            value={member.role}
                            options={[
                              { value: 'cashier', label: 'CASHIER' },
                              { value: 'manager', label: 'MANAGER' },
                            ]}
                            onChange={(val) => updateMemberRole(member.id, val as BusinessRole)}
                            disabled={updatingRole === member.id}
                            style={{ minWidth: '110px' }}
                          />
                          {updatingRole === member.id && (
                            <div
                              style={{
                                position: 'absolute',
                                right: '-24px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                              }}
                            >
                              <Loader2
                                size={16}
                                color="var(--brand-primary)"
                                style={{ animation: 'spin 1s linear infinite' }}
                              />
                            </div>
                          )}
                        </div>
                      )}
                      {member.role !== 'owner' && (
                        <button
                          onClick={() => removeMember(member.id)}
                          style={{
                            color: 'var(--color-error)',
                            backgroundColor: 'transparent',
                            border: 'none',
                            padding: '8px',
                            borderRadius: 'var(--radius-md)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                          title="Remove Member"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
            flex: 1,
            minWidth: '300px',
          }}
        >
          <Card style={{ padding: '24px' }}>
            <h2
              style={{
                fontSize: '1.125rem',
                fontWeight: 700,
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: 'var(--brand-primary)',
              }}
            >
              <Mail size={20} /> Invite Teammate
            </h2>
            <p
              style={{
                fontSize: '0.875rem',
                color: 'var(--text-muted)',
                margin: '0 0 16px 0',
                lineHeight: 1.5,
              }}
            >
              Send an email invitation, or leave the email field blank to generate a 6-letter
              shareable code.
            </p>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                marginBottom: '16px',
              }}
            >
              <Input
                type="email"
                placeholder="staff@example.com (Optional)"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
              <CustomSelect
                value={newInviteRole}
                onChange={(val) => setNewInviteRole(val as BusinessRole)}
                options={[
                  { value: 'cashier', label: 'CASHIER' },
                  { value: 'manager', label: 'MANAGER' },
                ]}
              />
            </div>
            <Button
              variant="primary"
              style={{ width: '100%', fontWeight: 700 }}
              onClick={generateInvite}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                  Processing...
                </span>
              ) : inviteEmail ? (
                'Send Email Invite'
              ) : (
                'Generate Invite Code'
              )}
            </Button>
          </Card>

          <Card style={{ padding: '24px' }}>
            <h2
              style={{
                fontSize: '1.125rem',
                fontWeight: 700,
                marginBottom: '16px',
                color: 'var(--text-main)',
              }}
            >
              Active Invite Codes
            </h2>
            {invites.length === 0 ? (
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0 }}>
                No active codes. Generate one to invite staff.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {invites.map((invite) => (
                  <div
                    key={invite.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px',
                      backgroundColor: 'var(--surface-color)',
                      borderRadius: 'var(--radius-lg)',
                      border: '1px solid var(--border-color)',
                    }}
                  >
                    <div>
                      <p
                        style={{
                          fontWeight: 700,
                          fontSize: '1rem',
                          color: 'var(--text-main)',
                          margin: '0 0 4px 0',
                        }}
                      >
                        {invite.email || invite.code}
                      </p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
                        Role:{' '}
                        <span style={{ textTransform: 'uppercase', fontWeight: 800 }}>
                          {invite.role}
                        </span>
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => copyToClipboard(invite.code)}
                        style={{
                          padding: '8px',
                          color: 'var(--text-muted)',
                          backgroundColor: 'transparent',
                          border: '1px solid var(--border-color)',
                          borderRadius: 'var(--radius-sm)',
                          cursor: 'pointer',
                          display: 'flex',
                        }}
                        title="Copy Code"
                      >
                        <Copy size={16} />
                      </button>
                      <button
                        onClick={() => removeInvite(invite.id)}
                        style={{
                          padding: '8px',
                          color: 'var(--color-error)',
                          backgroundColor: 'transparent',
                          border: '1px solid var(--border-color)',
                          borderRadius: 'var(--radius-sm)',
                          cursor: 'pointer',
                          display: 'flex',
                        }}
                        title="Delete Code"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

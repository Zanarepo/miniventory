import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { Table, LoadingSpinner, Toast } from '../../components';
import { Shield, ShieldAlert, User, Clock } from 'lucide-react';
export const AdminUsers: React.FC = () => {
  const { profile } = useAuth();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setUsers(data);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', userId);
      if (error) throw error;
      setActionMessage({ type: 'success', text: 'User role updated successfully.' });
      fetchUsers();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error updating user role.';
      setActionMessage({ type: 'error', text: msg });
    }
  };

  const columns = [
    {
      header: 'User',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      accessor: (row: any) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <User size={16} />
          </div>
          <div>
            <p style={{ margin: 0, fontWeight: 600 }}>{row.full_name || 'No Name'}</p>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Phone',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      accessor: (row: any) => row.phone || '-',
    },
    {
      header: 'Role',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      accessor: (row: any) => {
        if (profile?.role === 'superadmin') {
          return (
            <select
              value={row.role || 'user'}
              onChange={(e) => handleRoleChange(row.id, e.target.value)}
              style={{
                padding: '4px 8px',
                borderRadius: '4px',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-card)',
                color: 'var(--text-main)',
                fontSize: '0.85rem',
              }}
            >
              <option value="user">User</option>
              <option value="pending_admin">Pending Admin</option>
              <option value="admin">Admin</option>
              <option value="superadmin">Superadmin</option>
            </select>
          );
        }

        if (row.role === 'superadmin') {
          return (
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                color: 'var(--brand-primary)',
                fontWeight: 600,
                fontSize: '0.85rem',
              }}
            >
              <ShieldAlert size={14} /> Superadmin
            </span>
          );
        }
        if (row.role === 'admin') {
          return (
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                color: 'var(--text-main)',
                fontWeight: 600,
                fontSize: '0.85rem',
              }}
            >
              <Shield size={14} /> Admin
            </span>
          );
        }
        if (row.role === 'pending_admin') {
          return (
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                color: 'var(--text-muted)',
                fontWeight: 600,
                fontSize: '0.85rem',
              }}
            >
              <Clock size={14} /> Pending
            </span>
          );
        }
        return <span style={{ color: 'var(--text-muted)' }}>User</span>;
      },
    },
    {
      header: 'Joined',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      accessor: (row: any) => new Date(row.created_at).toLocaleDateString(),
    },
  ];

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ margin: '0 0 8px', fontSize: '1.75rem', color: 'var(--text-main)' }}>
          Platform Users
        </h1>
        <p style={{ margin: 0, color: 'var(--text-muted)' }}>
          Manage all registered users on the BizTrack platform.
        </p>
      </div>

      <div
        className="card"
        style={{
          background: 'var(--surface-color)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-color)',
          overflow: 'hidden',
        }}
      >
        {isLoading ? (
          <div style={{ padding: '40px', display: 'flex', justifyContent: 'center' }}>
            <LoadingSpinner />
          </div>
        ) : (
          <Table columns={columns} data={users} emptyMessage="No users found." />
        )}
      </div>

      {actionMessage && (
        <Toast
          type={actionMessage.type}
          message={actionMessage.text}
          onClose={() => setActionMessage(null)}
        />
      )}
    </div>
  );
};

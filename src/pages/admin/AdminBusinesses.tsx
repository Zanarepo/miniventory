import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Table, LoadingSpinner } from '../../components';
import { Building2 } from 'lucide-react';
export const AdminBusinesses: React.FC = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBusinesses = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('admin_business_metrics_view')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        if (data) setBusinesses(data);
      } catch (err) {
        console.error('Error fetching businesses:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBusinesses();
  }, []);

  const columns = [
    {
      header: 'Business Name',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      accessor: (row: any) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'var(--brand-primary)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Building2 size={16} />
          </div>
          <span style={{ fontWeight: 600 }}>{row.business_name || 'Unnamed Business'}</span>
        </div>
      ),
    },
    {
      header: 'Category',
      accessor: 'business_category',
    },
    {
      header: 'Currency',
      accessor: 'currency',
    },
    {
      header: 'Owner',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      accessor: (row: any) => row.owner_email || 'Unknown',
    },
    {
      header: 'Created On',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      accessor: (row: any) => new Date(row.created_at).toLocaleDateString(),
    },
    {
      header: 'Total Inventory',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      accessor: (row: any) => row.total_inventory_items || 0,
    },
    {
      header: 'Total Sales',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      accessor: (row: any) => {
        const currency = row.currency || 'USD';
        const amount = row.total_sales_amount || 0;
        return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
      },
    },
    {
      header: 'Health',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      accessor: (row: any) => {
        const profit = row.total_gross_profit || 0;
        const expenses = row.total_expenses || 0;
        const sales = row.total_sales_amount || 0;

        const healthText =
          sales === 0
            ? 'Needs Attention'
            : profit > expenses
              ? 'Healthy'
              : profit > 0
                ? 'Stable'
                : 'Critical';
        const healthColor =
          sales === 0
            ? '#f59e0b'
            : profit > expenses
              ? '#10b981'
              : profit > 0
                ? '#3b82f6'
                : '#ef4444';

        return (
          <span
            style={{
              display: 'inline-block',
              padding: '4px 8px',
              borderRadius: '999px',
              backgroundColor: `${healthColor}15`,
              color: healthColor,
              fontSize: '0.75rem',
              fontWeight: 600,
            }}
          >
            {healthText}
          </span>
        );
      },
    },
  ];

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ margin: '0 0 8px', fontSize: '1.75rem', color: 'var(--text-main)' }}>
          Platform Businesses
        </h1>
        <p style={{ margin: 0, color: 'var(--text-muted)' }}>
          Manage all businesses created on the BizTrack platform.
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
          <Table columns={columns} data={businesses} emptyMessage="No businesses found." />
        )}
      </div>
    </div>
  );
};

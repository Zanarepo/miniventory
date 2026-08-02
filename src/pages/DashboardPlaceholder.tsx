import React, { useState } from 'react';
import { Card, Table, Button, Modal, Toast, type Column } from '../components';
import { useAuth } from '../hooks/useAuth';

interface SampleRecord {
  id: string;
  item: string;
  type: 'Sale' | 'Expense';
  amount: string;
  status: 'Synced' | 'Pending Offline';
}

export const DashboardPlaceholder: React.FC = () => {
  const { user, profile } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const sampleData: SampleRecord[] = [
    { id: '1', item: '3 Bags of Rice', type: 'Sale', amount: '₦180,000', status: 'Synced' },
    { id: '2', item: 'Market Transport', type: 'Expense', amount: '₦4,500', status: 'Synced' },
    {
      id: '3',
      item: 'Cooking Oil (Carton)',
      type: 'Sale',
      amount: '₦65,000',
      status: 'Pending Offline',
    },
  ];

  const columns: Column<SampleRecord>[] = [
    { header: 'Transaction Detail', accessor: 'item' },
    {
      header: 'Category',
      accessor: (row) => (
        <span
          style={{
            padding: '4px 10px',
            borderRadius: '12px',
            fontSize: '0.75rem',
            fontWeight: 700,
            backgroundColor:
              row.type === 'Sale' ? 'rgba(46, 125, 50, 0.1)' : 'rgba(211, 47, 47, 0.1)',
            color: row.type === 'Sale' ? 'var(--brand-primary)' : 'hsl(0, 75%, 55%)',
          }}
        >
          {row.type}
        </span>
      ),
    },
    { header: 'Value (₦)', accessor: 'amount' },
    {
      header: 'Sync State',
      accessor: (row) => (
        <span
          style={{
            fontWeight: 600,
            color: row.status === 'Synced' ? 'var(--text-main)' : 'var(--brand-accent)',
          }}
        >
          {row.status === 'Synced' ? '✅ Cloud Saved' : '⏳ Offline Queue'}
        </span>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1
          style={{
            fontSize: '1.8rem',
            fontWeight: 800,
            color: 'var(--text-main)',
            margin: '0 0 6px',
          }}
        >
          Welcome back, {profile?.full_name || user?.email || 'Entrepreneur'}! 👋
        </h1>
        <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.95rem' }}>
          Here is your business financial summary. Your record keeping is simple, fast, and secure.
        </p>
      </div>

      {/* Metric Highlights */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '20px',
        }}
      >
        <Card title="Today's Sales Revenue" subtitle="Recorded across online & offline syncs">
          <p
            style={{
              fontSize: '2rem',
              fontWeight: 800,
              color: 'var(--brand-primary)',
              margin: '12px 0 0',
            }}
          >
            ₦245,000
          </p>
        </Card>
        <Card title="Today's Expenses" subtitle="Operational & supplier expenditures">
          <p
            style={{
              fontSize: '2rem',
              fontWeight: 800,
              color: 'hsl(0, 75%, 55%)',
              margin: '12px 0 0',
            }}
          >
            ₦4,500
          </p>
        </Card>
        <Card title="Estimated Net Profit" subtitle="Calculated automatically">
          <p
            style={{
              fontSize: '2rem',
              fontWeight: 800,
              color: 'var(--text-main)',
              margin: '12px 0 0',
            }}
          >
            ₦78,500
          </p>
        </Card>
      </div>

      {/* Transaction Actions & Tables */}
      <Card
        title="Recent Business Transactions (Sprint 0 Preview)"
        subtitle="Full interactive inventory, sales recording, and OCR receipts will launch in Sprint 1."
        footer={
          <div className="btn-group-responsive">
            <Button variant="secondary" onClick={() => setIsModalOpen(true)}>
              ➕ Test Modal Dialog
            </Button>
            <Button
              variant="primary"
              onClick={() => setToastMessage('✅ Transaction recorded in offline Dexie cache!')}
            >
              ⚡ Record Sample Sale
            </Button>
          </div>
        }
      >
        <div style={{ marginTop: '16px' }}>
          <Table data={sampleData} columns={columns} />
        </div>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Sprint 0 Foundation Verified"
      >
        <p style={{ color: 'var(--text-main)', lineHeight: 1.6 }}>
          Congratulations! Your design system, theme engine, Supabase connectivity, and responsive
          layout foundations are operating flawlessly.
        </p>
        <div className="btn-group-responsive" style={{ marginTop: '20px' }}>
          <Button variant="primary" onClick={() => setIsModalOpen(false)}>
            Excellent 👍
          </Button>
        </div>
      </Modal>

      {toastMessage && (
        <Toast message={toastMessage} type="success" onClose={() => setToastMessage(null)} />
      )}
    </div>
  );
};

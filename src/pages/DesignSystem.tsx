import React, { useState } from 'react';
import { useTheme } from '../hooks/useTheme';
import {
  Button,
  Input,
  SearchInput,
  Badge,
  Card,
  Table,
  Modal,
  Toast,
  type Column,
} from '../components';
import {
  ArrowRight,
  Sparkles,
  Bell,
  RefreshCw,
  Layers,
  Sliders,
  ShieldCheck,
  Download,
  Trash2,
  Edit3,
} from 'lucide-react';

interface Transaction {
  id: string;
  client: string;
  amount: string;
  status: 'success' | 'warning' | 'error' | 'info';
  date: string;
}

export const DesignSystem: React.FC = () => {
  const { resolvedTheme, setTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [errorInput, setErrorInput] = useState('Invalid corporate tax ID format');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  const sampleTransactions: Transaction[] = [
    {
      id: 'INV-2026-809',
      client: 'AeroCorp Aviation Services',
      amount: '$42,500.00',
      status: 'success',
      date: 'Today, 14:32',
    },
    {
      id: 'INV-2026-810',
      client: 'Quantum Dynamics Logistics',
      amount: '$18,750.50',
      status: 'warning',
      date: 'Yesterday',
    },
    {
      id: 'INV-2026-811',
      client: 'Starlight Retail Supermarkets',
      amount: '$112,000.00',
      status: 'error',
      date: 'Jul 28, 2026',
    },
    {
      id: 'INV-2026-812',
      client: 'Nexus Cyber Security',
      amount: '$8,400.00',
      status: 'info',
      date: 'Jul 25, 2026',
    },
  ];

  const tableColumns: Column<Transaction>[] = [
    {
      header: 'Invoice Reference',
      accessor: (row) => <strong style={{ fontFamily: 'var(--font-heading)' }}>{row.id}</strong>,
    },
    { header: 'Enterprise Client', accessor: 'client' },
    {
      header: 'Billed Amount',
      accessor: (row) => (
        <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{row.amount}</span>
      ),
    },
    {
      header: 'Settlement Status',
      accessor: (row) => (
        <Badge variant={row.status} pulseDot={row.status === 'warning' || row.status === 'error'}>
          {row.status === 'success' && 'Paid / Settled'}
          {row.status === 'warning' && 'Pending Verify'}
          {row.status === 'error' && 'Overdue Notice'}
          {row.status === 'info' && 'Draft Invoice'}
        </Badge>
      ),
    },
    { header: 'Timestamp', accessor: 'date' },
    {
      header: 'Actions',
      accessor: () => (
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            className="btn-ghost"
            style={{ padding: '6px', borderRadius: '6px', color: 'var(--brand-primary)' }}
            title="Edit"
          >
            <Edit3 size={16} />
          </button>
          <button
            className="btn-ghost"
            style={{ padding: '6px', borderRadius: '6px', color: 'var(--brand-danger)' }}
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
      width: '100px',
    },
  ];

  const pageContainerStyle: React.CSSProperties = {
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '40px 24px 80px',
    textAlign: 'left',
  };

  const sectionTitleStyle: React.CSSProperties = {
    fontSize: '1.5rem',
    fontWeight: 700,
    marginTop: '48px',
    marginBottom: '20px',
    paddingBottom: '8px',
    borderBottom: '2px solid var(--border-color)',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  };

  const swatchStyle = (bg: string, label: string, hex: string): React.ReactNode => (
    <div style={{ flex: '1 1 160px', minWidth: '150px' }}>
      <div
        style={{
          height: '90px',
          backgroundColor: bg,
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-sm)',
          marginBottom: '8px',
        }}
      />
      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)' }}>{label}</div>
      <div
        style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-sans)' }}
      >
        {hex}
      </div>
    </div>
  );

  return (
    <div style={pageContainerStyle} className="animate-fade-in">
      {/* Header & Theme Controls */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '20px',
          marginBottom: '32px',
        }}
      >
        <div>
          <span
            className="badge badge-info"
            style={{ marginBottom: '10px', display: 'inline-flex' }}
          >
            <Sparkles size={14} style={{ marginRight: '4px' }} /> Design Architecture Showcase
          </span>
          <h1 style={{ fontSize: '2.5rem', margin: '8px 0', letterSpacing: '-0.04em' }}>
            BizTrack <span className="text-gradient">Cyber-Enterprise Glass</span> OS
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '700px' }}>
            A tactile, high-contrast design system featuring HSL color aesthetics, frosted glass
            layering, micro-animated interactions, and seamless dark/light theme versatility.
          </p>
        </div>
        <Button
          onClick={toggleTheme}
          variant="outline"
          size="lg"
          leftIcon={
            <RefreshCw size={18} className="animate-spin" style={{ animationDuration: '4s' }} />
          }
        >
          Theme: <strong style={{ textTransform: 'capitalize' }}>{resolvedTheme} Mode</strong>
        </Button>
      </div>

      {/* SECTION 1: COLOR PALETTE TOKENS */}
      <h2 style={sectionTitleStyle}>
        <Layers size={22} color="var(--brand-primary)" /> 1. Brand Color Vocabulary & HSL Tokens
      </h2>
      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        {swatchStyle('var(--brand-primary)', 'Cyber Jade (Primary)', 'hsl(158, 85%, 32% / 48%)')}
        {swatchStyle('var(--brand-accent)', 'Sunset Amber (Accent)', 'hsl(38, 95%, 55%)')}
        {swatchStyle('var(--brand-cyan)', 'Analytics Cyan', 'hsl(188, 92%, 52%)')}
        {swatchStyle('var(--brand-danger)', 'Crimson Alert', 'hsl(358, 82%, 58%)')}
        {swatchStyle('var(--bg-card)', 'Frosted Glass Surface', 'hsla(222, 28%, 13%, 0.75)')}
        {swatchStyle('var(--bg-app)', 'Base Obsidian Ground', 'hsl(222, 38%, 7%)')}
      </div>

      {/* SECTION 2: INTERACTIVE BUTTONS & MICRO-ANIMATIONS */}
      <h2 style={sectionTitleStyle}>
        <Sliders size={22} color="var(--brand-primary)" /> 2. Tactile Button Variants & Hover States
      </h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>
        Hover over buttons to observe subtle upward transform lifts, glowing aura shadow emissions,
        and horizontal arrow icon slide micro-animations.
      </p>
      <div
        style={{
          display: 'flex',
          gap: '14px',
          flexWrap: 'wrap',
          alignItems: 'center',
          marginBottom: '24px',
        }}
      >
        <Button variant="primary" rightIcon={<ArrowRight size={18} />}>
          New Enterprise Deal
        </Button>
        <Button variant="secondary" leftIcon={<Sparkles size={18} />}>
          Generate AI Insight
        </Button>
        <Button variant="outline" leftIcon={<Download size={18} />}>
          Export Audit Report
        </Button>
        <Button variant="ghost" leftIcon={<Bell size={18} />}>
          Notifications
        </Button>
        <Button variant="danger" leftIcon={<Trash2 size={18} />}>
          Terminate Session
        </Button>
        <Button variant="primary" isLoading>
          Processing Transaction
        </Button>
        <Button variant="primary" disabled>
          Disabled Permission
        </Button>
      </div>

      {/* Button Size Hierarchy */}
      <div
        style={{
          display: 'flex',
          gap: '14px',
          alignItems: 'baseline',
          flexWrap: 'wrap',
          backgroundColor: 'var(--bg-card)',
          padding: '20px',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-color)',
        }}
      >
        <span style={{ fontWeight: 600, color: 'var(--text-muted)', width: '120px' }}>
          Size Hierarchy:
        </span>
        <Button size="sm" variant="outline">
          Small Control (sm)
        </Button>
        <Button size="md" variant="primary">
          Standard Billed Action (md)
        </Button>
        <Button size="lg" variant="secondary">
          Hero Executive Trigger (lg)
        </Button>
      </div>

      {/* SECTION 3: ADVANCED SEARCH BAR & FORM CONTROLS */}
      <h2 style={sectionTitleStyle}>
        <ShieldCheck size={22} color="var(--brand-primary)" /> 3. Glowing Search Field & Form
        Controls
      </h2>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '28px',
        }}
      >
        <Card
          title="Interactive Search Bar Experience"
          subtitle="Frosted container with shortcut badge and instant clear action"
        >
          <SearchInput
            value={searchQuery}
            onChange={(val) => setSearchQuery(val)}
            placeholder="Search transactions, VAT IDs, clients..."
            shortcutText="Ctrl + K"
          />
          <p style={{ marginTop: '12px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Active Query:{' '}
            <strong style={{ color: 'var(--text-main)' }}>
              {searchQuery || '(Empty — try typing!)'}
            </strong>
          </p>
        </Card>

        <Card
          title="Input Fields & Validation Shimmer"
          subtitle="Focus ring highlights and animated error tremor detection"
        >
          <Input
            label="Authorized Company Legal Title"
            placeholder="e.g. Acme Global Logistics Ltd."
            defaultValue="Zanara Quantum Holding UK"
            helperText="Recorded in commercial public trade register."
          />
          <Input
            label="Corporate Tax ID / Registration number"
            value={errorInput}
            onChange={(e) => setErrorInput(e.target.value)}
            error="Validation failure: Tax registry check mismatch. Please verify syntax."
          />
        </Card>
      </div>

      {/* SECTION 4: REAL-TIME BADGES & STATUS TAGS */}
      <h2 style={sectionTitleStyle}>
        <Bell size={22} color="var(--brand-primary)" /> 4. Live Status Badges & Pulsing Tags
      </h2>
      <div
        style={{
          display: 'flex',
          gap: '16px',
          flexWrap: 'wrap',
          alignItems: 'center',
          backgroundColor: 'var(--bg-card)',
          padding: '24px',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-color)',
        }}
      >
        <Badge variant="success" showDot>
          Active Supplier
        </Badge>
        <Badge variant="warning" pulseDot>
          Audit Verification Required
        </Badge>
        <Badge variant="error" pulseDot>
          Invoice Payment Overdue
        </Badge>
        <Badge variant="info" showDot>
          Draft Quotation
        </Badge>
        <Badge variant="success" showDot={false}>
          No-Dot Tag Capsule
        </Badge>
      </div>

      {/* SECTION 5: GLASSMORPHIC CARDS & MODAL LAUNCHER */}
      <h2 style={sectionTitleStyle}>
        <Layers size={22} color="var(--brand-primary)" /> 5. Glassmorphic 3D Cards & Dialog
        Experiences
      </h2>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '24px',
          marginBottom: '24px',
        }}
      >
        <Card
          title="Revenue Growth Projection"
          subtitle="Q3 / Q4 Financial Outlook Model"
          isInteractive
          footer={
            <Button variant="ghost" size="sm" rightIcon={<ArrowRight size={14} />}>
              Open Ledger
            </Button>
          }
        >
          <div
            style={{
              fontSize: '2.4rem',
              fontWeight: 800,
              color: 'var(--brand-primary)',
              letterSpacing: '-0.03em',
            }}
          >
            +248.6%
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
            Hover over this card to trigger tactile 3D elevation and neon rim border glow.
          </p>
        </Card>

        <Card
          title="Interactive Modal & Notification Toast"
          subtitle="Test tactile spring pop animations and slide alerts"
          isInteractive
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
            <Button variant="outline" onClick={() => setIsModalOpen(true)}>
              Launch Glass Dialog Modal
            </Button>
            <Button
              variant="secondary"
              onClick={() =>
                setToastMessage('Enterprise payment of $42,500 successfully reconciled!')
              }
            >
              Trigger Success Toast Alert
            </Button>
          </div>
        </Card>
      </div>

      {/* SECTION 6: FINANCIAL DATA TABLE */}
      <h2 style={sectionTitleStyle}>
        <Sliders size={22} color="var(--brand-primary)" /> 6. Interactive Data Ledger & Row Lighting
      </h2>
      <Table data={sampleTransactions} columns={tableColumns} />

      {/* Render Active Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Security Authorization & Reconciliation"
      >
        <p style={{ color: 'var(--text-muted)', marginBottom: '20px', lineHeight: 1.6 }}>
          You have initiated a multi-factor authorization request to verify billing ledgers. Notice
          the subtle background backdrop blur (`6px`) and smooth spring scaling entrance animation.
        </p>
        <Input
          label="Digital Officer Signature ID"
          placeholder="Enter security token (e.g. 093-B)"
        />
        <div
          style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}
        >
          <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              setIsModalOpen(false);
              setToastMessage('Authorization token approved and stored.');
            }}
          >
            Authorize Signature
          </Button>
        </div>
      </Modal>

      {/* Render Active Toast Alert */}
      {toastMessage && (
        <Toast
          message={toastMessage}
          type="success"
          onClose={() => setToastMessage(null)}
          durationMs={5000}
        />
      )}
    </div>
  );
};

export default DesignSystem;

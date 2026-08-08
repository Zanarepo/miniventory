import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '..';
import { useLanguage } from '../../hooks/useLanguage';
import { PlusCircle, Package, Receipt, Layers, BarChart2, Zap } from 'lucide-react';

export const QuickActionsWidget: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const actions: Array<{
    label: string;
    subtitle: string;
    path: string;
    color: string;
    bgColor: string;
    borderColor: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    icon: any;
    primary: boolean;
    onClick?: () => Promise<void>;
  }> = [
    {
      label: t('dashRecordSale'),
      subtitle: t('dashRecordSaleSub'),
      path: '/sales',
      color: '#10b981',
      bgColor: 'rgba(16, 185, 129, 0.12)',
      borderColor: 'rgba(16, 185, 129, 0.3)',
      icon: PlusCircle,
      primary: true,
    },
    {
      label: t('dashAddProduct'),
      subtitle: t('dashAddProductSub'),
      path: '/inventory?action=new',
      color: '#0ea5e9',
      bgColor: 'rgba(14, 165, 233, 0.12)',
      borderColor: 'rgba(14, 165, 233, 0.3)',
      icon: Package,
      primary: false,
    },
    {
      label: t('dashLogExpense'),
      subtitle: t('dashLogExpenseSub'),
      path: '/expenses/new',
      color: '#ef4444',
      bgColor: 'rgba(239, 68, 68, 0.12)',
      borderColor: 'rgba(239, 68, 68, 0.3)',
      icon: Receipt,
      primary: false,
    },
    {
      label: t('dashCheckStock'),
      subtitle: t('dashCheckStockSub'),
      path: '/inventory',
      color: '#f59e0b',
      bgColor: 'rgba(245, 158, 11, 0.12)',
      borderColor: 'rgba(245, 158, 11, 0.3)',
      icon: Layers,
      primary: false,
    },
    {
      label: t('tabFinancials'),
      subtitle: t('financialsSubtitle'),
      path: '/financials',
      color: '#8b5cf6',
      bgColor: 'rgba(139, 92, 246, 0.12)',
      borderColor: 'rgba(139, 92, 246, 0.3)',
      icon: BarChart2,
      primary: false,
    },
  ];

  return (
    <Card
      className="glass-panel"
      style={{
        padding: '16px',
        marginBottom: '20px',
        background:
          'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)',
        border: '1px solid var(--border-color)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
        <div
          style={{
            width: '28px',
            height: '28px',
            borderRadius: '8px',
            backgroundColor: 'rgba(245, 158, 11, 0.15)',
            color: '#f59e0b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Zap size={16} />
        </div>
        <h3
          style={{
            fontSize: '0.95rem',
            fontWeight: 800,
            color: 'var(--text-main)',
            margin: 0,
          }}
        >
          {t('dashQuickActionsTitle')}
        </h3>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '10px',
        }}
      >
        {actions.map((action, index) => {
          const Icon = action.icon;
          const handleClick = (e: React.MouseEvent) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            if ((action as any).onClick) {
              e.preventDefault();
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (action as any).onClick();
            } else {
              navigate(action.path);
            }
          };

          return (
            <button
              key={index}
              type="button"
              onClick={handleClick}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '10px 12px',
                borderRadius: '10px',
                backgroundColor: action.primary ? action.bgColor : 'rgba(0,0,0,0.02)',
                border: `1px solid ${action.primary ? action.color : 'var(--border-color)'}`,
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease',
                position: 'relative',
                boxShadow: action.primary ? `0 2px 8px ${action.color}15` : 'none',
                gap: '10px',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = action.primary
                  ? `0 4px 12px ${action.color}25`
                  : '0 2px 8px rgba(0,0,0,0.05)';
                e.currentTarget.style.backgroundColor = action.primary
                  ? action.bgColor
                  : 'rgba(0,0,0,0.04)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = action.primary
                  ? `0 2px 8px ${action.color}15`
                  : 'none';
                e.currentTarget.style.backgroundColor = action.primary
                  ? action.bgColor
                  : 'rgba(0,0,0,0.02)';
              }}
            >
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '8px',
                  backgroundColor: action.primary ? action.color : 'rgba(0,0,0,0.05)',
                  color: action.primary ? '#fff' : 'var(--text-main)',
                  display: 'flex',
                  flexShrink: 0,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon size={16} />
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <h4
                  style={{
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    color: 'var(--text-main)',
                    margin: 0,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {action.label}
                </h4>
              </div>
            </button>
          );
        })}
      </div>
    </Card>
  );
};

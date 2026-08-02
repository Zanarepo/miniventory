import React from 'react';
import type { DashboardInventorySummary } from '../../hooks/useInventorySummary';
import {
  Package,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Wallet,
  ArrowRight,
  PlusCircle,
  Boxes,
} from 'lucide-react';
import { Button } from '../Button';
import { useNavigate } from 'react-router-dom';

export interface InventorySummaryWidgetProps {
  summary: DashboardInventorySummary;
  currencySymbol?: string;
  isLoading?: boolean;
}

export const InventorySummaryWidget: React.FC<InventorySummaryWidgetProps> = ({
  summary,
  currencySymbol = '₦',
  isLoading = false,
}) => {
  const navigate = useNavigate();
  const hasProducts = summary.hasProducts;

  // Formatting helper for currency values
  const formatValue = (val: number) => {
    if (val >= 1_000_000) return `${currencySymbol}${(val / 1_000_000).toFixed(2)}M`;
    if (val >= 10_000) return `${currencySymbol}${(val / 1_000).toFixed(1)}k`;
    return `${currencySymbol}${val.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
  };

  return (
    <div
      className="glass-panel"
      style={{
        padding: '24px',
        borderTop: '3px solid #0284c7',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        gap: '22px',
      }}
      role="region"
      aria-label="Stock Inventory Summary and Capital Valuation"
    >
      {/* 1. Widget Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              backgroundColor: 'rgba(2, 132, 199, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#0284c7',
            }}
          >
            <Package size={20} />
          </div>
          <div>
            <h3
              style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}
            >
              Shop Stock & Total Item Value
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
              A quick view of your items currently in the shop, reorder warnings, and total stock
              value
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <Button variant="secondary" size="sm" onClick={() => navigate('/inventory?action=new')}>
            <PlusCircle size={15} style={{ marginRight: '5px' }} /> Add Product
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/inventory')}
            style={{ backgroundColor: '#0284c7', borderColor: '#0284c7', color: '#fff' }}
          >
            Manage Stock <ArrowRight size={15} style={{ marginLeft: '5px' }} />
          </Button>
        </div>
      </div>

      {/* 2. Five Core KPI Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '14px',
        }}
      >
        {/* Metric 1: Total Products */}
        <div
          style={{
            padding: '16px',
            borderRadius: '12px',
            backgroundColor: 'rgba(2, 132, 199, 0.05)',
            border: '1px solid rgba(2, 132, 199, 0.2)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
              }}
            >
              Total Products
            </span>
            <Boxes size={18} color="#0284c7" />
          </div>
          <div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)' }}>
              {summary.products.toLocaleString()}
            </div>
            <div
              style={{ fontSize: '0.75rem', color: '#0284c7', fontWeight: 600, marginTop: '2px' }}
            >
              {summary.totalUnitsInStock.toLocaleString()} total physical units
            </div>
          </div>
        </div>

        {/* Metric 2: Available Products */}
        <div
          style={{
            padding: '16px',
            borderRadius: '12px',
            backgroundColor: 'rgba(16, 185, 129, 0.05)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
              }}
            >
              Available Products
            </span>
            <CheckCircle2 size={18} color="#10b981" />
          </div>
          <div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#10b981' }}>
              {summary.availableProducts.toLocaleString()}
            </div>
            <div
              style={{
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
                fontWeight: 600,
                marginTop: '2px',
              }}
            >
              Ready for immediate sale
            </div>
          </div>
        </div>

        {/* Metric 3: Low Stock */}
        <div
          style={{
            padding: '16px',
            borderRadius: '12px',
            backgroundColor: 'rgba(245, 158, 11, 0.05)',
            border: '1px solid rgba(245, 158, 11, 0.2)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '8px',
            cursor: summary.lowStock > 0 ? 'pointer' : 'default',
          }}
          onClick={() => summary.lowStock > 0 && navigate('/inventory?status=low_stock')}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
              }}
            >
              Low Stock
            </span>
            <AlertTriangle size={18} color="#f59e0b" />
          </div>
          <div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f59e0b' }}>
              {summary.lowStock.toLocaleString()}
            </div>
            <div
              style={{
                fontSize: '0.75rem',
                color: summary.lowStock > 0 ? '#f59e0b' : 'var(--text-muted)',
                fontWeight: 700,
                marginTop: '2px',
              }}
            >
              {summary.lowStock > 0 ? '⚠️ Reorder threshold reached' : 'Optimal inventory levels'}
            </div>
          </div>
        </div>

        {/* Metric 4: Out of Stock */}
        <div
          style={{
            padding: '16px',
            borderRadius: '12px',
            backgroundColor: 'rgba(198, 40, 40, 0.05)',
            border: '1px solid rgba(198, 40, 40, 0.2)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '8px',
            cursor: summary.outOfStock > 0 ? 'pointer' : 'default',
          }}
          onClick={() => summary.outOfStock > 0 && navigate('/inventory?status=out_of_stock')}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
              }}
            >
              Out of Stock
            </span>
            <AlertCircle size={18} color="#c62828" />
          </div>
          <div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#c62828' }}>
              {summary.outOfStock.toLocaleString()}
            </div>
            <div
              style={{
                fontSize: '0.75rem',
                color: summary.outOfStock > 0 ? '#c62828' : 'var(--text-muted)',
                fontWeight: 700,
                marginTop: '2px',
              }}
            >
              {summary.outOfStock > 0 ? '🛑 Zero balance items' : 'No stockouts recorded'}
            </div>
          </div>
        </div>

        {/* Metric 5: Total Inventory Value */}
        <div
          style={{
            padding: '16px',
            borderRadius: '12px',
            backgroundColor: 'rgba(99, 102, 241, 0.05)',
            border: '1px solid rgba(99, 102, 241, 0.2)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
              }}
            >
              Inventory Value
            </span>
            <Wallet size={18} color="#6366f1" />
          </div>
          <div>
            <div
              style={{
                fontSize: '1.4rem',
                fontWeight: 800,
                color: '#6366f1',
                letterSpacing: '-0.3px',
              }}
            >
              {formatValue(summary.inventoryValue)}
            </div>
            <div
              style={{
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
                fontWeight: 600,
                marginTop: '2px',
              }}
            >
              Total capital cost valuation
            </div>
          </div>
        </div>
      </div>

      {/* 3. Live Stock Health Distribution Indicator Bar */}
      {hasProducts && (
        <div
          style={{
            padding: '16px 18px',
            borderRadius: '12px',
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid var(--border-color)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
            }}
          >
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>
              Stock Health Distribution Index
            </span>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0284c7' }}>
              {summary.healthyPercentage}% Optimal Stock Coverage
            </span>
          </div>

          {/* Multi-Segment Horizontal Bar */}
          <div
            style={{
              width: '100%',
              height: '14px',
              borderRadius: '8px',
              backgroundColor: 'rgba(0, 0, 0, 0.15)',
              overflow: 'hidden',
              display: 'flex',
              gap: '2px',
            }}
            role="progressbar"
            aria-valuenow={summary.healthyPercentage}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Stock Health Distribution percentage bar"
          >
            {/* Healthy Segment */}
            {summary.healthyPercentage > 0 && (
              <div
                style={{
                  width: `${summary.healthyPercentage}%`,
                  height: '100%',
                  backgroundColor: '#10b981',
                  transition: 'width 0.5s ease',
                }}
                title={`Healthy Stock: ${summary.healthyPercentage}%`}
              />
            )}
            {/* Low Stock Segment */}
            {summary.lowStockPercentage > 0 && (
              <div
                style={{
                  width: `${summary.lowStockPercentage}%`,
                  height: '100%',
                  backgroundColor: '#f59e0b',
                  transition: 'width 0.5s ease',
                }}
                title={`Low Stock Warnings: ${summary.lowStockPercentage}%`}
              />
            )}
            {/* Out of Stock Segment */}
            {summary.outOfStockPercentage > 0 && (
              <div
                style={{
                  width: `${summary.outOfStockPercentage}%`,
                  height: '100%',
                  backgroundColor: '#c62828',
                  transition: 'width 0.5s ease',
                }}
                title={`Out of Stock Depletion: ${summary.outOfStockPercentage}%`}
              />
            )}
          </div>

          {/* Bar Legend Tags */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '18px',
              fontSize: '0.75rem',
              fontWeight: 600,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  backgroundColor: '#10b981',
                  display: 'inline-block',
                }}
              />
              <span style={{ color: 'var(--text-main)' }}>
                Healthy In Stock ({summary.healthyPercentage}%)
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  backgroundColor: '#f59e0b',
                  display: 'inline-block',
                }}
              />
              <span style={{ color: 'var(--text-main)' }}>
                Low Stock Threshold ({summary.lowStockPercentage}%)
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  backgroundColor: '#c62828',
                  display: 'inline-block',
                }}
              />
              <span style={{ color: 'var(--text-main)' }}>
                Out of Stock Depleted ({summary.outOfStockPercentage}%)
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 4. Empty State Overlay */}
      {!hasProducts && !isLoading && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -40%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '24px 32px',
            borderRadius: '16px',
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            color: '#ffffff',
            border: '1px solid rgba(255,255,255,0.15)',
            boxShadow: '0 12px 36px rgba(0,0,0,0.45)',
            maxWidth: '460px',
            zIndex: 10,
          }}
        >
          <Boxes size={34} color="#0284c7" style={{ marginBottom: '8px' }} />
          <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>
            No Products Cataloged Yet
          </h4>
          <p
            style={{ fontSize: '0.85rem', color: '#dddddd', margin: '6px 0 16px', lineHeight: 1.5 }}
          >
            Add products to start tracking real-time available stock levels, automated reorder
            low-stock warnings, and total inventory capital valuation.
          </p>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/inventory?action=new')}
            style={{ backgroundColor: '#0284c7', borderColor: '#0284c7' }}
          >
            <PlusCircle size={15} style={{ marginRight: '6px' }} /> Add Your First Product
          </Button>
        </div>
      )}
    </div>
  );
};

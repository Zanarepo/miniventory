import React from 'react';
import { useBusiness } from '../hooks/useBusiness';
import { useInventory } from '../hooks/useInventory';
import { useAuth } from '../hooks/useAuth';
import { Card, Button } from '../components';
import { PackageOpen, AlertCircle, Slash } from 'lucide-react';
import { Link } from 'react-router-dom';

export const RestockHistory: React.FC = () => {
  const { getCurrencySymbol, currentRole } = useBusiness();
  const { products, restockBatches, voidRestockBatch, isLoading, error } = useInventory();
  const { user } = useAuth();
  const currSymbol = getCurrencySymbol();

  const handleVoid = async (batchId: string) => {
    const reason = window.prompt('Reason for voiding this batch:');
    if (!reason) return;

    const success = await voidRestockBatch(batchId, reason);
    if (!success) {
      alert('Failed to void batch. Ensure no units have been sold and you have connection.');
    }
  };

  const getProductName = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    return product ? product.product_name : 'Unknown Product';
  };

  if (isLoading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading restock history...</div>;
  }

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '40px' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: '1.85rem', fontWeight: 900 }}>📦 Restock History</h1>
          <p style={{ margin: '6px 0 0', color: 'var(--text-muted)' }}>
            Track and manage all bulk inventory intake events.
          </p>
        </div>
        <div>
          <Link to="/inventory" style={{ textDecoration: 'none' }}>
            <Button variant="outline">Back to Inventory</Button>
          </Link>
        </div>
      </div>

      {error && (
        <div
          style={{
            color: 'var(--brand-danger)',
            padding: '16px',
            background: 'rgba(239, 68, 68, 0.1)',
            borderRadius: '8px',
            marginBottom: '16px',
          }}
        >
          <AlertCircle size={16} style={{ verticalAlign: 'text-bottom', marginRight: '8px' }} />
          {error}
        </div>
      )}

      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr
                style={{
                  borderBottom: '2px solid var(--border-color)',
                  backgroundColor: 'rgba(0,0,0,0.03)',
                  color: 'var(--text-muted)',
                  fontSize: '0.78rem',
                  textTransform: 'uppercase',
                }}
              >
                <th style={{ padding: '16px' }}>Date</th>
                <th style={{ padding: '16px' }}>Product</th>
                <th style={{ padding: '16px' }}>Quantity</th>
                <th style={{ padding: '16px' }}>Unit Cost</th>
                <th style={{ padding: '16px' }}>Status</th>
                <th style={{ padding: '16px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {restockBatches
                .filter((batch) => currentRole !== 'cashier' || batch.created_by === user?.id)
                .map((batch) => (
                  <tr
                    key={batch.id}
                    style={{
                      borderBottom: '1px solid var(--border-color)',
                      opacity: batch.status === 'VOID' ? 0.6 : 1,
                    }}
                  >
                    <td style={{ padding: '16px' }}>
                      {new Date(batch.created_at || '').toLocaleDateString()}
                    </td>
                    <td style={{ padding: '16px', fontWeight: 600 }}>
                      {getProductName(batch.product_id)}
                    </td>
                    <td style={{ padding: '16px' }}>+{batch.quantity}</td>
                    <td style={{ padding: '16px' }}>
                      {currSymbol}
                      {batch.cost_price}
                    </td>
                    <td style={{ padding: '16px' }}>
                      <span
                        style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          background:
                            batch.status === 'ACTIVE'
                              ? 'rgba(16, 185, 129, 0.1)'
                              : 'rgba(239, 68, 68, 0.1)',
                          color: batch.status === 'ACTIVE' ? '#10b981' : '#ef4444',
                        }}
                      >
                        {batch.status}
                      </span>
                    </td>
                    <td style={{ padding: '16px', textAlign: 'right' }}>
                      {batch.status === 'ACTIVE' && (
                        <Button variant="outline" size="sm" onClick={() => handleVoid(batch.id)}>
                          <Slash size={14} /> Void
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              {restockBatches.filter(
                (batch) => currentRole !== 'cashier' || batch.created_by === user?.id,
              ).length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}
                  >
                    <PackageOpen size={40} style={{ opacity: 0.3, marginBottom: '8px' }} />
                    <p>No restock batches found.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

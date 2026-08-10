import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { useBusiness } from '../hooks/useBusiness';
import { supabase } from '../lib/supabase';
import { useNetwork } from '../hooks/useNetwork';
import { QrCode, Search, AlertCircle, Trash2, RotateCcw } from 'lucide-react';
import { db } from '../lib/dexie';
import type { ItemUnit, ProductWithStock } from '../types/inventory';
import { Input } from './Input';
import { useInventory } from '../hooks/useInventory';

export interface ItemUnitsModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: ProductWithStock | null;
}

export const ItemUnitsModal: React.FC<ItemUnitsModalProps> = ({ isOpen, onClose, product }) => {
  const { business } = useBusiness();
  const { isOnline } = useNetwork();
  const [itemUnits, setItemUnits] = useState<ItemUnit[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { voidItemUnit, itemUnits: globalUnits } = useInventory();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchUnits = React.useCallback(async () => {
    if (!product || !business) return;
    setIsLoading(true);

    try {
      if (isOnline) {
        const { data, error } = await supabase
          .from('item_units')
          .select('*')
          .eq('business_id', business.id)
          .eq('product_id', product.id)
          .order('created_at', { ascending: false });

        if (!error && data) {
          setItemUnits(data as ItemUnit[]);
        }
      } else {
        const localUnits = globalUnits.filter((u) => u.product_id === product.id);
        setItemUnits(localUnits);
      }
    } catch (err) {
      console.error('Error fetching item units:', err);
    } finally {
      setIsLoading(false);
    }
  }, [product, business, isOnline, globalUnits]);

  useEffect(() => {
    if (isOpen && product && business) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchUnits();
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setItemUnits([]);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSearchQuery('');
    }
  }, [isOpen, product, business, fetchUnits]);

  const handleDelete = async (unit: ItemUnit) => {
    const reason = window.prompt(
      `Reason for voiding serial ${unit.serial_barcode}? (This will reduce stock by 1)`,
    );
    if (!reason) {
      return;
    }
    setDeletingId(unit.id);
    const success = await voidItemUnit(unit, reason);
    if (success) {
      setItemUnits((prev) => prev.map((u) => (u.id === unit.id ? { ...u, status: 'VOID' } : u)));
    } else {
      alert('Failed to void item unit.');
    }
    setDeletingId(null);
  };

  const handleRestore = async (unit: ItemUnit) => {
    const confirm = window.confirm(`Restore serial ${unit.serial_barcode} to AVAILABLE?`);
    if (!confirm) return;

    setDeletingId(unit.id);
    const updatedUnit: ItemUnit = { ...unit, status: 'AVAILABLE' };

    try {
      await db.itemUnits.update(unit.id, { status: 'AVAILABLE' });
      await db.syncQueue.add({
        action: 'UPDATE',
        entity: 'item_unit',
        payload: updatedUnit,
        createdAt: Date.now(),
        status: 'pending',
      });
      setItemUnits((prev) => prev.map((u) => (u.id === unit.id ? updatedUnit : u)));
    } catch (err) {
      console.error('Failed to restore:', err);
      alert('Failed to restore item unit.');
    }
    setDeletingId(null);
  };

  if (!product) return null;

  const filteredUnits = itemUnits.filter((u) =>
    u.serial_barcode.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return 'var(--brand-success)';
      case 'SOLD':
        return 'var(--brand-primary)';
      case 'VOID':
        return 'var(--brand-danger)';
      default:
        return 'var(--text-muted)';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Track Serials: ${product.product_name}`}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div
          style={{
            padding: '12px',
            background: 'var(--bg-elevated)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)',
            display: 'flex',
            gap: '16px',
          }}
        >
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>
              Total Recorded
            </span>
            <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>
              {itemUnits.length}
            </span>
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>
              Available
            </span>
            <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--brand-success)' }}>
              {itemUnits.filter((u) => u.status === 'AVAILABLE').length}
            </span>
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>
              Sold
            </span>
            <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--brand-primary)' }}>
              {itemUnits.filter((u) => u.status === 'SOLD').length}
            </span>
          </div>
        </div>

        <div>
          <Input
            label=""
            type="text"
            placeholder="Search serials..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search size={16} />}
          />
        </div>

        <div
          style={{
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            maxHeight: '300px',
            overflowY: 'auto',
            background: 'var(--bg-card)',
          }}
        >
          {isLoading ? (
            <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
              Loading serials...
            </div>
          ) : filteredUnits.length === 0 ? (
            <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <QrCode size={32} style={{ opacity: 0.3, marginBottom: '8px' }} />
              <br />
              No serials found.
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead
                style={{
                  position: 'sticky',
                  top: 0,
                  background: 'var(--bg-elevated)',
                  borderBottom: '1px solid var(--border-color)',
                }}
              >
                <tr>
                  <th
                    style={{
                      padding: '12px',
                      textAlign: 'left',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      color: 'var(--text-muted)',
                    }}
                  >
                    SERIAL / BARCODE
                  </th>
                  <th
                    style={{
                      padding: '12px',
                      textAlign: 'left',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      color: 'var(--text-muted)',
                    }}
                  >
                    STATUS
                  </th>
                  <th
                    style={{
                      padding: '12px',
                      textAlign: 'left',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      color: 'var(--text-muted)',
                    }}
                  >
                    ADDED ON
                  </th>
                  <th
                    style={{
                      padding: '12px',
                      textAlign: 'right',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      color: 'var(--text-muted)',
                    }}
                  >
                    ACTIONS
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredUnits.map((unit) => (
                  <tr key={unit.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td
                      style={{
                        padding: '12px',
                        fontFamily: 'monospace',
                        fontWeight: 600,
                        color: 'var(--text-main)',
                      }}
                    >
                      {unit.serial_barcode}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span
                        style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          background: `color-mix(in srgb, ${getStatusColor(unit.status)} 15%, transparent)`,
                          color: getStatusColor(unit.status),
                        }}
                      >
                        {unit.status}
                      </span>
                    </td>
                    <td
                      style={{ padding: '12px', fontSize: '0.85rem', color: 'var(--text-muted)' }}
                    >
                      {new Date(unit.created_at || '').toLocaleDateString()}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>
                      {unit.status === 'AVAILABLE' && (
                        <button
                          type="button"
                          onClick={() => handleDelete(unit)}
                          disabled={deletingId === unit.id}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: deletingId === unit.id ? 'wait' : 'pointer',
                            color: 'var(--brand-danger)',
                            padding: '4px',
                            opacity: deletingId === unit.id ? 0.5 : 1,
                          }}
                          title="Void Serial"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                      {unit.status === 'SOLD' && (
                        <button
                          type="button"
                          onClick={() => handleRestore(unit)}
                          disabled={deletingId === unit.id}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: deletingId === unit.id ? 'wait' : 'pointer',
                            color: 'var(--brand-primary)',
                            padding: '4px',
                            opacity: deletingId === unit.id ? 0.5 : 1,
                          }}
                          title="Restore Serial to Available"
                        >
                          <RotateCcw size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {!isOnline && (
          <div
            style={{
              display: 'flex',
              gap: '8px',
              padding: '12px',
              background: 'rgba(217, 119, 6, 0.1)',
              color: '#d97706',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem',
            }}
          >
            <AlertCircle size={16} />
            You are offline. Serials are only synced while online.
          </div>
        )}
      </div>
    </Modal>
  );
};

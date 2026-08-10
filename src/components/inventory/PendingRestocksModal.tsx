import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../lib/dexie';
import { useBusiness } from '../../hooks/useBusiness';
import { useAuth } from '../../hooks/useAuth';
import { Modal } from '../Modal';
import { Button } from '../Button';
import { PackageOpen, CheckCircle, XCircle } from 'lucide-react';

interface PendingRestocksModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PendingRestocksModal: React.FC<PendingRestocksModalProps> = ({ isOpen, onClose }) => {
  const { business, currentRole } = useBusiness();
  const { profile } = useAuth();
  const [processing, setProcessing] = useState<string | null>(null);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: business?.currency || 'USD',
    }).format(val);
  };

  const pendingItems = useLiveQuery(async () => {
    if (!business?.id) return [];
    const items = await db.pendingRestocks.where('status').equals('PENDING').toArray();

    const enriched = await Promise.all(
      items.map(async (item) => {
        const product = await db.products.get(item.product_id);
        const sale = await db.sales.get(item.sale_id);
        return {
          ...item,
          product_name: product?.product_name || 'Unknown Product',
          receipt_number: sale?.receipt_number || 'Unknown Sale',
        };
      }),
    );
    return enriched.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
  }, [business?.id]);

  const handleAction = async (item: any, action: 'APPROVE' | 'REJECT') => {
    if (!business?.id) return;

    setProcessing(item.id);
    try {
      const updatedStatus = action === 'APPROVE' ? 'APPROVED' : 'REJECTED';

      // Update pending_restock record
      const updatedRestock = {
        ...item,
        status: updatedStatus,
        reviewed_by: profile?.id,
        reviewed_at: new Date().toISOString(),
      };

      delete updatedRestock.product_name;
      delete updatedRestock.receipt_number;

      await db.pendingRestocks.update(item.id, {
        status: updatedStatus,
        reviewed_by: profile?.id,
        reviewed_at: updatedRestock.reviewed_at,
      });

      await db.syncQueue.add({
        action: 'UPDATE',
        entity: 'pending_restock',
        payload: updatedRestock,
        createdAt: new Date().getTime(),
        status: 'pending',
      });

      if (action === 'APPROVE') {
        // Create InventoryTransaction for Void Restock
        const tx = {
          id: crypto.randomUUID(),
          business_id: business.id,
          product_id: item.product_id,
          movement_type: 'Void Restock' as const,
          quantity: item.quantity,
          unit_cost: item.unit_cost,
          remarks: `Approved Return: ${item.receipt_number}`,
          created_by: profile?.id || item.created_by,
          created_at: new Date().toISOString(),
        };

        await db.inventoryTransactions.add(tx);
        await db.syncQueue.add({
          action: 'CREATE',
          entity: 'inventory_transaction',
          payload: tx,
          createdAt: new Date().getTime(),
          status: 'pending',
        });

        // Update Serials to AVAILABLE
        if (item.serials && item.serials.length > 0) {
          const localUnits = await db.itemUnits.toArray();
          const updates = item.serials
            .map((serial: string) => {
              const unit = localUnits.find((u) => u.serial_barcode === serial);
              return unit ? { ...unit, status: 'AVAILABLE' } : null;
            })
            .filter(Boolean);

          if (updates.length > 0) {
            await db.itemUnits.bulkPut(updates);
            for (const update of updates) {
              await db.syncQueue.add({
                action: 'UPDATE',
                entity: 'item_unit',
                payload: update,
                createdAt: new Date().getTime(),
                status: 'pending',
              });
            }
          }
        }
      } else if (action === 'REJECT') {
        // Create InventoryTransaction for Damaged Stock if not serialized
        if (!item.serials || item.serials.length === 0) {
          // 1. Reverse the original sale deduction
          const voidTx = {
            id: crypto.randomUUID(),
            business_id: business.id,
            product_id: item.product_id,
            movement_type: 'Void Restock' as const,
            quantity: Math.abs(item.quantity),
            unit_cost: item.unit_cost,
            remarks: `Rejected Return (Sale Reversal): ${item.receipt_number}`,
            created_by: profile?.id || item.created_by,
            created_at: new Date().toISOString(),
          };

          await db.inventoryTransactions.add(voidTx);
          await db.syncQueue.add({
            action: 'CREATE',
            entity: 'inventory_transaction',
            payload: voidTx,
            createdAt: new Date().getTime(),
            status: 'pending',
          });

          // 2. Record the damaged/lost stock
          const damagedTx = {
            id: crypto.randomUUID(),
            business_id: business.id,
            product_id: item.product_id,
            movement_type: 'Damaged Stock' as const,
            quantity: -Math.abs(item.quantity),
            unit_cost: item.unit_cost,
            remarks: `Rejected Return (Written Off): ${item.receipt_number}`,
            created_by: profile?.id || item.created_by,
            created_at: new Date().toISOString(),
          };

          await db.inventoryTransactions.add(damagedTx);
          await db.syncQueue.add({
            action: 'CREATE',
            entity: 'inventory_transaction',
            payload: damagedTx,
            createdAt: new Date().getTime(),
            status: 'pending',
          });
        } else {
          // Update Serials to VOID (Damaged/Lost)
          const localUnits = await db.itemUnits.toArray();
          const updates = item.serials
            .map((serial: string) => {
              const unit = localUnits.find((u) => u.serial_barcode === serial);
              return unit ? { ...unit, status: 'VOID' } : null;
            })
            .filter(Boolean);

          if (updates.length > 0) {
            await db.itemUnits.bulkPut(updates);
            for (const update of updates) {
              await db.syncQueue.add({
                action: 'UPDATE',
                entity: 'item_unit',
                payload: update,
                createdAt: new Date().getTime(),
                status: 'pending',
              });
            }
          }
        }
      }
    } catch (err) {
      console.error('Failed to process restock:', err);
    } finally {
      setProcessing(null);
    }
  };

  if (currentRole === 'cashier') return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Review Voided Returns" className="max-w-3xl">
      <div className="flex flex-col gap-4 max-h-[70vh] overflow-y-auto">
        {!pendingItems || pendingItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-slate-500">
            <PackageOpen size={48} className="mb-4 opacity-50" />
            <p>No pending returns to review.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {pendingItems.map((item) => (
              <div
                key={item.id}
                className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-slate-50 dark:bg-slate-800/50"
              >
                <div className="flex-1">
                  <h4 className="font-bold text-slate-800 dark:text-slate-100">
                    {item.product_name}
                  </h4>
                  <div className="text-sm text-slate-500 dark:text-slate-400 mt-1 flex flex-wrap gap-x-4 gap-y-1">
                    <span>
                      Receipt:{' '}
                      <span className="font-mono text-slate-700 dark:text-slate-300">
                        {item.receipt_number}
                      </span>
                    </span>
                    <span>
                      Qty:{' '}
                      <span className="font-bold text-slate-700 dark:text-slate-300">
                        {item.quantity}
                      </span>
                    </span>
                    <span>
                      Cost:{' '}
                      <span className="font-bold text-slate-700 dark:text-slate-300">
                        {formatCurrency(item.unit_cost)}
                      </span>
                    </span>
                  </div>
                  {item.serials && item.serials.length > 0 && (
                    <div className="mt-2 text-xs">
                      <span className="font-semibold text-slate-600 dark:text-slate-400">
                        Serials:{' '}
                      </span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {item.serials.map((serial: string) => (
                          <span
                            key={serial}
                            className="px-1.5 py-0.5 bg-brand-primary/10 text-brand-primary rounded font-mono"
                          >
                            {serial}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 w-full md:w-auto mt-2 md:mt-0">
                  <Button
                    variant="outline"
                    className="flex-1 md:flex-none border-brand-danger text-brand-danger hover:bg-brand-danger/10"
                    onClick={() => handleAction(item, 'REJECT')}
                    disabled={processing === item.id}
                  >
                    <XCircle size={16} className="mr-2" />
                    Reject (Lost/Damaged)
                  </Button>
                  <Button
                    variant="primary"
                    className="flex-1 md:flex-none"
                    onClick={() => handleAction(item, 'APPROVE')}
                    disabled={processing === item.id}
                  >
                    <CheckCircle size={16} className="mr-2" />
                    Approve (Restock)
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
};

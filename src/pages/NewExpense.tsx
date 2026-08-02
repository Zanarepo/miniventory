import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../hooks/useLanguage';
import { useExpenses } from '../hooks/useExpenses';
import { useAuditLog } from '../hooks/useAuditLog';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Toast } from '../components/Toast';
import { Modal } from '../components/Modal';
import { ArrowLeft, Plus } from 'lucide-react';

export const NewExpense: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { categories, recordExpense, createCategory } = useExpenses();
  const { logAction } = useAuditLog();

  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [expenseDate, setExpenseDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [categoryId, setCategoryId] = useState('');
  const [receiptFile, setReceiptFile] = useState<File | undefined>(undefined);

  // Custom Category Modal
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      setToast({ message: 'Amount must be greater than zero.', type: 'error' });
      return;
    }
    if (!categoryId) {
      setToast({ message: 'Please select a category.', type: 'error' });
      return;
    }
    if (!description.trim()) {
      setToast({ message: 'Description is required.', type: 'error' });
      return;
    }
    if (expenseDate > todayStr) {
      setToast({ message: t('expenseDateFutureError'), type: 'error' });
      return;
    }

    setIsSubmitting(true);
    try {
      const exp = await recordExpense(
        Number(amount),
        description.trim(),
        expenseDate,
        paymentMethod,
        categoryId,
        receiptFile,
      );
      if (exp) {
        logAction({
          action: 'record_expense',
          entity: 'expense',
          metadata: { category: categoryId },
        });
        setToast({ message: 'Expense recorded successfully!', type: 'success' });
        setTimeout(() => navigate('/expenses'), 1000);
      } else {
        setToast({ message: 'Failed to record expense. Try again.', type: 'error' });
      }
    } catch (err) {
      console.error(err);
      setToast({ message: 'An unexpected error occurred.', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateCategory = async () => {
    if (!newCatName.trim()) return;
    try {
      const cat = await createCategory(newCatName.trim(), newCatDesc.trim());
      if (cat) {
        setCategoryId(cat.id);
        setIsCatModalOpen(false);
        setNewCatName('');
        setNewCatDesc('');
        setToast({ message: 'Category created successfully!', type: 'success' });
      } else {
        setToast({ message: 'Failed to create category.', type: 'error' });
      }
    } catch (err) {
      console.error(err);
      setToast({ message: 'Error creating category.', type: 'error' });
    }
  };

  const containerStyle: React.CSSProperties = {
    maxWidth: '600px',
    margin: '0 auto',
    padding: '16px 8px',
  };

  const formGroupStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    marginBottom: '16px',
  };

  const selectStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 14px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-color)',
    backgroundColor: 'var(--bg-app)',
    color: 'var(--text-main)',
    fontSize: '0.95rem',
    fontWeight: 500,
    outline: 'none',
  };

  return (
    <div style={containerStyle}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/expenses')}
          style={{ padding: '8px' }}
        >
          <ArrowLeft size={20} />
        </Button>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
          {t('modalTitleAddExpense')}
        </h1>
      </div>

      <Card style={{ padding: '24px' }}>
        <form onSubmit={handleSave}>
          <div style={formGroupStyle}>
            <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>
              {t('fieldExpenseAmount')} *
            </label>
            <Input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <div style={formGroupStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                {t('fieldCategory')} *
              </label>
              <button
                type="button"
                onClick={() => setIsCatModalOpen(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--brand-primary)',
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: '0.825rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <Plus size={14} /> Add Category
              </button>
            </div>
            <select
              style={selectStyle}
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
            >
              <option value="">-- Select Category --</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div style={formGroupStyle}>
            <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>
              {t('fieldExpenseDate')} *
            </label>
            <input
              type="date"
              style={selectStyle}
              max={todayStr}
              value={expenseDate}
              onChange={(e) => setExpenseDate(e.target.value)}
              required
            />
          </div>

          <div style={formGroupStyle}>
            <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>
              {t('fieldExpensePayMethod')} *
            </label>
            <select
              style={selectStyle}
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              required
            >
              <option value="CASH">💵 {t('payMethodCash')}</option>
              <option value="POS">💳 {t('payMethodPOS')}</option>
              <option value="TRANSFER">🏦 {t('payMethodTransfer')}</option>
              <option value="MOBILE_MONEY">📱 Mobile Money</option>
              <option value="OTHER">⚙️ Other</option>
            </select>
          </div>

          <div style={formGroupStyle}>
            <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>
              {t('fieldExpenseDesc')} *
            </label>
            <textarea
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-app)',
                color: 'var(--text-main)',
                fontSize: '0.95rem',
                minHeight: '80px',
                outline: 'none',
                resize: 'vertical',
              }}
              placeholder="e.g. Bought fuel for generator"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div style={formGroupStyle}>
            <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>
              {t('fieldReceiptUpload')}
            </label>
            <input
              type="file"
              accept="image/*,application/pdf"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  if (file.size > 10 * 1024 * 1024) {
                    setToast({ message: 'File size must be less than 10MB.', type: 'error' });
                    e.target.value = '';
                    return;
                  }
                  setReceiptFile(file);
                }
              }}
              style={{
                fontSize: '0.9rem',
                color: 'var(--text-muted)',
                marginTop: '4px',
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/expenses')}
              style={{ flex: 1 }}
              disabled={isSubmitting}
            >
              {t('btnCancel')}
            </Button>
            <Button type="submit" variant="primary" style={{ flex: 1 }} disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : t('btnSaveExpense')}
            </Button>
          </div>
        </form>
      </Card>

      {/* Custom Category Modal */}
      <Modal
        isOpen={isCatModalOpen}
        onClose={() => setIsCatModalOpen(false)}
        title="Add Custom Category"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>
              Category Name *
            </label>
            <Input
              placeholder="e.g. Internet Data"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>
              Description (Optional)
            </label>
            <Input
              placeholder="e.g. Monthly MTN bundles"
              value={newCatDesc}
              onChange={(e) => setNewCatDesc(e.target.value)}
            />
          </div>
          <div
            style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}
          >
            <Button variant="ghost" onClick={() => setIsCatModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleCreateCategory} disabled={!newCatName.trim()}>
              Save Category
            </Button>
          </div>
        </div>
      </Modal>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

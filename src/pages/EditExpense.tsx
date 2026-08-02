import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useLanguage } from '../hooks/useLanguage';
import { useExpenses } from '../hooks/useExpenses';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Toast } from '../components/Toast';
import { ArrowLeft } from 'lucide-react';

export const EditExpense: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { expenses, categories, updateExpense } = useExpenses();

  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [expenseDate, setExpenseDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [categoryId, setCategoryId] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const loadExpense = async () => {
      await Promise.resolve(); // Async boundary prevents synchronous cascading renders
      const expense = expenses.find((e) => e.id === id);
      if (expense) {
        setAmount(String(expense.amount));
        setDescription(expense.description);
        setExpenseDate(expense.expense_date);
        setPaymentMethod(expense.payment_method);
        setCategoryId(expense.category_id || '');
      }
    };
    loadExpense();
  }, [id, expenses]);

  const handleUpdate = async (e: React.FormEvent) => {
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
      const success = await updateExpense(id!, {
        amount: Number(amount),
        description: description.trim(),
        expense_date: expenseDate,
        payment_method: paymentMethod,
        category_id: categoryId,
      });
      if (success) {
        setToast({ message: 'Expense updated successfully!', type: 'success' });
        setTimeout(() => navigate('/expenses'), 1000);
      } else {
        setToast({ message: 'Failed to update expense.', type: 'error' });
      }
    } catch (err) {
      console.error(err);
      setToast({ message: 'An unexpected error occurred.', type: 'error' });
    } finally {
      setIsSubmitting(false);
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
          {t('modalTitleEditExpense')}
        </h1>
      </div>

      <Card style={{ padding: '24px' }}>
        <form onSubmit={handleUpdate}>
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
            <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>
              {t('fieldCategory')} *
            </label>
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
              placeholder="e.g. Purchased generator fuel"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
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
              {isSubmitting ? 'Updating...' : t('btnSaveChanges')}
            </Button>
          </div>
        </form>
      </Card>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

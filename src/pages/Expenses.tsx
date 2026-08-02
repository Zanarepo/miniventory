import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../hooks/useLanguage';
import { useBusiness } from '../hooks/useBusiness';
import { useExpenses } from '../hooks/useExpenses';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { SearchInput } from '../components/SearchInput';
import { Pagination } from '../components/Pagination';
import { Toast } from '../components/Toast';
import { Modal } from '../components/Modal';
import { Plus, Edit2, Trash2, Calendar, FileText } from 'lucide-react';

export const Expenses: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { getCurrencySymbol } = useBusiness();
  const currSymbol = getCurrencySymbol();

  const {
    expenses,
    categories,
    todayTotal,
    weeklyTotal,
    monthlyTotal,
    largestCategory,
    softDeleteExpense,
  } = useExpenses();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategoryId, setFilterCategoryId] = useState('');
  const [filterPayMethod, setFilterPayMethod] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  // Soft Delete states
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const formatCurrency = (val: number) =>
    `${currSymbol}${Number(val).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString(undefined, { dateStyle: 'medium' });

  // Filter logic
  const filteredExpenses = expenses.filter((e) => {
    const matchesSearch = e.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategoryId ? e.category_id === filterCategoryId : true;
    const matchesPayMethod = filterPayMethod ? e.payment_method === filterPayMethod : true;
    const matchesStartDate = startDate ? e.expense_date >= startDate : true;
    const matchesEndDate = endDate ? e.expense_date <= endDate : true;
    return (
      matchesSearch && matchesCategory && matchesPayMethod && matchesStartDate && matchesEndDate
    );
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredExpenses.length / ITEMS_PER_PAGE);
  const paginatedExpenses = filteredExpenses.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTargetId) return;
    try {
      const success = await softDeleteExpense(deleteTargetId);
      if (success) {
        setToast({ message: t('deleteExpenseSuccess'), type: 'success' });
      } else {
        setToast({ message: t('deleteExpenseFailed'), type: 'error' });
      }
    } catch (err) {
      console.error(err);
      setToast({ message: 'Error deleting expense.', type: 'error' });
    } finally {
      setDeleteTargetId(null);
    }
  };

  const getCategoryName = (catId: string | null) => {
    if (!catId) return 'General';
    const cat = categories.find((c) => c.id === catId);
    return cat ? cat.name : 'General';
  };

  const getMethodLabel = (method: string) => {
    switch (method) {
      case 'CASH':
        return t('payMethodCash');
      case 'POS':
        return t('payMethodPOS');
      case 'TRANSFER':
        return t('payMethodTransfer');
      default:
        return method;
    }
  };

  const selectStyle: React.CSSProperties = {
    padding: '8px 12px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-color)',
    backgroundColor: 'var(--bg-app)',
    color: 'var(--text-main)',
    fontSize: '0.9rem',
    fontWeight: 500,
    outline: 'none',
    flex: '1 1 150px',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header section */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div>
          <h1
            style={{
              fontSize: '1.5rem',
              fontWeight: 800,
              color: 'var(--text-main)',
              margin: 0,
              fontFamily: 'var(--font-heading)',
            }}
          >
            {t('expensesTitle')}
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
            {t('expensesSubtitle')}
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => navigate('/expenses/new')}
          leftIcon={<Plus size={18} />}
        >
          {t('btnRecordExpense')}
        </Button>
      </div>

      {/* KPI Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
        }}
      >
        <Card style={{ padding: '16px', borderLeft: '4px solid var(--brand-danger, #ef4444)' }}>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              display: 'block',
              marginBottom: '6px',
            }}
          >
            {t('todayExpenses')}
          </span>
          <strong style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--text-main)' }}>
            {formatCurrency(todayTotal)}
          </strong>
        </Card>
        <Card style={{ padding: '16px', borderLeft: '4px solid var(--brand-warning, #f59e0b)' }}>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              display: 'block',
              marginBottom: '6px',
            }}
          >
            {t('weeklyExpenses')}
          </span>
          <strong style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--text-main)' }}>
            {formatCurrency(weeklyTotal)}
          </strong>
        </Card>
        <Card style={{ padding: '16px', borderLeft: '4px solid var(--brand-primary)' }}>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              display: 'block',
              marginBottom: '6px',
            }}
          >
            {t('monthlyExpenses')}
          </span>
          <strong style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--text-main)' }}>
            {formatCurrency(monthlyTotal)}
          </strong>
        </Card>
        <Card style={{ padding: '16px', borderLeft: '4px solid var(--brand-cyan)' }}>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              display: 'block',
              marginBottom: '6px',
            }}
          >
            {t('largestCategory')}
          </span>
          <strong
            style={{
              fontSize: '1.4rem',
              fontWeight: 900,
              color: 'var(--text-main)',
              display: 'block',
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              marginTop: '6px',
            }}
          >
            {largestCategory}
          </strong>
        </Card>
      </div>

      {/* Ledger Container */}
      <Card style={{ overflow: 'hidden', padding: '0' }}>
        {/* Filters Header */}
        <div
          style={{
            padding: '16px',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            backgroundColor: 'var(--bg-app)',
          }}
        >
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ flex: '2 1 280px' }}>
              <SearchInput
                placeholder="Search expense description..."
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </div>
            <select
              style={selectStyle}
              value={filterCategoryId}
              onChange={(e) => {
                setFilterCategoryId(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <select
              style={selectStyle}
              value={filterPayMethod}
              onChange={(e) => {
                setFilterPayMethod(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="">All Pay Methods</option>
              <option value="CASH">Cash</option>
              <option value="POS">POS</option>
              <option value="TRANSFER">Transfer</option>
              <option value="MOBILE_MONEY">Mobile Money</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <span
              style={{
                fontSize: '0.85rem',
                fontWeight: 700,
                color: 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Calendar size={16} /> Date Range:
            </span>
            <input
              type="date"
              style={{ ...selectStyle, flex: '1 1 120px' }}
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setCurrentPage(1);
              }}
            />
            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>to</span>
            <input
              type="date"
              style={{ ...selectStyle, flex: '1 1 120px' }}
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setCurrentPage(1);
              }}
            />
            {(startDate || endDate || filterCategoryId || filterPayMethod || searchQuery) && (
              <button
                onClick={() => {
                  setStartDate('');
                  setEndDate('');
                  setFilterCategoryId('');
                  setFilterPayMethod('');
                  setSearchQuery('');
                  setCurrentPage(1);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--brand-danger)',
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                }}
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Desktop View Table */}
        <div className="desktop-table-container table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Category</th>
                <th>Description</th>
                <th>Method</th>
                <th>Amount</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedExpenses.map((exp) => (
                <tr key={exp.id}>
                  <td>
                    <div className="font-medium text-slate-800 dark:text-slate-200">
                      {formatDate(exp.expense_date)}
                    </div>
                  </td>
                  <td>
                    <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full">
                      {getCategoryName(exp.category_id)}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.95rem', color: 'var(--text-main)' }}>
                      {exp.description}
                    </span>
                    {exp.receipt_url && exp.receipt_url !== 'offline-pending' && (
                      <a
                        href={exp.receipt_url}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          marginLeft: '8px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '0.8rem',
                          color: 'var(--brand-primary)',
                          textDecoration: 'none',
                        }}
                      >
                        <FileText size={14} /> Receipt
                      </a>
                    )}
                  </td>
                  <td>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {getMethodLabel(exp.payment_method)}
                    </span>
                  </td>
                  <td style={{ fontWeight: 800, color: 'var(--brand-danger, #ef4444)' }}>
                    {formatCurrency(exp.amount)}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/expenses/edit/${exp.id}`)}
                        style={{ padding: '6px' }}
                      >
                        <Edit2 size={16} />
                      </Button>
                      <button
                        onClick={() => setDeleteTargetId(exp.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--brand-danger)',
                          cursor: 'pointer',
                          padding: '6px',
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {paginatedExpenses.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-500">
                    {t('noRecords')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Responsive Cards */}
        <div className="mobile-cards-container">
          {paginatedExpenses.map((exp) => (
            <Card
              key={exp.id}
              style={{
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                border: '1px solid var(--border-color)',
              }}
            >
              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {formatDate(exp.expense_date)}
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded">
                  {getCategoryName(exp.category_id)}
                </span>
              </div>
              <div style={{ fontSize: '0.95rem', color: 'var(--text-main)', fontWeight: 500 }}>
                {exp.description}
              </div>
              {exp.receipt_url && exp.receipt_url !== 'offline-pending' && (
                <a
                  href={exp.receipt_url}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.8rem',
                    color: 'var(--brand-primary)',
                    textDecoration: 'none',
                    width: 'fit-content',
                  }}
                >
                  <FileText size={14} /> View Receipt Document
                </a>
              )}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: '6px',
                  borderTop: '1px solid var(--border-color)',
                  paddingTop: '8px',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {getMethodLabel(exp.payment_method)}
                  </span>
                  <span
                    style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--brand-danger)' }}
                  >
                    {formatCurrency(exp.amount)}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate(`/expenses/edit/${exp.id}`)}
                  >
                    Edit
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => setDeleteTargetId(exp.id)}>
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
          {paginatedExpenses.length === 0 && (
            <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
              {t('noRecords')}
            </div>
          )}
        </div>

        {/* Pagination controls */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        title="Confirm Delete Expense"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <p style={{ margin: 0, color: 'var(--text-muted)' }}>
            {t('confirmDeleteExpense')} This action is soft-deleted and can only be recovered by
            administrators.
          </p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <Button variant="ghost" onClick={() => setDeleteTargetId(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleConfirmDelete}>
              Confirm Delete
            </Button>
          </div>
        </div>
      </Modal>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <style>{`
        .desktop-table-container {
          display: block;
        }
        .mobile-cards-container {
          display: none;
        }
        @media (max-width: 768px) {
          .desktop-table-container {
            display: none;
          }
          .mobile-cards-container {
            display: flex;
            flex-direction: column;
            gap: 12px;
            padding: 12px 14px;
          }
        }
      `}</style>
    </div>
  );
};

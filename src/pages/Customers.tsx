import React, { useState, useMemo } from 'react';
import { Users, Eye, UserPlus, Edit2, Trash2, ArrowLeft, Receipt } from 'lucide-react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { SearchInput } from '../components/SearchInput';
import { Modal } from '../components/Modal';
import { Input } from '../components/Input';
import { useCustomers } from '../hooks/useCustomers';
import { useCustomerLedger, type LedgerSale } from '../hooks/useCustomerLedger';
import { useBusiness } from '../hooks/useBusiness';
import type { Customer, InsertCustomer } from '../types/customers';
import { db } from '../lib/dexie';

export const Customers: React.FC = () => {
  const { customers, addCustomer, updateCustomer } = useCustomers();
  const { getCurrencySymbol } = useBusiness();
  const currSymbol = getCurrencySymbol();

  const [searchQuery, setSearchQuery] = useState('');
  
  // Ledger View State
  const [activeCustomer, setActiveCustomer] = useState<Customer | null>(null);
  
  // Modals State
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [customerForm, setCustomerForm] = useState<Partial<Customer>>({ name: '', phone: '', email: '', address: '' });
  
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [invoiceToPay, setInvoiceToPay] = useState<LedgerSale | null>(null);

  const { unpaidInvoices, payInvoice } = useCustomerLedger(activeCustomer?.id || null);

  const formatCurrency = (val: number) =>
    `${currSymbol}${Number(val).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString(undefined, { dateStyle: 'medium' });

  const filteredCustomers = useMemo(() => {
    if (!customers) return [];
    return customers.filter((c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [customers, searchQuery]);

  const totalDebt = useMemo(() => {
    let total = 0;
    if (customers) {
      for (const c of customers) {
        if (c.balance > 0) {
          total += c.balance;
        }
      }
    }
    return total;
  }, [customers]);

  // --- Handlers ---
  
  const handleOpenAdd = () => {
    setCustomerForm({ name: '', phone: '', email: '', address: '' });
    setIsCustomerModalOpen(true);
  };

  const handleOpenEdit = (e: React.MouseEvent, customer: Customer) => {
    e.stopPropagation();
    setCustomerForm(customer);
    setIsCustomerModalOpen(true);
  };

  const handleSaveCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerForm.name) return;

    if (customerForm.id) {
      await updateCustomer(customerForm.id, customerForm);
      if (activeCustomer?.id === customerForm.id) {
        setActiveCustomer({ ...activeCustomer, ...customerForm } as Customer);
      }
    } else {
      await addCustomer(customerForm as InsertCustomer);
    }
    setIsCustomerModalOpen(false);
  };

  const handleDeleteCustomer = async (e: React.MouseEvent, customer: Customer) => {
    e.stopPropagation();
    if (customer.balance > 0) {
      alert("Cannot delete a customer who has an outstanding debt balance.");
      return;
    }
    
    if (window.confirm(`Are you sure you want to delete ${customer.name}?`)) {
      await db.customers.delete(customer.id);
      if (activeCustomer?.id === customer.id) {
        setActiveCustomer(null);
      }
    }
  };

  const handleOpenPayment = (invoice: LedgerSale) => {
    setInvoiceToPay(invoice);
    const amountPaid = invoice.amount_paid !== undefined ? invoice.amount_paid : invoice.total_amount;
    const debt = invoice.total_amount - amountPaid;
    setPaymentAmount(debt.toString());
    setIsPaymentModalOpen(true);
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoiceToPay || !activeCustomer) return;

    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) return;

    await payInvoice(invoiceToPay.id, amount);

    // Update local active customer state balance for immediate UI feedback
    setActiveCustomer(prev => prev ? { ...prev, balance: Math.max(0, prev.balance - amount) } : null);

    setIsPaymentModalOpen(false);
    setInvoiceToPay(null);
    setPaymentAmount('');
  };

  // --- Views ---

  if (activeCustomer) {
    return (
      <div className="page-container">
        <div style={{ marginBottom: '20px' }}>
          <Button variant="outline" leftIcon={<ArrowLeft size={16} />} onClick={() => setActiveCustomer(null)}>
            Back to Customers
          </Button>
        </div>

        <Card style={{ padding: '24px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 900, margin: '0 0 4px', color: 'var(--text-main)' }}>
              {activeCustomer.name}
            </h2>
            <div style={{ display: 'flex', gap: '16px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              {activeCustomer.phone && <span>📞 {activeCustomer.phone}</span>}
              {activeCustomer.email && <span>✉️ {activeCustomer.email}</span>}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ margin: '0 0 4px', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Total Outstanding Debt
            </p>
            <p style={{ margin: 0, fontSize: '2rem', fontWeight: 900, color: activeCustomer.balance > 0 ? 'var(--brand-danger)' : 'var(--brand-primary)' }}>
              {formatCurrency(activeCustomer.balance)}
            </p>
          </div>
        </Card>

        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Receipt size={20} color="var(--brand-danger)" /> Unpaid Invoices
        </h3>

        {unpaidInvoices.length === 0 ? (
          <Card style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
            This customer has no unpaid invoices. Great!
          </Card>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {unpaidInvoices.map((invoice) => {
              const amountPaid = invoice.amount_paid !== undefined ? invoice.amount_paid : invoice.total_amount;
              const debt = invoice.total_amount - amountPaid;
              
              return (
                <Card key={invoice.id} style={{ padding: '20px', borderLeft: '4px solid var(--brand-danger)' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    
                    <div style={{ flex: '1 1 250px', minWidth: '0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', flexWrap: 'wrap' }}>
                        <span style={{ fontFamily: 'monospace', fontSize: '0.85rem', backgroundColor: 'var(--bg-app)', padding: '4px 8px', borderRadius: '4px', fontWeight: '600' }}>
                          {invoice.receipt_number}
                        </span>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                          {formatDate(invoice.created_at || '')}
                        </span>
                      </div>
                      
                      <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {invoice.items.map((item) => (
                          <li key={item.id} style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>
                            <span style={{ fontWeight: '700', marginRight: '4px' }}>{item.quantity}x</span> 
                            {item.product_name || item.custom_name || 'Product'} 
                            {item.is_discounted && (
                              <span style={{ marginLeft: '6px', fontSize: '0.65rem', backgroundColor: 'var(--brand-danger)', color: 'white', padding: '2px 4px', borderRadius: '4px', fontWeight: 'bold' }}>
                                Discount
                              </span>
                            )}
                            <span style={{ color: 'var(--text-muted)', marginLeft: '8px' }}>
                              ({formatCurrency(item.line_total)})
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div style={{ flex: '1 1 280px', backgroundColor: 'var(--bg-app)', padding: '16px', borderRadius: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', fontSize: '0.9rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Invoice Total:</span>
                        <span style={{ fontWeight: '600' }}>{formatCurrency(invoice.total_amount)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', fontSize: '0.9rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Amount Paid:</span>
                        <span style={{ fontWeight: '600', color: 'var(--brand-primary)' }}>{formatCurrency(amountPaid)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingTop: '8px', borderTop: '1px solid var(--border-color)' }}>
                        <span style={{ fontWeight: '700', color: 'var(--brand-danger)' }}>Debt:</span>
                        <span style={{ fontWeight: '900', fontSize: '1.1rem', color: 'var(--brand-danger)' }}>{formatCurrency(debt)}</span>
                      </div>
                      <Button variant="primary" style={{ width: '100%' }} onClick={() => handleOpenPayment(invoice)}>
                        Pay Invoice
                      </Button>
                    </div>

                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Record Payment Modal */}
        <Modal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          title="Settle Invoice Debt"
        >
          <form onSubmit={handleRecordPayment} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {invoiceToPay && (
              <div style={{ padding: '16px', backgroundColor: 'var(--bg-app)', borderRadius: '8px' }}>
                <p style={{ margin: '0 0 4px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Invoice</p>
                <p style={{ margin: '0 0 16px', fontSize: '1.2rem', fontWeight: 800, fontFamily: 'monospace' }}>{invoiceToPay.receipt_number}</p>
                
                <p style={{ margin: '0 0 4px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Outstanding Balance</p>
                <p style={{ margin: '0', fontSize: '1.5rem', fontWeight: 900, color: 'var(--brand-danger)' }}>
                  {formatCurrency(invoiceToPay.total_amount - (invoiceToPay.amount_paid !== undefined ? invoiceToPay.amount_paid : invoiceToPay.total_amount))}
                </p>
              </div>
            )}

            <Input
              label={`Amount Paying Now (${currSymbol})`}
              type="number"
              step="any"
              min="0.01"
              max={invoiceToPay ? (invoiceToPay.total_amount - (invoiceToPay.amount_paid || 0)) : undefined}
              required
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
            />

            <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
              <Button
                type="button"
                variant="outline"
                style={{ flex: 1 }}
                onClick={() => setIsPaymentModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" style={{ flex: 1 }}>
                Confirm Payment
              </Button>
            </div>
          </form>
        </Modal>

        {/* Customer Edit Modal */}
        <Modal
          isOpen={isCustomerModalOpen}
          onClose={() => setIsCustomerModalOpen(false)}
          title="Edit Customer"
        >
          <form onSubmit={handleSaveCustomer} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Input
              label="Customer Name"
              required
              value={customerForm.name || ''}
              onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })}
            />
            <Input
              label="Phone Number (Optional)"
              type="tel"
              value={customerForm.phone || ''}
              onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
            />
            <Input
              label="Email Address (Optional)"
              type="email"
              value={customerForm.email || ''}
              onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })}
            />
            <Input
              label="Physical Address (Optional)"
              value={customerForm.address || ''}
              onChange={(e) => setCustomerForm({ ...customerForm, address: e.target.value })}
            />
            <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
              <Button type="button" variant="outline" style={{ flex: 1 }} onClick={() => setIsCustomerModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" style={{ flex: 1 }}>
                Save Details
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header" style={{ marginBottom: '24px' }}>
        <div>
          <h1
            style={{
              fontSize: '1.75rem',
              fontWeight: 800,
              color: 'var(--text-main)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              margin: 0,
            }}
          >
            <Users size={28} color="var(--brand-primary)" />
            Customers & Debtors
          </h1>
          <p style={{ margin: '6px 0 0', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Manage your customer ledger and track unpaid invoices.
          </p>
        </div>
        <Button variant="primary" onClick={handleOpenAdd} leftIcon={<UserPlus size={18} />}>
          Add Customer
        </Button>
      </div>

      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', marginBottom: '24px' }}>
        <Card style={{ flex: '1 1 300px', padding: '24px', borderLeft: '4px solid var(--brand-primary)' }}>
          <p style={{ margin: '0 0 8px', fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Total Customers
          </p>
          <p style={{ margin: 0, fontSize: '2rem', fontWeight: 900, color: 'var(--text-main)' }}>
            {customers?.length || 0}
          </p>
        </Card>
        <Card style={{ flex: '1 1 300px', padding: '24px', borderLeft: '4px solid var(--brand-danger)' }}>
          <p style={{ margin: '0 0 8px', fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Total Outstanding Debt
          </p>
          <p style={{ margin: 0, fontSize: '2rem', fontWeight: 900, color: 'var(--brand-danger)' }}>
            {formatCurrency(totalDebt)}
          </p>
        </Card>
      </div>

      <Card style={{ padding: '20px' }}>
        <div style={{ marginBottom: '20px', maxWidth: '400px' }}>
          <SearchInput
            placeholder="Search customers by name..."
            value={searchQuery}
            onChange={setSearchQuery}
          />
        </div>

        <div className="table-wrapper desktop-table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Customer Name</th>
                <th>Phone</th>
                <th>Debt Balance</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((c) => (
                <tr 
                  key={c.id} 
                  onClick={() => setActiveCustomer(c)} 
                  className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  style={{ cursor: 'pointer' }}
                >
                  <td className="font-bold text-slate-800 dark:text-slate-200">
                    {c.name}
                  </td>
                  <td>{c.phone || '-'}</td>
                  <td>
                    {c.balance > 0 ? (
                      <span className="font-bold text-red-500">
                        {formatCurrency(c.balance)}
                      </span>
                    ) : (
                      <span className="font-bold text-emerald-500">
                        No Debt
                      </span>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveCustomer(c);
                        }}
                        leftIcon={<Eye size={14} />}
                      >
                        Ledger
                      </Button>
                      <button
                        onClick={(e) => handleOpenEdit(e, c)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: 'var(--text-muted)' }}
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={(e) => handleDeleteCustomer(e, c)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: c.balance > 0 ? '#cbd5e1' : 'var(--brand-danger)' }}
                        disabled={c.balance > 0}
                        title={c.balance > 0 ? 'Cannot delete customer with active debt' : 'Delete'}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredCustomers.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                    No customers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mobile-cards-container">
          {filteredCustomers.map((c) => (
            <Card
              key={c.id}
              onClick={() => setActiveCustomer(c)}
              style={{
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                border: '1px solid var(--border-color)',
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span className="font-bold text-lg text-slate-800 dark:text-slate-200">
                  {c.name}
                </span>
                {c.balance > 0 ? (
                  <span className="font-bold text-red-500">
                    Debt: {formatCurrency(c.balance)}
                  </span>
                ) : (
                  <span className="font-bold text-emerald-500 text-sm">
                    No Debt
                  </span>
                )}
              </div>
              {c.phone && <span className="text-sm text-slate-500">{c.phone}</span>}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveCustomer(c);
                  }}
                  leftIcon={<Eye size={14} />}
                >
                  View Ledger
                </Button>
                
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    onClick={(e) => handleOpenEdit(e, c)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: 'var(--text-muted)' }}
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={(e) => handleDeleteCustomer(e, c)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: c.balance > 0 ? '#cbd5e1' : 'var(--brand-danger)' }}
                    disabled={c.balance > 0}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </Card>
          ))}
          {filteredCustomers.length === 0 && (
            <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
              No customers found.
            </div>
          )}
        </div>
      </Card>

      {/* Customer Add Modal */}
      <Modal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        title={customerForm.id ? "Edit Customer" : "Add New Customer"}
      >
        <form onSubmit={handleSaveCustomer} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Input
            label="Customer Name"
            required
            value={customerForm.name || ''}
            onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })}
          />
          <Input
            label="Phone Number (Optional)"
            type="tel"
            value={customerForm.phone || ''}
            onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
          />
          <Input
            label="Email Address (Optional)"
            type="email"
            value={customerForm.email || ''}
            onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })}
          />
          <Input
            label="Physical Address (Optional)"
            value={customerForm.address || ''}
            onChange={(e) => setCustomerForm({ ...customerForm, address: e.target.value })}
          />
          <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
            <Button type="button" variant="outline" style={{ flex: 1 }} onClick={() => setIsCustomerModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" style={{ flex: 1 }}>
              {customerForm.id ? "Save Details" : "Create Customer"}
            </Button>
          </div>
        </form>
      </Modal>

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

import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { invoicesAPI } from '../utils/api';
import InvoiceModal from '../components/InvoiceModal';

export default function Billing({ navigate }) {
  const { customers, items, fetchCustomers, fetchItems } = useApp();

  const [step, setStep] = useState(1); // 1=select customer, 2=add items, 3=review
  const [selectedCust, setSelectedCust] = useState(null);
  const [billingItems, setBillingItems] = useState([]); // [{item_code, item_name, unit_price, quantity}]
  const [selectedItemCode, setSelectedItemCode] = useState('');
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [createdInvoice, setCreatedInvoice] = useState(null);

  useEffect(() => {
    fetchCustomers();
    fetchItems();
  }, []);

  const activeCustomers = customers.filter(c => c.is_active === 'Y');
  const activeItems = items.filter(i => i.is_active === 'Y');

  const fmt = (n) => '₹' + parseFloat(n).toLocaleString('en-IN', { minimumFractionDigits: 2 });

  const isGSTRegistered = selectedCust && selectedCust.cust_gst && selectedCust.cust_gst.trim().length > 0;
  const gstRate = isGSTRegistered ? 0 : 18;

  const subtotal = billingItems.reduce((s, i) => s + i.unit_price * i.quantity, 0);
  const gstAmount = (subtotal * gstRate) / 100;
  const totalAmount = subtotal + gstAmount;

  const handleSelectCustomer = (cust) => {
    setSelectedCust(cust);
    setStep(2);
    setBillingItems([]);
    setError('');
  };

  const handleAddItem = () => {
    if (!selectedItemCode) return;
    const item = activeItems.find(i => i.item_code === selectedItemCode);
    if (!item) return;
    if (qty < 1) { setError('Quantity must be at least 1'); return; }

    const existing = billingItems.find(i => i.item_code === selectedItemCode);
    if (existing) {
      setBillingItems(billingItems.map(i =>
        i.item_code === selectedItemCode
          ? { ...i, quantity: i.quantity + parseInt(qty) }
          : i
      ));
    } else {
      setBillingItems([...billingItems, {
        item_code: item.item_code,
        item_name: item.item_name,
        unit_price: parseFloat(item.selling_price),
        quantity: parseInt(qty),
      }]);
    }
    setSelectedItemCode('');
    setQty(1);
    setError('');
  };

  const handleRemoveItem = (code) => {
    setBillingItems(billingItems.filter(i => i.item_code !== code));
  };

  const handleQtyChange = (code, val) => {
    const n = parseInt(val);
    if (n < 1) return;
    setBillingItems(billingItems.map(i => i.item_code === code ? { ...i, quantity: n } : i));
  };

  const handleGenerateInvoice = async () => {
    if (billingItems.length === 0) { setError('Add at least one item.'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await invoicesAPI.create({
        cust_id: selectedCust.cust_id,
        items: billingItems.map(i => ({ item_code: i.item_code, quantity: i.quantity })),
      });
      setCreatedInvoice(res.data.data);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to generate invoice.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStep(1);
    setSelectedCust(null);
    setBillingItems([]);
    setCreatedInvoice(null);
    setError('');
  };

  return (
    <div>
      {/* Step indicator */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 28, alignItems: 'center' }}>
        {[
          { n: 1, label: 'Select Customer' },
          { n: 2, label: 'Add Items' },
          { n: 3, label: 'Review & Generate' },
        ].map((s, idx) => (
          <React.Fragment key={s.n}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              color: step >= s.n ? 'var(--accent-hover)' : 'var(--text-muted)',
              fontWeight: step === s.n ? 600 : 400,
              fontSize: 13,
            }}>
              <div style={{
                width: 26, height: 26, borderRadius: '50%',
                background: step >= s.n ? 'var(--accent)' : 'var(--bg-card)',
                border: `1px solid ${step >= s.n ? 'var(--accent)' : 'var(--border)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 700, color: step >= s.n ? '#fff' : 'var(--text-muted)',
                flexShrink: 0,
              }}>{s.n}</div>
              {s.label}
            </div>
            {idx < 2 && (
              <div style={{
                flex: 1, height: 1, margin: '0 12px',
                background: step > s.n ? 'var(--accent)' : 'var(--border)',
                maxWidth: 80,
              }} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Step 1: Select Customer */}
      {step === 1 && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">Select Customer</div>
          </div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 16, fontSize: 13 }}>
            Choose a customer to begin generating an invoice.
          </p>
          <div className="items-grid">
            {activeCustomers.map(c => (
              <div
                key={c.cust_id}
                className="item-card"
                style={{
                  cursor: 'pointer',
                  transition: 'all 0.18s',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  gap: 8,
                }}
                onClick={() => handleSelectCustomer(c)}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
              >
                <div className="item-card-name">{c.cust_name}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{c.cust_address}</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  <span className="badge badge-active">Active</span>
                  {c.cust_gst ? (
                    <span className="badge" style={{ background: 'rgba(92,107,192,0.15)', color: 'var(--accent-hover)' }}>GST Registered</span>
                  ) : (
                    <span className="badge badge-inactive">Non-GST</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Add Items */}
      {step === 2 && selectedCust && (
        <div>
          {/* Customer summary */}
          <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 10, padding: '14px 20px', marginBottom: 20,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 3 }}>BILLING TO</div>
              <div style={{ fontWeight: 600 }}>{selectedCust.cust_name}</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{selectedCust.cust_address}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span className={`badge ${isGSTRegistered ? 'badge-active' : 'badge-inactive'}`}>
                {isGSTRegistered ? 'GST Registered – No GST applied' : '18% GST will be applied'}
              </span>
              <br />
              <button className="btn btn-sm btn-secondary" style={{ marginTop: 8 }} onClick={() => setStep(1)}>
                ← Change Customer
              </button>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <div className="card-title">Add Items</div>
            </div>

            {/* Add item row */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr auto', gap: 12, marginBottom: 20, alignItems: 'flex-end' }}>
              <div>
                <label className="form-label">Select Item</label>
                <select className="form-control" value={selectedItemCode} onChange={e => setSelectedItemCode(e.target.value)}>
                  <option value="">-- Choose an item --</option>
                  {activeItems.map(i => (
                    <option key={i.item_code} value={i.item_code}>
                      {i.item_name} — {fmt(i.selling_price)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="form-label">Quantity</label>
                <input
                  className="form-control"
                  type="number" min="1" value={qty}
                  onChange={e => setQty(e.target.value)}
                />
              </div>
              <button className="btn btn-primary" onClick={handleAddItem}>＋ Add</button>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            {/* Items table */}
            {billingItems.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📦</div>
                <p>No items added yet. Select an item above.</p>
              </div>
            ) : (
              <>
                <div className="table-wrap">
                  <table>
                    <thead><tr>
                      <th>Item</th>
                      <th>Unit Price</th>
                      <th>Qty</th>
                      <th>Line Total</th>
                      <th></th>
                    </tr></thead>
                    <tbody>
                      {billingItems.map(item => (
                        <tr key={item.item_code}>
                          <td style={{ fontWeight: 500 }}>{item.item_name}</td>
                          <td>{fmt(item.unit_price)}</td>
                          <td>
                            <input
                              type="number" min="1" value={item.quantity}
                              onChange={e => handleQtyChange(item.item_code, e.target.value)}
                              style={{
                                width: 70, padding: '5px 8px',
                                background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                                borderRadius: 6, color: 'var(--text-primary)', fontFamily: 'inherit',
                              }}
                            />
                          </td>
                          <td style={{ fontWeight: 500 }}>{fmt(item.unit_price * item.quantity)}</td>
                          <td>
                            <button className="btn btn-sm btn-danger" onClick={() => handleRemoveItem(item.item_code)}>✕</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Totals preview */}
                <div className="total-section" style={{ marginTop: 16 }}>
                  <div className="total-row">
                    <span>Subtotal</span>
                    <span>{fmt(subtotal)}</span>
                  </div>
                  <div className="total-row">
                    <span>GST ({gstRate}%)</span>
                    <span>{gstRate === 0
                      ? <span style={{ color: 'var(--active-badge)' }}>Not Applicable</span>
                      : fmt(gstAmount)
                    }</span>
                  </div>
                  <div className="total-row grand">
                    <span>Total Amount</span>
                    <span>{fmt(totalAmount)}</span>
                  </div>
                </div>

                <div className="form-actions" style={{ marginTop: 20 }}>
                  <button className="btn btn-secondary" onClick={handleReset}>✕ Cancel</button>
                  <button
                    className="btn btn-primary"
                    onClick={handleGenerateInvoice}
                    disabled={loading}
                  >
                    {loading ? 'Generating...' : '🧾 Generate Invoice'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Invoice created modal */}
      {createdInvoice && (
        <InvoiceModal
          invoice={createdInvoice}
          onClose={() => {
            setCreatedInvoice(null);
            handleReset();
          }}
        />
      )}
    </div>
  );
}

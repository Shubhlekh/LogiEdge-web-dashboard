import React from 'react';

export default function InvoiceModal({ invoice, onClose }) {
  if (!invoice) return null;

  const fmt = (n) => '₹' + parseFloat(n).toLocaleString('en-IN', { minimumFractionDigits: 2 });
  const isGSTFree = parseFloat(invoice.gst_rate) === 0;

  const handlePrint = () => {
    const printContent = document.getElementById('invoice-print-area').innerHTML;
    const win = window.open('', '_blank');
    win.document.write(`
      <html><head><title>Invoice ${invoice.invoice_id}</title>
      <style>
        body { font-family: sans-serif; padding: 40px; color: #111; }
        table { width: 100%; border-collapse: collapse; margin-top: 16px; }
        th { background: #1e1e2e; color: #fff; padding: 10px 14px; text-align: left; font-size: 12px; }
        td { padding: 10px 14px; border-bottom: 1px solid #e5e7eb; font-size: 13px; }
        .header { display: flex; justify-content: space-between; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 2px solid #5c6bc0; }
        .logo { font-size: 22px; font-weight: 700; color: #5c6bc0; }
        .inv-id { font-size: 18px; font-weight: 700; color: #5c6bc0; font-family: monospace; }
        .totals { margin-top: 16px; text-align: right; }
        .grand { font-size: 18px; font-weight: 700; border-top: 2px solid #5c6bc0; padding-top: 10px; margin-top: 8px; }
        .badge { padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; }
        .gst-free { background: #dcfce7; color: #16a34a; }
        .gst-applied { background: #fee2e2; color: #dc2626; }
      </style></head>
      <body>${printContent}</body></html>
    `);
    win.document.close();
    win.print();
  };

  return (
    <div className="overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <div style={{ fontWeight: 700, fontSize: 16 }}>Invoice Details</div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button className="btn btn-sm btn-secondary" onClick={handlePrint}>🖨️ Print</button>
            <button className="close-btn" onClick={onClose}>✕</button>
          </div>
        </div>
        <div className="modal-body">
          <div id="invoice-print-area">
            {/* Header */}
            <div className="invoice-print-header">
              <div>
                <div className="invoice-logo">LogiEdge <span style={{ color: 'var(--text-secondary)', fontWeight: 400, fontSize: 14 }}>Systems</span></div>
                <div style={{ color: 'var(--text-secondary)', fontSize: 12, marginTop: 4 }}>Billing Invoice</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="invoice-id-badge">{invoice.invoice_id}</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
                  {new Date(invoice.invoice_date).toLocaleDateString('en-IN', {
                    day: '2-digit', month: 'long', year: 'numeric'
                  })}
                </div>
                <span className={`badge ${isGSTFree ? 'badge-active' : 'badge-inactive'}`} style={{ marginTop: 6, display: 'inline-block' }}>
                  {isGSTFree ? 'GST Registered' : '18% GST Applied'}
                </span>
              </div>
            </div>

            {/* Customer Info */}
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16,
              background: 'var(--bg-secondary)', borderRadius: 8, padding: 16, marginBottom: 20
            }}>
              <div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Bill To</div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{invoice.cust_name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{invoice.cust_address}</div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Tax Info</div>
                <div style={{ fontSize: 12 }}>PAN: <span className="mono" style={{ fontSize: 12 }}>{invoice.cust_pan}</span></div>
                {invoice.cust_gst && (
                  <div style={{ fontSize: 12, marginTop: 2 }}>GST: <span className="mono" style={{ fontSize: 12 }}>{invoice.cust_gst}</span></div>
                )}
              </div>
            </div>

            {/* Line Items */}
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Item</th>
                    <th>Unit Price</th>
                    <th>Qty</th>
                    <th style={{ textAlign: 'right' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {(invoice.items || []).map((item, i) => (
                    <tr key={item.id}>
                      <td style={{ color: 'var(--text-muted)' }}>{i + 1}</td>
                      <td style={{ fontWeight: 500 }}>{item.item_name}</td>
                      <td>{fmt(item.unit_price)}</td>
                      <td>{item.quantity}</td>
                      <td style={{ textAlign: 'right', fontWeight: 500 }}>{fmt(item.line_total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="total-section">
              <div className="total-row">
                <span>Subtotal</span>
                <span>{fmt(invoice.subtotal)}</span>
              </div>
              <div className="total-row">
                <span>GST ({invoice.gst_rate}%)</span>
                <span>{isGSTFree ? <span style={{ color: 'var(--active-badge)' }}>Not Applicable</span> : fmt(invoice.gst_amount)}</span>
              </div>
              <div className="total-row grand">
                <span>Total Amount</span>
                <span>{fmt(invoice.total_amount)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { invoicesAPI } from '../utils/api';
import InvoiceModal from '../components/InvoiceModal';

export default function Dashboard({ navigate }) {
  const { customers, fetchCustomers, fetchInvoices } = useApp();
  const [invoices, setInvoices] = useState([]);
  const [searchId, setSearchId] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [searchError, setSearchError] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [selectedCust, setSelectedCust] = useState('');
  const [custInvoices, setCustInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomers();
    invoicesAPI.getAll().then(r => {
      setInvoices(r.data.data);
      setLoading(false);
    });
  }, []);

  const handleSearch = async () => {
    if (!searchId.trim()) return;
    setSearchError('');
    setSearchResult(null);
    try {
      const res = await invoicesAPI.getOne(searchId.trim());
      setSearchResult(res.data.data);
    } catch {
      setSearchError('Invoice not found. Check the Invoice ID.');
    }
  };

  const handleCustFilter = async (id) => {
    setSelectedCust(id);
    if (!id) { setCustInvoices([]); return; }
    try {
      const res = await invoicesAPI.getAll();
      setCustInvoices(res.data.data.filter(i => i.cust_id === id));
    } catch {}
  };

  const fmt = (n) => '₹' + parseFloat(n).toLocaleString('en-IN', { minimumFractionDigits: 2 });
  const totalRevenue = invoices.reduce((s, i) => s + parseFloat(i.total_amount), 0);

  const displayList = selectedCust ? custInvoices : invoices;

  return (
    <div>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total Invoices</div>
          <div className="stat-value">{invoices.length}</div>
          <div className="stat-sub">All time</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Revenue</div>
          <div className="stat-value" style={{ fontSize: 20 }}>{fmt(totalRevenue)}</div>
          <div className="stat-sub">Across all invoices</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Active Customers</div>
          <div className="stat-value">{customers.filter(c => c.is_active === 'Y').length}</div>
          <div className="stat-sub">In master</div>
        </div>
      </div>

      {/* Search Invoice */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header">
          <div className="card-title">🔍 Search Invoice by ID</div>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <input
            className="form-control"
            placeholder="Enter Invoice ID (e.g. INVC224830)"
            value={searchId}
            onChange={e => setSearchId(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            style={{ maxWidth: 320 }}
          />
          <button className="btn btn-primary" onClick={handleSearch}>Search</button>
        </div>
        {searchError && <div className="alert alert-error" style={{ marginTop: 12 }}>{searchError}</div>}
        {searchResult && (
          <div style={{ marginTop: 16 }}>
            <div className="alert alert-success">Invoice found! ✅</div>
            <table><thead><tr>
              <th>Invoice ID</th><th>Customer</th><th>Date</th><th>Total</th><th></th>
            </tr></thead><tbody>
              <tr>
                <td className="mono">{searchResult.invoice_id}</td>
                <td>{searchResult.cust_name}</td>
                <td>{new Date(searchResult.invoice_date).toLocaleDateString('en-IN')}</td>
                <td style={{ fontWeight: 600 }}>{fmt(searchResult.total_amount)}</td>
                <td><button className="btn btn-sm btn-secondary" onClick={() => setSelectedInvoice(searchResult)}>View</button></td>
              </tr>
            </tbody></table>
          </div>
        )}
      </div>

      {/* Customer Filter + Recent Invoices */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">📋 {selectedCust ? 'Customer Invoices' : 'Recent Invoices'}</div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <select
              className="form-control"
              style={{ width: 220 }}
              value={selectedCust}
              onChange={e => handleCustFilter(e.target.value)}
            >
              <option value="">All Customers</option>
              {customers.map(c => (
                <option key={c.cust_id} value={c.cust_id}>{c.cust_name}</option>
              ))}
            </select>
            {selectedCust && (
              <button className="btn btn-sm btn-secondary" onClick={() => handleCustFilter('')}>Clear</button>
            )}
          </div>
        </div>

        {loading ? <div className="spinner" /> : displayList.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🧾</div>
            <p>No invoices found</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr>
                <th>Invoice ID</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Subtotal</th>
                <th>GST</th>
                <th>Total</th>
                <th></th>
              </tr></thead>
              <tbody>
                {displayList.map(inv => (
                  <tr key={inv.invoice_id}>
                    <td className="mono">{inv.invoice_id}</td>
                    <td>{inv.cust_name}</td>
                    <td>{new Date(inv.invoice_date).toLocaleDateString('en-IN')}</td>
                    <td>{fmt(inv.subtotal)}</td>
                    <td>{inv.gst_rate > 0 ? `${inv.gst_rate}%` : <span style={{ color: 'var(--active-badge)' }}>GST Free</span>}</td>
                    <td style={{ fontWeight: 600 }}>{fmt(inv.total_amount)}</td>
                    <td>
                      <button className="btn btn-sm btn-secondary"
                        onClick={async () => {
                          const r = await invoicesAPI.getOne(inv.invoice_id);
                          setSelectedInvoice(r.data.data);
                        }}>
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedInvoice && (
        <InvoiceModal invoice={selectedInvoice} onClose={() => setSelectedInvoice(null)} />
      )}
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { customersAPI } from '../utils/api';

export default function Customers() {
  const { customers, fetchCustomers } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [togglingId, setTogglingId] = useState(null);
  const [msg, setMsg] = useState(null);
  const [form, setForm] = useState({
    cust_name: '', cust_address: '', cust_pan: '',
    cust_gst: '', is_active: 'Y'
  });

  useEffect(() => { fetchCustomers(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    if (!form.cust_name || !form.cust_pan) {
      setMsg({ type: 'error', text: 'Customer Name and PAN are required.' });
      return;
    }
    setLoading(true);
    setMsg(null);
    try {
      await customersAPI.create(form);
      setMsg({ type: 'success', text: 'Customer created successfully!' });
      setForm({ cust_name: '', cust_address: '', cust_pan: '', cust_gst: '', is_active: 'Y' });
      setShowForm(false);
      fetchCustomers();
    } catch (e) {
      setMsg({ type: 'error', text: e.response?.data?.message || 'Failed to create customer.' });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (cust) => {
    const newStatus = cust.is_active === 'Y' ? 'N' : 'Y';
    setTogglingId(cust.cust_id);
    try {
      await customersAPI.updateStatus(cust.cust_id, newStatus);
      await fetchCustomers();
      setMsg({
        type: 'success',
        text: `${cust.cust_name} marked as ${newStatus === 'Y' ? 'Active' : 'In-Active'}.`
      });
    } catch (e) {
      setMsg({ type: 'error', text: 'Failed to update status.' });
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <div className="card-title">CUSTOMERS</div>
          <button className="btn btn-primary btn-sm" onClick={() => { setShowForm(!showForm); setMsg(null); }}>
            {showForm ? '✕ Cancel' : '＋ ADD'}
          </button>
        </div>

        {showForm && (
          <div style={{ background: 'var(--bg-secondary)', borderRadius: 10, padding: 20, marginBottom: 20 }}>
            <div style={{ fontWeight: 600, marginBottom: 16, fontSize: 15 }}>Add New Customer</div>
            {msg && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Customer Name *</label>
                <input className="form-control" name="cust_name" value={form.cust_name} onChange={handleChange} placeholder="Company name" />
              </div>
              <div className="form-group">
                <label className="form-label">Customer Address</label>
                <input className="form-control" name="cust_address" value={form.cust_address} onChange={handleChange} placeholder="City, State" />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">PAN Number * (10 digits)</label>
                <input className="form-control" name="cust_pan" value={form.cust_pan} onChange={handleChange} placeholder="ABCDE1234F" maxLength={10} />
              </div>
              <div className="form-group">
                <label className="form-label">GST Number (15 digits)</label>
                <input className="form-control" name="cust_gst" value={form.cust_gst} onChange={handleChange} placeholder="Leave blank if not GST registered" maxLength={15} />
              </div>
            </div>
            <div className="form-group" style={{ maxWidth: 220 }}>
              <label className="form-label">Customer Status</label>
              <select className="form-control" name="is_active" value={form.is_active} onChange={handleChange}>
                <option value="Y">Active</option>
                <option value="N">In-Active</option>
              </select>
            </div>
            <div className="form-actions">
              <button className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
                {loading ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
        )}

        {msg && !showForm && (
          <div className={`alert alert-${msg.type}`} style={{ marginBottom: 16 }}>{msg.text}</div>
        )}

        <div className="items-grid">
          {customers.map(c => (
            <div key={c.cust_id} className="item-card" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 12 }}>
              <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div className="item-card-name">{c.cust_name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>{c.cust_id}</div>
                </div>
                <span className={`badge ${c.is_active === 'Y' ? 'badge-active' : 'badge-inactive'}`}>
                  {c.is_active === 'Y' ? 'Active' : 'In-Active'}
                </span>
              </div>
              <div style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', flexShrink: 0 }}>Status:</span>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button
                    disabled={togglingId === c.cust_id}
                    onClick={() => c.is_active !== 'Y' && handleToggleStatus(c)}
                    style={{
                      padding: '4px 10px', fontSize: 11, fontWeight: 600, borderRadius: 6,
                      cursor: c.is_active === 'Y' ? 'default' : 'pointer',
                      background: c.is_active === 'Y' ? 'rgba(34,197,94,0.2)' : 'var(--bg-primary)',
                      color: c.is_active === 'Y' ? 'var(--active-badge)' : 'var(--text-muted)',
                      border: c.is_active === 'Y' ? '1px solid rgba(34,197,94,0.4)' : '1px solid var(--border)',
                      opacity: togglingId === c.cust_id ? 0.5 : 1, transition: 'all 0.18s',
                    }}
                  >✓ Active</button>
                  <button
                    disabled={togglingId === c.cust_id}
                    onClick={() => c.is_active !== 'N' && handleToggleStatus(c)}
                    style={{
                      padding: '4px 10px', fontSize: 11, fontWeight: 600, borderRadius: 6,
                      cursor: c.is_active === 'N' ? 'default' : 'pointer',
                      background: c.is_active === 'N' ? 'rgba(239,68,68,0.2)' : 'var(--bg-primary)',
                      color: c.is_active === 'N' ? 'var(--inactive-badge)' : 'var(--text-muted)',
                      border: c.is_active === 'N' ? '1px solid rgba(239,68,68,0.4)' : '1px solid var(--border)',
                      opacity: togglingId === c.cust_id ? 0.5 : 1, transition: 'all 0.18s',
                    }}
                  >✕ In-Active</button>
                </div>
                {togglingId === c.cust_id && (
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Updating...</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

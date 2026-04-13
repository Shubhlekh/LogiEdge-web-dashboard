import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { itemsAPI } from '../utils/api';

export default function Items() {
  const { items, fetchItems } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [togglingCode, setTogglingCode] = useState(null);
  const [msg, setMsg] = useState(null);
  const [form, setForm] = useState({ item_name: '', selling_price: '', is_active: 'Y' });

  useEffect(() => { fetchItems(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    if (!form.item_name || !form.selling_price) {
      setMsg({ type: 'error', text: 'Item Name and Selling Price are required.' });
      return;
    }
    setLoading(true);
    setMsg(null);
    try {
      await itemsAPI.create(form);
      setMsg({ type: 'success', text: 'Item created successfully!' });
      setForm({ item_name: '', selling_price: '', is_active: 'Y' });
      setShowForm(false);
      fetchItems();
    } catch (e) {
      setMsg({ type: 'error', text: e.response?.data?.message || 'Failed to create item.' });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (item) => {
    const newStatus = item.is_active === 'Y' ? 'N' : 'Y';
    setTogglingCode(item.item_code);
    try {
      await itemsAPI.updateStatus(item.item_code, newStatus);
      await fetchItems();
      setMsg({
        type: 'success',
        text: `${item.item_name} marked as ${newStatus === 'Y' ? 'Active' : 'In-Active'}.`
      });
    } catch (e) {
      setMsg({ type: 'error', text: 'Failed to update status.' });
    } finally {
      setTogglingCode(null);
    }
  };

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <div className="card-title">ITEMS</div>
          <button className="btn btn-primary btn-sm" onClick={() => { setShowForm(!showForm); setMsg(null); }}>
            {showForm ? '✕ Cancel' : '＋ ADD'}
          </button>
        </div>

        {showForm && (
          <div style={{ background: 'var(--bg-secondary)', borderRadius: 10, padding: 20, marginBottom: 20 }}>
            <div style={{ fontWeight: 600, marginBottom: 16, fontSize: 15 }}>Add New Item</div>
            {msg && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Item Name *</label>
                <input className="form-control" name="item_name" value={form.item_name} onChange={handleChange} placeholder="e.g. Laptop" />
              </div>
              <div className="form-group">
                <label className="form-label">Customer Selling Price *</label>
                <input className="form-control" type="number" name="selling_price" value={form.selling_price} onChange={handleChange} placeholder="e.g. 85000" />
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
          {items.map(item => (
            <div key={item.item_code} className="item-card" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 12 }}>
              <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div className="item-card-name">{item.item_name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>
                    ₹{parseFloat(item.selling_price).toLocaleString('en-IN')}
                  </div>
                </div>
                <span className={`badge ${item.is_active === 'Y' ? 'badge-active' : 'badge-inactive'}`}>
                  {item.is_active === 'Y' ? 'Active' : 'In-Active'}
                </span>
              </div>
              <div style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', flexShrink: 0 }}>Status:</span>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button
                    disabled={togglingCode === item.item_code}
                    onClick={() => item.is_active !== 'Y' && handleToggleStatus(item)}
                    style={{
                      padding: '4px 10px', fontSize: 11, fontWeight: 600, borderRadius: 6,
                      cursor: item.is_active === 'Y' ? 'default' : 'pointer',
                      background: item.is_active === 'Y' ? 'rgba(34,197,94,0.2)' : 'var(--bg-primary)',
                      color: item.is_active === 'Y' ? 'var(--active-badge)' : 'var(--text-muted)',
                      border: item.is_active === 'Y' ? '1px solid rgba(34,197,94,0.4)' : '1px solid var(--border)',
                      opacity: togglingCode === item.item_code ? 0.5 : 1, transition: 'all 0.18s',
                    }}
                  >✓ Active</button>
                  <button
                    disabled={togglingCode === item.item_code}
                    onClick={() => item.is_active !== 'N' && handleToggleStatus(item)}
                    style={{
                      padding: '4px 10px', fontSize: 11, fontWeight: 600, borderRadius: 6,
                      cursor: item.is_active === 'N' ? 'default' : 'pointer',
                      background: item.is_active === 'N' ? 'rgba(239,68,68,0.2)' : 'var(--bg-primary)',
                      color: item.is_active === 'N' ? 'var(--inactive-badge)' : 'var(--text-muted)',
                      border: item.is_active === 'N' ? '1px solid rgba(239,68,68,0.4)' : '1px solid var(--border)',
                      opacity: togglingCode === item.item_code ? 0.5 : 1, transition: 'all 0.18s',
                    }}
                  >✕ In-Active</button>
                </div>
                {togglingCode === item.item_code && (
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

import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { itemsAPI } from '../utils/api';

export default function Items() {
  const { items, fetchItems } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
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

        {msg && !showForm && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}

        <div className="items-grid">
          {items.map(item => (
            <div key={item.item_code} className="item-card">
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
          ))}
        </div>
      </div>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { itemsAPI } from '../utils/api';

export default function Items() {
  const { items, fetchItems } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);
  const [selected, setSelected] = useState([]); // selected item_codes
  const [bulkLoading, setBulkLoading] = useState(false);
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

  const toggleSelect = (code) => {
    setSelected(prev =>
      prev.includes(code) ? prev.filter(x => x !== code) : [...prev, code]
    );
  };

  const toggleSelectAll = () => {
    if (selected.length === items.length) {
      setSelected([]);
    } else {
      setSelected(items.map(i => i.item_code));
    }
  };

  const handleBulkStatus = async (newStatus) => {
    if (selected.length === 0) return;
    setBulkLoading(true);
    setMsg(null);
    try {
      await Promise.all(selected.map(code => itemsAPI.updateStatus(code, newStatus)));
      await fetchItems();
      setMsg({
        type: 'success',
        text: `${selected.length} item(s) marked as ${newStatus === 'Y' ? 'Active' : 'In-Active'}.`
      });
      setSelected([]);
    } catch (e) {
      setMsg({ type: 'error', text: 'Failed to update some statuses.' });
    } finally {
      setBulkLoading(false);
    }
  };

  const allSelected = items.length > 0 && selected.length === items.length;
  const someSelected = selected.length > 0;

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

        {/* Bulk action toolbar */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          marginBottom: 16, flexWrap: 'wrap',
        }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: 'var(--text-secondary)', userSelect: 'none' }}>
            <input
              type="checkbox"
              checked={allSelected}
              onChange={toggleSelectAll}
              style={{ width: 15, height: 15, accentColor: 'var(--accent)', cursor: 'pointer' }}
            />
            {allSelected ? 'Deselect All' : 'Select All'}
          </label>

          {someSelected && (
            <>
              <div style={{ height: 18, width: 1, background: 'var(--border)' }} />
              <span style={{ fontSize: 12, color: 'var(--accent-hover)', fontWeight: 600 }}>
                {selected.length} selected
              </span>
              <button
                className="btn btn-sm"
                disabled={bulkLoading}
                onClick={() => handleBulkStatus('Y')}
                style={{
                  background: 'rgba(34,197,94,0.15)', color: 'var(--active-badge)',
                  border: '1px solid rgba(34,197,94,0.35)', fontSize: 12, padding: '5px 14px',
                }}
              >
                {bulkLoading ? 'Updating...' : '✓ Mark Active'}
              </button>
              <button
                className="btn btn-sm"
                disabled={bulkLoading}
                onClick={() => handleBulkStatus('N')}
                style={{
                  background: 'rgba(239,68,68,0.12)', color: 'var(--inactive-badge)',
                  border: '1px solid rgba(239,68,68,0.3)', fontSize: 12, padding: '5px 14px',
                }}
              >
                {bulkLoading ? 'Updating...' : '✕ Mark In-Active'}
              </button>
              <button
                className="btn btn-sm btn-secondary"
                onClick={() => setSelected([])}
                style={{ fontSize: 12, padding: '5px 12px' }}
              >
                Clear
              </button>
            </>
          )}
        </div>

        {/* Item cards */}
        <div className="items-grid">
          {items.map(item => {
            const isSelected = selected.includes(item.item_code);
            return (
              <div
                key={item.item_code}
                onClick={() => toggleSelect(item.item_code)}
                style={{
                  background: isSelected ? 'rgba(92,107,192,0.12)' : 'var(--bg-secondary)',
                  border: `1px solid ${isSelected ? 'var(--accent)' : 'var(--border)'}`,
                  borderRadius: 10,
                  padding: 14,
                  cursor: 'pointer',
                  transition: 'all 0.18s',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                  boxShadow: isSelected ? '0 0 0 2px rgba(92,107,192,0.25)' : 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleSelect(item.item_code)}
                    onClick={e => e.stopPropagation()}
                    style={{ marginTop: 2, width: 15, height: 15, accentColor: 'var(--accent)', cursor: 'pointer', flexShrink: 0 }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 13.5 }}>{item.item_name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                      ₹{parseFloat(item.selling_price).toLocaleString('en-IN')}
                    </div>
                  </div>
                  <span className={`badge ${item.is_active === 'Y' ? 'badge-active' : 'badge-inactive'}`}>
                    {item.is_active === 'Y' ? 'Active' : 'In-Active'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

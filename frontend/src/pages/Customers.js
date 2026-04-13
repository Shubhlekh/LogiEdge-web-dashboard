import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { customersAPI } from '../utils/api';

export default function Customers() {
  const { customers, fetchCustomers } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);
  const [selected, setSelected] = useState([]); // selected cust_ids
  const [bulkLoading, setBulkLoading] = useState(false);
  const [form, setForm] = useState({
    cust_name: '', cust_address: '', cust_pan: '', cust_gst: '', is_active: 'Y'
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

  const toggleSelect = (id) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selected.length === customers.length) {
      setSelected([]);
    } else {
      setSelected(customers.map(c => c.cust_id));
    }
  };

  const handleBulkStatus = async (newStatus) => {
    if (selected.length === 0) return;
    setBulkLoading(true);
    setMsg(null);
    try {
      await Promise.all(selected.map(id => customersAPI.updateStatus(id, newStatus)));
      await fetchCustomers();
      setMsg({
        type: 'success',
        text: `${selected.length} customer(s) marked as ${newStatus === 'Y' ? 'Active' : 'In-Active'}.`
      });
      setSelected([]);
    } catch (e) {
      setMsg({ type: 'error', text: 'Failed to update some statuses.' });
    } finally {
      setBulkLoading(false);
    }
  };

  const allSelected = customers.length > 0 && selected.length === customers.length;
  const someSelected = selected.length > 0;

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

        {/* Bulk action toolbar */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          marginBottom: 16, flexWrap: 'wrap',
        }}>
          {/* Select All checkbox */}
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

        {/* Customer cards */}
        <div className="items-grid">
          {customers.map(c => {
            const isSelected = selected.includes(c.cust_id);
            return (
              <div
                key={c.cust_id}
                onClick={() => toggleSelect(c.cust_id)}
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
                {/* Top row: checkbox + name + badge */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleSelect(c.cust_id)}
                    onClick={e => e.stopPropagation()}
                    style={{ marginTop: 2, width: 15, height: 15, accentColor: 'var(--accent)', cursor: 'pointer', flexShrink: 0 }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 13.5 }}>{c.cust_name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{c.cust_id}</div>
                  </div>
                  <span className={`badge ${c.is_active === 'Y' ? 'badge-active' : 'badge-inactive'}`}>
                    {c.is_active === 'Y' ? 'Active' : 'In-Active'}
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

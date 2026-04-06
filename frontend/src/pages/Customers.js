import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { customersAPI } from '../utils/api';

export default function Customers() {
  const { customers, fetchCustomers } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
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

        {msg && !showForm && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}

        <div className="items-grid">
          {customers.map(c => (
            <div key={c.cust_id} className="item-card">
              <div>
                <div className="item-card-name">{c.cust_name}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>{c.cust_id}</div>
              </div>
              <span className={`badge ${c.is_active === 'Y' ? 'badge-active' : 'badge-inactive'}`}>
                {c.is_active === 'Y' ? 'Active' : 'In-Active'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

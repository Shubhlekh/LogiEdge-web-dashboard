import React from 'react';

export default function MasterHome({ navigate }) {
  return (
    <div>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>
        Manage your master data — Customers and Items.
      </p>
      <div className="master-grid">
        <div className="master-card" onClick={() => navigate('customers')}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>👤</div>
          <h3>Customer</h3>
          <p>Read or Create customer data</p>
        </div>
        <div className="master-card" onClick={() => navigate('items')}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>📦</div>
          <h3>Items</h3>
          <p>Read or Create Items data</p>
        </div>
      </div>
    </div>
  );
}

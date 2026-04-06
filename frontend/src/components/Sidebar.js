import React from 'react';

const navItems = [
  { label: 'Dashboard', icon: '⊞', page: 'dashboard' },
  { label: 'Master', icon: '◉', page: 'master', children: [
    { label: 'Customers', icon: '👤', page: 'customers' },
    { label: 'Items', icon: '📦', page: 'items' },
  ]},
  { label: 'Billing', icon: '🧾', page: 'billing' },
];

export default function Sidebar({ current, navigate }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-badge">LogiEdge</div>
        <div className="logo-text">Systems</div>
      </div>
      <nav className="sidebar-nav">
        <div className="nav-section-label">Navigation</div>
        <div
          className={`nav-item ${current === 'dashboard' ? 'active' : ''}`}
          onClick={() => navigate('dashboard')}
        >
          <span className="nav-icon">⊞</span> Dashboard
        </div>

        <div className="nav-section-label" style={{ marginTop: 8 }}>Master</div>
        <div
          className={`nav-item ${current === 'master' ? 'active' : ''}`}
          onClick={() => navigate('master')}
        >
          <span className="nav-icon">◉</span> Master Home
        </div>
        <div
          className={`nav-item ${current === 'customers' ? 'active' : ''}`}
          onClick={() => navigate('customers')}
          style={{ paddingLeft: 36 }}
        >
          <span className="nav-icon">👤</span> Customers
        </div>
        <div
          className={`nav-item ${current === 'items' ? 'active' : ''}`}
          onClick={() => navigate('items')}
          style={{ paddingLeft: 36 }}
        >
          <span className="nav-icon">📦</span> Items
        </div>

        <div className="nav-section-label" style={{ marginTop: 8 }}>Operations</div>
        <div
          className={`nav-item ${current === 'billing' ? 'active' : ''}`}
          onClick={() => navigate('billing')}
        >
          <span className="nav-icon">🧾</span> Billing
        </div>
      </nav>
    </aside>
  );
}

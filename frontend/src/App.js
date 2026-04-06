import React, { useState } from 'react';
import './index.css';
import { AppProvider } from './context/AppContext';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import MasterHome from './pages/MasterHome';
import Customers from './pages/Customers';
import Items from './pages/Items';
import Billing from './pages/Billing';

const PAGE_TITLES = {
  dashboard: 'Dashboard',
  master: 'Master Home',
  customers: 'Customer Master',
  items: 'Items Master',
  billing: 'Billing',
};

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const navigate = (page) => setCurrentPage(page);

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': return <Dashboard navigate={navigate} />;
      case 'master':    return <MasterHome navigate={navigate} />;
      case 'customers': return <Customers />;
      case 'items':     return <Items />;
      case 'billing':   return <Billing navigate={navigate} />;
      default:          return <Dashboard navigate={navigate} />;
    }
  };

  return (
    <AppProvider>
      <div className="app-layout">
        <Sidebar current={currentPage} navigate={navigate} />
        <div className="main-content">
          <div className="top-bar">
            <h1>{PAGE_TITLES[currentPage]}</h1>
            <div className="top-bar-right">
              <div className="avatar">LG</div>
            </div>
          </div>
          <div className="page-body">
            {renderPage()}
          </div>
        </div>
      </div>
    </AppProvider>
  );
}

export default App;

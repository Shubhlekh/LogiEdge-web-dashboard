import React, { createContext, useContext, useState, useCallback } from 'react';
import { customersAPI, itemsAPI, invoicesAPI } from '../utils/api';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [customers, setCustomers] = useState([]);
  const [items, setItems] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCustomers = useCallback(async () => {
    try {
      const res = await customersAPI.getAll();
      setCustomers(res.data.data);
    } catch (e) {
      setError('Failed to load customers');
    }
  }, []);

  const fetchItems = useCallback(async () => {
    try {
      const res = await itemsAPI.getAll();
      setItems(res.data.data);
    } catch (e) {
      setError('Failed to load items');
    }
  }, []);

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const res = await invoicesAPI.getAll();
      setInvoices(res.data.data);
    } catch (e) {
      setError('Failed to load invoices');
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <AppContext.Provider value={{
      customers, items, invoices,
      loading, error, setError,
      fetchCustomers, fetchItems, fetchInvoices,
      setCustomers, setItems, setInvoices,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);

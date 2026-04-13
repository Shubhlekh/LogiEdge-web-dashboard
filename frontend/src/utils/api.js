import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({ baseURL: API_BASE });

export const customersAPI = {
  getAll: () => api.get('/customers'),
  getOne: (id) => api.get(`/customers/${id}`),
  create: (data) => api.post('/customers', data),
  updateStatus: (id, is_active) => api.patch(`/customers/${id}/status`, { is_active }),
  getInvoices: (id) => api.get(`/customers/${id}/invoices`),
};

export const itemsAPI = {
  getAll: () => api.get('/items'),
  create: (data) => api.post('/items', data),
  updateStatus: (code, is_active) => api.patch(`/items/${code}/status`, { is_active }),
};

export const invoicesAPI = {
  getAll: () => api.get('/invoices'),
  getOne: (id) => api.get(`/invoices/${id}`),
  create: (data) => api.post('/invoices', data),
};

export default api;


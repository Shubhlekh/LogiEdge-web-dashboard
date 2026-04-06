const express = require('express');
const router = express.Router();
const pool = require('../db/connection');

// GET all customers
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM customers ORDER BY created_at DESC'
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET single customer
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM customers WHERE cust_id = $1',
      [req.params.id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ success: false, message: 'Customer not found' });
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST create customer
router.post('/', async (req, res) => {
  const { cust_name, cust_address, cust_pan, cust_gst, is_active } = req.body;
  if (!cust_name || !cust_pan)
    return res.status(400).json({ success: false, message: 'Name and PAN are required' });
  try {
    // Generate next cust_id
    const lastId = await pool.query(
      "SELECT cust_id FROM customers ORDER BY cust_id DESC LIMIT 1"
    );
    let nextNum = 1;
    if (lastId.rows.length > 0) {
      nextNum = parseInt(lastId.rows[0].cust_id.replace('C', '')) + 1;
    }
    const cust_id = 'C' + String(nextNum).padStart(5, '0');

    const result = await pool.query(
      `INSERT INTO customers (cust_id, cust_name, cust_address, cust_pan, cust_gst, is_active)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [cust_id, cust_name, cust_address || null, cust_pan, cust_gst || null, is_active || 'Y']
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET invoices for a specific customer
router.get('/:id/invoices', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT i.*, c.cust_name FROM invoices i
       JOIN customers c ON c.cust_id = i.cust_id
       WHERE i.cust_id = $1 ORDER BY i.invoice_date DESC`,
      [req.params.id]
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;

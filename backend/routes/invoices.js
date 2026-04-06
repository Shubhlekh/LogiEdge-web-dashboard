const express = require('express');
const router = express.Router();
const pool = require('../db/connection');

// Generate unique invoice ID: INVC + 6 random digits = length 10
function generateInvoiceId() {
  const digits = Math.floor(100000 + Math.random() * 900000);
  return 'INVC' + digits;
}

// GET all invoices (recent first)
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT i.*, c.cust_name, c.cust_gst
       FROM invoices i JOIN customers c ON c.cust_id = i.cust_id
       ORDER BY i.invoice_date DESC LIMIT 50`
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET invoice by ID with line items
router.get('/:id', async (req, res) => {
  try {
    const inv = await pool.query(
      `SELECT i.*, c.cust_name, c.cust_address, c.cust_pan, c.cust_gst
       FROM invoices i JOIN customers c ON c.cust_id = i.cust_id
       WHERE i.invoice_id = $1`,
      [req.params.id]
    );
    if (inv.rows.length === 0)
      return res.status(404).json({ success: false, message: 'Invoice not found' });

    const items = await pool.query(
      'SELECT * FROM invoice_items WHERE invoice_id = $1',
      [req.params.id]
    );
    res.json({ success: true, data: { ...inv.rows[0], items: items.rows } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST create invoice
router.post('/', async (req, res) => {
  const { cust_id, items } = req.body;
  if (!cust_id || !items || items.length === 0)
    return res.status(400).json({ success: false, message: 'Customer and items are required' });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Fetch customer GST info
    const custResult = await client.query(
      'SELECT cust_gst FROM customers WHERE cust_id = $1',
      [cust_id]
    );
    if (custResult.rows.length === 0) throw new Error('Customer not found');
    const { cust_gst } = custResult.rows[0];
    const isGSTRegistered = cust_gst && cust_gst.trim().length > 0;
    const gstRate = isGSTRegistered ? 0 : 18;

    // Calculate totals
    let subtotal = 0;
    const lineItems = [];
    for (const item of items) {
      const itemResult = await client.query(
        'SELECT item_name, selling_price FROM items WHERE item_code = $1',
        [item.item_code]
      );
      if (itemResult.rows.length === 0) throw new Error(`Item ${item.item_code} not found`);
      const { item_name, selling_price } = itemResult.rows[0];
      const line_total = selling_price * item.quantity;
      subtotal += line_total;
      lineItems.push({ item_code: item.item_code, item_name, unit_price: selling_price, quantity: item.quantity, line_total });
    }

    const gst_amount = (subtotal * gstRate) / 100;
    const total_amount = subtotal + gst_amount;

    // Generate unique invoice ID
    let invoice_id;
    let exists = true;
    while (exists) {
      invoice_id = generateInvoiceId();
      const check = await client.query('SELECT 1 FROM invoices WHERE invoice_id = $1', [invoice_id]);
      exists = check.rows.length > 0;
    }

    // Insert invoice header
    await client.query(
      `INSERT INTO invoices (invoice_id, cust_id, subtotal, gst_rate, gst_amount, total_amount)
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [invoice_id, cust_id, subtotal, gstRate, gst_amount, total_amount]
    );

    // Insert line items
    for (const li of lineItems) {
      await client.query(
        `INSERT INTO invoice_items (invoice_id, item_code, item_name, unit_price, quantity, line_total)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [invoice_id, li.item_code, li.item_name, li.unit_price, li.quantity, li.line_total]
      );
    }

    await client.query('COMMIT');

    // Return full invoice
    const full = await pool.query(
      `SELECT i.*, c.cust_name, c.cust_address, c.cust_pan, c.cust_gst
       FROM invoices i JOIN customers c ON c.cust_id = i.cust_id
       WHERE i.invoice_id = $1`,
      [invoice_id]
    );
    const itemsResult = await pool.query(
      'SELECT * FROM invoice_items WHERE invoice_id = $1',
      [invoice_id]
    );
    res.status(201).json({
      success: true,
      data: { ...full.rows[0], items: itemsResult.rows }
    });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ success: false, message: err.message });
  } finally {
    client.release();
  }
});

module.exports = router;

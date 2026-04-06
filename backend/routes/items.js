const express = require('express');
const router = express.Router();
const pool = require('../db/connection');

// GET all items
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM items ORDER BY created_at DESC');
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST create item
router.post('/', async (req, res) => {
  const { item_name, selling_price, is_active } = req.body;
  if (!item_name || selling_price === undefined)
    return res.status(400).json({ success: false, message: 'Name and price are required' });
  try {
    const lastId = await pool.query(
      "SELECT item_code FROM items ORDER BY item_code DESC LIMIT 1"
    );
    let nextNum = 1;
    if (lastId.rows.length > 0) {
      nextNum = parseInt(lastId.rows[0].item_code.replace('IT', '')) + 1;
    }
    const item_code = 'IT' + String(nextNum).padStart(5, '0');

    const result = await pool.query(
      `INSERT INTO items (item_code, item_name, selling_price, is_active)
       VALUES ($1,$2,$3,$4) RETURNING *`,
      [item_code, item_name, parseFloat(selling_price), is_active || 'Y']
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;

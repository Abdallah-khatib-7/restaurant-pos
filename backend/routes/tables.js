const express = require('express');
const router = express.Router();
const db = require('../database');
const auth = require('../middleware/auth');

// Get all tables for the restaurant
router.get('/', auth, async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM tables WHERE restaurant_id = ? ORDER BY number',
      [req.user.restaurant_id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Add table (owner only)
router.post('/', auth, async (req, res) => {
  if (req.user.role !== 'owner') {
    return res.status(403).json({ message: 'Access denied' });
  }

  const { number, capacity } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO tables (restaurant_id, number, capacity) VALUES (?, ?, ?)',
      [req.user.restaurant_id, number, capacity || 4]
    );
    res.status(201).json({ message: 'Table created', id: result.insertId });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Update table status
router.put('/:id/status', auth, async (req, res) => {
  const { status } = req.body;
  try {
    await db.query(
      'UPDATE tables SET status = ? WHERE id = ? AND restaurant_id = ?',
      [status, req.params.id, req.user.restaurant_id]
    );
    res.json({ message: 'Table status updated' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Delete table (owner only)
router.delete('/:id', auth, async (req, res) => {
  if (req.user.role !== 'owner') {
    return res.status(403).json({ message: 'Access denied' });
  }

  try {
    await db.query(
      'DELETE FROM tables WHERE id = ? AND restaurant_id = ?',
      [req.params.id, req.user.restaurant_id]
    );
    res.json({ message: 'Table deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
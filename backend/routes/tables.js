const express = require('express');
const router = express.Router();
const db = require('../database');
const auth = require('../middleware/auth');

// Get all tables
router.get('/', auth, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM tables ORDER BY number');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Update table status
router.put('/:id/status', auth, async (req, res) => {
  const { status } = req.body;
  try {
    await db.query('UPDATE tables SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ message: 'Table status updated' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
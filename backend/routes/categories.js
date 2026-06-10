const express = require('express');
const router = express.Router();
const db = require('../database');
const auth = require('../middleware/auth');

// Get all categories for the restaurant
router.get('/', auth, async (req, res, next) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM categories WHERE restaurant_id = ? ORDER BY display_order',
      [req.user.restaurant_id]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// Add category (owner only)
router.post('/', auth, async (req, res, next) => {
  if (req.user.role !== 'owner') {
    return res.status(403).json({ message: 'Access denied' });
  }

  const { name, display_order } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO categories (restaurant_id, name, display_order) VALUES (?, ?, ?)',
      [req.user.restaurant_id, name, display_order || 0]
    );
    res.status(201).json({ message: 'Category created', id: result.insertId });
  } catch (err) {
    next(err);
  }
});

// Update category (owner only)
router.put('/:id', auth, async (req, res, next) => {
  if (req.user.role !== 'owner') {
    return res.status(403).json({ message: 'Access denied' });
  }

  const { name, display_order } = req.body;
  try {
    await db.query(
      'UPDATE categories SET name = ?, display_order = ? WHERE id = ? AND restaurant_id = ?',
      [name, display_order, req.params.id, req.user.restaurant_id]
    );
    res.json({ message: 'Category updated' });
  } catch (err) {
    next(err);
  }
});

// Delete category (owner only)
router.delete('/:id', auth, async (req, res, next) => {
  if (req.user.role !== 'owner') {
    return res.status(403).json({ message: 'Access denied' });
  }

  try {
    await db.query(
      'DELETE FROM categories WHERE id = ? AND restaurant_id = ?',
      [req.params.id, req.user.restaurant_id]
    );
    res.json({ message: 'Category deleted' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
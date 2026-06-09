const express = require('express');
const router = express.Router();
const db = require('../database');
const auth = require('../middleware/auth');

// Get all menu items
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT m.*, c.name AS category_name 
      FROM menu_items m
      JOIN categories c ON m.category_id = c.id
      ORDER BY c.display_order, m.name
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get menu items by category
router.get('/category/:categoryId', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM menu_items WHERE category_id = ? AND is_available = TRUE',
      [req.params.categoryId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Add menu item (owner only)
router.post('/', auth, async (req, res) => {
  if (req.user.role !== 'owner') {
    return res.status(403).json({ message: 'Access denied' });
  }

  const { category_id, name, description, price, image_url } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO menu_items (category_id, name, description, price, image_url) VALUES (?, ?, ?, ?, ?)',
      [category_id, name, description, price, image_url || null]
    );
    res.status(201).json({ message: 'Menu item created', id: result.insertId });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Update menu item (owner only)
router.put('/:id', auth, async (req, res) => {
  if (req.user.role !== 'owner') {
    return res.status(403).json({ message: 'Access denied' });
  }

  const { category_id, name, description, price, image_url, is_available } = req.body;
  try {
    await db.query(
      'UPDATE menu_items SET category_id = ?, name = ?, description = ?, price = ?, image_url = ?, is_available = ? WHERE id = ?',
      [category_id, name, description, price, image_url, is_available, req.params.id]
    );
    res.json({ message: 'Menu item updated' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Delete menu item (owner only)
router.delete('/:id', auth, async (req, res) => {
  if (req.user.role !== 'owner') {
    return res.status(403).json({ message: 'Access denied' });
  }

  try {
    await db.query('DELETE FROM menu_items WHERE id = ?', [req.params.id]);
    res.json({ message: 'Menu item deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
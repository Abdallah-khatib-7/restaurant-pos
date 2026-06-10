const express = require('express');
const router = express.Router();
const db = require('../database');
const auth = require('../middleware/auth');

// Get all menu items for the restaurant
router.get('/', auth, async (req, res, next) => {
  try {
    const [rows] = await db.query(`
      SELECT m.*, c.name AS category_name 
      FROM menu_items m
      JOIN categories c ON m.category_id = c.id
      WHERE m.restaurant_id = ?
      ORDER BY c.display_order, m.name
    `, [req.user.restaurant_id]);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// Get menu items by category
router.get('/category/:categoryId', auth, async (req, res, next) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM menu_items WHERE category_id = ? AND restaurant_id = ? AND is_available = TRUE',
      [req.params.categoryId, req.user.restaurant_id]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// Add menu item (owner only)
router.post('/', auth, async (req, res, next) => {
  if (req.user.role !== 'owner') {
    return res.status(403).json({ message: 'Access denied' });
  }

  const { category_id, name, description, price, image_url } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO menu_items (restaurant_id, category_id, name, description, price, image_url) VALUES (?, ?, ?, ?, ?, ?)',
      [req.user.restaurant_id, category_id, name, description, price, image_url || null]
    );
    res.status(201).json({ message: 'Menu item created', id: result.insertId });
  } catch (err) {
    next(err);
  }
});

// Update menu item (owner only)
router.put('/:id', auth, async (req, res, next) => {
  if (req.user.role !== 'owner') {
    return res.status(403).json({ message: 'Access denied' });
  }

  const { category_id, name, description, price, image_url, is_available } = req.body;
  try {
    await db.query(
      'UPDATE menu_items SET category_id = ?, name = ?, description = ?, price = ?, image_url = ?, is_available = ? WHERE id = ? AND restaurant_id = ?',
      [category_id, name, description, price, image_url, is_available, req.params.id, req.user.restaurant_id]
    );
    res.json({ message: 'Menu item updated' });
  } catch (err) {
    next(err);
  }
});

// Delete menu item (owner only)
router.delete('/:id', auth, async (req, res, next) => {
  if (req.user.role !== 'owner') {
    return res.status(403).json({ message: 'Access denied' });
  }

  try {
    await db.query(
      'DELETE FROM menu_items WHERE id = ? AND restaurant_id = ?',
      [req.params.id, req.user.restaurant_id]
    );
    res.json({ message: 'Menu item deleted' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
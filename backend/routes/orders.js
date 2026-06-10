const express = require('express');
const router = express.Router();
const db = require('../database');
const auth = require('../middleware/auth');
const getIo = (req) => req.app.get('io');

// Get all orders for the restaurant
router.get('/', auth, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT o.*, t.number as table_number, u.name as waiter_name
      FROM orders o
      JOIN tables t ON o.table_id = t.id
      JOIN users u ON o.waiter_id = u.id
      WHERE o.restaurant_id = ?
      ORDER BY o.created_at DESC
    `, [req.user.restaurant_id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get single order with items
router.get('/:id', auth, async (req, res) => {
  try {
    const [orders] = await db.query(`
      SELECT o.*, t.number as table_number, u.name as waiter_name
      FROM orders o
      JOIN tables t ON o.table_id = t.id
      JOIN users u ON o.waiter_id = u.id
      WHERE o.id = ? AND o.restaurant_id = ?
    `, [req.params.id, req.user.restaurant_id]);

    if (orders.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const [items] = await db.query(`
      SELECT oi.*, m.name as item_name
      FROM order_items oi
      JOIN menu_items m ON oi.menu_item_id = m.id
      WHERE oi.order_id = ?
    `, [req.params.id]);

    res.json({ ...orders[0], items });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get active orders for kitchen
router.get('/kitchen/active', auth, async (req, res) => {
  try {
    const [orders] = await db.query(`
      SELECT o.*, t.number as table_number, u.name as waiter_name
      FROM orders o
      JOIN tables t ON o.table_id = t.id
      JOIN users u ON o.waiter_id = u.id
      WHERE o.restaurant_id = ? AND o.status IN ('pending', 'preparing')
      ORDER BY o.created_at ASC
    `, [req.user.restaurant_id]);

    for (let order of orders) {
      const [items] = await db.query(`
        SELECT oi.*, m.name as item_name
        FROM order_items oi
        JOIN menu_items m ON oi.menu_item_id = m.id
        WHERE oi.order_id = ?
      `, [order.id]);
      order.items = items;
    }

    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Create order
router.post('/', auth, async (req, res) => {
  const { table_id, items, notes } = req.body;
  const waiter_id = req.user.id;
  const restaurant_id = req.user.restaurant_id;

  try {
    let total = 0;
    for (let item of items) {
      const [rows] = await db.query(
        'SELECT price FROM menu_items WHERE id = ? AND restaurant_id = ?',
        [item.menu_item_id, restaurant_id]
      );
      total += rows[0].price * item.quantity;
    }

    const [result] = await db.query(
      'INSERT INTO orders (restaurant_id, table_id, waiter_id, total, notes) VALUES (?, ?, ?, ?, ?)',
      [restaurant_id, table_id, waiter_id, total, notes || null]
    );

    const order_id = result.insertId;

    for (let item of items) {
      const [rows] = await db.query(
        'SELECT price FROM menu_items WHERE id = ?',
        [item.menu_item_id]
      );
      await db.query(
        'INSERT INTO order_items (order_id, menu_item_id, quantity, price, notes) VALUES (?, ?, ?, ?, ?)',
        [order_id, item.menu_item_id, item.quantity, rows[0].price, item.notes || null]
      );
    }

    await db.query(
      'UPDATE tables SET status = ? WHERE id = ? AND restaurant_id = ?',
      ['occupied', table_id, restaurant_id]
    );

    const io = getIo(req);
    const [newOrder] = await db.query(`
      SELECT o.*, t.number as table_number, u.name as waiter_name
      FROM orders o
      JOIN tables t ON o.table_id = t.id
      JOIN users u ON o.waiter_id = u.id
      WHERE o.id = ?
    `, [order_id]);

    const [newItems] = await db.query(`
      SELECT oi.*, m.name as item_name
      FROM order_items oi
      JOIN menu_items m ON oi.menu_item_id = m.id
      WHERE oi.order_id = ?
    `, [order_id]);

    io.to(`kitchen_${restaurant_id}`).emit('new_order', { ...newOrder[0], items: newItems });

    res.status(201).json({ message: 'Order created', id: order_id, total });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Update order status
router.put('/:id/status', auth, async (req, res) => {
  const { status } = req.body;
  try {
    const io = getIo(req);
    await db.query(
      'UPDATE orders SET status = ? WHERE id = ? AND restaurant_id = ?',
      [status, req.params.id, req.user.restaurant_id]
    );

    if (status === 'served' || status === 'cancelled') {
      const [orders] = await db.query('SELECT table_id FROM orders WHERE id = ?', [req.params.id]);
      await db.query(
        'UPDATE tables SET status = ? WHERE id = ? AND restaurant_id = ?',
        ['free', orders[0].table_id, req.user.restaurant_id]
      );
    }

    io.to(`kitchen_${req.user.restaurant_id}`).emit('order_status_changed', {
      id: parseInt(req.params.id), status
    });

    res.json({ message: 'Order status updated' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Update order item status
router.put('/:orderId/items/:itemId/status', auth, async (req, res) => {
  const { status } = req.body;
  try {
    await db.query(
      'UPDATE order_items SET status = ? WHERE id = ? AND order_id = ?',
      [status, req.params.itemId, req.params.orderId]
    );
    res.json({ message: 'Item status updated' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
const express = require('express');
const router = express.Router();
const db = require('../database');
const auth = require('../middleware/auth');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const getIo = (req) => req.app.get('io');

// Get all orders for the restaurant
router.get('/', auth, async (req, res, next) => {
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
    next(err);
  }
});

// Get single order with items
router.get('/:id', auth, async (req, res, next) => {
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
    next(err);
  }
});

// Get active orders for kitchen
router.get('/kitchen/active', auth, async (req, res, next) => {
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
    next(err);
  }
});

// Create order
router.post('/',
  auth,
  [
    body('table_id').notEmpty().withMessage('Table is required'),
    body('items').isArray({ min: 1 }).withMessage('Order must have at least one item'),
    body('items.*.menu_item_id').notEmpty().withMessage('Each item must have a menu_item_id'),
    body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1')
  ],
  validate,
  async (req, res, next) => {
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
      'INSERT INTO orders (restaurant_id, table_id, waiter_id, total, final_total, notes) VALUES (?, ?, ?, ?, ?, ?)',
[restaurant_id, table_id, waiter_id, total, total, notes || null]
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
    next(err);
  }
});

// Update order status
router.put('/:id/status', auth, async (req, res, next) => {
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
    next(err);
  }
});

// Update order item status
router.put('/:orderId/items/:itemId/status', auth, async (req, res, next) => {
  const { status } = req.body;
  try {
    await db.query(
      'UPDATE order_items SET status = ? WHERE id = ? AND order_id = ?',
      [status, req.params.itemId, req.params.orderId]
    );
    res.json({ message: 'Item status updated' });
  } catch (err) {
    next(err);
  }
});
// Apply discount (owner only)
router.put('/:id/discount', auth, async (req, res, next) => {
  if (req.user.role !== 'owner') {
    return res.status(403).json({ message: 'Access denied' });
  }

  const { discount_percent } = req.body;

  if (discount_percent < 0 || discount_percent > 100) {
    return res.status(400).json({ message: 'Discount must be between 0 and 100' });
  }

  try {
    const [orders] = await db.query(
      'SELECT * FROM orders WHERE id = ? AND restaurant_id = ?',
      [req.params.id, req.user.restaurant_id]
    );

    if (orders.length === 0) return res.status(404).json({ message: 'Order not found' });

    const order = orders[0];
    const discount_amount = (parseFloat(order.total) * discount_percent) / 100;
    const final_total = parseFloat(order.total) - discount_amount;

    await db.query(
      'UPDATE orders SET discount_percent = ?, discount_amount = ?, final_total = ? WHERE id = ?',
      [discount_percent, discount_amount.toFixed(2), final_total.toFixed(2), req.params.id]
    );

    const io = getIo(req);
    io.to(`kitchen_${req.user.restaurant_id}`).emit('order_updated', {
      id: parseInt(req.params.id),
      discount_percent,
      discount_amount: discount_amount.toFixed(2),
      final_total: final_total.toFixed(2)
    });

    res.json({
      message: 'Discount applied',
      original_total: order.total,
      discount_percent,
      discount_amount: discount_amount.toFixed(2),
      final_total: final_total.toFixed(2)
    });
  } catch (err) { next(err); }
});
module.exports = router;
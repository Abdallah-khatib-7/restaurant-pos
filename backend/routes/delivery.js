const express = require('express');
const router = express.Router();
const db = require('../database');
const auth = require('../middleware/auth');
const getIo = (req) => req.app.get('io');

// Get all delivery orders (owner sees all, driver sees his own)
router.get('/', auth, async (req, res) => {
  try {
    let query = `
      SELECT d.*, u.name as driver_name, u.car_type, u.car_color, u.plate_number
      FROM delivery_orders d
      LEFT JOIN users u ON d.driver_id = u.id
      ORDER BY d.created_at DESC
    `;
    let params = [];

    if (req.user.role === 'delivery') {
      query = `
        SELECT d.*, u.name as driver_name, u.car_type, u.car_color, u.plate_number
        FROM delivery_orders d
        LEFT JOIN users u ON d.driver_id = u.id
        WHERE d.driver_id = ?
        ORDER BY d.created_at DESC
      `;
      params = [req.user.id];
    }

    const [rows] = await db.query(query, params);

    for (let order of rows) {
      const [items] = await db.query(`
        SELECT di.*, m.name as item_name
        FROM delivery_order_items di
        JOIN menu_items m ON di.menu_item_id = m.id
        WHERE di.delivery_order_id = ?
      `, [order.id]);
      order.items = items;
    }

    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get all delivery drivers (owner only)
router.get('/drivers', auth, async (req, res) => {
  if (req.user.role !== 'owner') {
    return res.status(403).json({ message: 'Access denied' });
  }
  try {
    const [rows] = await db.query(
      'SELECT id, name, email, car_type, car_color, plate_number, id_number, driver_license, created_at FROM users WHERE role = ?',
      ['delivery']
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Create delivery order (owner only)
router.post('/', auth, async (req, res) => {
  if (req.user.role !== 'owner') {
    return res.status(403).json({ message: 'Access denied' });
  }

  const { driver_id, customer_name, customer_phone, delivery_address, notes, items } = req.body;

  try {
    // Calculate food total
    let food_total = 0;
    for (let item of items) {
      const [rows] = await db.query('SELECT price FROM menu_items WHERE id = ?', [item.menu_item_id]);
      food_total += rows[0].price * item.quantity;
    }

    // Delivery fee logic
    const delivery_fee = food_total >= 60 ? 0 : 3;
    const total = food_total + delivery_fee;

    // Create delivery order
    const [result] = await db.query(
      'INSERT INTO delivery_orders (driver_id, customer_name, customer_phone, delivery_address, notes, food_total, delivery_fee, total) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [driver_id || null, customer_name, customer_phone, delivery_address, notes || null, food_total, delivery_fee, total]
    );

    const delivery_order_id = result.insertId;

    // Insert items
    for (let item of items) {
      const [rows] = await db.query('SELECT price FROM menu_items WHERE id = ?', [item.menu_item_id]);
      await db.query(
        'INSERT INTO delivery_order_items (delivery_order_id, menu_item_id, quantity, price, notes) VALUES (?, ?, ?, ?, ?)',
        [delivery_order_id, item.menu_item_id, item.quantity, rows[0].price, item.notes || null]
      );
    }

    // Emit to kitchen
    const io = getIo(req);
    io.to('kitchen').emit('new_delivery_order', { id: delivery_order_id, customer_name, delivery_address, total });

    res.status(201).json({ message: 'Delivery order created', id: delivery_order_id, food_total, delivery_fee, total });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Assign driver (owner only)
router.put('/:id/assign', auth, async (req, res) => {
  if (req.user.role !== 'owner') {
    return res.status(403).json({ message: 'Access denied' });
  }
  const { driver_id } = req.body;
  try {
    await db.query('UPDATE delivery_orders SET driver_id = ? WHERE id = ?', [driver_id, req.params.id]);
    res.json({ message: 'Driver assigned' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Update delivery status (driver or owner)
router.put('/:id/status', auth, async (req, res) => {
  const { status } = req.body;
  try {
    let extra = '';
    if (status === 'delivered') extra = ', delivered_at = NOW()';
    if (status === 'cancelled') extra = ', cancelled_at = NOW()';

    await db.query(
      `UPDATE delivery_orders SET status = ?${extra} WHERE id = ?`,
      [status, req.params.id]
    );

    const io = getIo(req);
    io.emit('delivery_status_changed', { id: parseInt(req.params.id), status });

    res.json({ message: 'Status updated' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
const express = require('express');
const router = express.Router();
const db = require('../database');
const auth = require('../middleware/auth');
const getIo = (req) => req.app.get('io');

// Get all delivery orders (owner sees all, driver sees his own)
router.get('/', auth, async (req, res, next) => {
  try {
    let query = `
      SELECT d.*, u.name as driver_name, u.car_type, u.car_color, u.plate_number
      FROM delivery_orders d
      LEFT JOIN users u ON d.driver_id = u.id
      WHERE d.restaurant_id = ?
      ORDER BY d.created_at DESC
    `;
    let params = [req.user.restaurant_id];

    if (req.user.role === 'delivery') {
      query = `
        SELECT d.*, u.name as driver_name, u.car_type, u.car_color, u.plate_number
        FROM delivery_orders d
        LEFT JOIN users u ON d.driver_id = u.id
        WHERE d.restaurant_id = ? AND d.driver_id = ?
        ORDER BY d.created_at DESC
      `;
      params = [req.user.restaurant_id, req.user.id];
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
    next(err);
  }
});

// Get all delivery drivers for this restaurant
router.get('/drivers', auth, async (req, res, next) => {
  if (req.user.role !== 'owner') {
    return res.status(403).json({ message: 'Access denied' });
  }
  try {
    const [rows] = await db.query(
      'SELECT id, name, email, car_type, car_color, plate_number, id_number, driver_license, created_at FROM users WHERE role = ? AND restaurant_id = ?',
      ['delivery', req.user.restaurant_id]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// Create delivery order (owner only)
router.post('/', auth, async (req, res, next) => {
  if (req.user.role !== 'owner') {
    return res.status(403).json({ message: 'Access denied' });
  }

  const { driver_id, customer_name, customer_phone, delivery_address, notes, items } = req.body;
  const restaurant_id = req.user.restaurant_id;

  try {
    let food_total = 0;
    for (let item of items) {
      const [rows] = await db.query(
        'SELECT price FROM menu_items WHERE id = ? AND restaurant_id = ?',
        [item.menu_item_id, restaurant_id]
      );
      food_total += rows[0].price * item.quantity;
    }

    const delivery_fee = food_total >= 60 ? 0 : 3;
    const total = food_total + delivery_fee;

    const [result] = await db.query(
      'INSERT INTO delivery_orders (restaurant_id, driver_id, customer_name, customer_phone, delivery_address, notes, food_total, delivery_fee, total) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [restaurant_id, driver_id || null, customer_name, customer_phone, delivery_address, notes || null, food_total, delivery_fee, total]
    );

    const delivery_order_id = result.insertId;

    for (let item of items) {
      const [rows] = await db.query('SELECT price FROM menu_items WHERE id = ?', [item.menu_item_id]);
      await db.query(
        'INSERT INTO delivery_order_items (delivery_order_id, menu_item_id, quantity, price, notes) VALUES (?, ?, ?, ?, ?)',
        [delivery_order_id, item.menu_item_id, item.quantity, rows[0].price, item.notes || null]
      );
    }

    const io = getIo(req);
    io.to(`kitchen_${restaurant_id}`).emit('new_delivery_order', {
      id: delivery_order_id, customer_name, delivery_address, total
    });

    res.status(201).json({ message: 'Delivery order created', id: delivery_order_id, food_total, delivery_fee, total });
  } catch (err) {
    next(err);
  }
});

// Assign driver (owner only)
router.put('/:id/assign', auth, async (req, res, next) => {
  if (req.user.role !== 'owner') {
    return res.status(403).json({ message: 'Access denied' });
  }
  const { driver_id } = req.body;
  try {
    await db.query(
      'UPDATE delivery_orders SET driver_id = ? WHERE id = ? AND restaurant_id = ?',
      [driver_id, req.params.id, req.user.restaurant_id]
    );
    res.json({ message: 'Driver assigned' });
  } catch (err) {
    next(err);
  }
});

// Update delivery status (driver or owner)
router.put('/:id/status', auth, async (req, res, next) => {
  const { status } = req.body;
  try {
    let extra = '';
    if (status === 'delivered') extra = ', delivered_at = NOW()';
    if (status === 'cancelled') extra = ', cancelled_at = NOW()';

    await db.query(
      `UPDATE delivery_orders SET status = ?${extra} WHERE id = ? AND restaurant_id = ?`,
      [status, req.params.id, req.user.restaurant_id]
    );

    const io = getIo(req);
    io.to(`kitchen_${req.user.restaurant_id}`).emit('delivery_status_changed', {
      id: parseInt(req.params.id), status
    });

    res.json({ message: 'Status updated' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
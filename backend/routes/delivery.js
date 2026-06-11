const express = require('express');
const router = express.Router();
const db = require('../database');
const auth = require('../middleware/auth');
const getIo = (req) => req.app.get('io');

// Get all delivery orders (owner + delivery_operator)
router.get('/', auth, async (req, res, next) => {
  try {
    const [rows] = await db.query(`
      SELECT d.*, u.name as driver_name, u.car_type, u.car_color, u.plate_number, u.delivery_status
      FROM delivery_orders d
      LEFT JOIN users u ON d.driver_id = u.id
      WHERE d.restaurant_id = ?
      ORDER BY d.created_at DESC
    `, [req.user.restaurant_id]);

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
  } catch (err) { next(err); }
});

// Get all delivery drivers for this restaurant
router.get('/drivers', auth, async (req, res, next) => {
  try {
    const [rows] = await db.query(
      'SELECT id, name, car_type, car_color, plate_number, id_number, driver_license, delivery_status, active_deliveries, created_at FROM users WHERE role = ? AND restaurant_id = ?',
      ['delivery', req.user.restaurant_id]
    );
    res.json(rows);
  } catch (err) { next(err); }
});

// Create delivery order (owner + delivery_operator)
router.post('/', auth, async (req, res, next) => {
  if (!['owner', 'delivery_operator'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Access denied' });
  }

  const { driver_id, customer_name, customer_phone, delivery_address, notes, items } = req.body;
  const restaurant_id = req.user.restaurant_id;

  try {
    // Validate driver availability
    if (driver_id) {
      const [drivers] = await db.query(
        'SELECT * FROM users WHERE id = ? AND role = ? AND restaurant_id = ?',
        [driver_id, 'delivery', restaurant_id]
      );
      if (drivers.length === 0) return res.status(400).json({ message: 'Driver not found' });
      if (drivers[0].active_deliveries >= 4) return res.status(400).json({ message: 'Driver already has 4 active deliveries' });
    }

    let food_total = 0;
    for (let item of items) {
      const [rows] = await db.query(
        'SELECT price FROM menu_items WHERE id = ? AND restaurant_id = ?',
        [item.menu_item_id, restaurant_id]
      );
      food_total += parseFloat(rows[0].price) * item.quantity;
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

    // Update driver status if assigned
    if (driver_id) {
      await db.query(
        'UPDATE users SET delivery_status = "on_road", active_deliveries = active_deliveries + 1 WHERE id = ?',
        [driver_id]
      );
    }

    // Emit to kitchen
    const io = getIo(req);
    io.to(`kitchen_${restaurant_id}`).emit('new_delivery_order', {
      id: delivery_order_id, customer_name, delivery_address, total, type: 'delivery'
    });

    res.status(201).json({ message: 'Delivery order created', id: delivery_order_id, food_total, delivery_fee, total });
  } catch (err) { next(err); }
});

// Assign driver
router.put('/:id/assign', auth, async (req, res, next) => {
  if (!['owner', 'delivery_operator'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Access denied' });
  }

  const { driver_id } = req.body;
  try {
    // Check driver capacity
    const [drivers] = await db.query(
      'SELECT * FROM users WHERE id = ? AND role = ? AND restaurant_id = ?',
      [driver_id, 'delivery', req.user.restaurant_id]
    );
    if (drivers.length === 0) return res.status(400).json({ message: 'Driver not found' });
    if (drivers[0].active_deliveries >= 4) return res.status(400).json({ message: `${drivers[0].name} already has 4 active deliveries` });

    // Get current driver to decrement their count
    const [order] = await db.query('SELECT driver_id FROM delivery_orders WHERE id = ?', [req.params.id]);
    if (order[0].driver_id) {
      await db.query(
        'UPDATE users SET active_deliveries = GREATEST(active_deliveries - 1, 0) WHERE id = ?',
        [order[0].driver_id]
      );
      // Check if old driver now has 0 active deliveries
      const [oldDriver] = await db.query('SELECT active_deliveries FROM users WHERE id = ?', [order[0].driver_id]);
      if (oldDriver[0].active_deliveries === 0) {
        await db.query('UPDATE users SET delivery_status = "available" WHERE id = ?', [order[0].driver_id]);
      }
    }

    await db.query(
      'UPDATE delivery_orders SET driver_id = ? WHERE id = ? AND restaurant_id = ?',
      [driver_id, req.params.id, req.user.restaurant_id]
    );

    // Update new driver
    await db.query(
      'UPDATE users SET delivery_status = "on_road", active_deliveries = active_deliveries + 1 WHERE id = ?',
      [driver_id]
    );
       const io = getIo(req);
io.to(`kitchen_${req.user.restaurant_id}`).emit('delivery_updated', {
  id: parseInt(req.params.id),
  driver_id: parseInt(driver_id)
});
    res.json({ message: 'Driver assigned' });
  } catch (err) { next(err); }
});

// Update delivery status
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

    // If delivered or cancelled, decrement driver active count
    if (status === 'delivered' || status === 'cancelled') {
      const [orders] = await db.query('SELECT driver_id FROM delivery_orders WHERE id = ?', [req.params.id]);
      if (orders[0].driver_id) {
        await db.query(
          'UPDATE users SET active_deliveries = GREATEST(active_deliveries - 1, 0) WHERE id = ?',
          [orders[0].driver_id]
        );
        const [driver] = await db.query('SELECT active_deliveries FROM users WHERE id = ?', [orders[0].driver_id]);
        if (driver[0].active_deliveries === 0) {
          await db.query('UPDATE users SET delivery_status = "available" WHERE id = ?', [orders[0].driver_id]);
        }
      }
    }

    const io = getIo(req);
    io.to(`kitchen_${req.user.restaurant_id}`).emit('delivery_status_changed', {
      id: parseInt(req.params.id), status
    });

    res.json({ message: 'Status updated' });
  } catch (err) { next(err); }
});

module.exports = router;
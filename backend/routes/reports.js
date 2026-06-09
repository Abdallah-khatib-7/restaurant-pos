const express = require('express');
const router = express.Router();
const db = require('../database');
const auth = require('../middleware/auth');

// Dashboard summary — today's stats
router.get('/summary', auth, async (req, res) => {
  if (req.user.role !== 'owner') {
    return res.status(403).json({ message: 'Access denied' });
  }
  try {
    const [todayRevenue] = await db.query(`
      SELECT COALESCE(SUM(total), 0) as revenue, COUNT(*) as orders
      FROM orders
      WHERE DATE(created_at) = CURDATE() AND status != 'cancelled'
    `);

    const [deliveryRevenue] = await db.query(`
      SELECT COALESCE(SUM(total), 0) as revenue, COUNT(*) as orders
      FROM delivery_orders
      WHERE DATE(created_at) = CURDATE() AND status != 'cancelled'
    `);

    const [activeOrders] = await db.query(`
      SELECT COUNT(*) as count FROM orders
      WHERE status IN ('pending', 'preparing')
    `);

    const [activeTables] = await db.query(`
      SELECT COUNT(*) as count FROM tables WHERE status = 'occupied'
    `);

    res.json({
      today_revenue: parseFloat(todayRevenue[0].revenue) + parseFloat(deliveryRevenue[0].revenue),
      today_orders: parseInt(todayRevenue[0].orders) + parseInt(deliveryRevenue[0].orders),
      active_orders: parseInt(activeOrders[0].count),
      active_tables: parseInt(activeTables[0].count)
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Best selling items
router.get('/best-sellers', auth, async (req, res) => {
  if (req.user.role !== 'owner') {
    return res.status(403).json({ message: 'Access denied' });
  }
  try {
    const [rows] = await db.query(`
      SELECT m.name, SUM(oi.quantity) as total_sold, SUM(oi.quantity * oi.price) as revenue
      FROM order_items oi
      JOIN menu_items m ON oi.menu_item_id = m.id
      JOIN orders o ON oi.order_id = o.id
      WHERE o.status != 'cancelled'
      GROUP BY m.id, m.name
      ORDER BY total_sold DESC
      LIMIT 10
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Revenue by day (last 7 days)
router.get('/weekly', auth, async (req, res) => {
  if (req.user.role !== 'owner') {
    return res.status(403).json({ message: 'Access denied' });
  }
  try {
    const [dineIn] = await db.query(`
      SELECT DATE(created_at) as date, SUM(total) as revenue
      FROM orders
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) AND status != 'cancelled'
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `);

    const [delivery] = await db.query(`
      SELECT DATE(created_at) as date, SUM(total) as revenue
      FROM delivery_orders
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) AND status != 'cancelled'
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `);

    res.json({ dine_in: dineIn, delivery });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Revenue by category
router.get('/by-category', auth, async (req, res) => {
  if (req.user.role !== 'owner') {
    return res.status(403).json({ message: 'Access denied' });
  }
  try {
    const [rows] = await db.query(`
      SELECT c.name as category, SUM(oi.quantity * oi.price) as revenue
      FROM order_items oi
      JOIN menu_items m ON oi.menu_item_id = m.id
      JOIN categories c ON m.category_id = c.id
      JOIN orders o ON oi.order_id = o.id
      WHERE o.status != 'cancelled'
      GROUP BY c.id, c.name
      ORDER BY revenue DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
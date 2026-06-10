const express = require('express');
const router = express.Router();
const db = require('../database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Super admin login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const [rows] = await db.query('SELECT * FROM super_admins WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const admin = rows[0];
    const match = await bcrypt.compare(password, admin.password);
    if (!match) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: admin.id, name: admin.name, role: 'superadmin' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({
      token,
      user: { id: admin.id, name: admin.name, email: admin.email, role: 'superadmin' }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get all applications
router.get('/applications', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM restaurant_applications ORDER BY applied_at DESC'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get single application
router.get('/applications/:id', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM restaurant_applications WHERE id = ?',
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Application not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Approve application — creates restaurant + owner account
router.post('/applications/:id/approve', async (req, res) => {
  try {
    const [apps] = await db.query(
      'SELECT * FROM restaurant_applications WHERE id = ?',
      [req.params.id]
    );
    if (apps.length === 0) {
      return res.status(404).json({ message: 'Application not found' });
    }

    const app = apps[0];

    // Create restaurant
    const [result] = await db.query(`
      INSERT INTO restaurants (
        application_id, restaurant_name, branch_name, restaurant_type, cuisine_type,
        owner_name, owner_email, owner_phone, phone, whatsapp,
        address, city, region, google_maps_link,
        seating_capacity, num_tables, opening_time, closing_time, days_open,
        has_delivery, has_shisha, has_outdoor_seating,
        num_owners, num_waiters, num_kitchen, num_delivery, total_employees,
        pricing_tier, quoted_price
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        app.id, app.restaurant_name, app.branch_name, app.restaurant_type, app.cuisine_type,
        app.owner_name, app.owner_email, app.owner_phone, app.phone, app.whatsapp,
        app.address, app.city, app.region, app.google_maps_link,
        app.seating_capacity, app.num_tables, app.opening_time, app.closing_time, app.days_open,
        app.has_delivery, app.has_shisha, app.has_outdoor_seating,
        app.num_owners, app.num_waiters, app.num_kitchen, app.num_delivery, app.total_employees,
        app.pricing_tier, app.quoted_price
      ]
    );

    const restaurant_id = result.insertId;

    // Create owner account with temp password
    const tempPassword = 'Welcome@123';
    const hashed = await bcrypt.hash(tempPassword, 10);
    await db.query(
      'INSERT INTO users (restaurant_id, name, email, password, role) VALUES (?, ?, ?, ?, ?)',
      [restaurant_id, app.owner_name, app.owner_email, hashed, 'owner']
    );

    // Update application status
    await db.query(
      'UPDATE restaurant_applications SET status = ?, approved_at = NOW() WHERE id = ?',
      ['approved', app.id]
    );

    res.json({
      message: 'Application approved',
      restaurant_id,
      temp_password: tempPassword
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Reject application
router.post('/applications/:id/reject', async (req, res) => {
  const { reason } = req.body;
  try {
    await db.query(
      'UPDATE restaurant_applications SET status = ?, rejection_reason = ? WHERE id = ?',
      ['rejected', reason || 'No reason provided', req.params.id]
    );
    res.json({ message: 'Application rejected' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get all restaurants
router.get('/restaurants', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM restaurants ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Toggle restaurant active/inactive
router.put('/restaurants/:id/toggle', async (req, res) => {
  try {
    await db.query(
      'UPDATE restaurants SET is_active = NOT is_active WHERE id = ?',
      [req.params.id]
    );
    res.json({ message: 'Restaurant status toggled' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Mark payment as received
router.put('/restaurants/:id/payment', async (req, res) => {
  const { payment_method } = req.body;
  try {
    await db.query(
      'UPDATE restaurants SET payment_status = ?, payment_method = ?, payment_date = NOW() WHERE id = ?',
      ['paid', payment_method, req.params.id]
    );
    res.json({ message: 'Payment marked as received' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
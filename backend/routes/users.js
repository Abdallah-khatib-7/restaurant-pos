const express = require('express');
const router = express.Router();
const db = require('../database');
const auth = require('../middleware/auth');
const bcrypt = require('bcryptjs');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
// Get all users for the restaurant (owner only)
router.get('/', auth, async (req, res, next) => {
  if (req.user.role !== 'owner') {
    return res.status(403).json({ message: 'Access denied' });
  }
  try {
    const [rows] = await db.query(
      'SELECT id, name, email, role, car_type, car_color, plate_number, created_at FROM users WHERE restaurant_id = ?',
      [req.user.restaurant_id]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// Create user (owner only)
router.post('/',
  auth,
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').isIn(['owner', 'waiter', 'kitchen', 'delivery', 'delivery_operator']).withMessage('Invalid role')
  ],
  validate,
  async (req, res, next) => {
  if (req.user.role !== 'owner') {
    return res.status(403).json({ message: 'Access denied' });
  }

  const { name, email, password, role, car_type, car_color, plate_number, id_number, driver_license } = req.body;
  try {
    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      'INSERT INTO users (restaurant_id, name, email, password, role, car_type, car_color, plate_number, id_number, driver_license) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [req.user.restaurant_id, name, email, hashed, role, car_type || null, car_color || null, plate_number || null, id_number || null, driver_license || null]
    );
    res.status(201).json({ message: 'User created', id: result.insertId });
  } catch (err) {
    next(err);
  }
});

// Change own password ← before /:id routes
router.put('/change-password',
  auth,
  [
    body('current_password').notEmpty().withMessage('Current password is required'),
    body('new_password').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
  ],
  validate,
  async (req, res, next) => {
  const { current_password, new_password } = req.body;

  try {
    const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [req.user.id]);
    const user = rows[0];

    const match = await bcrypt.compare(current_password, user.password);
    if (!match) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    const same = await bcrypt.compare(new_password, user.password);
    if (same) {
      return res.status(400).json({ message: 'New password must be different from current password' });
    }

    if (new_password.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    const hashed = await bcrypt.hash(new_password, 10);
    await db.query('UPDATE users SET password = ? WHERE id = ?', [hashed, req.user.id]);

    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    next(err);
  }
});

// Update user
router.put('/:id', auth, async (req, res, next) => {
  if (req.user.role !== 'owner') {
    return res.status(403).json({ message: 'Access denied' });
  }

  const { name, email, role, car_type, car_color, plate_number, id_number, driver_license } = req.body;
  try {
    await db.query(
      'UPDATE users SET name = ?, email = ?, role = ?, car_type = ?, car_color = ?, plate_number = ?, id_number = ?, driver_license = ? WHERE id = ? AND restaurant_id = ?',
      [name, email, role, car_type || null, car_color || null, plate_number || null, id_number || null, driver_license || null, req.params.id, req.user.restaurant_id]
    );
    res.json({ message: 'User updated' });
  } catch (err) {
    next(err);
  }
});

// Delete user (owner only)
router.delete('/:id', auth, async (req, res, next) => {
  if (req.user.role !== 'owner') {
    return res.status(403).json({ message: 'Access denied' });
  }
  try {
    await db.query(
      'DELETE FROM users WHERE id = ? AND restaurant_id = ?',
      [req.params.id, req.user.restaurant_id]
    );
    res.json({ message: 'User deleted' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
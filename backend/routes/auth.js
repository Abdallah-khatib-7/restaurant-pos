const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../database');
const { body } = require('express-validator');
const validate = require('../middleware/validate');

// Single login for everyone
router.post('/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  validate,
  async (req, res, next) => {
    const { email, password } = req.body;

    try {
      // Check super admin first
      const [superAdmins] = await db.query('SELECT * FROM super_admins WHERE email = ?', [email]);
      if (superAdmins.length > 0) {
        const admin = superAdmins[0];
        const match = await bcrypt.compare(password, admin.password);
        if (!match) return res.status(400).json({ message: 'Invalid credentials' });

        const token = jwt.sign(
          { id: admin.id, name: admin.name, role: 'superadmin' },
          process.env.JWT_SECRET,
          { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        return res.json({
          token,
          user: { id: admin.id, name: admin.name, email: admin.email, role: 'superadmin' }
        });
      }

      // Check restaurant staff
      const [users] = await db.query(`
        SELECT u.*, r.is_active, r.restaurant_name
        FROM users u
        JOIN restaurants r ON u.restaurant_id = r.id
        WHERE u.email = ?
      `, [email]);

      if (users.length === 0) return res.status(400).json({ message: 'Invalid credentials' });

      const user = users[0];

      if (!user.is_active) {
        return res.status(403).json({ message: 'Restaurant is inactive. Contact support.' });
      }

      const match = await bcrypt.compare(password, user.password);
      if (!match) return res.status(400).json({ message: 'Invalid credentials' });

      const token = jwt.sign(
        { id: user.id, name: user.name, role: user.role, restaurant_id: user.restaurant_id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

      res.json({
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          restaurant_id: user.restaurant_id,
          restaurant_name: user.restaurant_name
        }
      });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
const express = require('express');
const router = express.Router();
const db = require('../database');
const auth = require('../middleware/auth');

// Log login session
router.post('/login', auth, async (req, res, next) => {
  try {
    await db.query(
      'INSERT INTO work_sessions (user_id, restaurant_id) VALUES (?, ?)',
      [req.user.id, req.user.restaurant_id]
    );
    res.json({ message: 'Session started' });
  } catch (err) { next(err); }
});

// Log logout session
router.post('/logout', auth, async (req, res, next) => {
  try {
    const [sessions] = await db.query(
      'SELECT * FROM work_sessions WHERE user_id = ? AND logout_at IS NULL ORDER BY login_at DESC LIMIT 1',
      [req.user.id]
    );
    if (sessions.length > 0) {
      const session = sessions[0];
      const duration = Math.round((Date.now() - new Date(session.login_at).getTime()) / 60000);
      await db.query(
        'UPDATE work_sessions SET logout_at = NOW(), duration_minutes = ? WHERE id = ?',
        [duration, session.id]
      );
    }
    res.json({ message: 'Session ended' });
  } catch (err) { next(err); }
});

// Get today's sessions for all staff (owner only)
router.get('/today', auth, async (req, res, next) => {
  if (req.user.role !== 'owner') return res.status(403).json({ message: 'Access denied' });
  try {
    const [rows] = await db.query(`
      SELECT ws.*, u.name, u.role, u.email
      FROM work_sessions ws
      JOIN users u ON ws.user_id = u.id
      WHERE ws.restaurant_id = ? AND DATE(ws.login_at) = CURDATE()
      ORDER BY ws.login_at DESC
    `, [req.user.restaurant_id]);
    res.json(rows);
  } catch (err) { next(err); }
});

// Get sessions for a specific user
router.get('/user/:userId', auth, async (req, res, next) => {
  if (req.user.role !== 'owner') return res.status(403).json({ message: 'Access denied' });
  try {
    const [rows] = await db.query(`
      SELECT * FROM work_sessions
      WHERE user_id = ? AND restaurant_id = ?
      ORDER BY login_at DESC
      LIMIT 30
    `, [req.params.userId, req.user.restaurant_id]);
    res.json(rows);
  } catch (err) { next(err); }
});

module.exports = router;
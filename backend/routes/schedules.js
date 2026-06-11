const express = require('express');
const router = express.Router();
const db = require('../database');
const auth = require('../middleware/auth');

// Get schedule for a user
router.get('/:userId', auth, async (req, res, next) => {
  if (req.user.role !== 'owner') return res.status(403).json({ message: 'Access denied' });
  try {
    const [rows] = await db.query(
      'SELECT * FROM work_schedules WHERE user_id = ? AND restaurant_id = ?',
      [req.params.userId, req.user.restaurant_id]
    );
    res.json(rows);
  } catch (err) { next(err); }
});

// Save schedule for a user (owner only)
router.post('/:userId', auth, async (req, res, next) => {
  if (req.user.role !== 'owner') return res.status(403).json({ message: 'Access denied' });
  const { schedules } = req.body;
  // schedules = [{ day_of_week, start_time, end_time }]
  try {
    // Delete existing schedule for this user
    await db.query(
      'DELETE FROM work_schedules WHERE user_id = ? AND restaurant_id = ?',
      [req.params.userId, req.user.restaurant_id]
    );

    // Insert new schedule
    for (const s of schedules) {
      await db.query(
        'INSERT INTO work_schedules (user_id, restaurant_id, day_of_week, start_time, end_time) VALUES (?, ?, ?, ?, ?)',
        [req.params.userId, req.user.restaurant_id, s.day_of_week, s.start_time, s.end_time]
      );
    }

    res.json({ message: 'Schedule saved' });
  } catch (err) { next(err); }
});

module.exports = router;
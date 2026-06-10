const express = require('express');
const router = express.Router();
const db = require('../database');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { sendNewApplicationEmail } = require('../utils/mailer');

// Calculate pricing tier based on total employees
const getPricingTier = (total_employees) => {
  if (total_employees <= 5) return { tier: '1-5 employees', price: 499 };
  if (total_employees <= 15) return { tier: '6-15 employees', price: 999 };
  if (total_employees <= 30) return { tier: '16-30 employees', price: 1499 };
  return { tier: '30+ employees', price: 2499 };
};

// Submit restaurant application (public route — no auth needed)
router.post('/',
  [
    body('owner_name').notEmpty().withMessage('Owner name is required'),
    body('owner_email').isEmail().withMessage('Valid email is required'),
    body('owner_phone').notEmpty().withMessage('Owner phone is required'),
    body('owner_national_id').notEmpty().withMessage('National ID is required'),
    body('restaurant_name').notEmpty().withMessage('Restaurant name is required'),
    body('restaurant_type').notEmpty().withMessage('Restaurant type is required'),
    body('cuisine_type').notEmpty().withMessage('Cuisine type is required'),
    body('address').notEmpty().withMessage('Address is required'),
    body('city').notEmpty().withMessage('City is required'),
    body('phone').notEmpty().withMessage('Phone is required'),
    body('seating_capacity').isInt({ min: 1 }).withMessage('Seating capacity must be a number'),
    body('num_tables').isInt({ min: 1 }).withMessage('Number of tables must be a number'),
    body('opening_time').notEmpty().withMessage('Opening time is required'),
    body('closing_time').notEmpty().withMessage('Closing time is required'),
    body('days_open').notEmpty().withMessage('Days open is required'),
    body('num_waiters').isInt({ min: 0 }).withMessage('Number of waiters must be a number'),
    body('num_kitchen').isInt({ min: 1 }).withMessage('At least 1 kitchen staff required')
  ],
  validate,
  async (req, res, next) => {
  const {
    owner_name, owner_email, owner_phone, owner_national_id,
    restaurant_name, branch_name, restaurant_type, cuisine_type,
    address, city, region, google_maps_link, phone, whatsapp,
    seating_capacity, num_tables, opening_time, closing_time, days_open,
    has_delivery, has_shisha, has_outdoor_seating,
    num_owners, num_waiters, num_kitchen, num_delivery
  } = req.body;

  try {
    // Check if email already applied
    const [existing] = await db.query(
      'SELECT id FROM restaurant_applications WHERE owner_email = ?',
      [owner_email]
    );
    if (existing.length > 0) {
      return res.status(400).json({ message: 'An application with this email already exists' });
    }

    const total_employees = (parseInt(num_owners) || 1) +
      (parseInt(num_waiters) || 0) +
      (parseInt(num_kitchen) || 0) +
      (parseInt(num_delivery) || 0);

    const { tier, price } = getPricingTier(total_employees);

    await db.query(`
      INSERT INTO restaurant_applications (
        owner_name, owner_email, owner_phone, owner_national_id,
        restaurant_name, branch_name, restaurant_type, cuisine_type,
        address, city, region, google_maps_link, phone, whatsapp,
        seating_capacity, num_tables, opening_time, closing_time, days_open,
        has_delivery, has_shisha, has_outdoor_seating,
        num_owners, num_waiters, num_kitchen, num_delivery, total_employees,
        pricing_tier, quoted_price
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        owner_name, owner_email, owner_phone, owner_national_id,
        restaurant_name, branch_name || null, restaurant_type, cuisine_type,
        address, city, region || null, google_maps_link || null, phone, whatsapp || null,
        seating_capacity, num_tables, opening_time, closing_time, days_open,
        has_delivery || false, has_shisha || false, has_outdoor_seating || false,
        num_owners || 1, num_waiters, num_kitchen, num_delivery || 0, total_employees,
        tier, price
      ]
    );
          
      // Send email notification to super admin
try {
  await sendNewApplicationEmail({
    owner_name, owner_email, owner_phone,
    restaurant_name, branch_name, restaurant_type,
    address, city, phone,
    seating_capacity, num_tables,
    has_delivery, has_shisha, has_outdoor_seating,
    num_owners: num_owners || 1, num_waiters, num_kitchen, num_delivery: num_delivery || 0,
    total_employees,
    pricing_tier: tier,
    quoted_price: price
  });
} catch (emailErr) {
  console.error('Email failed:', emailErr.message);
  // Don't fail the request if email fails
}


    res.status(201).json({
      message: 'Application submitted successfully. We will contact you within 24 hours.',
      pricing_tier: tier,
      quoted_price: price
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
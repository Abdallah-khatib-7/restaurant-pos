const express = require('express');
const router = express.Router();
const db = require('../database');

// Calculate pricing tier based on total employees
const getPricingTier = (total_employees) => {
  if (total_employees <= 5) return { tier: '1-5 employees', price: 499 };
  if (total_employees <= 15) return { tier: '6-15 employees', price: 999 };
  if (total_employees <= 30) return { tier: '16-30 employees', price: 1499 };
  return { tier: '30+ employees', price: 2499 };
};

// Submit restaurant application (public route — no auth needed)
router.post('/', async (req, res) => {
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

    res.status(201).json({
      message: 'Application submitted successfully. We will contact you within 24 hours.',
      pricing_tier: tier,
      quoted_price: price
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
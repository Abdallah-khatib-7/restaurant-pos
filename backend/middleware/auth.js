const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Middleware to allow superadmin only
module.exports.superAdminOnly = (req, res, next) => {
  if (req.user.role !== 'superadmin') {
    return res.status(403).json({ message: 'Super admin access only' });
  }
  next();
};

// Middleware to allow restaurant staff only (not superadmin)
module.exports.restaurantOnly = (req, res, next) => {
  if (req.user.role === 'superadmin') {
    return res.status(403).json({ message: 'Not allowed for super admin' });
  }
  next();
};
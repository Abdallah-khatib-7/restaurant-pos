module.exports = (err, req, res, next) => {
  console.error(err.stack);

  // In production, never expose internal error details
  if (process.env.NODE_ENV === 'production') {
    return res.status(500).json({ message: 'Something went wrong. Please try again.' });
  }

  // In development, show full error
  res.status(500).json({ message: err.message, stack: err.stack });
};
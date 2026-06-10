const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();
const { apiLimiter, loginLimiter, applicationLimiter } = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

// Middleware
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(morgan('dev'));
app.use(express.json());

// Rate limiting
app.use('/api/', apiLimiter);
app.use('/api/auth/login', loginLimiter);
app.use('/api/superadmin/login', loginLimiter);
app.use('/api/applications', applicationLimiter);

// Make io accessible in routes
app.set('io', io);

// Socket.io events
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('join_kitchen', (restaurant_id) => {
    socket.join(`kitchen_${restaurant_id}`);
    console.log(`Kitchen connected for restaurant ${restaurant_id}`);
  });

  socket.on('join_waiter', (data) => {
    socket.join(`waiter_${data.restaurant_id}_${data.waiterId}`);
    console.log(`Waiter connected for restaurant ${data.restaurant_id}`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/menu', require('./routes/menu'));
app.use('/api/tables', require('./routes/tables'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/users', require('./routes/users'));
app.use('/api/delivery', require('./routes/delivery'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/superadmin', require('./routes/superadmin'));
app.use('/api/applications', require('./routes/applications'));

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Restaurant POS API is running' });
});

// Error handler — must be last
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
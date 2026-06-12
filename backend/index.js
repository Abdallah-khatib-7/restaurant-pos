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
app.set('trust proxy', 1);
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [process.env.CLIENT_URL, 'http://localhost:5173'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  }
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: [process.env.CLIENT_URL, 'http://localhost:5173'],
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());

// Rate limiting
app.use('/api/', apiLimiter);
app.use('/api/auth/login', loginLimiter);
app.use('/api/superadmin/login', loginLimiter);
app.use('/api/applications', applicationLimiter);

// Make io accessible in routes
app.set('io', io);

// Track online users in memory
const onlineUsers = new Map();

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('join_kitchen', (restaurant_id) => {
    socket.join(`kitchen_${restaurant_id}`);
  });

  socket.on('join_waiter', (data) => {
    socket.join(`waiter_${data.restaurant_id}_${data.waiterId}`);
  });

  socket.on('user_online', (data) => {
    onlineUsers.set(data.user_id, { ...data, socket_id: socket.id });
    socket.join(`restaurant_${data.restaurant_id}`);
    io.to(`restaurant_${data.restaurant_id}`).emit('online_users_updated',
      Array.from(onlineUsers.values()).filter(u => u.restaurant_id === data.restaurant_id)
    );
  });

  socket.on('disconnect', () => {
    for (const [userId, userData] of onlineUsers.entries()) {
      if (userData.socket_id === socket.id) {
        onlineUsers.delete(userId);
        io.to(`restaurant_${userData.restaurant_id}`).emit('online_users_updated',
          Array.from(onlineUsers.values()).filter(u => u.restaurant_id === userData.restaurant_id)
        );
        break;
      }
    }
    console.log('Client disconnected:', socket.id);
  });
});

app.set('onlineUsers', onlineUsers);

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
app.use('/api/sessions', require('./routes/sessions'));
app.use('/api/schedules', require('./routes/schedules'));

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Restaurant POS API is running' });
});

// Online users
app.get('/api/online-users', (req, res) => {
  const onlineUsers = req.app.get('onlineUsers');
  const restaurantId = parseInt(req.query.restaurant_id);
  const users = Array.from(onlineUsers.values()).filter(u => u.restaurant_id === restaurantId);
  res.json(users);
});

// Error handler — must be last
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
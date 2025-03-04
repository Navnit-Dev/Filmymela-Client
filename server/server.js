const express = require('express');
const mongoose = require('mongoose');
const { Server } = require('socket.io');
const http = require('http');
const compression = require('compression');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const NodeCache = require('node-cache');
const movie = require('./routes/movies');
const admin = require('./routes/admin');
const adminLogin = require('./routes/auth');
const Users = require('./routes/UserRoutes');
const Watchlist = require('./routes/WatchList');
const GetMovies = require('./routes/GetMovie');
const chatbot = require('./routes/chatbot');
const { apiLimiter } = require('./middleware/auth');
const cors = require('cors');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Initialize cache
const cache = new NodeCache({
  stdTTL: process.env.CACHE_TTL || 1800,
  checkperiod: 120
});

// Basic middleware
app.use(cors());
app.use(helmet()); // Security headers
app.use(compression()); // Compress responses
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Rate limiting for all routes
app.use(apiLimiter);

// Cache middleware
const cacheMiddleware = (req, res, next) => {
  if (req.method !== 'GET') return next();
  
  const key = `cache:${req.originalUrl}`;
  const cachedResponse = cache.get(key);
  
  if (cachedResponse) {
    return res.json(cachedResponse);
  }
  
  // Store original send
  const originalSend = res.send;
  res.send = function(body) {
    if (res.statusCode === 200) {
      cache.set(key, JSON.parse(body));
    }
    originalSend.call(this, body);
  };
  
  next();
};

// MongoDB Connection with retry logic
const connectDB = async (retries = 5) => {
  while (retries) {
    try {
      await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log('Connected to MongoDB');
      break;
    } catch (err) {
      console.error('MongoDB connection error:', err);
      retries -= 1;
      if (!retries) {
        process.exit(1);
      }
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
};

connectDB();

// WebSocket event handlers
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join room for real-time updates
  socket.on('join-room', (roomId) => {
    socket.join(roomId);
  });

  // Handle movie updates
  socket.on('movie-update', (data) => {
    io.to('admin-room').emit('movie-changed', data);
    // Invalidate cache for movie routes
    cache.del(`cache:/api/movies/${data.movieId}`);
  });

  // Handle user notifications
  socket.on('send-notification', (data) => {
    io.to(data.userId).emit('new-notification', data);
  });

  // Handle admin dashboard updates
  socket.on('admin-update', (data) => {
    io.to('admin-room').emit('dashboard-update', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Apply cache middleware to routes that benefit from caching
app.use('/api/movies', cacheMiddleware);
app.use('/api/trending', cacheMiddleware);

// Routes
app.use('/api', Watchlist);
app.use('/api', GetMovies);
app.use('/api', movie);
app.use('/api/auth', admin);
app.use('/api/auth', adminLogin);
app.use('/api/auth', Users);
app.use('/api/admin/chatbot', chatbot);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
const PORT = process.env.PORT || 8001;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`WebSocket server is ready for connections`);
});

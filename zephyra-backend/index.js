require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const connectRedis = require('./config/redis');

// Initialize Express app
const app = express();

// Connect to MongoDB
let mongoConnection;
(async () => {
  try {
    mongoConnection = await connectDB();
  } catch (err) {
    console.error('Failed to connect to MongoDB:', err);
    process.exit(1);
  }
})();

// Connect to Redis
let redisClient;
(async () => {
  try {
    redisClient = await connectRedis();
  } catch (err) {
    console.warn('Redis connection failed, continuing without Redis:', err);
    // Continue without Redis
  }
})();

// Middleware
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Health check route
app.get('/health', (req, res) => {
  const dbStatus = mongoConnection ? 'connected' : 'disconnected';
  const redisStatus = redisClient && redisClient.isReady ? 'connected' : 'disconnected';
  
  res.json({
    status: 'ok',
    timestamp: new Date(),
    services: {
      mongodb: dbStatus,
      redis: redisStatus
    }
  });
});

// API Routes
app.use('/api/users', require('./routes/users'));
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/pools', require('./routes/pools'));
app.use('/api/pool-service', require('./routes/poolService'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Server Error',
    message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message
  });
});

// Handle 404 routes
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  // Don't crash the server, just log the error
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  // Graceful shutdown
  if (mongoConnection) {
    mongoConnection.connection.close(() => {
      console.log('MongoDB connection closed due to app termination');
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

// Export for testing
module.exports = app;

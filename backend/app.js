require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const passport = require('passport');

// Import routes
const authRoutes = require('./routes/auth');
const connectorRoutes = require('./routes/connectors');
const accRoutes = require('./routes/acc');
const workflowRoutes = require('./routes/workflows');

// Import middleware
const errorHandler = require('./middleware/errorHandler');
const requireAuth = require('./middleware/requireAuth');

// Import passport config
require('./config/passport');

const app = express();

// Import database utility
const database = require('./utils/database');

// Connect to MongoDB
database.connect()
  .then(() => console.log('✅ Database connection established'))
  .catch(err => console.error('❌ Database connection error:', err));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { success: false, message: 'Too many requests from this IP' }
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(limiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Initialize passport
app.use(passport.initialize());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/connectors', requireAuth, connectorRoutes);
app.use('/api/acc', requireAuth, accRoutes);
app.use('/api/workflows', requireAuth, workflowRoutes);

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const dbHealth = await database.healthCheck();
    res.json({ 
      success: true, 
      message: 'Server is running',
      database: dbHealth,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Health check failed',
      error: error.message
    });
  }
});

// Global error handler
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

module.exports = app;

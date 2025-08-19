const mongoose = require('mongoose');
const logger = require('./logger');

class Database {
  constructor() {
    this.isConnected = false;
    this.connection = null;
  }

  async connect() {
    try {
      if (this.isConnected) {
        logger.info('Database already connected');
        return;
      }

      const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/acc-workflow';
      
      logger.info(`Connecting to MongoDB: ${mongoUri.replace(/\/\/.*@/, '//***@')}`);
      
      // Connection options
      const options = {
        maxPoolSize: 10, // Maximum number of connections in the pool
        serverSelectionTimeoutMS: 5000, // Timeout for server selection
        socketTimeoutMS: 45000, // Timeout for socket operations
      };

      // Connect to MongoDB
      this.connection = await mongoose.connect(mongoUri, options);
      
      this.isConnected = true;
      logger.info('✅ Connected to MongoDB successfully');

      // Handle connection events
      mongoose.connection.on('error', (error) => {
        logger.error('MongoDB connection error:', error);
        this.isConnected = false;
      });

      mongoose.connection.on('disconnected', () => {
        logger.warn('MongoDB disconnected');
        this.isConnected = false;
      });

      mongoose.connection.on('reconnected', () => {
        logger.info('MongoDB reconnected');
        this.isConnected = false;
      });

      // Graceful shutdown
      process.on('SIGINT', this.gracefulShutdown.bind(this));
      process.on('SIGTERM', this.gracefulShutdown.bind(this));

    } catch (error) {
      logger.error('Failed to connect to MongoDB:', error);
      throw error;
    }
  }

  async disconnect() {
    try {
      if (this.connection && this.isConnected) {
        await mongoose.disconnect();
        this.isConnected = false;
        logger.info('Disconnected from MongoDB');
      }
    } catch (error) {
      logger.error('Error disconnecting from MongoDB:', error);
    }
  }

  async gracefulShutdown() {
    logger.info('Received shutdown signal, closing database connection...');
    await this.disconnect();
    process.exit(0);
  }

  getConnection() {
    return mongoose.connection;
  }

  isDatabaseConnected() {
    return this.isConnected && mongoose.connection.readyState === 1;
  }

  // Health check method
  async healthCheck() {
    try {
      if (!this.isDatabaseConnected()) {
        return { status: 'unhealthy', message: 'Database not connected' };
      }

      // Ping the database
      await mongoose.connection.db.admin().ping();
      
      return { status: 'healthy', message: 'Database connection is working' };
    } catch (error) {
      logger.error('Database health check failed:', error);
      return { status: 'unhealthy', message: error.message };
    }
  }
}

// Create singleton instance
const database = new Database();

module.exports = database;

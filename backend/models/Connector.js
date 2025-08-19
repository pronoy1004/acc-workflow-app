const mongoose = require('mongoose');

const connectorSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['acc', 'gmail', 'google-calendar']
  },
  name: {
    type: String,
    required: true
  },
  credentials: {
    accessToken: {
      type: String,
      required: true
    },
    refreshToken: {
      type: String,
      required: true
    },
    expiresAt: {
      type: Date,
      required: true
    },
    scope: String,
    accountId: String,
    accountName: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamp on save
connectorSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Check if token is expired
connectorSchema.methods.isTokenExpired = function() {
  const bufferTime = 5 * 60 * 1000; // 5 minutes buffer
  return Date.now() >= (this.credentials.expiresAt.getTime() - bufferTime);
};

module.exports = mongoose.model('Connector', connectorSchema);

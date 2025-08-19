const mongoose = require('mongoose');

const workflowSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  nodes: [{
    id: {
      type: String,
      required: true
    },
    type: {
      type: String,
      required: true,
      enum: ['acc-trigger', 'gmail-action', 'calendar-action']
    },
    position: {
      x: Number,
      y: Number
    },
    data: {
      label: String,
      config: mongoose.Schema.Types.Mixed
    }
  }],
  edges: [{
    id: {
      type: String,
      required: true
    },
    source: {
      type: String,
      required: true
    },
    target: {
      type: String,
      required: true
    },
    type: {
      type: String,
      default: 'default'
    }
  }],
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
workflowSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Workflow', workflowSchema);

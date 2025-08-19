const mongoose = require('mongoose');

const workflowExecutionSchema = new mongoose.Schema({
  workflowId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workflow',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'running', 'completed', 'failed'],
    default: 'pending'
  },
  inputData: {
    type: mongoose.Schema.Types.Mixed
  },
  executionSteps: [{
    stepId: String,
    stepType: String,
    status: {
      type: String,
      enum: ['pending', 'running', 'completed', 'failed']
    },
    input: mongoose.Schema.Types.Mixed,
    output: mongoose.Schema.Types.Mixed,
    error: String,
    startTime: Date,
    endTime: Date
  }],
  result: {
    type: mongoose.Schema.Types.Mixed
  },
  error: {
    message: String,
    stack: String
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: Date,
  duration: Number // in milliseconds
});

// Calculate duration when completed
workflowExecutionSchema.pre('save', function(next) {
  if (this.status === 'completed' && this.completedAt && !this.duration) {
    this.duration = this.completedAt.getTime() - this.startedAt.getTime();
  }
  next();
});

module.exports = mongoose.model('WorkflowExecution', workflowExecutionSchema);

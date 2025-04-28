const mongoose = require('mongoose');

/**
 * Transaction Schema
 * Represents a remittance transaction in the Zephyra platform
 * Tracks the user, amount, and corridor for each transaction
 */
const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  corridor: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  stellarTxHash: {
    type: String,
    trim: true,
    sparse: true
  },
  sourceAsset: {
    type: String,
    required: true
  },
  destinationAsset: {
    type: String,
    required: true
  },
  exchangeRate: {
    type: Number
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Pre-save middleware to update the updatedAt field
transactionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;

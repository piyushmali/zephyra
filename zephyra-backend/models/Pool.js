const mongoose = require('mongoose');

/**
 * Pool Schema
 * Represents a liquidity pool for a specific corridor in the Zephyra platform
 * Tracks the available assets for each remittance corridor
 */
const poolSchema = new mongoose.Schema({
  corridor: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true
  },
  assets: {
    type: [String],
    required: true,
    validate: {
      validator: function(v) {
        return v && v.length > 0;
      },
      message: 'Pool must have at least one asset'
    }
  },
  totalLiquidity: {
    type: Number,
    default: 0,
    min: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  stellarPoolId: {
    type: String,
    trim: true
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
poolSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Pool = mongoose.model('Pool', poolSchema);

module.exports = Pool;

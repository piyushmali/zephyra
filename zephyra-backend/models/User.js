const mongoose = require('mongoose');

/**
 * User Schema
 * Represents a user in the Zephyra platform
 * Each user is identified by their Stellar public key
 */
const userSchema = new mongoose.Schema({
  publicKey: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true
  },
  alias: {
    type: String,
    required: false,
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
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;

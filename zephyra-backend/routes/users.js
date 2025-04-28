const express = require('express');
const router = express.Router();
const User = require('../models/User');

/**
 * @route   GET /api/users
 * @desc    Get all users
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const users = await User.find().select('-__v');
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

/**
 * @route   GET /api/users/:publicKey
 * @desc    Get user by public key
 * @access  Public
 */
router.get('/:publicKey', async (req, res) => {
  try {
    const user = await User.findOne({ publicKey: req.params.publicKey }).select('-__v');
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

/**
 * @route   POST /api/users
 * @desc    Create or update a user
 * @access  Public
 */
router.post('/', async (req, res) => {
  const { publicKey, alias } = req.body;

  try {
    // Check if user exists
    let user = await User.findOne({ publicKey });

    if (user) {
      // Update existing user
      user.alias = alias || user.alias;
      await user.save();
      return res.json(user);
    }

    // Create new user
    user = new User({
      publicKey,
      alias
    });

    await user.save();
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;

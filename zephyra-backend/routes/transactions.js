const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const User = require('../models/User');

/**
 * @route   GET /api/transactions
 * @desc    Get all transactions
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const transactions = await Transaction.find()
      .populate('userId', 'publicKey alias')
      .select('-__v')
      .sort({ createdAt: -1 });
    
    res.json(transactions);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

/**
 * @route   GET /api/transactions/user/:userId
 * @desc    Get transactions by user ID
 * @access  Public
 */
router.get('/user/:userId', async (req, res) => {
  try {
    // First find the user by publicKey
    const user = await User.findOne({ publicKey: req.params.userId });
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    // Then find transactions using the MongoDB ObjectId
    const transactions = await Transaction.find({ userId: user._id })
      .populate('userId', 'publicKey alias')
      .select('-__v')
      .sort({ createdAt: -1 });
    
    res.json(transactions);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

/**
 * @route   GET /api/transactions/:id
 * @desc    Get transaction by ID
 * @access  Public
 */
router.get('/:id', async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id)
      .populate('userId', 'publicKey alias')
      .select('-__v');
    
    if (!transaction) {
      return res.status(404).json({ msg: 'Transaction not found' });
    }
    
    res.json(transaction);
  } catch (err) {
    console.error(err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Transaction not found' });
    }
    
    res.status(500).send('Server Error');
  }
});

/**
 * @route   POST /api/transactions
 * @desc    Create a new transaction
 * @access  Public
 */
router.post('/', async (req, res) => {
  const { userId, amount, corridor, sourceAsset, destinationAsset, exchangeRate } = req.body;

  try {
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Create new transaction
    const newTransaction = new Transaction({
      userId,
      amount,
      corridor,
      sourceAsset,
      destinationAsset,
      exchangeRate
    });

    const transaction = await newTransaction.save();
    res.json(transaction);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

/**
 * @route   PUT /api/transactions/:id
 * @desc    Update transaction status
 * @access  Public
 */
router.put('/:id', async (req, res) => {
  const { status, stellarTxHash } = req.body;

  try {
    let transaction = await Transaction.findById(req.params.id);
    
    if (!transaction) {
      return res.status(404).json({ msg: 'Transaction not found' });
    }

    // Update transaction
    if (status) transaction.status = status;
    if (stellarTxHash) transaction.stellarTxHash = stellarTxHash;
    
    await transaction.save();
    res.json(transaction);
  } catch (err) {
    console.error(err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Transaction not found' });
    }
    
    res.status(500).send('Server Error');
  }
});

module.exports = router;

/**
 * API Routes for Zephyra
 * 
 * This file defines the main API routes for the Zephyra Stellar Testnet remittance platform.
 * It includes endpoints for pools, remittances, savings, and transactions.
 */

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { apiLimiter, strictLimiter } = require('../middleware/rateLimiter');
const { 
  validatePoolCreation, 
  validateRemittanceCreation,
  validateTransactionXDR,
  validateUserCreation
} = require('../middleware/validators');

// Import services
const poolService = require('../services/pool');
const remittanceService = require('../services/remittance');
const savingsService = require('../services/savings');

// Import models
const Pool = require('../models/Pool');
const Transaction = require('../models/Transaction');
const User = require('../models/User');

/**
 * @route   GET /api/pools
 * @desc    Get all liquidity pools
 * @access  Public
 */
router.get('/pools', apiLimiter, async (req, res) => {
  try {
    const pools = await Pool.find().select('-__v');
    res.json(pools);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server Error', message: err.message });
  }
});

/**
 * @route   POST /api/pools
 * @desc    Create a new liquidity pool
 * @access  Private
 */
router.post('/pools', [auth, strictLimiter, validatePoolCreation], async (req, res) => {
  try {
    const { corridor, assets, sourceSecretKey, initialDeposit } = req.body;
    
    const pool = await poolService.createLiquidityPool({
      corridor,
      assets,
      sourceSecretKey,
      initialDeposit: initialDeposit || 0
    });
    
    res.json(pool);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server Error', message: err.message });
  }
});

/**
 * @route   GET /api/pools/:corridor
 * @desc    Get pool by corridor
 * @access  Public
 */
router.get('/pools/:corridor', apiLimiter, async (req, res) => {
  try {
    const pool = await Pool.findOne({ corridor: req.params.corridor });
    
    if (!pool) {
      return res.status(404).json({ error: 'Not Found', message: 'Pool not found' });
    }
    
    res.json(pool);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server Error', message: err.message });
  }
});

/**
 * @route   POST /api/remittances
 * @desc    Create a new remittance transaction
 * @access  Public (requires Stellar signature)
 */
router.post('/remittances', [apiLimiter, validateRemittanceCreation], async (req, res) => {
  try {
    const {
      sourceAsset,
      destinationAsset,
      amount,
      destinationAddress,
      senderPublicKey,
      memo
    } = req.body;
    
    const remittanceResult = await remittanceService.createRemittance({
      sourceAsset,
      destinationAsset,
      amount,
      destinationAddress,
      senderPublicKey,
      memo
    });
    
    res.json({
      transactionId: remittanceResult.transaction._id,
      xdr: remittanceResult.xdr,
      status: remittanceResult.transaction.status
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server Error', message: err.message });
  }
});

/**
 * @route   POST /api/remittances/submit
 * @desc    Submit a signed remittance transaction
 * @access  Public
 */
router.post('/remittances/submit', [apiLimiter, validateTransactionXDR], async (req, res) => {
  try {
    const { xdr, transactionId } = req.body;
    
    const result = await remittanceService.submitRemittanceTransaction(xdr, transactionId);
    
    res.json({
      transaction: result.transaction,
      hash: result.stellarResult.hash,
      status: 'success'
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server Error', message: err.message });
  }
});

/**
 * @route   GET /api/remittances/rate
 * @desc    Get exchange rate for a corridor
 * @access  Public
 */
router.get('/remittances/rate', apiLimiter, async (req, res) => {
  try {
    const { sourceAsset, destinationAsset } = req.query;
    
    if (!sourceAsset || !destinationAsset) {
      return res.status(400).json({ 
        error: 'Bad Request', 
        message: 'sourceAsset and destinationAsset are required query parameters' 
      });
    }
    
    const exchangeRate = await remittanceService.getExchangeRate(sourceAsset, destinationAsset);
    
    res.json({
      sourceAsset,
      destinationAsset,
      exchangeRate,
      timestamp: new Date()
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server Error', message: err.message });
  }
});

/**
 * @route   GET /api/savings
 * @desc    Get platform-wide savings statistics
 * @access  Public
 */
router.get('/savings', apiLimiter, async (req, res) => {
  try {
    const savingsStats = await savingsService.getPlatformSavings();
    res.json(savingsStats);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server Error', message: err.message });
  }
});

/**
 * @route   GET /api/savings/user/:publicKey
 * @desc    Get savings statistics for a user
 * @access  Public
 */
router.get('/savings/user/:publicKey', apiLimiter, async (req, res) => {
  try {
    const user = await User.findOne({ publicKey: req.params.publicKey });
    
    if (!user) {
      return res.status(404).json({ error: 'Not Found', message: 'User not found' });
    }
    
    const savingsStats = await savingsService.getUserSavings(user._id);
    res.json(savingsStats);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server Error', message: err.message });
  }
});

/**
 * @route   GET /api/transactions
 * @desc    Get all transactions
 * @access  Private
 */
router.get('/transactions', [auth, apiLimiter], async (req, res) => {
  try {
    const transactions = await Transaction.find()
      .populate('userId', 'publicKey alias')
      .sort({ createdAt: -1 });
    
    res.json(transactions);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server Error', message: err.message });
  }
});

/**
 * @route   GET /api/transactions/user/:publicKey
 * @desc    Get transactions for a user by public key
 * @access  Public
 */
router.get('/transactions/user/:publicKey', apiLimiter, async (req, res) => {
  try {
    const user = await User.findOne({ publicKey: req.params.publicKey });
    
    if (!user) {
      return res.status(404).json({ error: 'Not Found', message: 'User not found' });
    }
    
    const transactions = await Transaction.find({ userId: user._id })
      .sort({ createdAt: -1 });
    
    res.json(transactions);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server Error', message: err.message });
  }
});

/**
 * @route   POST /api/transactions
 * @desc    Create a new transaction record
 * @access  Private
 */
router.post('/transactions', [auth, apiLimiter], async (req, res) => {
  try {
    const { userId, amount, corridor, sourceAsset, destinationAsset, status } = req.body;
    
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Not Found', message: 'User not found' });
    }
    
    // Create new transaction
    const transaction = new Transaction({
      userId,
      amount,
      corridor,
      sourceAsset,
      destinationAsset,
      status: status || 'pending'
    });
    
    await transaction.save();
    res.json(transaction);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server Error', message: err.message });
  }
});

/**
 * @route   GET /api/transactions/:id
 * @desc    Get transaction by ID
 * @access  Public
 */
router.get('/transactions/:id', apiLimiter, async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id)
      .populate('userId', 'publicKey alias');
    
    if (!transaction) {
      return res.status(404).json({ error: 'Not Found', message: 'Transaction not found' });
    }
    
    res.json(transaction);
  } catch (err) {
    console.error(err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ error: 'Not Found', message: 'Transaction not found' });
    }
    
    res.status(500).json({ error: 'Server Error', message: err.message });
  }
});

/**
 * @route   POST /api/users
 * @desc    Register a new user
 * @access  Public
 */
router.post('/users', [apiLimiter, validateUserCreation], async (req, res) => {
  try {
    const { publicKey, alias } = req.body;
    
    // Check if user already exists
    let user = await User.findOne({ publicKey });
    
    if (user) {
      // Update existing user
      if (alias) {
        user.alias = alias;
        await user.save();
      }
      return res.json(user);
    }
    
    // Create new user
    user = new User({
      publicKey,
      alias
    });
    
    await user.save();
    res.status(201).json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server Error', message: err.message });
  }
});

module.exports = router;

/**
 * Pool Service Routes for Zephyra
 * 
 * This file defines the API routes for interacting with Stellar liquidity pools
 * in the Zephyra remittance platform.
 */

const express = require('express');
const router = express.Router();
const poolService = require('../services/pool');

/**
 * @route   GET /api/pool-service/pools
 * @desc    Get all liquidity pools
 * @access  Public
 */
router.get('/pools', async (req, res) => {
  try {
    const pools = await poolService.getAllPools();
    res.json(pools);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server Error', message: err.message });
  }
});

/**
 * @route   GET /api/pool-service/pools/:corridor
 * @desc    Get pool by corridor with Stellar details
 * @access  Public
 */
router.get('/pools/:corridor', async (req, res) => {
  try {
    const pool = await poolService.getPoolByCorridorWithDetails(req.params.corridor);
    res.json(pool);
  } catch (err) {
    console.error(err.message);
    if (err.message.includes('No active pool found')) {
      return res.status(404).json({ error: 'Not Found', message: err.message });
    }
    res.status(500).json({ error: 'Server Error', message: err.message });
  }
});

/**
 * @route   POST /api/pool-service/pools
 * @desc    Create a new liquidity pool
 * @access  Private (should be protected in production)
 */
router.post('/pools', async (req, res) => {
  try {
    const { corridor, assets, sourceSecretKey, initialDeposit } = req.body;
    
    if (!corridor || !sourceSecretKey) {
      return res.status(400).json({ 
        error: 'Bad Request', 
        message: 'corridor and sourceSecretKey are required' 
      });
    }
    
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
 * @route   POST /api/pool-service/pools/usd-mxn
 * @desc    Create a USD-MXN liquidity pool
 * @access  Private (should be protected in production)
 */
router.post('/pools/usd-mxn', async (req, res) => {
  try {
    const { sourceSecretKey, initialDeposit } = req.body;
    
    if (!sourceSecretKey) {
      return res.status(400).json({ 
        error: 'Bad Request', 
        message: 'sourceSecretKey is required' 
      });
    }
    
    const pool = await poolService.createUsdMxnPool(sourceSecretKey, initialDeposit);
    res.json(pool);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server Error', message: err.message });
  }
});

/**
 * @route   GET /api/pool-service/exchange-rate/:corridor
 * @desc    Get exchange rate for a corridor
 * @access  Public
 */
router.get('/exchange-rate/:corridor', async (req, res) => {
  try {
    const exchangeRate = await poolService.getExchangeRate(req.params.corridor);
    res.json({ corridor: req.params.corridor, exchangeRate });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server Error', message: err.message });
  }
});

/**
 * @route   PUT /api/pool-service/pools/:poolId/stats
 * @desc    Update pool statistics
 * @access  Private (should be protected in production)
 */
router.put('/pools/:poolId/stats', async (req, res) => {
  try {
    const updatedPool = await poolService.updatePoolStats(req.params.poolId);
    res.json(updatedPool);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server Error', message: err.message });
  }
});

module.exports = router;

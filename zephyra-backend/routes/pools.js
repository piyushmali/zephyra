const express = require('express');
const router = express.Router();
const Pool = require('../models/Pool');

/**
 * @route   GET /api/pools
 * @desc    Get all pools
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const pools = await Pool.find().select('-__v');
    res.json(pools);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

/**
 * @route   GET /api/pools/:corridor
 * @desc    Get pool by corridor
 * @access  Public
 */
router.get('/:corridor', async (req, res) => {
  try {
    const pool = await Pool.findOne({ corridor: req.params.corridor }).select('-__v');
    
    if (!pool) {
      return res.status(404).json({ msg: 'Pool not found' });
    }
    
    res.json(pool);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

/**
 * @route   POST /api/pools
 * @desc    Create a new pool
 * @access  Public
 */
router.post('/', async (req, res) => {
  const { corridor, assets, totalLiquidity, stellarPoolId } = req.body;

  try {
    // Check if pool already exists
    let pool = await Pool.findOne({ corridor });
    
    if (pool) {
      return res.status(400).json({ msg: 'Pool already exists for this corridor' });
    }

    // Create new pool
    pool = new Pool({
      corridor,
      assets,
      totalLiquidity,
      stellarPoolId
    });

    await pool.save();
    res.json(pool);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

/**
 * @route   PUT /api/pools/:id
 * @desc    Update a pool
 * @access  Public
 */
router.put('/:id', async (req, res) => {
  const { assets, totalLiquidity, isActive, stellarPoolId } = req.body;

  try {
    let pool = await Pool.findById(req.params.id);
    
    if (!pool) {
      return res.status(404).json({ msg: 'Pool not found' });
    }

    // Update pool fields
    if (assets) pool.assets = assets;
    if (totalLiquidity !== undefined) pool.totalLiquidity = totalLiquidity;
    if (isActive !== undefined) pool.isActive = isActive;
    if (stellarPoolId) pool.stellarPoolId = stellarPoolId;
    
    await pool.save();
    res.json(pool);
  } catch (err) {
    console.error(err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Pool not found' });
    }
    
    res.status(500).send('Server Error');
  }
});

module.exports = router;

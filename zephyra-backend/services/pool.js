/**
 * Pool Service for Zephyra
 * 
 * This service provides functionality for creating and managing Stellar liquidity pools
 * for the Zephyra remittance platform. It includes functions for creating USD-MXN pools,
 * querying pool statistics, and storing pool data in MongoDB.
 */

const StellarSdk = require('@stellar/stellar-sdk');
const Pool = require('../models/Pool');
const stellarUtils = require('../utils/stellar');

/**
 * Create a liquidity pool on the Stellar network
 * @param {Object} poolData - Data for creating the pool
 * @param {string} poolData.corridor - Remittance corridor (e.g., "USD-MXN")
 * @param {Array<string>} poolData.assets - Array of asset codes
 * @param {string} poolData.sourceSecretKey - Secret key of the source account
 * @param {number} poolData.initialDeposit - Initial deposit amount for each asset
 * @returns {Promise<Object>} Created pool data including Stellar pool ID
 */
const createLiquidityPool = async (poolData) => {
  try {
    const { corridor, assets, sourceSecretKey, initialDeposit } = poolData;
    
    if (!corridor || !assets || assets.length !== 2 || !sourceSecretKey) {
      throw new Error('Invalid pool data: corridor, assets (exactly 2), and sourceSecretKey are required');
    }

    // Parse the corridor to get asset codes if not explicitly provided
    if (!assets[0] || !assets[1]) {
      const corridorAssets = corridor.split('-');
      if (corridorAssets.length !== 2) {
        throw new Error('Invalid corridor format. Expected format: ASSET1-ASSET2');
      }
      assets[0] = assets[0] || corridorAssets[0];
      assets[1] = assets[1] || corridorAssets[1];
    }

    // Get the Stellar server instance
    const server = stellarUtils.getServer();
    
    // Load the source account
    const sourceKeypair = StellarSdk.Keypair.fromSecret(sourceSecretKey);
    const sourcePublicKey = sourceKeypair.publicKey();
    const sourceAccount = await server.loadAccount(sourcePublicKey);

    // Define the assets for the pool
    const poolAssets = [];
    
    // Create proper asset objects based on asset codes
    for (const assetCode of assets) {
      if (assetCode === 'XLM' || assetCode === 'native') {
        poolAssets.push(StellarSdk.Asset.native());
      } else {
        // For non-native assets, we need an issuer
        // In a real application, you would use actual asset issuers from Stellar
        // For testnet, we'll use a test issuer or the source account as issuer
        const issuer = sourcePublicKey; // Using source account as issuer for simplicity
        poolAssets.push(new StellarSdk.Asset(assetCode, issuer));
      }
    }

    // Sort assets as required by Stellar protocol
    poolAssets.sort((a, b) => {
      return StellarSdk.Asset.compare(a, b);
    });

    // Calculate the liquidity pool ID
    const poolId = StellarSdk.getLiquidityPoolId(
      'constant_product', // Currently the only supported pool type
      poolAssets[0],
      poolAssets[1]
    ).toString('hex');

    // Check if pool already exists
    let existingPool;
    try {
      existingPool = await server.getLiquidityPool(poolId).call();
      console.log(`Pool already exists with ID: ${poolId}`);
    } catch (error) {
      // Pool doesn't exist, which is what we want
      console.log(`Creating new liquidity pool for ${corridor}`);
    }

    // If pool doesn't exist, create it
    if (!existingPool) {
      // Create a transaction to create the liquidity pool and deposit initial liquidity
      const transaction = new StellarSdk.TransactionBuilder(sourceAccount, {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase: stellarUtils.NETWORK_PASSPHRASE
      })
        .addOperation(
          StellarSdk.Operation.changeTrust({
            asset: new StellarSdk.LiquidityPoolAsset(
              'constant_product',
              poolAssets[0],
              poolAssets[1],
              0
            )
          })
        );

      // If initial deposit is specified, add liquidity deposit operation
      if (initialDeposit && initialDeposit > 0) {
        transaction.addOperation(
          StellarSdk.Operation.liquidityPoolDeposit({
            liquidityPoolId: poolId,
            maxAmountA: initialDeposit.toString(),
            maxAmountB: initialDeposit.toString(),
            minPrice: '0.1', // Minimum price ratio, adjust as needed
            maxPrice: '10'   // Maximum price ratio, adjust as needed
          })
        );
      }

      // Build and sign the transaction
      const builtTransaction = transaction
        .setTimeout(30)
        .build();
      
      builtTransaction.sign(sourceKeypair);

      // Submit the transaction to the network
      const transactionResult = await server.submitTransaction(builtTransaction);
      console.log(`Transaction successful! Hash: ${transactionResult.hash}`);
    }

    // Store the pool information in MongoDB
    const poolRecord = await Pool.findOne({ corridor });
    
    if (poolRecord) {
      // Update existing pool record
      poolRecord.assets = assets;
      poolRecord.stellarPoolId = poolId;
      poolRecord.isActive = true;
      poolRecord.updatedAt = Date.now();
      
      await poolRecord.save();
      console.log(`Updated pool record for ${corridor}`);
      return poolRecord;
    } else {
      // Create new pool record
      const newPool = new Pool({
        corridor,
        assets,
        stellarPoolId: poolId,
        isActive: true,
        totalLiquidity: initialDeposit ? initialDeposit * 2 : 0
      });
      
      await newPool.save();
      console.log(`Created new pool record for ${corridor}`);
      return newPool;
    }
  } catch (error) {
    console.error('Error creating liquidity pool:', error);
    throw new Error(`Failed to create liquidity pool: ${error.message}`);
  }
};

/**
 * Get liquidity pool details from the Stellar network
 * @param {string} poolId - The Stellar liquidity pool ID
 * @returns {Promise<Object>} Pool details from Stellar
 */
const getLiquidityPoolDetails = async (poolId) => {
  try {
    const server = stellarUtils.getServer();
    const pool = await server.getLiquidityPool(poolId).call();
    return pool;
  } catch (error) {
    console.error('Error fetching liquidity pool details:', error);
    throw new Error(`Failed to fetch liquidity pool details: ${error.message}`);
  }
};

/**
 * Get all liquidity pools from the database
 * @returns {Promise<Array>} Array of pool records
 */
const getAllPools = async () => {
  try {
    const pools = await Pool.find({ isActive: true }).sort({ createdAt: -1 });
    return pools;
  } catch (error) {
    console.error('Error fetching pools from database:', error);
    throw new Error(`Failed to fetch pools: ${error.message}`);
  }
};

/**
 * Get liquidity pool by corridor
 * @param {string} corridor - The remittance corridor (e.g., "USD-MXN")
 * @returns {Promise<Object>} Pool record with Stellar details
 */
const getPoolByCorridorWithDetails = async (corridor) => {
  try {
    // Get the pool record from the database
    const poolRecord = await Pool.findOne({ corridor, isActive: true });
    
    if (!poolRecord) {
      throw new Error(`No active pool found for corridor: ${corridor}`);
    }
    
    // Get the pool details from Stellar
    const stellarPoolDetails = await getLiquidityPoolDetails(poolRecord.stellarPoolId);
    
    // Combine the database record with Stellar details
    return {
      ...poolRecord.toObject(),
      stellarDetails: stellarPoolDetails
    };
  } catch (error) {
    console.error(`Error fetching pool for corridor ${corridor}:`, error);
    throw new Error(`Failed to fetch pool for corridor ${corridor}: ${error.message}`);
  }
};

/**
 * Create a USD-MXN liquidity pool
 * @param {string} sourceSecretKey - Secret key of the source account
 * @param {number} initialDeposit - Initial deposit amount for each asset
 * @returns {Promise<Object>} Created pool data
 */
const createUsdMxnPool = async (sourceSecretKey, initialDeposit = 100) => {
  try {
    const poolData = {
      corridor: 'USD-MXN',
      assets: ['USD', 'MXN'],
      sourceSecretKey,
      initialDeposit
    };
    
    return await createLiquidityPool(poolData);
  } catch (error) {
    console.error('Error creating USD-MXN pool:', error);
    throw new Error(`Failed to create USD-MXN pool: ${error.message}`);
  }
};

/**
 * Update pool statistics in the database
 * @param {string} poolId - The Stellar liquidity pool ID
 * @returns {Promise<Object>} Updated pool record
 */
const updatePoolStats = async (poolId) => {
  try {
    // Get the pool from the database
    const poolRecord = await Pool.findOne({ stellarPoolId: poolId });
    
    if (!poolRecord) {
      throw new Error(`No pool found with ID: ${poolId}`);
    }
    
    // Get the pool details from Stellar
    const stellarPoolDetails = await getLiquidityPoolDetails(poolId);
    
    // Update the pool record with the latest statistics
    poolRecord.totalLiquidity = parseFloat(stellarPoolDetails.total_shares);
    poolRecord.updatedAt = Date.now();
    
    await poolRecord.save();
    return poolRecord;
  } catch (error) {
    console.error(`Error updating pool stats for ${poolId}:`, error);
    throw new Error(`Failed to update pool stats: ${error.message}`);
  }
};

/**
 * Get exchange rate for a corridor
 * @param {string} corridor - The remittance corridor (e.g., "USD-MXN")
 * @returns {Promise<number>} Exchange rate
 */
const getExchangeRate = async (corridor) => {
  try {
    const poolDetails = await getPoolByCorridorWithDetails(corridor);
    
    if (!poolDetails.stellarDetails) {
      throw new Error(`No Stellar details available for corridor: ${corridor}`);
    }
    
    // Calculate exchange rate based on reserves
    const reserveA = parseFloat(poolDetails.stellarDetails.reserves[0].amount);
    const reserveB = parseFloat(poolDetails.stellarDetails.reserves[1].amount);
    
    if (reserveA === 0 || reserveB === 0) {
      throw new Error('Pool reserves are zero, cannot calculate exchange rate');
    }
    
    const exchangeRate = reserveB / reserveA;
    return exchangeRate;
  } catch (error) {
    console.error(`Error calculating exchange rate for ${corridor}:`, error);
    throw new Error(`Failed to calculate exchange rate: ${error.message}`);
  }
};

module.exports = {
  createLiquidityPool,
  getLiquidityPoolDetails,
  getAllPools,
  getPoolByCorridorWithDetails,
  createUsdMxnPool,
  updatePoolStats,
  getExchangeRate
};

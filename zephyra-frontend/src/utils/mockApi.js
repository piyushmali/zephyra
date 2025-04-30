/**
 * Mock API Service for Zephyra Demo
 * 
 * This service intercepts API calls and returns mock data for demonstration purposes.
 * It allows showcasing the entire Zephyra platform without requiring actual blockchain interactions.
 */

import mockData from './mockData';

// Mock delay to simulate network requests (in milliseconds)
const MOCK_DELAY = 500;

/**
 * Simulate API delay
 * @param {number} ms - Milliseconds to delay
 * @returns {Promise} Promise that resolves after the delay
 */
const delay = (ms = MOCK_DELAY) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Mock API service with the same interface as the real API
 */
const mockApi = {
  // Auth
  setAuthToken: () => {},

  // Pools
  getPools: async () => {
    await delay();
    return mockData.pools;
  },

  getPoolByCorridor: async (corridor) => {
    await delay();
    return mockData.pools.find(pool => pool.corridor === corridor) || null;
  },

  // Remittances
  getExchangeRate: async (sourceAsset, destinationAsset) => {
    await delay();
    const pool = mockData.pools.find(p => 
      p.assets.includes(sourceAsset) && p.assets.includes(destinationAsset)
    );
    
    if (!pool) {
      throw new Error(`No exchange rate found for ${sourceAsset}-${destinationAsset}`);
    }
    
    return {
      sourceAsset,
      destinationAsset,
      exchangeRate: pool.exchangeRate,
      fee: pool.feePercentage,
      timestamp: new Date().toISOString()
    };
  },

  createRemittance: async (remittanceData) => {
    await delay();
    const { sourceAsset, destinationAsset, amount } = remittanceData;
    
    // Find exchange rate
    const pool = mockData.pools.find(p => 
      p.assets.includes(sourceAsset) && p.assets.includes(destinationAsset)
    );
    
    if (!pool) {
      throw new Error(`No exchange rate found for ${sourceAsset}-${destinationAsset}`);
    }
    
    return {
      transactionId: mockData.generateTransactionId(),
      xdr: mockData.generateTransactionXdr(),
      sourceAsset,
      destinationAsset,
      sourceAmount: amount,
      destinationAmount: amount * pool.exchangeRate,
      exchangeRate: pool.exchangeRate,
      fee: amount * (pool.feePercentage / 100),
      timestamp: new Date().toISOString()
    };
  },

  submitRemittance: async (xdr, transactionId) => {
    await delay(1000); // Longer delay to simulate blockchain transaction
    
    return {
      success: true,
      transactionId,
      status: 'completed',
      stellarTxHash: 'mock_' + Math.random().toString(36).substring(2, 15),
      timestamp: new Date().toISOString()
    };
  },

  // Savings
  getPlatformSavings: async () => {
    await delay();
    return {
      totalSaved: 825000,
      totalUsers: 1250,
      averageSavingsPerUser: 660,
      savingsGrowth: 15.2 // percentage growth
    };
  },

  getUserSavings: async (publicKey) => {
    await delay();
    return mockData.savings;
  },

  getSavingsComparison: async (publicKey, comparisonType = 'traditional') => {
    await delay();
    return {
      zephyraCost: 1250.45,
      comparisonCost: 1576.20,
      savings: 325.75,
      savingsPercentage: 20.7,
      comparisonType
    };
  },

  getSavingsProjection: async (publicKey, months = 12) => {
    await delay();
    return {
      currentSavings: 1250.45,
      projectedSavings: 2500.90,
      monthlyData: [...mockData.savings.monthlySavings, ...mockData.savings.projection]
    };
  },

  // Transactions
  getUserTransactions: async (publicKey, options = {}) => {
    await delay();
    
    let transactions = [...mockData.transactions];
    
    // Apply filters if provided
    if (options.status) {
      transactions = transactions.filter(tx => tx.status === options.status);
    }
    
    if (options.corridor) {
      transactions = transactions.filter(tx => `${tx.sourceAsset}-${tx.destinationAsset}` === options.corridor);
    }
    
    if (options.startDate) {
      const startDate = new Date(options.startDate);
      transactions = transactions.filter(tx => new Date(tx.timestamp) >= startDate);
    }
    
    if (options.endDate) {
      const endDate = new Date(options.endDate);
      transactions = transactions.filter(tx => new Date(tx.timestamp) <= endDate);
    }
    
    // Apply pagination
    const page = options.page || 1;
    const limit = options.limit || 10;
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedTransactions = transactions.slice(start, end);
    
    return {
      transactions: paginatedTransactions,
      pagination: {
        total: transactions.length,
        page,
        limit,
        pages: Math.ceil(transactions.length / limit)
      }
    };
  },

  getTransactionById: async (transactionId) => {
    await delay();
    const transaction = mockData.transactions.find(tx => tx.id === transactionId);
    
    if (!transaction) {
      throw new Error(`Transaction with ID ${transactionId} not found`);
    }
    
    return transaction;
  },

  getTransactionStats: async (publicKey, period = 'month') => {
    await delay();
    return {
      totalTransactions: 5,
      totalVolume: 1000,
      averageAmount: 200,
      totalSavings: 204.60,
      mostUsedCorridor: 'USD-MXN',
      period
    };
  },

  // User
  registerUser: async (publicKey, userData = {}) => {
    await delay();
    return {
      publicKey,
      registered: true,
      ...userData,
      createdAt: new Date().toISOString()
    };
  },

  updateUserProfile: async (publicKey, userData) => {
    await delay();
    return {
      publicKey,
      ...userData,
      updatedAt: new Date().toISOString()
    };
  },

  getUserProfile: async (publicKey) => {
    await delay();
    return {
      publicKey,
      alias: 'Demo User',
      email: 'demo@zephyra.com',
      preferences: {
        defaultCorridor: 'USD-MXN',
        notificationsEnabled: true
      },
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(), // 30 days ago
      updatedAt: new Date().toISOString()
    };
  },

  // Liquidity
  addLiquidity: async (liquidityData) => {
    await delay(1000); // Longer delay to simulate blockchain transaction
    
    const { corridor, asset, amount } = liquidityData;
    
    return {
      success: true,
      transactionId: mockData.generateTransactionId(),
      xdr: mockData.generateTransactionXdr(),
      corridor,
      asset,
      amount,
      timestamp: new Date().toISOString()
    };
  },

  removeLiquidity: async (liquidityData) => {
    await delay(1000); // Longer delay to simulate blockchain transaction
    
    const { corridor, asset, amount } = liquidityData;
    
    return {
      success: true,
      transactionId: mockData.generateTransactionId(),
      xdr: mockData.generateTransactionXdr(),
      corridor,
      asset,
      amount,
      timestamp: new Date().toISOString()
    };
  },

  getUserLiquidityPositions: async (publicKey) => {
    await delay();
    return mockData.liquidityPositions;
  },

  // Platform
  getPlatformStatus: async () => {
    await delay();
    return mockData.platformStatus;
  },

  getSupportedAssets: async () => {
    await delay();
    return mockData.supportedAssets;
  }
};

export default mockApi;

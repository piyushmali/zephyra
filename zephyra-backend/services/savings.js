/**
 * Savings Service for Zephyra
 * 
 * This service calculates savings compared to traditional remittance services
 * for the Zephyra Stellar Testnet remittance platform.
 */

const Transaction = require('../models/Transaction');

// Average fees for traditional remittance services (in percentage)
const TRADITIONAL_FEES = {
  'USD-MXN': 4.5,  // 4.5% average fee for USD to MXN
  'USD-EUR': 3.8,  // 3.8% average fee for USD to EUR
  'USD-PHP': 5.2,  // 5.2% average fee for USD to PHP
  'EUR-NGN': 6.1,  // 6.1% average fee for EUR to NGN
  'default': 5.0   // Default fee for other corridors
};

// Zephyra platform fee (in percentage)
const ZEPHYRA_FEE = 0.5; // 0.5% fee

/**
 * Calculate savings for a single transaction
 * @param {Object} transaction - Transaction object
 * @returns {Object} Savings information
 */
const calculateTransactionSavings = (transaction) => {
  const { amount, corridor } = transaction;
  
  // Get the traditional fee percentage for this corridor
  const traditionalFeePercent = TRADITIONAL_FEES[corridor] || TRADITIONAL_FEES.default;
  
  // Calculate fees
  const traditionalFee = amount * (traditionalFeePercent / 100);
  const zephyraFee = amount * (ZEPHYRA_FEE / 100);
  
  // Calculate savings
  const savings = traditionalFee - zephyraFee;
  const savingsPercent = (savings / traditionalFee) * 100;
  
  return {
    transaction,
    traditionalFee,
    zephyraFee,
    savings,
    savingsPercent,
    traditionalFeePercent,
    zephyraFeePercent: ZEPHYRA_FEE
  };
};

/**
 * Get total savings for a user
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Total savings information
 */
const getUserSavings = async (userId) => {
  try {
    // Get all completed transactions for the user
    const transactions = await Transaction.find({
      userId,
      status: 'completed'
    });
    
    if (transactions.length === 0) {
      return {
        totalAmount: 0,
        totalTraditionalFees: 0,
        totalZephyraFees: 0,
        totalSavings: 0,
        averageSavingsPercent: 0,
        transactionCount: 0
      };
    }
    
    // Calculate savings for each transaction
    const savingsDetails = transactions.map(calculateTransactionSavings);
    
    // Calculate totals
    const totalAmount = transactions.reduce((sum, tx) => sum + tx.amount, 0);
    const totalTraditionalFees = savingsDetails.reduce((sum, detail) => sum + detail.traditionalFee, 0);
    const totalZephyraFees = savingsDetails.reduce((sum, detail) => sum + detail.zephyraFee, 0);
    const totalSavings = savingsDetails.reduce((sum, detail) => sum + detail.savings, 0);
    
    // Calculate average savings percentage
    const averageSavingsPercent = (totalSavings / totalTraditionalFees) * 100;
    
    return {
      totalAmount,
      totalTraditionalFees,
      totalZephyraFees,
      totalSavings,
      averageSavingsPercent,
      transactionCount: transactions.length,
      transactions: savingsDetails
    };
  } catch (error) {
    console.error('Error calculating user savings:', error);
    throw new Error(`Failed to calculate user savings: ${error.message}`);
  }
};

/**
 * Get platform-wide savings statistics
 * @returns {Promise<Object>} Platform savings information
 */
const getPlatformSavings = async () => {
  try {
    // Get all completed transactions
    const transactions = await Transaction.find({
      status: 'completed'
    });
    
    if (transactions.length === 0) {
      return {
        totalAmount: 0,
        totalTraditionalFees: 0,
        totalZephyraFees: 0,
        totalSavings: 0,
        averageSavingsPercent: 0,
        transactionCount: 0,
        corridorStats: {}
      };
    }
    
    // Calculate savings for each transaction
    const savingsDetails = transactions.map(calculateTransactionSavings);
    
    // Calculate totals
    const totalAmount = transactions.reduce((sum, tx) => sum + tx.amount, 0);
    const totalTraditionalFees = savingsDetails.reduce((sum, detail) => sum + detail.traditionalFee, 0);
    const totalZephyraFees = savingsDetails.reduce((sum, detail) => sum + detail.zephyraFee, 0);
    const totalSavings = savingsDetails.reduce((sum, detail) => sum + detail.savings, 0);
    
    // Calculate average savings percentage
    const averageSavingsPercent = (totalSavings / totalTraditionalFees) * 100;
    
    // Calculate corridor statistics
    const corridorStats = {};
    transactions.forEach(tx => {
      if (!corridorStats[tx.corridor]) {
        corridorStats[tx.corridor] = {
          count: 0,
          totalAmount: 0,
          totalSavings: 0
        };
      }
      
      const savings = calculateTransactionSavings(tx);
      corridorStats[tx.corridor].count += 1;
      corridorStats[tx.corridor].totalAmount += tx.amount;
      corridorStats[tx.corridor].totalSavings += savings.savings;
    });
    
    return {
      totalAmount,
      totalTraditionalFees,
      totalZephyraFees,
      totalSavings,
      averageSavingsPercent,
      transactionCount: transactions.length,
      corridorStats
    };
  } catch (error) {
    console.error('Error calculating platform savings:', error);
    throw new Error(`Failed to calculate platform savings: ${error.message}`);
  }
};

module.exports = {
  calculateTransactionSavings,
  getUserSavings,
  getPlatformSavings,
  TRADITIONAL_FEES,
  ZEPHYRA_FEE
};

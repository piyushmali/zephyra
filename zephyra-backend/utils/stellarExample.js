/**
 * Example usage of Stellar utility functions
 * This file demonstrates how to use the Stellar utility functions in the Zephyra platform
 */

const stellarUtils = require('./stellar');

// Example function to demonstrate getting account balances
const checkAccountBalance = async (publicKey) => {
  try {
    console.log(`Checking balance for account: ${publicKey}`);
    
    // First check if the account exists
    const exists = await stellarUtils.accountExists(publicKey);
    if (!exists) {
      console.log(`Account ${publicKey} does not exist on the Stellar network`);
      return;
    }
    
    // Get all balances for the account
    const balances = await stellarUtils.getAccountBalances(publicKey);
    console.log('Account balances:');
    balances.forEach(balance => {
      if (balance.asset_type === 'native') {
        console.log(`XLM: ${balance.balance}`);
      } else {
        console.log(`${balance.asset_code}: ${balance.balance} (Issuer: ${balance.asset_issuer})`);
      }
    });
    
    // Get specific XLM balance
    const xlmBalance = await stellarUtils.getAssetBalance(publicKey, 'XLM');
    console.log(`XLM Balance: ${xlmBalance}`);
    
    return balances;
  } catch (error) {
    console.error('Error checking account balance:', error.message);
    throw error;
  }
};

// Example function to demonstrate getting account operations
const getRecentOperations = async (publicKey, limit = 10) => {
  try {
    console.log(`Getting recent operations for account: ${publicKey}`);
    
    const operations = await stellarUtils.getAccountOperations(publicKey, { limit, order: 'desc' });
    console.log(`Found ${operations.length} recent operations`);
    
    operations.forEach((op, index) => {
      console.log(`Operation ${index + 1}:`);
      console.log(`  Type: ${op.type}`);
      console.log(`  Created at: ${op.created_at}`);
      console.log(`  Transaction hash: ${op.transaction_hash}`);
    });
    
    return operations;
  } catch (error) {
    console.error('Error getting recent operations:', error.message);
    throw error;
  }
};

// Example usage with a test account on Stellar Testnet
const runExample = async () => {
  try {
    // Replace with a valid Stellar Testnet account public key
    const testPublicKey = 'GBZH7S5NC57XNHKHJ75C5DGMI3SP6ZFJLIKW74K6OSMA5E5DFMYBDD2Z';
    
    // Check account balance
    await checkAccountBalance(testPublicKey);
    
    // Get recent operations
    await getRecentOperations(testPublicKey, 5);
    
  } catch (error) {
    console.error('Error running example:', error.message);
  }
};

// Uncomment to run the example
// runExample();

module.exports = {
  checkAccountBalance,
  getRecentOperations,
  runExample
};

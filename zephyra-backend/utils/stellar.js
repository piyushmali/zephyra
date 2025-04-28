/**
 * Stellar Utility Functions for Zephyra
 * 
 * This module provides utility functions for interacting with the Stellar network
 * using the Stellar SDK. It includes functions for connecting to the Testnet Horizon
 * server, querying account balances, and performing other Stellar-related operations.
 */

const StellarSdk = require('@stellar/stellar-sdk');
require('dotenv').config();

// Configure Stellar network connection
const HORIZON_URL = process.env.HORIZON_URL || 'https://horizon-testnet.stellar.org';
const NETWORK_PASSPHRASE = process.env.STELLAR_NETWORK === 'PUBLIC' 
  ? StellarSdk.Networks.PUBLIC 
  : StellarSdk.Networks.TESTNET;

/**
 * Get a configured Stellar Server instance
 * @returns {StellarSdk.Server} Configured Stellar Server instance
 */
const getServer = () => {
  return new StellarSdk.Server(HORIZON_URL);
};

/**
 * Check if an account exists on the Stellar network
 * @param {string} publicKey - The Stellar account public key
 * @returns {Promise<boolean>} True if the account exists, false otherwise
 */
const accountExists = async (publicKey) => {
  try {
    const server = getServer();
    await server.loadAccount(publicKey);
    return true;
  } catch (error) {
    if (error instanceof StellarSdk.NotFoundError) {
      return false;
    }
    throw error;
  }
};

/**
 * Get account details from the Stellar network
 * @param {string} publicKey - The Stellar account public key
 * @returns {Promise<Object>} Account details
 * @throws {Error} If the account doesn't exist or there's a network error
 */
const getAccountDetails = async (publicKey) => {
  try {
    const server = getServer();
    const account = await server.loadAccount(publicKey);
    return account;
  } catch (error) {
    if (error instanceof StellarSdk.NotFoundError) {
      throw new Error(`Account ${publicKey} not found on the Stellar network`);
    }
    console.error('Error fetching account details:', error);
    throw new Error(`Failed to fetch account details: ${error.message}`);
  }
};

/**
 * Get account balances for a Stellar account
 * @param {string} publicKey - The Stellar account public key
 * @returns {Promise<Array>} Array of balance objects
 * @throws {Error} If the account doesn't exist or there's a network error
 */
const getAccountBalances = async (publicKey) => {
  try {
    const account = await getAccountDetails(publicKey);
    return account.balances;
  } catch (error) {
    throw error;
  }
};

/**
 * Get balance for a specific asset
 * @param {string} publicKey - The Stellar account public key
 * @param {string} assetCode - The asset code (e.g., 'XLM', 'USD')
 * @param {string} [issuer] - The asset issuer (not required for XLM)
 * @returns {Promise<string>} Balance amount as a string
 * @throws {Error} If the account doesn't exist, asset not found, or network error
 */
const getAssetBalance = async (publicKey, assetCode, issuer = null) => {
  try {
    const balances = await getAccountBalances(publicKey);
    
    let balance;
    if (assetCode === 'XLM' || assetCode === 'native') {
      balance = balances.find(b => b.asset_type === 'native');
    } else {
      balance = balances.find(b => 
        b.asset_code === assetCode && 
        (issuer ? b.asset_issuer === issuer : true)
      );
    }
    
    if (!balance) {
      throw new Error(`Asset ${assetCode} not found in account balances`);
    }
    
    return balance.balance;
  } catch (error) {
    throw error;
  }
};

/**
 * Create a Stellar keypair (for testing purposes)
 * @returns {Object} Object containing public and secret keys
 */
const createKeypair = () => {
  const keypair = StellarSdk.Keypair.random();
  return {
    publicKey: keypair.publicKey(),
    secretKey: keypair.secret()
  };
};

/**
 * Check if a transaction has been completed on the Stellar network
 * @param {string} transactionHash - The transaction hash
 * @returns {Promise<Object>} Transaction details if found
 * @throws {Error} If the transaction is not found or there's a network error
 */
const getTransaction = async (transactionHash) => {
  try {
    const server = getServer();
    const transaction = await server.transactions()
      .transaction(transactionHash)
      .call();
    
    return transaction;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      throw new Error(`Transaction ${transactionHash} not found on the Stellar network`);
    }
    console.error('Error fetching transaction:', error);
    throw new Error(`Failed to fetch transaction: ${error.message}`);
  }
};

/**
 * Get operations for a specific account
 * @param {string} publicKey - The Stellar account public key
 * @param {Object} options - Query options (limit, cursor, order)
 * @returns {Promise<Array>} Array of operations
 */
const getAccountOperations = async (publicKey, options = {}) => {
  try {
    const server = getServer();
    let builder = server.operations()
      .forAccount(publicKey);
    
    if (options.limit) {
      builder = builder.limit(options.limit);
    }
    
    if (options.cursor) {
      builder = builder.cursor(options.cursor);
    }
    
    if (options.order) {
      builder = builder.order(options.order);
    }
    
    const operations = await builder.call();
    return operations.records;
  } catch (error) {
    console.error('Error fetching account operations:', error);
    throw new Error(`Failed to fetch account operations: ${error.message}`);
  }
};

/**
 * Get asset information from the Stellar network
 * @param {string} assetCode - The asset code (e.g., 'USD')
 * @param {string} [issuer] - The asset issuer (optional filter)
 * @returns {Promise<Array>} Array of assets matching the criteria
 */
const getAssetInfo = async (assetCode, issuer = null) => {
  try {
    const server = getServer();
    let builder = server.assets()
      .forCode(assetCode);
    
    if (issuer) {
      builder = builder.forIssuer(issuer);
    }
    
    const assets = await builder.call();
    return assets.records;
  } catch (error) {
    console.error('Error fetching asset information:', error);
    throw new Error(`Failed to fetch asset information: ${error.message}`);
  }
};

module.exports = {
  getServer,
  accountExists,
  getAccountDetails,
  getAccountBalances,
  getAssetBalance,
  createKeypair,
  getTransaction,
  getAccountOperations,
  getAssetInfo,
  NETWORK_PASSPHRASE
};

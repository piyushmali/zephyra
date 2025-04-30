/**
 * Stellar Network Utility for Zephyra
 * 
 * This utility provides functions for interacting with the Stellar network,
 * including creating accounts, sending payments, and managing assets
 * for the Zephyra Stellar Testnet remittance platform.
 */

import StellarSdk from '@stellar/stellar-sdk';

// Configure Stellar SDK for Testnet
const server = new StellarSdk.Server('https://horizon-testnet.stellar.org');
const networkPassphrase = StellarSdk.Networks.TESTNET;

/**
 * Get account details from the Stellar network
 * @param {string} publicKey - Stellar account public key
 * @returns {Promise<Object>} Account details
 */
export const getAccountDetails = async (publicKey) => {
  try {
    const account = await server.loadAccount(publicKey);
    return account;
  } catch (error) {
    console.error('Error getting account details:', error);
    throw error;
  }
};

/**
 * Get account balances
 * @param {string} publicKey - Stellar account public key
 * @returns {Promise<Array>} Array of balance objects
 */
export const getAccountBalances = async (publicKey) => {
  try {
    const account = await getAccountDetails(publicKey);
    return account.balances;
  } catch (error) {
    console.error('Error getting account balances:', error);
    throw error;
  }
};

/**
 * Check if account exists on the Stellar network
 * @param {string} publicKey - Stellar account public key
 * @returns {Promise<boolean>} True if account exists
 */
export const accountExists = async (publicKey) => {
  try {
    await getAccountDetails(publicKey);
    return true;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return false;
    }
    throw error;
  }
};

/**
 * Create a payment transaction
 * @param {string} sourcePublicKey - Sender's public key
 * @param {string} destinationPublicKey - Recipient's public key
 * @param {string} amount - Amount to send
 * @param {string} asset - Asset to send (e.g., 'XLM', 'USD')
 * @param {string} issuer - Asset issuer (null for XLM)
 * @param {string} memo - Optional transaction memo
 * @returns {Promise<string>} Transaction XDR
 */
export const createPaymentTransaction = async (
  sourcePublicKey,
  destinationPublicKey,
  amount,
  asset = 'XLM',
  issuer = null,
  memo = null
) => {
  try {
    // Load the source account
    const sourceAccount = await server.loadAccount(sourcePublicKey);
    
    // Create a transaction builder
    const builder = new StellarSdk.TransactionBuilder(sourceAccount, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase
    });
    
    // Add memo if provided
    if (memo) {
      builder.addMemo(StellarSdk.Memo.text(memo));
    }
    
    // Create the payment operation
    let paymentOperation;
    
    if (asset === 'XLM') {
      // Native asset (XLM) payment
      paymentOperation = StellarSdk.Operation.payment({
        destination: destinationPublicKey,
        asset: StellarSdk.Asset.native(),
        amount: amount.toString()
      });
    } else {
      // Custom asset payment
      if (!issuer) {
        throw new Error('Issuer is required for non-native assets');
      }
      
      const customAsset = new StellarSdk.Asset(asset, issuer);
      
      paymentOperation = StellarSdk.Operation.payment({
        destination: destinationPublicKey,
        asset: customAsset,
        amount: amount.toString()
      });
    }
    
    // Add the payment operation to the transaction
    builder.addOperation(paymentOperation);
    
    // Build the transaction
    const transaction = builder.setTimeout(30).build();
    
    // Return the transaction XDR
    return transaction.toXDR();
  } catch (error) {
    console.error('Error creating payment transaction:', error);
    throw error;
  }
};

/**
 * Submit a signed transaction to the Stellar network
 * @param {string} signedXdr - Signed transaction XDR
 * @returns {Promise<Object>} Transaction result
 */
export const submitTransaction = async (signedXdr) => {
  try {
    // Convert XDR to transaction object
    const transaction = StellarSdk.TransactionBuilder.fromXDR(signedXdr, networkPassphrase);
    
    // Submit the transaction
    const transactionResult = await server.submitTransaction(transaction);
    return transactionResult;
  } catch (error) {
    console.error('Error submitting transaction:', error);
    
    // Extract more detailed error information
    if (error.response && error.response.data && error.response.data.extras) {
      const resultCodes = error.response.data.extras.result_codes;
      throw new Error(`Transaction failed: ${JSON.stringify(resultCodes)}`);
    }
    
    throw error;
  }
};

/**
 * Create a trustline for an asset
 * @param {string} publicKey - Account public key
 * @param {string} assetCode - Asset code
 * @param {string} issuerPublicKey - Asset issuer public key
 * @param {string} limit - Optional trustline limit
 * @returns {Promise<string>} Transaction XDR
 */
export const createTrustlineTransaction = async (
  publicKey,
  assetCode,
  issuerPublicKey,
  limit = null
) => {
  try {
    // Load the account
    const account = await server.loadAccount(publicKey);
    
    // Create the asset
    const asset = new StellarSdk.Asset(assetCode, issuerPublicKey);
    
    // Create a transaction builder
    const builder = new StellarSdk.TransactionBuilder(account, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase
    });
    
    // Create the change trust operation
    const changeTrustOperation = StellarSdk.Operation.changeTrust({
      asset,
      limit: limit || '1000000000' // Default to a high limit if not specified
    });
    
    // Add the operation to the transaction
    builder.addOperation(changeTrustOperation);
    
    // Build the transaction
    const transaction = builder.setTimeout(30).build();
    
    // Return the transaction XDR
    return transaction.toXDR();
  } catch (error) {
    console.error('Error creating trustline transaction:', error);
    throw error;
  }
};

/**
 * Check if an account has a trustline for an asset
 * @param {string} publicKey - Account public key
 * @param {string} assetCode - Asset code
 * @param {string} issuerPublicKey - Asset issuer public key
 * @returns {Promise<boolean>} True if trustline exists
 */
export const hasTrustline = async (publicKey, assetCode, issuerPublicKey) => {
  try {
    const account = await getAccountDetails(publicKey);
    
    // Check if the account has a trustline for the asset
    return account.balances.some(balance => 
      balance.asset_type !== 'native' && 
      balance.asset_code === assetCode && 
      balance.asset_issuer === issuerPublicKey
    );
  } catch (error) {
    console.error('Error checking trustline:', error);
    throw error;
  }
};

/**
 * Get transaction history for an account
 * @param {string} publicKey - Account public key
 * @param {number} limit - Maximum number of transactions to return
 * @returns {Promise<Array>} Array of transactions
 */
export const getTransactionHistory = async (publicKey, limit = 10) => {
  try {
    const transactions = await server
      .transactions()
      .forAccount(publicKey)
      .limit(limit)
      .order('desc')
      .call();
    
    return transactions.records;
  } catch (error) {
    console.error('Error getting transaction history:', error);
    throw error;
  }
};

/**
 * Get payment history for an account
 * @param {string} publicKey - Account public key
 * @param {number} limit - Maximum number of payments to return
 * @returns {Promise<Array>} Array of payments
 */
export const getPaymentHistory = async (publicKey, limit = 10) => {
  try {
    const payments = await server
      .payments()
      .forAccount(publicKey)
      .limit(limit)
      .order('desc')
      .call();
    
    return payments.records;
  } catch (error) {
    console.error('Error getting payment history:', error);
    throw error;
  }
};

/**
 * Get current exchange rate between two assets
 * @param {string} sourceAsset - Source asset code
 * @param {string} sourceIssuer - Source asset issuer (null for XLM)
 * @param {string} destinationAsset - Destination asset code
 * @param {string} destinationIssuer - Destination asset issuer (null for XLM)
 * @returns {Promise<number>} Exchange rate
 */
export const getExchangeRate = async (
  sourceAsset,
  sourceIssuer,
  destinationAsset,
  destinationIssuer
) => {
  try {
    // Create asset objects
    const sellAsset = sourceAsset === 'XLM' 
      ? StellarSdk.Asset.native() 
      : new StellarSdk.Asset(sourceAsset, sourceIssuer);
    
    const buyAsset = destinationAsset === 'XLM'
      ? StellarSdk.Asset.native()
      : new StellarSdk.Asset(destinationAsset, destinationIssuer);
    
    // Get orderbook to determine exchange rate
    const orderbook = await server.orderbook(sellAsset, buyAsset).call();
    
    // If there are no offers, we can't determine the exchange rate
    if (!orderbook.asks.length && !orderbook.bids.length) {
      throw new Error('No offers found for this asset pair');
    }
    
    // Calculate exchange rate from the orderbook
    // We'll use the best ask price as the exchange rate
    if (orderbook.asks.length) {
      return parseFloat(orderbook.asks[0].price);
    } else {
      // If no asks, use the inverse of the best bid price
      return 1 / parseFloat(orderbook.bids[0].price);
    }
  } catch (error) {
    console.error('Error getting exchange rate:', error);
    throw error;
  }
};

export default {
  getAccountDetails,
  getAccountBalances,
  accountExists,
  createPaymentTransaction,
  submitTransaction,
  createTrustlineTransaction,
  hasTrustline,
  getTransactionHistory,
  getPaymentHistory,
  getExchangeRate,
  server,
  networkPassphrase
};

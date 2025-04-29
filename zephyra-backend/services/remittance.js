/**
 * Remittance Service for Zephyra
 * 
 * This service handles remittance operations using the Stellar network
 * for the Zephyra Stellar Testnet remittance platform.
 */

const StellarSdk = require('@stellar/stellar-sdk');
const stellarUtils = require('../utils/stellar');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const Pool = require('../models/Pool');

/**
 * Create a remittance transaction
 * @param {Object} remittanceData - Data for the remittance
 * @param {string} remittanceData.sourceAsset - Source asset code
 * @param {string} remittanceData.destinationAsset - Destination asset code
 * @param {number} remittanceData.amount - Amount to send
 * @param {string} remittanceData.destinationAddress - Recipient's Stellar address
 * @param {string} remittanceData.senderPublicKey - Sender's Stellar public key
 * @param {string} [remittanceData.memo] - Optional memo for the transaction
 * @returns {Promise<Object>} Transaction details including XDR
 */
const createRemittance = async (remittanceData) => {
  try {
    const {
      sourceAsset,
      destinationAsset,
      amount,
      destinationAddress,
      senderPublicKey,
      memo
    } = remittanceData;

    // Determine the corridor
    const corridor = `${sourceAsset}-${destinationAsset}`;

    // Check if sender exists in the database
    let sender = await User.findOne({ publicKey: senderPublicKey });
    if (!sender) {
      // Create a new user record
      sender = new User({
        publicKey: senderPublicKey
      });
      await sender.save();
    }

    // Check if the pool exists for this corridor
    const pool = await Pool.findOne({ corridor });
    if (!pool) {
      throw new Error(`No liquidity pool found for corridor: ${corridor}`);
    }

    // Get the Stellar server instance
    const server = stellarUtils.getServer();
    
    // Load the sender's account
    const senderAccount = await server.loadAccount(senderPublicKey);

    // Create a transaction builder
    const transaction = new StellarSdk.TransactionBuilder(senderAccount, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: stellarUtils.NETWORK_PASSPHRASE
    });

    // Add memo if provided
    if (memo) {
      transaction.addMemo(StellarSdk.Memo.text(memo));
    }

    // Define the assets
    let sourceAssetObj, destinationAssetObj;
    
    // For simplicity, we're using the sender as the asset issuer for custom assets
    // In a real application, you would use actual asset issuers from Stellar
    if (sourceAsset === 'XLM' || sourceAsset === 'native') {
      sourceAssetObj = StellarSdk.Asset.native();
    } else {
      sourceAssetObj = new StellarSdk.Asset(sourceAsset, senderPublicKey);
    }
    
    if (destinationAsset === 'XLM' || destinationAsset === 'native') {
      destinationAssetObj = StellarSdk.Asset.native();
    } else {
      destinationAssetObj = new StellarSdk.Asset(destinationAsset, senderPublicKey);
    }

    // Add path payment operation
    transaction.addOperation(
      StellarSdk.Operation.pathPaymentStrictSend({
        sendAsset: sourceAssetObj,
        sendAmount: amount.toString(),
        destination: destinationAddress,
        destAsset: destinationAssetObj,
        destMin: '0', // The minimum amount to receive, should be calculated based on exchange rate
        path: [] // Let Stellar find the best path
      })
    );

    // Build the transaction
    const builtTransaction = transaction.setTimeout(30).build();
    
    // Get the XDR representation of the transaction
    const xdr = builtTransaction.toXDR();

    // Create a transaction record in the database
    const transactionRecord = new Transaction({
      userId: sender._id,
      amount: parseFloat(amount),
      corridor,
      sourceAsset,
      destinationAsset,
      status: 'pending'
    });
    
    await transactionRecord.save();

    return {
      transaction: transactionRecord,
      xdr,
      stellarTransaction: builtTransaction
    };
  } catch (error) {
    console.error('Error creating remittance:', error);
    throw new Error(`Failed to create remittance: ${error.message}`);
  }
};

/**
 * Submit a signed transaction to the Stellar network
 * @param {string} signedXdr - Signed transaction XDR
 * @param {string} transactionId - Database transaction ID
 * @returns {Promise<Object>} Transaction result
 */
const submitRemittanceTransaction = async (signedXdr, transactionId) => {
  try {
    // Get the transaction record from the database
    const transactionRecord = await Transaction.findById(transactionId);
    if (!transactionRecord) {
      throw new Error(`Transaction not found with ID: ${transactionId}`);
    }

    // Update transaction status
    transactionRecord.status = 'processing';
    await transactionRecord.save();

    // Get the Stellar server instance
    const server = stellarUtils.getServer();
    
    // Convert the XDR to a transaction object
    const transaction = StellarSdk.TransactionBuilder.fromXDR(
      signedXdr,
      stellarUtils.NETWORK_PASSPHRASE
    );

    // Submit the transaction to the Stellar network
    const transactionResult = await server.submitTransaction(transaction);

    // Update the transaction record with the Stellar transaction hash
    transactionRecord.stellarTxHash = transactionResult.hash;
    transactionRecord.status = 'completed';
    await transactionRecord.save();

    return {
      transaction: transactionRecord,
      stellarResult: transactionResult
    };
  } catch (error) {
    console.error('Error submitting remittance transaction:', error);
    
    // Update the transaction record with the error
    if (transactionId) {
      try {
        const transactionRecord = await Transaction.findById(transactionId);
        if (transactionRecord) {
          transactionRecord.status = 'failed';
          await transactionRecord.save();
        }
      } catch (dbError) {
        console.error('Error updating transaction status:', dbError);
      }
    }
    
    throw new Error(`Failed to submit remittance transaction: ${error.message}`);
  }
};

/**
 * Get exchange rate for a remittance corridor
 * @param {string} sourceAsset - Source asset code
 * @param {string} destinationAsset - Destination asset code
 * @returns {Promise<number>} Exchange rate
 */
const getExchangeRate = async (sourceAsset, destinationAsset) => {
  try {
    const corridor = `${sourceAsset}-${destinationAsset}`;
    
    // Check if the pool exists for this corridor
    const pool = await Pool.findOne({ corridor });
    if (!pool) {
      throw new Error(`No liquidity pool found for corridor: ${corridor}`);
    }
    
    // Get the Stellar server instance
    const server = stellarUtils.getServer();
    
    // Get the liquidity pool details using the correct method for Stellar SDK v11.0.1
    const liquidityPoolResponse = await server.liquidityPools()
      .liquidityPoolId(pool.stellarPoolId)
      .call();
    
    const liquidityPool = liquidityPoolResponse;
    
    // Calculate exchange rate based on reserves
    const reserveA = parseFloat(liquidityPool.reserves[0].amount);
    const reserveB = parseFloat(liquidityPool.reserves[1].amount);
    
    if (reserveA === 0 || reserveB === 0) {
      throw new Error('Pool reserves are zero, cannot calculate exchange rate');
    }
    
    // The exchange rate depends on which asset is the source and which is the destination
    let exchangeRate;
    if (liquidityPool.reserves[0].asset === sourceAsset) {
      exchangeRate = reserveB / reserveA;
    } else {
      exchangeRate = reserveA / reserveB;
    }
    
    return exchangeRate;
  } catch (error) {
    console.error('Error getting exchange rate:', error);
    throw new Error(`Failed to get exchange rate: ${error.message}`);
  }
};

module.exports = {
  createRemittance,
  submitRemittanceTransaction,
  getExchangeRate
};

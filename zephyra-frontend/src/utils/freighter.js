/**
 * Freighter Wallet Utility for Zephyra
 * 
 * This utility provides functions for interacting with the Freighter wallet extension,
 * including connecting to the wallet, checking connection status, and signing transactions
 * for the Zephyra Stellar Testnet remittance platform.
 */

import {
  isConnected,
  getPublicKey,
  signTransaction,
  getNetwork,
  setNetwork,
  TESTNET,
  MAINNET,
  ERROR_TYPES
} from '@stellar/freighter-api';

/**
 * Check if Freighter extension is installed
 * @returns {boolean} True if Freighter is installed
 */
export const isFreighterInstalled = () => {
  return typeof window !== 'undefined' && !!window.freighter;
};

/**
 * Check if user is connected to Freighter
 * @returns {Promise<boolean>} True if connected to Freighter
 */
export const checkFreighterConnection = async () => {
  try {
    if (!isFreighterInstalled()) {
      throw new Error('Freighter extension is not installed');
    }
    return await isConnected();
  } catch (error) {
    console.error('Error checking Freighter connection:', error);
    return false;
  }
};

/**
 * Connect to Freighter wallet and get public key
 * @returns {Promise<string>} Stellar public key
 * @throws {Error} If connection fails or user rejects
 */
export const connectWallet = async () => {
  try {
    if (!isFreighterInstalled()) {
      throw new Error('Freighter extension is not installed. Please install Freighter to continue.');
    }

    // Check if already connected
    const connected = await isConnected();
    if (!connected) {
      throw new Error('Please unlock your Freighter wallet and try again.');
    }

    // Ensure we're on the TESTNET
    await setNetworkToTestnet();

    // Get the public key
    const publicKey = await getPublicKey();
    if (!publicKey) {
      throw new Error('Failed to get public key from Freighter.');
    }

    return publicKey;
  } catch (error) {
    console.error('Error connecting to Freighter wallet:', error);
    
    // Handle specific error types
    if (error.message && error.message.includes('User rejected')) {
      throw new Error('Connection rejected. Please approve the connection request in Freighter.');
    }
    
    throw error;
  }
};

/**
 * Set Freighter network to Testnet
 * @returns {Promise<string>} Current network after setting
 */
export const setNetworkToTestnet = async () => {
  try {
    await setNetwork(TESTNET);
    const currentNetwork = await getNetwork();
    
    if (currentNetwork !== TESTNET) {
      throw new Error('Failed to set network to Testnet. Please set it manually in Freighter.');
    }
    
    return currentNetwork;
  } catch (error) {
    console.error('Error setting network to Testnet:', error);
    throw error;
  }
};

/**
 * Sign a transaction with Freighter
 * @param {string} xdr - XDR representation of the transaction
 * @param {Object} options - Optional parameters (network, accountToSign)
 * @returns {Promise<string>} Signed transaction XDR
 * @throws {Error} If signing fails or user rejects
 */
export const signStellarTransaction = async (xdr, options = {}) => {
  try {
    if (!isFreighterInstalled()) {
      throw new Error('Freighter extension is not installed');
    }

    // Default to TESTNET if not specified
    const network = options.network || TESTNET;
    
    // Ensure we're on the correct network
    const currentNetwork = await getNetwork();
    if (currentNetwork !== network) {
      await setNetwork(network);
    }

    // Sign the transaction
    const signedXDR = await signTransaction(xdr, options);
    return signedXDR;
  } catch (error) {
    console.error('Error signing transaction:', error);
    
    // Handle specific error types
    if (error.type === ERROR_TYPES.REJECTED) {
      throw new Error('Transaction signing rejected by user');
    } else if (error.type === ERROR_TYPES.TIMEOUT) {
      throw new Error('Transaction signing timed out');
    }
    
    throw error;
  }
};

/**
 * Get account details from Freighter
 * @returns {Promise<Object>} Account details including publicKey and network
 */
export const getFreighterAccountDetails = async () => {
  try {
    if (!await checkFreighterConnection()) {
      throw new Error('Not connected to Freighter');
    }
    
    const publicKey = await getPublicKey();
    const network = await getNetwork();
    
    return {
      publicKey,
      network,
      isTestnet: network === TESTNET,
      isMainnet: network === MAINNET
    };
  } catch (error) {
    console.error('Error getting Freighter account details:', error);
    throw error;
  }
};

/**
 * Disconnect from Freighter (for UI state management only)
 * Note: Freighter doesn't have an actual disconnect method,
 * this is for application state management
 * @returns {Promise<void>}
 */
export const disconnectWallet = async () => {
  // Freighter doesn't have a disconnect method
  // This is just for application state management
  return Promise.resolve();
};

export default {
  isFreighterInstalled,
  checkFreighterConnection,
  connectWallet,
  setNetworkToTestnet,
  signStellarTransaction,
  getFreighterAccountDetails,
  disconnectWallet,
  TESTNET,
  MAINNET
};

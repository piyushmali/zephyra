/**
 * API Utility for Zephyra
 * 
 * This utility provides functions for making API calls to the Zephyra backend
 * using Axios for the Zephyra Stellar Testnet remittance platform.
 */

import axios from 'axios';

// Base URL for API calls
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * Set authorization token for API calls
 * @param {string} token - JWT token
 */
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['x-auth-token'] = token;
  } else {
    delete api.defaults.headers.common['x-auth-token'];
  }
};

/**
 * Get all liquidity pools
 * @returns {Promise<Array>} Array of pools
 */
export const getPools = async () => {
  try {
    const response = await api.get('/pools');
    return response.data;
  } catch (error) {
    console.error('Error fetching pools:', error);
    throw error;
  }
};

/**
 * Get pool by corridor
 * @param {string} corridor - Remittance corridor (e.g., "USD-MXN")
 * @returns {Promise<Object>} Pool details
 */
export const getPoolByCorridor = async (corridor) => {
  try {
    const response = await api.get(`/pools/${corridor}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching pool for corridor ${corridor}:`, error);
    throw error;
  }
};

/**
 * Get exchange rate for a corridor
 * @param {string} sourceAsset - Source asset code
 * @param {string} destinationAsset - Destination asset code
 * @returns {Promise<Object>} Exchange rate details
 */
export const getExchangeRate = async (sourceAsset, destinationAsset) => {
  try {
    const response = await api.get(`/remittances/rate?sourceAsset=${sourceAsset}&destinationAsset=${destinationAsset}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching exchange rate:', error);
    throw error;
  }
};

/**
 * Create a remittance transaction
 * @param {Object} remittanceData - Remittance data
 * @returns {Promise<Object>} Transaction details with XDR
 */
export const createRemittance = async (remittanceData) => {
  try {
    const response = await api.post('/remittances', remittanceData);
    return response.data;
  } catch (error) {
    console.error('Error creating remittance:', error);
    throw error;
  }
};

/**
 * Submit a signed remittance transaction
 * @param {string} xdr - Signed transaction XDR
 * @param {string} transactionId - Transaction ID
 * @returns {Promise<Object>} Transaction result
 */
export const submitRemittance = async (xdr, transactionId) => {
  try {
    const response = await api.post('/remittances/submit', { xdr, transactionId });
    return response.data;
  } catch (error) {
    console.error('Error submitting remittance:', error);
    throw error;
  }
};

/**
 * Get platform-wide savings statistics
 * @returns {Promise<Object>} Savings statistics
 */
export const getPlatformSavings = async () => {
  try {
    const response = await api.get('/savings');
    return response.data;
  } catch (error) {
    console.error('Error fetching platform savings:', error);
    throw error;
  }
};

/**
 * Get user savings statistics
 * @param {string} publicKey - User's Stellar public key
 * @returns {Promise<Object>} User savings statistics
 */
export const getUserSavings = async (publicKey) => {
  try {
    const response = await api.get(`/savings/user/${publicKey}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user savings:', error);
    throw error;
  }
};

/**
 * Get user transactions
 * @param {string} publicKey - User's Stellar public key
 * @returns {Promise<Array>} Array of transactions
 */
export const getUserTransactions = async (publicKey) => {
  try {
    const response = await api.get(`/transactions/user/${publicKey}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user transactions:', error);
    throw error;
  }
};

/**
 * Register a new user
 * @param {string} publicKey - User's Stellar public key
 * @param {string} alias - User's alias (optional)
 * @returns {Promise<Object>} User details
 */
export const registerUser = async (publicKey, alias) => {
  try {
    const response = await api.post('/users', { publicKey, alias });
    return response.data;
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
};

export default {
  setAuthToken,
  getPools,
  getPoolByCorridor,
  getExchangeRate,
  createRemittance,
  submitRemittance,
  getPlatformSavings,
  getUserSavings,
  getUserTransactions,
  registerUser
};

/**
 * API Utility for Zephyra
 * 
 * This utility provides functions for making API calls to the Zephyra backend
 * using Axios for the Zephyra Stellar Testnet remittance platform.
 */

import axios from 'axios';

// Base URL for API calls - use environment variable or fallback to localhost
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Request timeout in milliseconds
const REQUEST_TIMEOUT = 30000; // 30 seconds

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: REQUEST_TIMEOUT
});

// Add request interceptor for logging and request modification
api.interceptors.request.use(
  (config) => {
    // Log request (only in development)
    if (process.env.NODE_ENV === 'development') {
      console.log(`API Request: ${config.method.toUpperCase()} ${config.url}`);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Format error message based on response
    let errorMessage = 'An unexpected error occurred';
    
    if (error.response) {
      // Server responded with an error status code
      const status = error.response.status;
      const data = error.response.data;
      
      if (data && data.message) {
        errorMessage = data.message;
      } else if (status === 401) {
        errorMessage = 'Authentication required. Please reconnect your wallet.';
      } else if (status === 403) {
        errorMessage = 'You do not have permission to perform this action.';
      } else if (status === 404) {
        errorMessage = 'The requested resource was not found.';
      } else if (status === 500) {
        errorMessage = 'Server error. Please try again later.';
      } else {
        errorMessage = `Error ${status}: ${data.error || 'Unknown error'}`;
      }
    } else if (error.request) {
      // Request was made but no response received
      if (error.code === 'ECONNABORTED') {
        errorMessage = 'Request timed out. Please check your connection and try again.';
      } else {
        errorMessage = 'No response received from server. Please check your connection.';
      }
    }
    
    // Create a new error with the formatted message
    const formattedError = new Error(errorMessage);
    formattedError.originalError = error;
    formattedError.response = error.response;
    
    return Promise.reject(formattedError);
  }
);

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
 * @param {Object} options - Optional parameters
 * @param {boolean} options.includeStats - Include pool statistics
 * @param {boolean} options.includeYield - Include yield information
 * @returns {Promise<Array>} Array of pools
 */
export const getPools = async (options = {}) => {
  try {
    // Build query parameters
    const params = new URLSearchParams();
    if (options.includeStats !== undefined) params.append('includeStats', options.includeStats);
    if (options.includeYield !== undefined) params.append('includeYield', options.includeYield);
    
    const queryString = params.toString() ? `?${params.toString()}` : '';
    const response = await api.get(`/pools${queryString}`);
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
 * @param {string} period - Time period (day, week, month, year, all)
 * @returns {Promise<Object>} User savings statistics
 */
export const getUserSavings = async (publicKey, period = 'all') => {
  try {
    const response = await api.get(`/savings/user/${publicKey}?period=${period}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user savings:', error);
    throw error;
  }
};

/**
 * Get savings comparison
 * @param {string} publicKey - User's Stellar public key
 * @param {string} comparisonType - Type of comparison (traditional, average)
 * @returns {Promise<Object>} Savings comparison data
 */
export const getSavingsComparison = async (publicKey, comparisonType = 'traditional') => {
  try {
    const response = await api.get(`/savings/comparison/${publicKey}?type=${comparisonType}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching savings comparison:', error);
    throw error;
  }
};

/**
 * Get savings projection
 * @param {string} publicKey - User's Stellar public key
 * @param {number} months - Number of months to project
 * @returns {Promise<Object>} Savings projection data
 */
export const getSavingsProjection = async (publicKey, months = 12) => {
  try {
    const response = await api.get(`/savings/projection/${publicKey}?months=${months}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching savings projection:', error);
    throw error;
  }
};

/**
 * Get user transactions
 * @param {string} publicKey - User's Stellar public key
 * @param {Object} options - Optional parameters
 * @param {number} options.page - Page number for pagination
 * @param {number} options.limit - Number of transactions per page
 * @param {string} options.status - Filter by transaction status
 * @param {string} options.corridor - Filter by corridor
 * @param {string} options.startDate - Filter by start date
 * @param {string} options.endDate - Filter by end date
 * @returns {Promise<Object>} Object containing transactions array and pagination info
 */
export const getUserTransactions = async (publicKey, options = {}) => {
  try {
    // Build query parameters
    const params = new URLSearchParams();
    if (options.page) params.append('page', options.page);
    if (options.limit) params.append('limit', options.limit);
    if (options.status) params.append('status', options.status);
    if (options.corridor) params.append('corridor', options.corridor);
    if (options.startDate) params.append('startDate', options.startDate);
    if (options.endDate) params.append('endDate', options.endDate);
    
    const queryString = params.toString() ? `?${params.toString()}` : '';
    const response = await api.get(`/transactions/user/${publicKey}${queryString}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user transactions:', error);
    throw error;
  }
};

/**
 * Get transaction by ID
 * @param {string} transactionId - Transaction ID
 * @returns {Promise<Object>} Transaction details
 */
export const getTransactionById = async (transactionId) => {
  try {
    const response = await api.get(`/transactions/${transactionId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching transaction ${transactionId}:`, error);
    throw error;
  }
};

/**
 * Get transaction statistics
 * @param {string} publicKey - User's Stellar public key
 * @param {string} period - Time period (day, week, month, year)
 * @returns {Promise<Object>} Transaction statistics
 */
export const getTransactionStats = async (publicKey, period = 'month') => {
  try {
    const response = await api.get(`/transactions/stats/${publicKey}?period=${period}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching transaction statistics:', error);
    throw error;
  }
};

/**
 * Register a new user
 * @param {string} publicKey - User's Stellar public key
 * @param {Object} userData - Additional user data
 * @param {string} userData.alias - User's alias (optional)
 * @param {string} userData.email - User's email (optional)
 * @param {Object} userData.preferences - User preferences (optional)
 * @returns {Promise<Object>} User details
 */
export const registerUser = async (publicKey, userData = {}) => {
  try {
    const response = await api.post('/users', { 
      publicKey, 
      ...userData 
    });
    return response.data;
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
};

/**
 * Update user profile
 * @param {string} publicKey - User's Stellar public key
 * @param {Object} userData - User data to update
 * @returns {Promise<Object>} Updated user details
 */
export const updateUserProfile = async (publicKey, userData) => {
  try {
    const response = await api.put(`/users/${publicKey}`, userData);
    return response.data;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

/**
 * Get user profile
 * @param {string} publicKey - User's Stellar public key
 * @returns {Promise<Object>} User profile
 */
export const getUserProfile = async (publicKey) => {
  try {
    const response = await api.get(`/users/${publicKey}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

/**
 * Add liquidity to a pool
 * @param {Object} liquidityData - Liquidity data
 * @param {string} liquidityData.publicKey - User's Stellar public key
 * @param {string} liquidityData.corridor - Pool corridor
 * @param {string} liquidityData.asset - Asset code
 * @param {number} liquidityData.amount - Amount to add
 * @returns {Promise<Object>} Transaction details with XDR
 */
export const addLiquidity = async (liquidityData) => {
  try {
    const response = await api.post('/pools/liquidity/add', liquidityData);
    return response.data;
  } catch (error) {
    console.error('Error adding liquidity:', error);
    throw error;
  }
};

/**
 * Remove liquidity from a pool
 * @param {Object} liquidityData - Liquidity data
 * @param {string} liquidityData.publicKey - User's Stellar public key
 * @param {string} liquidityData.corridor - Pool corridor
 * @param {string} liquidityData.asset - Asset code
 * @param {number} liquidityData.amount - Amount to remove
 * @returns {Promise<Object>} Transaction details with XDR
 */
export const removeLiquidity = async (liquidityData) => {
  try {
    const response = await api.post('/pools/liquidity/remove', liquidityData);
    return response.data;
  } catch (error) {
    console.error('Error removing liquidity:', error);
    throw error;
  }
};

/**
 * Get user's liquidity positions
 * @param {string} publicKey - User's Stellar public key
 * @returns {Promise<Array>} Array of liquidity positions
 */
export const getUserLiquidityPositions = async (publicKey) => {
  try {
    const response = await api.get(`/pools/liquidity/user/${publicKey}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user liquidity positions:', error);
    throw error;
  }
};

/**
 * Get platform status
 * @returns {Promise<Object>} Platform status information
 */
export const getPlatformStatus = async () => {
  try {
    const response = await api.get('/status');
    return response.data;
  } catch (error) {
    console.error('Error fetching platform status:', error);
    throw error;
  }
};

/**
 * Get supported assets
 * @returns {Promise<Array>} Array of supported assets
 */
export const getSupportedAssets = async () => {
  try {
    const response = await api.get('/assets');
    return response.data;
  } catch (error) {
    console.error('Error fetching supported assets:', error);
    throw error;
  }
};

// Export all functions as a default object
export default {
  // Auth
  setAuthToken,
  
  // User management
  registerUser,
  updateUserProfile,
  getUserProfile,
  
  // Pools and liquidity
  getPools,
  getPoolByCorridor,
  addLiquidity,
  removeLiquidity,
  getUserLiquidityPositions,
  
  // Remittances
  getExchangeRate,
  createRemittance,
  submitRemittance,
  
  // Savings
  getPlatformSavings,
  getUserSavings,
  getSavingsComparison,
  getSavingsProjection,
  
  // Transactions
  getUserTransactions,
  getTransactionById,
  getTransactionStats,
  
  // Platform
  getPlatformStatus,
  getSupportedAssets
};

/**
 * Mock Freighter Wallet Service for Zephyra Demo
 * 
 * This service simulates Freighter wallet functionality for demonstration purposes.
 * It allows showcasing the entire Zephyra platform without requiring the actual Freighter extension.
 */

import mockData from './mockData';

// Mock delay to simulate wallet operations (in milliseconds)
const MOCK_DELAY = 800;

/**
 * Simulate delay
 * @param {number} ms - Milliseconds to delay
 * @returns {Promise} Promise that resolves after the delay
 */
const delay = (ms = MOCK_DELAY) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Check if Freighter is installed
 * @returns {Promise<boolean>} True if Freighter is "installed"
 */
export const isInstalled = async () => {
  await delay(300);
  return true;
};

/**
 * Check if Freighter is connected
 * @returns {Promise<boolean>} True if Freighter is "connected"
 */
export const isConnected = async () => {
  await delay();
  // For demo purposes, we'll return false initially so users can see the connect flow
  return false;
};

/**
 * Get public key from Freighter
 * @returns {Promise<string>} Stellar public key
 */
export const getPublicKey = async () => {
  await delay();
  return mockData.wallet.publicKey;
};

/**
 * Get network from Freighter
 * @returns {Promise<string>} Network (testnet/public)
 */
export const getNetwork = async () => {
  await delay(200);
  return 'TESTNET';
};

/**
 * Sign Stellar transaction with Freighter
 * @param {string} xdr - Transaction XDR
 * @returns {Promise<string>} Signed transaction XDR
 */
export const signStellarTransaction = async (xdr) => {
  await delay(1500); // Longer delay to simulate user interaction
  
  // In a real implementation, this would send the XDR to Freighter for signing
  // For demo, we'll just return a "signed" version
  return xdr + '_signed';
};

/**
 * Sign Stellar transaction with Freighter (using challenge)
 * @param {string} challenge - Challenge XDR
 * @returns {Promise<string>} Signed challenge XDR
 */
export const signAuthEntry = async (challenge) => {
  await delay(1500); // Longer delay to simulate user interaction
  return challenge + '_signed';
};

/**
 * Mock user interaction to connect wallet
 * @returns {Promise<string>} Public key
 */
export const connect = async () => {
  await delay(1200); // Simulate user clicking connect in Freighter
  return mockData.wallet.publicKey;
};

/**
 * Export all functions as a default object
 */
export default {
  isInstalled,
  isConnected,
  getPublicKey,
  getNetwork,
  signStellarTransaction,
  signAuthEntry,
  connect
};

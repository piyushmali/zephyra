/**
 * ConnectFreighterButton Component for Zephyra
 * 
 * This component provides a button for connecting to the Freighter wallet
 * in the Zephyra Stellar Testnet remittance platform.
 */

import React, { useState, useEffect } from 'react';
import freighterUtils from '../utils/freighter';
import apiUtils from '../utils/api';

/**
 * ConnectFreighterButton Component
 * @param {Object} props - Component props
 * @param {Function} props.onConnect - Callback function when wallet is connected
 * @param {boolean} props.large - Whether to display a large button
 * @param {string} props.className - Additional CSS classes
 * @returns {JSX.Element} ConnectFreighterButton component
 */
const ConnectFreighterButton = ({ onConnect, large = false, className = '' }) => {
  // State to track connection status and errors
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [publicKey, setPublicKey] = useState(null);
  const [error, setError] = useState(null);

  // Check if wallet is already connected on component mount
  useEffect(() => {
    const checkWalletConnection = async () => {
      try {
        // Check if Freighter is installed
        if (!freighterUtils.isFreighterInstalled()) {
          return;
        }
        
        // Check if wallet is connected
        const connected = await freighterUtils.checkFreighterConnection();
        if (connected) {
          const accountDetails = await freighterUtils.getFreighterAccountDetails();
          setPublicKey(accountDetails.publicKey);
          setIsConnected(true);
          
          // Register user with the backend
          try {
            await apiUtils.registerUser(accountDetails.publicKey);
          } catch (registerError) {
            console.warn('Error registering user:', registerError);
            // Non-blocking error, continue with connection
          }
          
          // Call the onConnect callback if provided
          if (onConnect) {
            onConnect(accountDetails.publicKey);
          }
        }
      } catch (err) {
        console.error('Error checking wallet connection:', err);
      }
    };

    checkWalletConnection();
  }, [onConnect]);

  /**
   * Handle wallet connection
   */
  const handleConnectWallet = async () => {
    setIsConnecting(true);
    setError(null);
    
    try {
      // Connect to Freighter wallet
      const stellarPublicKey = await freighterUtils.connectWallet();
      
      // Update state
      setPublicKey(stellarPublicKey);
      setIsConnected(true);
      
      // Register user with the backend
      try {
        await apiUtils.registerUser(stellarPublicKey);
      } catch (registerError) {
        console.warn('Error registering user:', registerError);
        // Non-blocking error, continue with connection
      }
      
      // Call the onConnect callback if provided
      if (onConnect) {
        onConnect(stellarPublicKey);
      }
    } catch (err) {
      console.error('Error connecting to wallet:', err);
      setError(err.message || 'Failed to connect to Freighter wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  // Determine button size classes based on the 'large' prop
  const sizeClasses = large 
    ? 'py-3 px-6 text-lg' 
    : 'py-2 px-4 text-sm';

  // Determine button color classes based on connection status
  const colorClasses = isConnected
    ? 'bg-green-500 hover:bg-green-600'
    : 'bg-indigo-600 hover:bg-indigo-700';

  return (
    <div className="wallet-connect-container">
      <button
        onClick={handleConnectWallet}
        disabled={isConnecting || isConnected}
        className={`rounded-md text-white font-medium transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${sizeClasses} ${colorClasses} ${className} ${isConnecting ? 'opacity-75 cursor-wait' : ''} ${isConnected ? 'cursor-default' : 'cursor-pointer'}`}
      >
        {isConnecting ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Connecting...
          </span>
        ) : isConnected ? (
          <span className="flex items-center justify-center">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
            Connected
          </span>
        ) : (
          'Connect Freighter Wallet'
        )}
      </button>
      
      {error && (
        <div className="mt-2 text-sm text-red-600">
          {error}
        </div>
      )}
      
      {publicKey && !error && (
        <div className="mt-2 text-xs text-gray-500 truncate max-w-full">
          {publicKey.substring(0, 4)}...{publicKey.substring(publicKey.length - 4)}
        </div>
      )}
    </div>
  );
};

export default ConnectFreighterButton;

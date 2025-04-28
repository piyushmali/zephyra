import React, { useState, useEffect } from 'react';
import freighterUtils from './utils/freighter';

/**
 * App Component for Zephyra - A Stellar Testnet Remittance Platform
 * 
 * This component provides the main interface for the Zephyra application,
 * featuring a Freighter wallet connection button and displaying the
 * connected wallet's public key.
 */
function App() {
  // State to store the user's public key
  const [publicKey, setPublicKey] = useState(null);
  // State to track any errors that occur during wallet connection
  const [error, setError] = useState(null);
  // State to track if wallet is connected
  const [walletConnected, setWalletConnected] = useState(false);

  // Effect to check if wallet is already connected on component mount
  useEffect(() => {
    const checkWalletConnection = async () => {
      try {
        // Check if Freighter is installed
        if (!freighterUtils.isFreighterInstalled()) {
          setError('Freighter extension is not installed. Please install Freighter to continue.');
          return;
        }
        
        // Check if Freighter is connected
        const connected = await freighterUtils.checkFreighterConnection();
        setWalletConnected(connected);
        
        // If connected, get the public key
        if (connected) {
          // Ensure we're on the Testnet
          await freighterUtils.setNetworkToTestnet();
          
          // Get account details
          const accountDetails = await freighterUtils.getFreighterAccountDetails();
          setPublicKey(accountDetails.publicKey);
        }
      } catch (err) {
        console.error('Error checking wallet connection:', err);
        setError('Failed to connect to Freighter wallet. Please make sure the extension is installed and unlocked.');
      }
    };

    checkWalletConnection();
  }, []);

  /**
   * Handles the wallet connection process
   * Attempts to retrieve the user's public key from Freighter
   */
  const handleConnectWallet = async () => {
    try {
      setError(null); // Clear any previous errors
      
      // Connect to wallet using our utility function
      const stellarPublicKey = await freighterUtils.connectWallet();
      
      // Update state with the retrieved public key
      setPublicKey(stellarPublicKey);
      setWalletConnected(true);
      
      console.log('Connected to wallet with public key:', stellarPublicKey);
    } catch (err) {
      console.error('Error connecting to wallet:', err);
      setError(err.message || 'Failed to connect to Freighter wallet');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-indigo-800 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl overflow-hidden">
        <div className="p-6">
          <h1 className="text-3xl font-bold text-center text-indigo-700 mb-2">Zephyra</h1>
          <p className="text-gray-600 text-center mb-8">Stellar Testnet Remittance Platform</p>
          
          {/* Wallet Connection Section */}
          <div className="mb-6">
            <button
              onClick={handleConnectWallet}
              disabled={walletConnected}
              className={`w-full py-3 px-4 rounded-md text-white font-medium transition-colors duration-300 ${
                walletConnected
                  ? 'bg-green-500 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2'
              }`}
            >
              {walletConnected ? 'Wallet Connected' : 'Connect Freighter Wallet'}
            </button>
          </div>
          
          {/* Display Public Key or Connection Status */}
          <div className="mt-4">
            {error && (
              <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}
            
            {publicKey && (
              <div className="mt-4">
                <h2 className="text-lg font-semibold text-gray-700 mb-2">Connected Wallet</h2>
                <div className="p-3 bg-gray-100 rounded break-all">
                  <p className="text-sm font-mono">{publicKey}</p>
                </div>
              </div>
            )}
            
            {!publicKey && !error && (
              <div className="p-3 bg-gray-100 border border-gray-300 text-gray-700 rounded text-center">
                Not Connected
              </div>
            )}
          </div>
        </div>
      </div>
      
      <p className="mt-8 text-sm text-white opacity-75">
        Powered by Stellar Testnet • {new Date().getFullYear()}
      </p>
    </div>
  );
}

export default App;

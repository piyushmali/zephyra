/**
 * ConnectFreighterButton Component for Zephyra
 * 
 * This component provides a button for connecting to the Freighter wallet
 * in the Zephyra Stellar Testnet remittance platform.
 */

import React, { useState, useEffect } from 'react';
import { getPublicKey } from '@stellar/freighter-api';

const ConnectFreighterButton = ({ onConnect, onDisconnect, publicKey: initialPublicKey, large = false, className = '' }) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [walletConnected, setWalletConnected] = useState(!!initialPublicKey);
  const [publicKey, setPublicKey] = useState(initialPublicKey);

  useEffect(() => {
    setWalletConnected(!!initialPublicKey);
    setPublicKey(initialPublicKey);
  }, [initialPublicKey]);

  const handleConnectWallet = async () => {
    setIsConnecting(true);
    
    try {
      const stellarPublicKey = await getPublicKey();
      setPublicKey(stellarPublicKey);
      setWalletConnected(true);
      
      if (onConnect) {
        onConnect(stellarPublicKey);
      }
    } catch (err) {
      console.error('Error connecting to wallet:', err);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    setPublicKey(null);
    setWalletConnected(false);
    if (onDisconnect) {
      onDisconnect();
    }
  };

  const sizeClasses = large ? 'py-3 px-6 text-lg' : 'py-2 px-4 text-sm';
  const colorClasses = walletConnected
    ? 'bg-green-500 hover:bg-green-600'
    : 'bg-indigo-600 hover:bg-indigo-700';

  return (
    <div className="wallet-connect-container">
      {!walletConnected ? (
        <button
          onClick={handleConnectWallet}
          disabled={isConnecting}
          className={`rounded-md text-white font-medium transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${sizeClasses} ${colorClasses} ${className}`}
        >
          {isConnecting ? 'Connecting...' : 'Connect Freighter Wallet'}
        </button>
      ) : (
        <div className="flex items-center space-x-2">
          <div className="text-xs text-gray-500 truncate max-w-[150px]">
            {publicKey.substring(0, 4)}...{publicKey.substring(publicKey.length - 4)}
          </div>
          <button
            onClick={handleDisconnect}
            className="text-sm text-red-600 hover:text-red-800"
          >
            Disconnect
          </button>
        </div>
      )}
    </div>
  );
};

export default ConnectFreighterButton;
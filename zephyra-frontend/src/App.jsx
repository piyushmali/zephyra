import React, { useState, useEffect } from 'react';
import './App.css';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import TransactionForm from './components/TransactionForm';
import TransactionHistory from './components/TransactionHistory';
import LiquidityPool from './components/LiquidityPool';
import freighterUtils from './utils/freighter';

/**
 * Main App Component for Zephyra
 * 
 * This is the root component for the Zephyra Stellar Testnet remittance platform.
 * It manages the application state and renders the appropriate components based on
 * the selected tab.
 */
function App() {
  // State for wallet and navigation
  const [publicKey, setPublicKey] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [error, setError] = useState(null);
  
  // Check if Freighter is installed and connected on component mount
  useEffect(() => {
    const checkFreighterConnection = async () => {
      try {
        if (!freighterUtils.isFreighterInstalled()) {
          console.log('Freighter wallet extension is not installed');
          return;
        }
        
        const connected = await freighterUtils.checkFreighterConnection();
        if (connected) {
          const accountDetails = await freighterUtils.getFreighterAccountDetails();
          setPublicKey(accountDetails.publicKey);
        }
      } catch (err) {
        console.error('Error checking Freighter connection:', err);
        setError(`Error connecting to Freighter: ${err.message}`);
      }
    };
    
    checkFreighterConnection();
  }, []);
  
  // Handle wallet connection
  const handleWalletConnect = (connectedPublicKey) => {
    setPublicKey(connectedPublicKey);
    setError(null);
  };
  
  // Handle tab change
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };
  
  // Handle transaction completion
  const handleTransactionComplete = () => {
    // Optionally switch to transaction history tab after completing a transaction
    setActiveTab('history');
  };
  
  // Render active component based on selected tab
  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'send':
        return <TransactionForm onTransactionComplete={handleTransactionComplete} />;
      case 'history':
        return <TransactionHistory />;
      case 'pools':
        return <LiquidityPool />;
      default:
        return <Dashboard />;
    }
  };
  
  return (
    <div className="App min-h-screen bg-gray-100">
      <Navigation 
        activeTab={activeTab} 
        onTabChange={handleTabChange} 
        publicKey={publicKey}
        onConnect={handleWalletConnect}
      />
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
        
        {renderActiveComponent()}
      </main>
      
      <footer className="bg-white border-t border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              &copy; {new Date().getFullYear()} Zephyra - Stellar Testnet Remittance Platform
            </div>
            <div className="text-sm text-gray-500">
              Built on <a href="https://stellar.org" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800">Stellar</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;

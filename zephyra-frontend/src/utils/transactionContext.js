/**
 * Transaction Context for Zephyra
 * 
 * This context provides a way to share transaction data between components
 * for the Zephyra Stellar Testnet remittance platform.
 */

import React, { createContext, useState, useContext, useEffect } from 'react';
import { DEMO_MODE } from './api';
import mockData from './mockData';

// Create the context
const TransactionContext = createContext();

// Create a provider component
export const TransactionProvider = ({ children }) => {
  const [transactions, setTransactions] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(Date.now());

  // Initialize with mock data in demo mode
  useEffect(() => {
    if (DEMO_MODE) {
      setTransactions(mockData.transactions || []);
    }
  }, []);

  // Add a new transaction
  const addTransaction = (transaction) => {
    setTransactions(prevTransactions => [transaction, ...prevTransactions]);
    setLastUpdated(Date.now());
  };

  // Update a transaction
  const updateTransaction = (transactionId, updates) => {
    setTransactions(prevTransactions => 
      prevTransactions.map(tx => 
        tx.id === transactionId ? { ...tx, ...updates } : tx
      )
    );
    setLastUpdated(Date.now());
  };

  // Get transactions
  const getTransactions = () => {
    return transactions;
  };

  // Get recent transactions
  const getRecentTransactions = (count = 5) => {
    return transactions.slice(0, count);
  };

  return (
    <TransactionContext.Provider 
      value={{ 
        transactions, 
        addTransaction, 
        updateTransaction, 
        getTransactions,
        getRecentTransactions,
        lastUpdated
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
};

// Create a hook to use the transaction context
export const useTransactions = () => {
  const context = useContext(TransactionContext);
  if (!context) {
    throw new Error('useTransactions must be used within a TransactionProvider');
  }
  return context;
};

export default TransactionContext;

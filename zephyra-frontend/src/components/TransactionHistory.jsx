/**
 * TransactionHistory Component for Zephyra
 * 
 * This component displays the transaction history for the Zephyra Stellar Testnet
 * remittance platform, including filtering, table view, and analytics.
 */

import React, { useState, useEffect } from 'react';

/**
 * TransactionHistory Component
 * @returns {JSX.Element} TransactionHistory component
 */
const TransactionHistory = ({ publicKey }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (publicKey) {
      fetchTransactions();
    }
  }, [publicKey]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      // TODO: Implement actual transaction fetching logic
      // For now, using placeholder data
      const mockTransactions = [
        {
          id: 1,
          type: 'send',
          amount: 100,
          asset: 'XLM',
          timestamp: new Date().toISOString(),
          status: 'completed'
        }
      ];
      setTransactions(mockTransactions);
      setError(null);
    } catch (err) {
      setError('Failed to fetch transactions');
      console.error('Error fetching transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Transaction History</h1>
          <p className="text-gray-600 mb-6">View your remittance history</p>

          {!publicKey ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">
                Please connect your wallet in the Dashboard to view transactions
              </p>
            </div>
          ) : loading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-12 bg-gray-200 rounded"></div>
              <div className="h-12 bg-gray-200 rounded"></div>
              <div className="h-12 bg-gray-200 rounded"></div>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-500">{error}</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No transactions found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transactions.map((tx) => (
                    <tr key={tx.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="capitalize">{tx.type}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {tx.amount} {tx.asset}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {new Date(tx.timestamp).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                          ${tx.status === 'completed' ? 'bg-green-100 text-green-800' : 
                            tx.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-red-100 text-red-800'}`}>
                          {tx.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransactionHistory;
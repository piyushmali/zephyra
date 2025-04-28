/**
 * TransactionHistory Component for Zephyra
 * 
 * This component displays the transaction history for the Zephyra Stellar Testnet
 * remittance platform, including filtering, table view, and analytics.
 */

import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import ConnectFreighterButton from './ConnectFreighterButton';
import apiUtils from '../utils/api';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

/**
 * TransactionHistory Component
 * @returns {JSX.Element} TransactionHistory component
 */
const TransactionHistory = () => {
  // State for wallet and transactions
  const [publicKey, setPublicKey] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  
  // Filtering state
  const [filters, setFilters] = useState({
    dateRange: 'all',
    status: 'all',
    corridor: 'all',
    search: ''
  });
  
  // Pagination state
  const [pagination, setPagination] = useState({
    currentPage: 1,
    itemsPerPage: 10,
    totalPages: 1
  });
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showModal, setShowModal] = useState(false);
  
  // Handle wallet connection
  const handleWalletConnect = (connectedPublicKey) => {
    setPublicKey(connectedPublicKey);
  };
  
  // Fetch transactions when public key changes
  useEffect(() => {
    if (!publicKey) return;
    
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const transactionsData = await apiUtils.getUserTransactions(publicKey);
        setTransactions(transactionsData);
        setFilteredTransactions(transactionsData);
        
        // Calculate total pages
        setPagination(prev => ({
          ...prev,
          totalPages: Math.ceil(transactionsData.length / prev.itemsPerPage)
        }));
      } catch (err) {
        console.error('Error fetching transactions:', err);
        setError(err.message || 'Failed to fetch transactions');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTransactions();
  }, [publicKey]);
  
  // Apply filters when filters or transactions change
  useEffect(() => {
    if (!transactions.length) return;
    
    const applyFilters = () => {
      let filtered = [...transactions];
      
      // Filter by date range
      if (filters.dateRange !== 'all') {
        const now = new Date();
        let startDate;
        
        switch (filters.dateRange) {
          case 'today':
            startDate = new Date(now.setHours(0, 0, 0, 0));
            break;
          case 'week':
            startDate = new Date(now.setDate(now.getDate() - 7));
            break;
          case 'month':
            startDate = new Date(now.setMonth(now.getMonth() - 1));
            break;
          case 'year':
            startDate = new Date(now.setFullYear(now.getFullYear() - 1));
            break;
          default:
            startDate = null;
        }
        
        if (startDate) {
          filtered = filtered.filter(tx => new Date(tx.createdAt) >= startDate);
        }
      }
      
      // Filter by status
      if (filters.status !== 'all') {
        filtered = filtered.filter(tx => tx.status === filters.status);
      }
      
      // Filter by corridor
      if (filters.corridor !== 'all') {
        filtered = filtered.filter(tx => tx.corridor === filters.corridor);
      }
      
      // Filter by search term
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        filtered = filtered.filter(tx => 
          tx.corridor.toLowerCase().includes(searchTerm) ||
          tx.sourceAsset.toLowerCase().includes(searchTerm) ||
          tx.destinationAsset.toLowerCase().includes(searchTerm) ||
          (tx.stellarTxHash && tx.stellarTxHash.toLowerCase().includes(searchTerm))
        );
      }
      
      setFilteredTransactions(filtered);
      
      // Reset to first page and update total pages
      setPagination(prev => ({
        ...prev,
        currentPage: 1,
        totalPages: Math.ceil(filtered.length / prev.itemsPerPage)
      }));
    };
    
    applyFilters();
  }, [filters, transactions]);
  
  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle pagination
  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
  };
  
  // Handle transaction selection
  const handleTransactionClick = (transaction) => {
    setSelectedTransaction(transaction);
    setShowModal(true);
  };
  
  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setSelectedTransaction(null);
  };
  
  // Get current page transactions
  const getCurrentPageTransactions = () => {
    const { currentPage, itemsPerPage } = pagination;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredTransactions.slice(startIndex, endIndex);
  };
  
  // Get unique corridors for filter dropdown
  const getUniqueCorridors = () => {
    const corridors = transactions.map(tx => tx.corridor);
    return ['all', ...new Set(corridors)];
  };
  
  // Prepare chart data
  const getChartData = () => {
    // Group transactions by month
    const monthlyData = {};
    
    filteredTransactions.forEach(tx => {
      const date = new Date(tx.createdAt);
      const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
      
      if (!monthlyData[monthYear]) {
        monthlyData[monthYear] = 0;
      }
      
      monthlyData[monthYear] += tx.amount;
    });
    
    // Sort months chronologically
    const sortedMonths = Object.keys(monthlyData).sort((a, b) => {
      const [aMonth, aYear] = a.split('/').map(Number);
      const [bMonth, bYear] = b.split('/').map(Number);
      
      if (aYear !== bYear) {
        return aYear - bYear;
      }
      
      return aMonth - bMonth;
    });
    
    return {
      labels: sortedMonths,
      datasets: [
        {
          label: 'Transaction Volume',
          data: sortedMonths.map(month => monthlyData[month]),
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
        },
      ],
    };
  };
  
  // Chart options
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Transaction Volume by Month',
      },
    },
  };
  
  // Render transaction status badge
  const renderStatusBadge = (status) => {
    let bgColor, textColor;
    
    switch (status) {
      case 'completed':
        bgColor = 'bg-green-100';
        textColor = 'text-green-800';
        break;
      case 'pending':
        bgColor = 'bg-yellow-100';
        textColor = 'text-yellow-800';
        break;
      case 'processing':
        bgColor = 'bg-blue-100';
        textColor = 'text-blue-800';
        break;
      case 'failed':
        bgColor = 'bg-red-100';
        textColor = 'text-red-800';
        break;
      default:
        bgColor = 'bg-gray-100';
        textColor = 'text-gray-800';
    }
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };
  
  // Render transaction details modal
  const renderTransactionModal = () => {
    if (!selectedTransaction) return null;
    
    return (
      <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
          <div className="px-6 py-4 border-b">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Transaction Details</h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          
          <div className="px-6 py-4">
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-500">Status:</span>
                {renderStatusBadge(selectedTransaction.status)}
              </div>
              
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-500">Amount:</span>
                <span className="font-medium">{selectedTransaction.amount} {selectedTransaction.sourceAsset}</span>
              </div>
              
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-500">Corridor:</span>
                <span className="font-medium">{selectedTransaction.corridor}</span>
              </div>
              
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-500">Date:</span>
                <span className="font-medium">{new Date(selectedTransaction.createdAt).toLocaleString()}</span>
              </div>
              
              {selectedTransaction.exchangeRate && (
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-500">Exchange Rate:</span>
                  <span className="font-medium">{selectedTransaction.exchangeRate}</span>
                </div>
              )}
            </div>
            
            {selectedTransaction.stellarTxHash && (
              <div className="mt-4 pt-4 border-t">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Stellar Transaction Hash:</h4>
                <div className="bg-gray-50 p-2 rounded overflow-x-auto">
                  <code className="text-xs break-all">{selectedTransaction.stellarTxHash}</code>
                </div>
                <div className="mt-2 text-right">
                  <a
                    href={`https://stellar.expert/explorer/testnet/tx/${selectedTransaction.stellarTxHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:text-indigo-800 text-sm"
                  >
                    View on Explorer
                  </a>
                </div>
              </div>
            )}
          </div>
          
          <div className="px-6 py-4 border-t bg-gray-50 flex justify-end">
            <button
              onClick={closeModal}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="transaction-history-container bg-white shadow-md rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Transaction History</h2>
        
        {!publicKey && (
          <ConnectFreighterButton onConnect={handleWalletConnect} />
        )}
      </div>
      
      {!publicKey ? (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">Connect your Freighter wallet to view your transaction history</p>
          <ConnectFreighterButton onConnect={handleWalletConnect} large />
        </div>
      ) : (
        <>
          {/* Filtering Options */}
          <div className="mb-6 bg-gray-50 p-4 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date Range
                </label>
                <select
                  name="dateRange"
                  value={filters.dateRange}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">Last 7 Days</option>
                  <option value="month">Last 30 Days</option>
                  <option value="year">Last Year</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                >
                  <option value="all">All Statuses</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Corridor
                </label>
                <select
                  name="corridor"
                  value={filters.corridor}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                >
                  {getUniqueCorridors().map(corridor => (
                    <option key={corridor} value={corridor}>
                      {corridor === 'all' ? 'All Corridors' : corridor}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Search
                </label>
                <input
                  type="text"
                  name="search"
                  value={filters.search}
                  onChange={handleFilterChange}
                  placeholder="Search transactions..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                />
              </div>
            </div>
          </div>
          
          {/* Transaction Table */}
          <div className="mb-6 overflow-hidden">
            {loading ? (
              <div className="animate-pulse">
                <div className="h-10 bg-gray-200 rounded mb-2"></div>
                <div className="h-10 bg-gray-200 rounded mb-2"></div>
                <div className="h-10 bg-gray-200 rounded mb-2"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            ) : error ? (
              <div className="text-red-500 text-center py-4">
                {error}
              </div>
            ) : filteredTransactions.length === 0 ? (
              <div className="text-gray-500 text-center py-8">
                No transactions found
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Corridor
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {getCurrentPageTransactions().map((transaction) => (
                        <tr 
                          key={transaction._id} 
                          className="hover:bg-gray-50 cursor-pointer"
                          onClick={() => handleTransactionClick(transaction)}
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(transaction.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {transaction.amount} {transaction.sourceAsset}
                            </div>
                            <div className="text-xs text-gray-500">
                              → {transaction.destinationAsset}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {transaction.corridor}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {renderStatusBadge(transaction.status)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleTransactionClick(transaction);
                              }}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm text-gray-700">
                          Showing <span className="font-medium">{(pagination.currentPage - 1) * pagination.itemsPerPage + 1}</span> to{' '}
                          <span className="font-medium">
                            {Math.min(pagination.currentPage * pagination.itemsPerPage, filteredTransactions.length)}
                          </span>{' '}
                          of <span className="font-medium">{filteredTransactions.length}</span> results
                        </p>
                      </div>
                      <div>
                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                          <button
                            onClick={() => handlePageChange(pagination.currentPage - 1)}
                            disabled={pagination.currentPage === 1}
                            className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                              pagination.currentPage === 1
                                ? 'text-gray-300 cursor-not-allowed'
                                : 'text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            <span className="sr-only">Previous</span>
                            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </button>
                          
                          {/* Page numbers */}
                          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                            <button
                              key={page}
                              onClick={() => handlePageChange(page)}
                              className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium ${
                                page === pagination.currentPage
                                  ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                                  : 'bg-white text-gray-500 hover:bg-gray-50'
                              }`}
                            >
                              {page}
                            </button>
                          ))}
                          
                          <button
                            onClick={() => handlePageChange(pagination.currentPage + 1)}
                            disabled={pagination.currentPage === pagination.totalPages}
                            className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                              pagination.currentPage === pagination.totalPages
                                ? 'text-gray-300 cursor-not-allowed'
                                : 'text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            <span className="sr-only">Next</span>
                            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </nav>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
          
          {/* Transaction Analytics */}
          {!loading && !error && filteredTransactions.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Transaction Analytics</h3>
              <div className="h-80">
                <Bar options={chartOptions} data={getChartData()} />
              </div>
            </div>
          )}
          
          {/* Transaction Modal */}
          {showModal && renderTransactionModal()}
        </>
      )}
    </div>
  );
};

export default TransactionHistory;

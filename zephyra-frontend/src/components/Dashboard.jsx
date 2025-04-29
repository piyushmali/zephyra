/**
 * Dashboard Component for Zephyra
 * 
 * This component displays the main dashboard for the Zephyra Stellar Testnet
 * remittance platform, including wallet status, pool statistics, and savings charts.
 */

import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title, Filler } from 'chart.js';
import { Pie, Line } from 'react-chartjs-2';
import ConnectFreighterButton from './ConnectFreighterButton';
import apiUtils from '../utils/api';

// Register ChartJS components
ChartJS.register(
  ArcElement, 
  Tooltip, 
  Legend, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Filler
);

/**
 * Dashboard Component
 * @returns {JSX.Element} Dashboard component
 */
const Dashboard = ({ publicKey, onConnect, onDisconnect }) => {
  // State for wallet and data
  const [walletBalance, setWalletBalance] = useState(null);
  const [pools, setPools] = useState([]);
  const [savings, setSavings] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState({
    pools: true,
    savings: true,
    transactions: true,
    balance: true
  });
  const [error, setError] = useState({
    pools: null,
    savings: null,
    transactions: null,
    balance: null
  });

  // Fetch pools data
  useEffect(() => {
    const fetchPools = async () => {
      try {
        setLoading(prev => ({ ...prev, pools: true }));
        const poolsData = await apiUtils.getPools();
        setPools(poolsData);
        setError(prev => ({ ...prev, pools: null }));
      } catch (err) {
        console.error('Error fetching pools:', err);
        setError(prev => ({ ...prev, pools: err.message || 'Failed to fetch pools' }));
      } finally {
        setLoading(prev => ({ ...prev, pools: false }));
      }
    };

    fetchPools();
  }, []);

  // Update fetchUserData to get actual XLM balance
  useEffect(() => {
    if (!publicKey) return;

    const fetchUserData = async () => {
      // Fetch wallet balance
      try {
        setLoading(prev => ({ ...prev, balance: true }));
        const response = await fetch(`https://horizon-testnet.stellar.org/accounts/${publicKey}`);
        const accountData = await response.json();
        const xlmBalance = accountData.balances.find(b => b.asset_type === 'native')?.balance || '0';
        
        setWalletBalance({
          XLM: xlmBalance,
          // Keep other balances if needed
          USD: walletBalance?.USD || '0',
          EUR: walletBalance?.EUR || '0'
        });
        setError(prev => ({ ...prev, balance: null }));
      } catch (err) {
        console.error('Error fetching balance:', err);
        setError(prev => ({ ...prev, balance: err.message || 'Failed to fetch balance' }));
      } finally {
        setLoading(prev => ({ ...prev, balance: false }));
      }

      // Fetch user savings
      try {
        setLoading(prev => ({ ...prev, savings: true }));
        const savingsData = await apiUtils.getUserSavings(publicKey);
        setSavings(savingsData);
        setError(prev => ({ ...prev, savings: null }));
      } catch (err) {
        console.error('Error fetching savings:', err);
        setError(prev => ({ ...prev, savings: err.message || 'Failed to fetch savings' }));
      } finally {
        setLoading(prev => ({ ...prev, savings: false }));
      }

      // Fetch user transactions
      try {
        setLoading(prev => ({ ...prev, transactions: true }));
        const transactionsData = await apiUtils.getUserTransactions(publicKey);
        setRecentTransactions(transactionsData.slice(0, 5)); // Get only the 5 most recent
        setError(prev => ({ ...prev, transactions: null }));
      } catch (err) {
        console.error('Error fetching transactions:', err);
        setError(prev => ({ ...prev, transactions: err.message || 'Failed to fetch transactions' }));
      } finally {
        setLoading(prev => ({ ...prev, transactions: false }));
      }
    };

    fetchUserData();
  }, [publicKey, walletBalance?.USD, walletBalance?.EUR]);

  // Prepare pool distribution chart data
  const poolDistributionData = {
    labels: pools.map(pool => pool.corridor),
    datasets: [
      {
        label: 'Liquidity',
        data: pools.map(pool => pool.totalLiquidity),
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Prepare savings chart data
  const savingsChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        fill: true,
        label: 'Savings ($)',
        data: [12, 19, 25, 32, 45, 56],
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.3)',
        tension: 0.3,
      },
    ],
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
        text: 'Your Savings Over Time',
      },
    },
  };

  return (
    <div className="dashboard-container p-4">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Header with Connect/Disconnect */}
        <div className="lg:col-span-12 flex flex-col md:flex-row justify-between items-center bg-white rounded-lg shadow-md p-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Zephyra Dashboard</h1>
            <p className="text-gray-600">Stellar Testnet Remittance Platform</p>
          </div>
          <div className="mt-4 md:mt-0">
            {!publicKey ? (
              <ConnectFreighterButton onConnect={onConnect} large />
            ) : (
              <div className="flex items-center space-x-4">
                <div className="flex items-center bg-gray-100 rounded-lg p-3">
                  <div className="mr-3">
                    <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold">
                      {publicKey.substring(0, 1)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-700">Connected Wallet</div>
                    <div className="text-xs text-gray-500 truncate w-32 md:w-48">
                      {publicKey.substring(0, 6)}...{publicKey.substring(publicKey.length - 6)}
                    </div>
                  </div>
                </div>
                <button
                  onClick={onDisconnect}
                  className="text-red-600 hover:text-red-800 font-medium"
                >
                  Disconnect
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* Wallet Information Panel */}
        <div className="lg:col-span-4 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Wallet Information</h2>
          
          {!publicKey ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">Connect your Freighter wallet to view your balance and account details</p>
            </div>
          ) : loading.balance ? (
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          ) : error.balance ? (
            <div className="text-red-500">{error.balance}</div>
          ) : (
            <>
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">XLM Balance:</span>
                  <span className="font-semibold">{Number(walletBalance?.XLM).toFixed(7)} XLM</span>
                </div>
                {walletBalance?.USD && (
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">USD Balance:</span>
                    <span className="font-semibold">${walletBalance.USD}</span>
                  </div>
                )}
                {walletBalance?.EUR && (
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">EUR Balance:</span>
                    <span className="font-semibold">€{walletBalance.EUR}</span>
                  </div>
                )}
              </div>
              
              <div className="flex flex-wrap gap-2 mt-6">
                <button className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-md text-sm transition-colors duration-300">
                  Send
                </button>
                <button className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-md text-sm transition-colors duration-300">
                  Receive
                </button>
                <button className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-md text-sm transition-colors duration-300"
                        onClick={() => window.open(`https://testnet.steexp.com/account/${publicKey}`, '_blank')}>
                  View on Explorer
                </button>
              </div>
            </>
          )}
        </div>

        {/* Remittance Pool Statistics */}
        <div className="lg:col-span-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Remittance Pool Statistics</h2>
          
          {loading.pools ? (
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          ) : error.pools ? (
            <div className="text-red-500">{error.pools}</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-indigo-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-indigo-800">Active Pools</h3>
                <p className="text-2xl font-bold text-indigo-600">{pools.length}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-green-800">Total Liquidity</h3>
                <p className="text-2xl font-bold text-green-600">
                  ${pools.reduce((sum, pool) => sum + (pool.totalLiquidity || 0), 0).toLocaleString()}
                </p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-purple-800">Average Yield</h3>
                <p className="text-2xl font-bold text-purple-600">
                  {pools.length > 0 
                    ? (pools.reduce((sum, pool) => sum + (pool.yield || 0), 0) / pools.length).toFixed(2)
                    : 0}%
                </p>
              </div>
            </div>
          )}
          
          {!loading.pools && !error.pools && pools.length > 0 && (
            <div className="h-64">
              <Pie data={poolDistributionData} />
            </div>
          )}
        </div>

        {/* Savings Metrics */}
        <div className="lg:col-span-6 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Savings Metrics</h2>
          
          {!publicKey ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">Connect your Freighter wallet to view your savings</p>
            </div>
          ) : loading.savings ? (
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          ) : error.savings ? (
            <div className="text-red-500">{error.savings}</div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-blue-800">Total Savings</h3>
                  <p className="text-2xl font-bold text-blue-600">
                    ${savings?.totalSavings?.toFixed(2) || '0.00'}
                  </p>
                </div>
                <div className="bg-teal-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-teal-800">Average Savings</h3>
                  <p className="text-2xl font-bold text-teal-600">
                    {savings?.averageSavingsPercent?.toFixed(2) || '0.00'}%
                  </p>
                </div>
              </div>
              
              <div className="h-64">
                <Line options={chartOptions} data={savingsChartData} />
              </div>
            </>
          )}
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-6 bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Recent Activity</h2>
            <button 
              onClick={() => {/* Add functionality here */}} 
              className="text-indigo-600 hover:text-indigo-800 text-sm"
            >
              View All
            </button>
          </div>
          
          {!publicKey ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">Connect your Freighter wallet to view your recent transactions</p>
            </div>
          ) : loading.transactions ? (
            <div className="animate-pulse">
              <div className="h-16 bg-gray-200 rounded mb-2"></div>
              <div className="h-16 bg-gray-200 rounded mb-2"></div>
              <div className="h-16 bg-gray-200 rounded"></div>
            </div>
          ) : error.transactions ? (
            <div className="text-red-500">{error.transactions}</div>
          ) : recentTransactions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No recent transactions found</p>
            </div>
          ) : (
            <div className="overflow-hidden">
              {recentTransactions.map((tx, index) => (
                <div key={tx._id || index} className="flex items-center py-3 border-b border-gray-100 last:border-0">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white ${
                    tx.status === 'completed' ? 'bg-green-500' : 
                    tx.status === 'pending' ? 'bg-yellow-500' : 
                    tx.status === 'failed' ? 'bg-red-500' : 'bg-gray-500'
                  }`}>
                    {tx.status === 'completed' ? '✓' : 
                     tx.status === 'pending' ? '⏱' : 
                     tx.status === 'failed' ? '✗' : '?'}
                  </div>
                  <div className="ml-4 flex-1">
                    <div className="text-sm font-medium text-gray-900">{tx.corridor} Remittance</div>
                    <div className="text-xs text-gray-500">
                      {new Date(tx.createdAt).toLocaleDateString()} • {tx.status}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">${tx.amount.toFixed(2)}</div>
                    <div className="text-xs text-gray-500">{tx.sourceAsset} → {tx.destinationAsset}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
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
    <div className="dashboard-container p-2 bg-gray-50">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Header with Connect/Disconnect */}
        <div className="lg:col-span-12 flex flex-col md:flex-row justify-between items-center bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-lg p-6 text-white">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
          </div>
          <div className="mt-6 md:mt-0">
            {!publicKey ? (
              <ConnectFreighterButton onConnect={onConnect} large />
            ) : (
              <div className="flex items-center space-x-4">
                <div className="flex items-center bg-white bg-opacity-20 backdrop-filter backdrop-blur-sm rounded-xl p-4 border border-white border-opacity-20">
                  <div className="mr-3">
                    <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center text-indigo-600 font-bold shadow-md">
                      {publicKey.substring(0, 1)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">Connected Wallet</div>
                    <div className="text-xs text-indigo-100 truncate w-32 md:w-48">
                      {publicKey.substring(0, 6)}...{publicKey.substring(publicKey.length - 6)}
                    </div>
                  </div>
                </div>
                <button
                  onClick={onDisconnect}
                  className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1"
                >
                  Disconnect
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* Wallet Information Panel */}
        <div className="lg:col-span-4 bg-white rounded-xl shadow-lg p-6 transform transition-all duration-300 hover:shadow-xl">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-indigo-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z"></path>
              <path d="M3 12v3c0 1.657 3.134 3 7 3s7-1.343 7-3v-3c0 1.657-3.134 3-7 3s-7-1.343-7-3z"></path>
              <path d="M17 5c0 1.657-3.134 3-7 3S3 6.657 3 5s3.134-3 7-3 7 1.343 7 3z"></path>
            </svg>
            Wallet Information
          </h2>
          
          {!publicKey ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
              </svg>
              <p className="text-gray-500 mb-4">Connect your Freighter wallet to view your balance and account details</p>
            </div>
          ) : loading.balance ? (
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          ) : error.balance ? (
            <div className="text-red-500 p-4 bg-red-50 rounded-lg">{error.balance}</div>
          ) : (
            <>
              <div className="mb-4 space-y-4">
                <div className="flex justify-between items-center p-3 bg-indigo-50 rounded-lg">
                  <span className="text-gray-700 flex items-center">
                    <span className="w-3 h-3 bg-indigo-600 rounded-full mr-2"></span>
                    XLM Balance:
                  </span>
                  <span className="font-semibold text-indigo-700">{Number(walletBalance?.XLM).toFixed(7)} XLM</span>
                </div>
                {walletBalance?.USD && (
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span className="text-gray-700 flex items-center">
                      <span className="w-3 h-3 bg-green-600 rounded-full mr-2"></span>
                      USD Balance:
                    </span>
                    <span className="font-semibold text-green-700">${walletBalance.USD}</span>
                  </div>
                )}
                {walletBalance?.EUR && (
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <span className="text-gray-700 flex items-center">
                      <span className="w-3 h-3 bg-blue-600 rounded-full mr-2"></span>
                      EUR Balance:
                    </span>
                    <span className="font-semibold text-blue-700">€{walletBalance.EUR}</span>
                  </div>
                )}
              </div>
              
              <div className="flex flex-wrap gap-2 mt-6">
                <button className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-4 rounded-lg text-sm font-medium transition-all duration-300 shadow hover:shadow-md transform hover:-translate-y-1 flex items-center justify-center">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 001.788 0l7-14a1 1 0 00-1.169-1.409l-5 1.429A1 1 0 0011 10.14V6a1 1 0 00-2 0v4.571a1 1 0 00.293.707l2.828 2.829a1 1 0 001.415-1.415L11 3.828V6a1 1 0 00-2 0v2.828l-5-1.428a1 1 0 00-1.415 1.415z"></path>
                  </svg>
                  Send
                </button>
                <button className="flex-1 bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-300 shadow hover:shadow-md transform hover:-translate-y-1 flex items-center justify-center">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H5a1 1 0 010-2h1V3a2 2 0 00-2-2H3a2 2 0 00-2 2v1a1 1 0 010 2h1a1 1 0 110 2H3a1 1 0 011-1h1V5a2 2 0 002 2h1a2 2 0 002-2V3zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path>
                  </svg>
                  Receive
                </button>
                <button className="flex-1 bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-300 shadow hover:shadow-md transform hover:-translate-y-1 flex items-center justify-center"
                        onClick={() => window.open(`https://testnet.steexp.com/account/${publicKey}`, '_blank')}>
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z"></path>
                    <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z"></path>
                  </svg>
                  Explorer
                </button>
              </div>
            </>
          )}
        </div>

        {/* Remittance Pool Statistics */}
        <div className="lg:col-span-8 bg-white rounded-xl shadow-lg p-6 transform transition-all duration-300 hover:shadow-xl">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-indigo-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 12v3c0 1.657 3.134 3 7 3s7-1.343 7-3v-3c0 1.657-3.134 3-7 3s-7-1.343-7-3z"></path>
              <path d="M3 7v3c0 1.657 3.134 3 7 3s7-1.343 7-3V7c0 1.657-3.134 3-7 3s-7-1.343-7-3z"></path>
              <path d="M17 5c0 1.657-3.134 3-7 3S3 6.657 3 5s3.134-3 7-3 7 1.343 7 3z"></path>
            </svg>
            Remittance Pool Statistics
          </h2>
          
          {loading.pools ? (
            <div className="animate-pulse space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="h-24 bg-gray-200 rounded-lg"></div>
                <div className="h-24 bg-gray-200 rounded-lg"></div>
                <div className="h-24 bg-gray-200 rounded-lg"></div>
              </div>
              <div className="h-64 bg-gray-200 rounded-lg"></div>
            </div>
          ) : error.pools ? (
            <div className="text-red-500 p-4 bg-red-50 rounded-lg flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path>
              </svg>
              {error.pools}
            </div>
          ) : (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 p-6 rounded-xl shadow-md text-white transform transition-all duration-300 hover:scale-105">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-indigo-100">Active Pools</h3>
                    <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5 3a1 1 0 011 1v1h1a1 1 0 010 2H5a1 1 0 010-2h1V3a2 2 0 00-2-2H3a2 2 0 00-2 2v1a1 1 0 010 2h1a1 1 0 110 2H3a1 1 0 011-1h1V5a2 2 0 002 2h1a2 2 0 002-2V3zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path>
                      </svg>
                    </div>
                  </div>
                  <p className="text-3xl font-bold mt-2">{pools.length}</p>
                  <div className="mt-2 text-xs text-indigo-100">Available for trading</div>
                </div>
                <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-xl shadow-md text-white transform transition-all duration-300 hover:scale-105">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-green-100">Total Liquidity</h3>
                    <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"></path>
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd"></path>
                      </svg>
                    </div>
                  </div>
                  <p className="text-3xl font-bold mt-2">
                    ${pools.reduce((sum, pool) => sum + (pool.totalLiquidity || 0), 0).toLocaleString()}
                  </p>
                  <div className="mt-2 text-xs text-green-100">Total value locked</div>
                </div>
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-xl shadow-md text-white transform transition-all duration-300 hover:scale-105">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-purple-100">Average Yield</h3>
                    <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd"></path>
                      </svg>
                    </div>
                  </div>
                  <p className="text-3xl font-bold mt-2">
                    {pools.length > 0 
                      ? (pools.reduce((sum, pool) => sum + (pool.yield || 0), 0) / pools.length).toFixed(2)
                      : 0}%
                  </p>
                  <div className="mt-2 text-xs text-purple-100">Annual percentage yield</div>
                </div>
              </div>
            
              {pools.length > 0 && (
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Pool Distribution</h3>
                  <div className="h-64">
                    <Pie 
                      data={poolDistributionData} 
                      options={{
                        plugins: {
                          legend: {
                            position: 'bottom',
                            labels: {
                              boxWidth: 12,
                              padding: 15,
                              font: {
                                size: 11
                              }
                            }
                          },
                          tooltip: {
                            backgroundColor: 'rgba(0,0,0,0.8)',
                            padding: 12,
                            titleFont: {
                              size: 13
                            },
                            bodyFont: {
                              size: 12
                            },
                            displayColors: true,
                            boxWidth: 10,
                            boxHeight: 10
                          }
                        },
                        animation: {
                          animateScale: true,
                          animateRotate: true
                        }
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Savings Metrics */}
        <div className="lg:col-span-6 bg-white rounded-xl shadow-lg p-6 transform transition-all duration-300 hover:shadow-xl">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-indigo-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2h12a2 2 0 002-2v-4a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4a2 2 0 00-2-2H4z" clipRule="evenodd"></path>
            </svg>
            Savings Metrics
          </h2>
          
          {!publicKey ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
              </svg>
              <p className="text-gray-500 mb-4">Connect your Freighter wallet to view your savings</p>
              <button 
                onClick={onConnect}
                className="mt-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300"
              >
                Connect Wallet
              </button>
            </div>
          ) : loading.savings ? (
            <div className="animate-pulse space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="h-24 bg-gray-200 rounded-lg"></div>
                <div className="h-24 bg-gray-200 rounded-lg"></div>
              </div>
              <div className="h-64 bg-gray-200 rounded-lg"></div>
            </div>
          ) : error.savings ? (
            <div className="text-red-500 p-4 bg-red-50 rounded-lg flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path>
              </svg>
              {error.savings}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl shadow-md text-white transform transition-all duration-300 hover:scale-105">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-blue-100">Total Savings</h3>
                    <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"></path>
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd"></path>
                      </svg>
                    </div>
                  </div>
                  <p className="text-3xl font-bold mt-2">
                    ${savings?.totalSavings?.toFixed(2) || '0.00'}
                  </p>
                  <div className="mt-2 text-xs text-blue-100">Total amount saved</div>
                </div>
                <div className="bg-gradient-to-br from-teal-500 to-teal-600 p-6 rounded-xl shadow-md text-white transform transition-all duration-300 hover:scale-105">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-teal-100">Average Savings</h3>
                    <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd"></path>
                      </svg>
                    </div>
                  </div>
                  <p className="text-3xl font-bold mt-2">
                    {savings?.averageSavingsPercent?.toFixed(2) || '0.00'}%
                  </p>
                  <div className="mt-2 text-xs text-teal-100">Average percentage saved</div>
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Your Savings Over Time</h3>
                <div className="h-64">
                  <Line 
                    options={{
                      responsive: true,
                      plugins: {
                        legend: {
                          position: 'top',
                          labels: {
                            boxWidth: 12,
                            padding: 15,
                            font: {
                              size: 11
                            }
                          }
                        },
                        tooltip: {
                          backgroundColor: 'rgba(0,0,0,0.8)',
                          padding: 12,
                          titleFont: {
                            size: 13
                          },
                          bodyFont: {
                            size: 12
                          },
                          displayColors: true,
                          boxWidth: 10,
                          boxHeight: 10
                        }
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                          }
                        },
                        x: {
                          grid: {
                            display: false
                          }
                        }
                      },
                      elements: {
                        line: {
                          tension: 0.4
                        }
                      }
                    }} 
                    data={savingsChartData} 
                  />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-6 bg-white rounded-xl shadow-lg p-6 transform transition-all duration-300 hover:shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center">
              <svg className="w-5 h-5 mr-2 text-indigo-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd"></path>
              </svg>
              Recent Activity
            </h2>
            <button 
              onClick={() => {/* Add functionality here */}} 
              className="text-indigo-600 hover:text-indigo-800 text-sm font-medium transition-colors duration-200 flex items-center"
            >
              View All
              <svg className="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
              </svg>
            </button>
          </div>
          
          {!publicKey ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <p className="text-gray-500 mb-4">Connect your Freighter wallet to view your recent transactions</p>
              <button 
                onClick={onConnect}
                className="mt-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300"
              >
                Connect Wallet
              </button>
            </div>
          ) : loading.transactions ? (
            <div className="animate-pulse space-y-4">
              <div className="h-16 bg-gray-200 rounded-lg mb-2"></div>
              <div className="h-16 bg-gray-200 rounded-lg mb-2"></div>
              <div className="h-16 bg-gray-200 rounded-lg"></div>
            </div>
          ) : error.transactions ? (
            <div className="text-red-500 p-4 bg-red-50 rounded-lg flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path>
              </svg>
              {error.transactions}
            </div>
          ) : recentTransactions.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              <p className="text-gray-500">No recent transactions found</p>
            </div>
          ) : (
            <div className="overflow-hidden space-y-3">
              {recentTransactions.map((tx, index) => (
                <div 
                  key={tx._id || index} 
                  className="flex items-center p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors duration-200 transform hover:scale-[1.01]"
                >
                  <div className={`h-12 w-12 rounded-full flex items-center justify-center text-white shadow-md ${
                    tx.status === 'completed' ? 'bg-green-500' : 
                    tx.status === 'pending' ? 'bg-yellow-500' : 
                    tx.status === 'failed' ? 'bg-red-500' : 'bg-gray-500'
                  }`}>
                    {tx.status === 'completed' ? (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                    ) : tx.status === 'pending' ? (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                    ) : tx.status === 'failed' ? (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                      </svg>
                    ) : (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                    )}
                  </div>
                  <div className="ml-4 flex-1">
                    <div className="text-sm font-medium text-gray-900">{tx.corridor} Remittance</div>
                    <div className="text-xs text-gray-500 flex items-center">
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M10 18a8 8 0 11-16 0 8 8 0 0116 0zm-7 0a1 1 0 10-2 0v-3a1 1 0 00-1-1H3a1 1 0 00-1 1v3a1 1 0 001 1h6v-4a1 1 0 00-1-1H3a1 1 0 001-1V8a1 1 0 00-2 0v4h2a1 1 0 001 1h3v4z" clipRule="evenodd"></path>
                      </svg>
                      {new Date(tx.createdAt).toLocaleDateString()} • 
                      <span className={`ml-1 font-medium ${
                        tx.status === 'completed' ? 'text-green-600' : 
                        tx.status === 'pending' ? 'text-yellow-600' : 
                        tx.status === 'failed' ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {tx.status}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">${tx.amount.toFixed(2)}</div>
                    <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full inline-block mt-1">
                      {tx.sourceAsset} → {tx.destinationAsset}
                    </div>
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
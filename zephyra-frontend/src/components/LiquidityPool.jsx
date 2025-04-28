/**
 * LiquidityPool Component for Zephyra
 * 
 * This component displays liquidity pool information and allows users to add
 * or remove liquidity from pools in the Zephyra Stellar Testnet remittance platform.
 */

import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import ConnectFreighterButton from './ConnectFreighterButton';
import apiUtils from '../utils/api';
import freighterUtils from '../utils/freighter';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend);

/**
 * LiquidityPool Component
 * @returns {JSX.Element} LiquidityPool component
 */
const LiquidityPool = () => {
  // State for wallet and pools
  const [publicKey, setPublicKey] = useState(null);
  const [pools, setPools] = useState([]);
  const [selectedPool, setSelectedPool] = useState(null);
  const [userLiquidity, setUserLiquidity] = useState({});
  
  // Form state
  const [formData, setFormData] = useState({
    action: 'add', // 'add' or 'remove'
    amount: '',
    asset: ''
  });
  
  // UI state
  const [loading, setLoading] = useState({
    pools: false,
    userLiquidity: false,
    action: false
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Handle wallet connection
  const handleWalletConnect = (connectedPublicKey) => {
    setPublicKey(connectedPublicKey);
  };
  
  // Fetch pools on component mount
  useEffect(() => {
    const fetchPools = async () => {
      try {
        setLoading(prev => ({ ...prev, pools: true }));
        const poolsData = await apiUtils.getPools();
        setPools(poolsData);
        
        // Set first pool as selected by default
        if (poolsData.length > 0 && !selectedPool) {
          setSelectedPool(poolsData[0]);
          setFormData(prev => ({ ...prev, asset: poolsData[0].assets[0] }));
        }
      } catch (err) {
        console.error('Error fetching pools:', err);
        setError('Failed to fetch liquidity pools');
      } finally {
        setLoading(prev => ({ ...prev, pools: false }));
      }
    };
    
    fetchPools();
  }, []);
  
  // Fetch user liquidity when public key and selected pool change
  useEffect(() => {
    if (!publicKey || !selectedPool) return;
    
    const fetchUserLiquidity = async () => {
      try {
        setLoading(prev => ({ ...prev, userLiquidity: true }));
        
        // In a real app, this would be an API call to get user's liquidity in each pool
        // For now, we'll simulate it with mock data
        const mockUserLiquidity = {
          [selectedPool.corridor]: {
            [selectedPool.assets[0]]: (Math.random() * 1000).toFixed(2),
            [selectedPool.assets[1]]: (Math.random() * 1000).toFixed(2)
          }
        };
        
        setUserLiquidity(mockUserLiquidity);
      } catch (err) {
        console.error('Error fetching user liquidity:', err);
        setError('Failed to fetch your liquidity position');
      } finally {
        setLoading(prev => ({ ...prev, userLiquidity: false }));
      }
    };
    
    fetchUserLiquidity();
  }, [publicKey, selectedPool]);
  
  // Handle pool selection
  const handlePoolSelect = (pool) => {
    setSelectedPool(pool);
    setFormData(prev => ({ ...prev, asset: pool.assets[0] }));
    setError(null);
    setSuccess(null);
  };
  
  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!publicKey) {
      setError('Please connect your Freighter wallet');
      return;
    }
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    
    try {
      setLoading(prev => ({ ...prev, action: true }));
      setError(null);
      setSuccess(null);
      
      // In a real app, this would call the backend API to add/remove liquidity
      // For now, we'll simulate it with a timeout
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update user liquidity (simulated)
      const newUserLiquidity = { ...userLiquidity };
      const amount = parseFloat(formData.amount);
      
      if (formData.action === 'add') {
        newUserLiquidity[selectedPool.corridor][formData.asset] = 
          (parseFloat(newUserLiquidity[selectedPool.corridor][formData.asset]) + amount).toFixed(2);
      } else {
        // Ensure user has enough liquidity to remove
        if (parseFloat(newUserLiquidity[selectedPool.corridor][formData.asset]) < amount) {
          throw new Error('Insufficient liquidity to remove');
        }
        
        newUserLiquidity[selectedPool.corridor][formData.asset] = 
          (parseFloat(newUserLiquidity[selectedPool.corridor][formData.asset]) - amount).toFixed(2);
      }
      
      setUserLiquidity(newUserLiquidity);
      setSuccess(`Successfully ${formData.action === 'add' ? 'added' : 'removed'} ${formData.amount} ${formData.asset} ${formData.action === 'add' ? 'to' : 'from'} the pool`);
      
      // Reset form
      setFormData(prev => ({ ...prev, amount: '' }));
    } catch (err) {
      console.error('Error processing liquidity action:', err);
      setError(err.message || `Failed to ${formData.action} liquidity`);
    } finally {
      setLoading(prev => ({ ...prev, action: false }));
    }
  };
  
  // Prepare chart data for selected pool
  const getPoolChartData = () => {
    if (!selectedPool) return null;
    
    return {
      labels: selectedPool.assets,
      datasets: [
        {
          label: 'Pool Composition',
          data: selectedPool.assets.map(asset => 
            selectedPool.assetDistribution ? selectedPool.assetDistribution[asset] : 50
          ),
          backgroundColor: [
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 206, 86, 0.6)',
          ],
          borderColor: [
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
          ],
          borderWidth: 1,
        },
      ],
    };
  };
  
  // Calculate APY for the selected pool
  const getPoolAPY = () => {
    if (!selectedPool) return '0.00';
    
    // In a real app, this would come from the pool data
    // For now, we'll generate a random APY between 3-8%
    return (3 + Math.random() * 5).toFixed(2);
  };
  
  return (
    <div className="liquidity-pool-container bg-white shadow-md rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Liquidity Pools</h2>
        
        {!publicKey && (
          <ConnectFreighterButton onConnect={handleWalletConnect} />
        )}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pool Selection */}
        <div className="lg:col-span-1">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-gray-700 mb-4">Available Pools</h3>
            
            {loading.pools ? (
              <div className="animate-pulse space-y-2">
                <div className="h-12 bg-gray-200 rounded"></div>
                <div className="h-12 bg-gray-200 rounded"></div>
                <div className="h-12 bg-gray-200 rounded"></div>
              </div>
            ) : pools.length === 0 ? (
              <div className="text-gray-500 text-center py-4">
                No pools available
              </div>
            ) : (
              <div className="space-y-2">
                {pools.map(pool => (
                  <div
                    key={pool.corridor}
                    onClick={() => handlePoolSelect(pool)}
                    className={`p-3 rounded-lg cursor-pointer transition-colors duration-200 ${
                      selectedPool && selectedPool.corridor === pool.corridor
                        ? 'bg-indigo-100 border border-indigo-300'
                        : 'bg-white border border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <div className="font-medium text-gray-800">{pool.corridor}</div>
                    <div className="text-sm text-gray-500">
                      Liquidity: ${pool.totalLiquidity.toLocaleString()}
                    </div>
                    <div className="text-xs text-indigo-600 mt-1">
                      APY: {pool.yield ? `${pool.yield}%` : '5.25%'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Pool Details */}
        <div className="lg:col-span-2">
          {selectedPool ? (
            <div>
              <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
                <div className="flex flex-col md:flex-row justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800">{selectedPool.corridor} Pool</h3>
                    <div className="text-sm text-gray-500 mt-1">
                      Total Liquidity: ${selectedPool.totalLiquidity.toLocaleString()}
                    </div>
                    <div className="text-sm text-green-600 font-medium mt-1">
                      APY: {getPoolAPY()}%
                    </div>
                  </div>
                  
                  <div className="mt-4 md:mt-0 w-full md:w-40 h-40">
                    <Doughnut data={getPoolChartData()} />
                  </div>
                </div>
                
                {publicKey && userLiquidity[selectedPool.corridor] && (
                  <div className="mt-4 pt-4 border-t">
                    <h4 className="text-md font-medium text-gray-700">Your Position</h4>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      {selectedPool.assets.map(asset => (
                        <div key={asset} className="bg-gray-50 p-3 rounded">
                          <div className="text-sm text-gray-500">{asset}</div>
                          <div className="text-lg font-medium">
                            {loading.userLiquidity ? (
                              <div className="animate-pulse h-6 w-20 bg-gray-200 rounded"></div>
                            ) : (
                              userLiquidity[selectedPool.corridor][asset]
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Liquidity Form */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-700 mb-4">Manage Liquidity</h3>
                
                {!publicKey ? (
                  <div className="text-center py-6">
                    <p className="text-gray-500 mb-4">Connect your Freighter wallet to manage liquidity</p>
                    <ConnectFreighterButton onConnect={handleWalletConnect} large />
                  </div>
                ) : (
                  <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Action
                      </label>
                      <div className="flex space-x-4">
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            name="action"
                            value="add"
                            checked={formData.action === 'add'}
                            onChange={handleInputChange}
                            className="form-radio h-4 w-4 text-indigo-600"
                          />
                          <span className="ml-2 text-gray-700">Add Liquidity</span>
                        </label>
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            name="action"
                            value="remove"
                            checked={formData.action === 'remove'}
                            onChange={handleInputChange}
                            className="form-radio h-4 w-4 text-indigo-600"
                          />
                          <span className="ml-2 text-gray-700">Remove Liquidity</span>
                        </label>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Asset
                      </label>
                      <select
                        name="asset"
                        value={formData.asset}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        {selectedPool.assets.map(asset => (
                          <option key={asset} value={asset}>{asset}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Amount
                      </label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <input
                          type="number"
                          name="amount"
                          value={formData.amount}
                          onChange={handleInputChange}
                          className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pr-12 sm:text-sm border-gray-300 rounded-md"
                          placeholder="0.00"
                          step="0.01"
                          min="0.01"
                          required
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 sm:text-sm">{formData.asset}</span>
                        </div>
                      </div>
                    </div>
                    
                    {error && (
                      <div className="mb-4 text-sm text-red-600">
                        {error}
                      </div>
                    )}
                    
                    {success && (
                      <div className="mb-4 text-sm text-green-600">
                        {success}
                      </div>
                    )}
                    
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        disabled={loading.action}
                      >
                        {loading.action ? (
                          <span className="flex items-center">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Processing...
                          </span>
                        ) : (
                          `${formData.action === 'add' ? 'Add' : 'Remove'} Liquidity`
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <p className="text-gray-500">
                Select a pool to view details and manage liquidity
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiquidityPool;

/**
 * SavingsChart Component for Zephyra
 * 
 * This component displays a bar chart comparing Zephyra's low fees to traditional
 * remittance services like Western Union for the Zephyra Stellar Testnet remittance platform.
 */

import React, { useState, useEffect } from 'react';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
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
 * SavingsChart Component
 * @param {Object} props - Component props
 * @param {string} props.publicKey - User's Stellar public key (optional)
 * @param {string} props.comparisonType - Type of comparison ('traditional', 'average', 'all')
 * @param {boolean} props.showPersonalized - Whether to show personalized data
 * @param {string} props.title - Chart title
 * @param {string} props.className - Additional CSS classes
 * @returns {JSX.Element} SavingsChart component
 */
const SavingsChart = ({ 
  publicKey = null, 
  comparisonType = 'traditional', 
  showPersonalized = true,
  title = 'Fee Comparison',
  className = ''
}) => {
  // State for chart data
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [savingsPercentage, setSavingsPercentage] = useState(0);
  
  // Fetch savings data on component mount or when props change
  useEffect(() => {
    const fetchSavingsData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        let savingsData;
        
        if (publicKey && showPersonalized) {
          // Fetch personalized savings comparison if public key is provided
          savingsData = await apiUtils.getSavingsComparison(publicKey, comparisonType);
        } else {
          // Fetch platform-wide savings data
          savingsData = await apiUtils.getPlatformSavings();
        }
        
        // Process data for the chart
        prepareChartData(savingsData);
      } catch (err) {
        console.error('Error fetching savings data:', err);
        setError(err.message || 'Failed to fetch savings data');
        
        // Use fallback data
        prepareFallbackData();
      } finally {
        setLoading(false);
      }
    };
    
    fetchSavingsData();
  }, [publicKey, comparisonType, showPersonalized]);
  
  /**
   * Prepare chart data from API response
   * @param {Object} savingsData - Savings data from API
   */
  const prepareChartData = (savingsData) => {
    // Extract relevant data
    const zephyraFee = savingsData.zephyraFee || 0.00001; // XLM fee per transaction
    const traditionalFee = savingsData.traditionalFee || 6.0; // Western Union average fee percentage
    
    // Calculate savings percentage
    const savingsPercent = ((traditionalFee - zephyraFee) / traditionalFee) * 100;
    setSavingsPercentage(savingsPercent);
    
    // Create chart data
    const data = {
      labels: ['Zephyra', 'Western Union'],
      datasets: [
        {
          label: 'Fee Percentage',
          data: [
            zephyraFee < 0.01 ? 0.01 : zephyraFee, // Minimum display value for visibility
            traditionalFee
          ],
          backgroundColor: [
            'rgba(75, 192, 192, 0.6)', // Teal for Zephyra
            'rgba(255, 99, 132, 0.6)'  // Red for Western Union
          ],
          borderColor: [
            'rgba(75, 192, 192, 1)',
            'rgba(255, 99, 132, 1)'
          ],
          borderWidth: 1,
        }
      ]
    };
    
    setChartData(data);
  };
  
  /**
   * Prepare fallback data if API call fails
   */
  const prepareFallbackData = () => {
    // Default comparison data
    const data = {
      labels: ['Zephyra', 'Western Union'],
      datasets: [
        {
          label: 'Fee Percentage',
          data: [0.01, 6.0], // Zephyra (0.00001 XLM, displayed as 0.01%), Western Union (6%)
          backgroundColor: [
            'rgba(75, 192, 192, 0.6)',
            'rgba(255, 99, 132, 0.6)'
          ],
          borderColor: [
            'rgba(75, 192, 192, 1)',
            'rgba(255, 99, 132, 1)'
          ],
          borderWidth: 1,
        }
      ]
    };
    
    setChartData(data);
    setSavingsPercentage(99.83); // (6 - 0.01) / 6 * 100
  };
  
  // Chart options
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Fee Percentage (%)'
        },
        ticks: {
          callback: (value) => `${value}%`
        }
      }
    },
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: title,
        font: {
          size: 16
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const value = context.raw;
            return `Fee: ${value}%`;
          }
        }
      }
    }
  };
  
  // Logarithmic scale options for better visualization of the huge difference
  const logOptions = {
    ...options,
    scales: {
      ...options.scales,
      y: {
        ...options.scales.y,
        type: 'logarithmic',
        min: 0.001 // Minimum value for log scale
      }
    }
  };
  
  return (
    <div className={`savings-chart-container bg-white rounded-lg shadow-md p-4 ${className}`}>
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
        </div>
      ) : error ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-red-500 text-center">
            <p className="text-lg font-semibold">Error loading chart</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      ) : (
        <div>
          <div className="h-64">
            <Bar data={chartData} options={logOptions} />
          </div>
          
          <div className="mt-6 text-center">
            <div className="text-sm text-gray-600 mb-2">
              Zephyra fees are approximately ~0.00001 XLM per transaction
            </div>
            <div className="text-xl font-bold text-indigo-600">
              Save up to {savingsPercentage.toFixed(2)}% on remittance fees
            </div>
            <div className="mt-2 text-sm text-gray-500">
              Compared to traditional remittance services like Western Union
            </div>
          </div>
          
          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="bg-green-50 p-3 rounded-lg border border-green-100">
              <div className="text-sm font-medium text-gray-700">Zephyra</div>
              <div className="text-2xl font-bold text-green-600">~0.00001 XLM</div>
              <div className="text-xs text-gray-500">Fixed fee per transaction</div>
            </div>
            <div className="bg-red-50 p-3 rounded-lg border border-red-100">
              <div className="text-sm font-medium text-gray-700">Western Union</div>
              <div className="text-2xl font-bold text-red-600">~6%</div>
              <div className="text-xs text-gray-500">Average fee of amount sent</div>
            </div>
          </div>
          
          <div className="mt-6 text-xs text-gray-500">
            <p>* Fees shown are approximate and may vary based on corridor, amount, and payment method.</p>
            <p>* Zephyra fees shown in XLM (Stellar Lumens), the native asset of the Stellar network.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SavingsChart;
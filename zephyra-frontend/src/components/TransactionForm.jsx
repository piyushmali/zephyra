/**
 * TransactionForm Component for Zephyra
 * 
 * This component provides a form for creating remittance transactions
 * in the Zephyra Stellar Testnet remittance platform.
 */

import React, { useState, useEffect } from 'react';
import freighterUtils from '../utils/freighter';
import apiUtils from '../utils/api';
import { DEMO_MODE } from '../utils/api';
import { useTransactions } from '../utils/transactionContext';

const TransactionForm = ({ publicKey, onTransactionComplete }) => {
  // Form state
  const [formData, setFormData] = useState({
    sourceAsset: 'USD',
    destinationAsset: 'MXN',
    amount: '',
    destinationAddress: '',
    memo: ''
  });
  
  // Transaction state
  const [exchangeRate, setExchangeRate] = useState(null);
  const [estimatedReceive, setEstimatedReceive] = useState(null);
  const [fee, setFee] = useState(null);
  const [transactionXdr, setTransactionXdr] = useState(null);
  const [transactionId, setTransactionId] = useState(null);
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [step, setStep] = useState(1);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [availableCorridors, setAvailableCorridors] = useState([]);

  // Get transaction context
  const { addTransaction } = useTransactions();
  
  // Fetch available corridors on component mount
  useEffect(() => {
    const fetchCorridors = async () => {
      try {
        const pools = await apiUtils.getPools();
        const corridors = pools.map(pool => ({
          value: pool.corridor,
          label: pool.corridor,
          assets: pool.assets
        }));
        setAvailableCorridors(corridors);
      } catch (err) {
        console.error('Error fetching corridors:', err);
        setError('Failed to fetch available corridors');
      }
    };
    
    fetchCorridors();
  }, []);
  
  // Update exchange rate when source/destination assets or amount changes
  useEffect(() => {
    const fetchExchangeRate = async () => {
      if (!formData.sourceAsset || !formData.destinationAsset || !formData.amount) {
        return;
      }
      
      try {
        setLoading(prev => ({ ...prev, rate: true }));
        const rateData = await apiUtils.getExchangeRate(formData.sourceAsset, formData.destinationAsset);
        setExchangeRate(rateData.exchangeRate);
        
        // Calculate estimated receive amount
        const amount = parseFloat(formData.amount);
        if (!isNaN(amount)) {
          const estimatedAmount = amount * rateData.exchangeRate;
          setEstimatedReceive(estimatedAmount);
          
          // Calculate fee (0.5% of amount)
          const feeAmount = amount * 0.005;
          setFee(feeAmount);
        }
      } catch (err) {
        console.error('Error fetching exchange rate:', err);
        setError('Failed to fetch exchange rate');
      } finally {
        setLoading(prev => ({ ...prev, rate: false }));
      }
    };
    
    fetchExchangeRate();
  }, [formData.sourceAsset, formData.destinationAsset, formData.amount]);
  
  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle corridor selection
  const handleCorridorChange = (e) => {
    const corridor = e.target.value;
    const [sourceAsset, destinationAsset] = corridor.split('-');
    
    setFormData(prev => ({
      ...prev,
      sourceAsset,
      destinationAsset
    }));
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!publicKey) {
        setError('Please connect your Freighter wallet');
        return;
      }
      
      if (!formData.amount || !formData.destinationAddress) {
        setError('Please fill in all required fields');
        return;
      }
      
      // Move to preview step
      setStep(2);
    } catch (err) {
      setError(err.message || 'Failed to process transaction');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle transaction creation
  const handleCreateTransaction = async () => {
    if (!termsAccepted) {
      setError('Please accept the terms and conditions');
      return;
    }
    
    try {
      setLoading(prev => ({ ...prev, submit: true }));
      setError(null);
      
      // Create remittance transaction
      const remittanceData = {
        sourceAsset: formData.sourceAsset,
        destinationAsset: formData.destinationAsset,
        amount: parseFloat(formData.amount),
        destinationAddress: formData.destinationAddress,
        senderPublicKey: publicKey,
        memo: formData.memo || undefined
      };
      
      const result = await apiUtils.createRemittance(remittanceData);
      
      // Store transaction data
      setTransactionXdr(result.xdr);
      setTransactionId(result.transactionId);
      
      // Move to confirm step
      setStep(3);
    } catch (err) {
      console.error('Error creating transaction:', err);
      setError(err.message || 'Failed to create transaction');
    } finally {
      setLoading(prev => ({ ...prev, submit: false }));
    }
  };
  
  // Handle transaction signing and submission
  const handleSignAndSubmit = async () => {
    if (!transactionXdr || !transactionId) {
      setError('Transaction data is missing');
      return;
    }
    
    try {
      setLoading(prev => ({ ...prev, submit: true }));
      setError(null);
      
      // Sign transaction with Freighter
      const signedXdr = await freighterUtils.signStellarTransaction(transactionXdr);
      
      // Submit signed transaction and store result
      const submitResult = await apiUtils.submitRemittance(signedXdr, transactionId);
      console.log('Transaction submitted:', submitResult);
      
      // Create a new transaction record
      const newTransaction = {
        id: transactionId,
        type: 'remittance',
        sourceAsset: formData.sourceAsset,
        destinationAsset: formData.destinationAsset,
        sourceAmount: parseFloat(formData.amount),
        destinationAmount: estimatedReceive,
        exchangeRate: exchangeRate,
        fee: fee,
        status: 'completed',
        timestamp: new Date().toISOString(),
        sender: publicKey,
        recipient: formData.destinationAddress,
        memo: formData.memo || 'No memo',
        savings: (parseFloat(formData.amount) * 0.05).toFixed(2) // Example savings calculation
      };
      
      // Add the transaction to the context
      addTransaction(newTransaction);
      
      // Move to result step
      setStep(4);
      
      if (onTransactionComplete) {
        onTransactionComplete();
      }
    } catch (err) {
      console.error('Error signing/submitting transaction:', err);
      setError(err.message || 'Failed to sign or submit transaction');
    } finally {
      setLoading(prev => ({ ...prev, submit: false }));
    }
  };
  
  // Handle starting a new transaction
  const handleNewTransaction = () => {
    // Reset form and state
    setFormData({
      sourceAsset: 'USD',
      destinationAsset: 'MXN',
      amount: '',
      destinationAddress: '',
      memo: ''
    });
    setTransactionXdr(null);
    setTransactionId(null);
    setError(null);
    setTermsAccepted(false);
    setStep(1);
  };
  
  // Render form step
  const renderFormStep = () => (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Remittance Corridor
        </label>
        <select
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          onChange={handleCorridorChange}
          value={`${formData.sourceAsset}-${formData.destinationAsset}`}
        >
          {availableCorridors.map(corridor => (
            <option key={corridor.value} value={corridor.value}>
              {corridor.label}
            </option>
          ))}
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Amount to Send ({formData.sourceAsset})
        </label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-500 sm:text-sm">$</span>
          </div>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleInputChange}
            className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
            placeholder="0.00"
            step="0.01"
            min="0.01"
            required
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className="text-gray-500 sm:text-sm">{formData.sourceAsset}</span>
          </div>
        </div>
        
        {loading.rate && (
          <div className="mt-2 text-xs text-gray-500">
            Calculating exchange rate...
          </div>
        )}
        
        {exchangeRate && !loading.rate && (
          <div className="mt-2 text-xs text-gray-500">
            Exchange Rate: 1 {formData.sourceAsset} = {exchangeRate.toFixed(4)} {formData.destinationAsset}
          </div>
        )}
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Recipient Stellar Address
        </label>
        <input
          type="text"
          name="destinationAddress"
          value={formData.destinationAddress}
          onChange={handleInputChange}
          className="focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
          placeholder="G..."
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Memo (Optional)
        </label>
        <input
          type="text"
          name="memo"
          value={formData.memo}
          onChange={handleInputChange}
          className="focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
          placeholder="Add a memo for this transaction"
        />
      </div>
      
      {error && (
        <div className="text-red-500 text-sm">
          {error}
        </div>
      )}
      
      <div className="flex justify-end">
        <button
          type="submit"
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          disabled={!publicKey || loading.rate}
        >
          Continue
        </button>
      </div>
    </form>
  );
  
  // Render preview step
  const renderPreviewStep = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">Transaction Preview</h3>
      
      <div className="bg-gray-50 p-4 rounded-md">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-gray-500">You Send</div>
            <div className="text-lg font-medium">{formData.amount} {formData.sourceAsset}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Recipient Gets</div>
            <div className="text-lg font-medium">
              {estimatedReceive ? estimatedReceive.toFixed(2) : '0.00'} {formData.destinationAsset}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Fee</div>
            <div className="text-lg font-medium">{fee ? fee.toFixed(2) : '0.00'} {formData.sourceAsset}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Exchange Rate</div>
            <div className="text-lg font-medium">
              1 {formData.sourceAsset} = {exchangeRate ? exchangeRate.toFixed(4) : '0.0000'} {formData.destinationAsset}
            </div>
          </div>
        </div>
      </div>
      
      <div className="border-t border-b py-4">
        <div className="flex items-center mb-4">
          <div className="mr-3 text-indigo-600">
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"></path>
            </svg>
          </div>
          <div>
            <div className="text-sm font-medium">Recipient</div>
            <div className="text-xs text-gray-500">{formData.destinationAddress}</div>
          </div>
        </div>
        
        {formData.memo && (
          <div className="flex items-center">
            <div className="mr-3 text-indigo-600">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path>
              </svg>
            </div>
            <div>
              <div className="text-sm font-medium">Memo</div>
              <div className="text-xs text-gray-500">{formData.memo}</div>
            </div>
          </div>
        )}
      </div>
      
      <div className="flex items-start">
        <div className="flex items-center h-5">
          <input
            id="terms"
            name="terms"
            type="checkbox"
            checked={termsAccepted}
            onChange={() => setTermsAccepted(!termsAccepted)}
            className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
          />
        </div>
        <div className="ml-3 text-sm">
          <label htmlFor="terms" className="font-medium text-gray-700">
            I agree to the terms and conditions
          </label>
          <p className="text-gray-500">
            I confirm that I am sending funds to the correct address and understand that transactions on the Stellar network are irreversible.
          </p>
        </div>
      </div>
      
      {error && (
        <div className="text-red-500 text-sm">
          {error}
        </div>
      )}
      
      <div className="flex justify-between">
        <button
          type="button"
          onClick={() => setStep(1)}
          className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Back
        </button>
        <button
          type="button"
          onClick={handleCreateTransaction}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          disabled={loading.submit}
        >
          {loading.submit ? 'Creating...' : 'Create Transaction'}
        </button>
      </div>
    </div>
  );
  
  // Render confirm step
  const renderConfirmStep = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">Sign Transaction</h3>
      
      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">Attention</h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>
                You are about to sign a transaction on the Stellar Testnet. Please review the details carefully before signing.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-gray-50 p-4 rounded-md">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-gray-500">Amount</div>
            <div className="text-lg font-medium">{formData.amount} {formData.sourceAsset}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Recipient</div>
            <div className="text-xs font-medium truncate">{formData.destinationAddress}</div>
          </div>
        </div>
      </div>
      
      {error && (
        <div className="text-red-500 text-sm">
          {error}
        </div>
      )}
      
      <div className="flex justify-between">
        <button
          type="button"
          onClick={() => setStep(2)}
          className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Back
        </button>
        <button
          type="button"
          onClick={handleSignAndSubmit}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          disabled={loading.submit}
        >
          {loading.submit ? 'Signing...' : 'Sign with Freighter'}
        </button>
      </div>
    </div>
  );
  
  // Render result step
  const renderResultStep = () => (
    <div className="space-y-6 text-center">
      <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
        <svg className="h-6 w-6 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-gray-900">Transaction Submitted!</h3>
      <p className="text-sm text-gray-500">
        Your transaction has been successfully submitted to the Stellar network. It may take a few seconds to be confirmed.
      </p>
      
      <div className="pt-4">
        <button
          type="button"
          onClick={handleNewTransaction}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          New Transaction
        </button>
      </div>
    </div>
  );
  
  return (
    <div className="p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Send Remittance</h1>
          <p className="text-gray-600 mb-6">Stellar Testnet Remittance Platform</p>

          {!publicKey ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">Please connect your wallet in the Dashboard to send money</p>
            </div>
          ) : (
            <div>
              {step === 1 && renderFormStep()}
              {step === 2 && renderPreviewStep()}
              {step === 3 && renderConfirmStep()}
              {step === 4 && renderResultStep()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransactionForm;
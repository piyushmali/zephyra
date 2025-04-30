/**
 * Mock Data for Zephyra Demo
 * 
 * This file provides mock data for the Zephyra platform to allow
 * for a complete demo without requiring actual blockchain interactions.
 */

// Mock wallet data
export const mockWallet = {
  publicKey: 'GDEMO2MOCKWALLET3ZEPHYRA4TESTNET5STELLAR6DEMO7KEY',
  balances: {
    XLM: '10000.0000000',
    USD: '5000.00',
    EUR: '4200.00',
    MXN: '25000.00',
    NGN: '1500000.00',
    PHP: '120000.00',
    INR: '200000.00'
  }
};

// Mock liquidity pools
export const mockPools = [
  {
    id: 'pool-usd-mxn',
    corridor: 'USD-MXN',
    assets: ['USD', 'MXN'],
    exchangeRate: 18.75,
    totalLiquidity: 250000,
    volume24h: 45000,
    apy: 5.2,
    liquidityProviders: 24,
    feePercentage: 0.3,
    status: 'active'
  },
  {
    id: 'pool-usd-ngn',
    corridor: 'USD-NGN',
    assets: ['USD', 'NGN'],
    exchangeRate: 1550.25,
    totalLiquidity: 180000,
    volume24h: 32000,
    apy: 6.8,
    liquidityProviders: 18,
    feePercentage: 0.3,
    status: 'active'
  },
  {
    id: 'pool-eur-ngn',
    corridor: 'EUR-NGN',
    assets: ['EUR', 'NGN'],
    exchangeRate: 1680.50,
    totalLiquidity: 150000,
    volume24h: 28000,
    apy: 6.5,
    liquidityProviders: 15,
    feePercentage: 0.3,
    status: 'active'
  },
  {
    id: 'pool-usd-php',
    corridor: 'USD-PHP',
    assets: ['USD', 'PHP'],
    exchangeRate: 56.25,
    totalLiquidity: 120000,
    volume24h: 25000,
    apy: 5.8,
    liquidityProviders: 12,
    feePercentage: 0.3,
    status: 'active'
  },
  {
    id: 'pool-usd-inr',
    corridor: 'USD-INR',
    assets: ['USD', 'INR'],
    exchangeRate: 82.75,
    totalLiquidity: 200000,
    volume24h: 35000,
    apy: 5.5,
    liquidityProviders: 20,
    feePercentage: 0.3,
    status: 'active'
  }
];

// Mock user savings data
export const mockSavings = {
  totalSaved: 1250.45,
  comparisonToTraditional: 325.75,
  percentageSaved: 26.5,
  monthlySavings: [
    { month: 'Jan', amount: 150.25 },
    { month: 'Feb', amount: 175.50 },
    { month: 'Mar', amount: 190.75 },
    { month: 'Apr', amount: 210.25 },
    { month: 'May', amount: 245.80 },
    { month: 'Jun', amount: 277.90 }
  ],
  projection: [
    { month: 'Jul', amount: 300.00 },
    { month: 'Aug', amount: 325.00 },
    { month: 'Sep', amount: 350.00 },
    { month: 'Oct', amount: 375.00 },
    { month: 'Nov', amount: 400.00 },
    { month: 'Dec', amount: 425.00 }
  ]
};

// Mock transaction history
export const mockTransactions = [
  {
    id: 'tx-001',
    type: 'remittance',
    sourceAsset: 'USD',
    destinationAsset: 'MXN',
    sourceAmount: 100.00,
    destinationAmount: 1875.00,
    exchangeRate: 18.75,
    fee: 0.50,
    status: 'completed',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    sender: mockWallet.publicKey,
    recipient: 'GREC3MOCKRECIPIENT4ZEPHYRA5TESTNET6STELLAR7DEMO',
    memo: 'Family support',
    savings: 25.50
  },
  {
    id: 'tx-002',
    type: 'remittance',
    sourceAsset: 'USD',
    destinationAsset: 'NGN',
    sourceAmount: 200.00,
    destinationAmount: 310050.00,
    exchangeRate: 1550.25,
    fee: 1.00,
    status: 'completed',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
    sender: mockWallet.publicKey,
    recipient: 'GREC4MOCKRECIPIENT5ZEPHYRA6TESTNET7STELLAR8DEMO',
    memo: 'School fees',
    savings: 45.75
  },
  {
    id: 'tx-003',
    type: 'remittance',
    sourceAsset: 'EUR',
    destinationAsset: 'NGN',
    sourceAmount: 150.00,
    destinationAmount: 252075.00,
    exchangeRate: 1680.50,
    fee: 0.75,
    status: 'completed',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), // 5 days ago
    sender: mockWallet.publicKey,
    recipient: 'GREC5MOCKRECIPIENT6ZEPHYRA7TESTNET8STELLAR9DEMO',
    memo: 'Rent payment',
    savings: 35.25
  },
  {
    id: 'tx-004',
    type: 'remittance',
    sourceAsset: 'USD',
    destinationAsset: 'PHP',
    sourceAmount: 300.00,
    destinationAmount: 16875.00,
    exchangeRate: 56.25,
    fee: 1.50,
    status: 'completed',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8).toISOString(), // 8 days ago
    sender: mockWallet.publicKey,
    recipient: 'GREC6MOCKRECIPIENT7ZEPHYRA8TESTNET9STELLAR0DEMO',
    memo: 'Medical expenses',
    savings: 55.80
  },
  {
    id: 'tx-005',
    type: 'remittance',
    sourceAsset: 'USD',
    destinationAsset: 'INR',
    sourceAmount: 250.00,
    destinationAmount: 20687.50,
    exchangeRate: 82.75,
    fee: 1.25,
    status: 'completed',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString(), // 12 days ago
    sender: mockWallet.publicKey,
    recipient: 'GREC7MOCKRECIPIENT8ZEPHYRA9TESTNET0STELLAR1DEMO',
    memo: 'Wedding gift',
    savings: 42.30
  }
];

// Mock user liquidity positions
export const mockLiquidityPositions = [
  {
    id: 'pos-001',
    poolId: 'pool-usd-mxn',
    corridor: 'USD-MXN',
    asset: 'USD',
    amount: 5000.00,
    share: 2.5,
    apy: 5.2,
    earnings: 125.50,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString() // 30 days ago
  },
  {
    id: 'pos-002',
    poolId: 'pool-usd-ngn',
    corridor: 'USD-NGN',
    asset: 'USD',
    amount: 3000.00,
    share: 1.8,
    apy: 6.8,
    earnings: 98.75,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 25).toISOString() // 25 days ago
  }
];

// Mock platform status
export const mockPlatformStatus = {
  status: 'operational',
  totalUsers: 1250,
  totalTransactions: 15780,
  totalVolume: 3250000,
  totalSavings: 825000,
  uptime: 99.98,
  lastUpdated: new Date().toISOString()
};

// Mock supported assets
export const mockSupportedAssets = [
  { code: 'XLM', name: 'Stellar Lumens', type: 'native' },
  { code: 'USD', name: 'US Dollar', type: 'fiat', issuer: 'GDEMO1ISSUER2ZEPHYRA3TESTNET4STELLAR5DEMO' },
  { code: 'EUR', name: 'Euro', type: 'fiat', issuer: 'GDEMO1ISSUER2ZEPHYRA3TESTNET4STELLAR5DEMO' },
  { code: 'MXN', name: 'Mexican Peso', type: 'fiat', issuer: 'GDEMO1ISSUER2ZEPHYRA3TESTNET4STELLAR5DEMO' },
  { code: 'NGN', name: 'Nigerian Naira', type: 'fiat', issuer: 'GDEMO1ISSUER2ZEPHYRA3TESTNET4STELLAR5DEMO' },
  { code: 'PHP', name: 'Philippine Peso', type: 'fiat', issuer: 'GDEMO1ISSUER2ZEPHYRA3TESTNET4STELLAR5DEMO' },
  { code: 'INR', name: 'Indian Rupee', type: 'fiat', issuer: 'GDEMO1ISSUER2ZEPHYRA3TESTNET4STELLAR5DEMO' }
];

// Helper function to generate a transaction ID
export const generateTransactionId = () => {
  return 'tx-' + Math.random().toString(36).substring(2, 10);
};

// Helper function to generate a transaction XDR (mock)
export const generateTransactionXdr = () => {
  return 'AAAAAGL9yvPYbfoot1pxXGLBn2HzWwQkz12/OqzKUftxcjK/AAAAZAEH/OgAAAADAAAAAQAAAABkXnhaAAAAAGReeFsAAAAAAAAAAQAAAAAAAAABAAAAAO2xJZAGAl5S+oO6IIgy4C5tJy+FLQhIGGJgTHMn6QT/AAAAAAAAAAA7msoAAAAAAAAAAAFxcjK/AAAAQJRZlMm7QqMBCqpwJNFTm1Tiny6FLZ/3ioiF9mYn4HGx1/L22OV8f3N8kYfFYZKZlw6R2Nfv8QXN/fEwLRlNiQA=';
};

// Default export of all mock data
export default {
  wallet: mockWallet,
  pools: mockPools,
  savings: mockSavings,
  transactions: mockTransactions,
  liquidityPositions: mockLiquidityPositions,
  platformStatus: mockPlatformStatus,
  supportedAssets: mockSupportedAssets,
  generateTransactionId,
  generateTransactionXdr
};

/**
 * Database Seed Script for Zephyra
 * 
 * This script populates the MongoDB database with sample data for the
 * Zephyra Stellar Testnet remittance platform, including users, transactions,
 * and liquidity pools.
 * 
 * Usage: node seed.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Transaction = require('./models/Transaction');
const Pool = require('./models/Pool');

// MongoDB Connection URI
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/zephyra';

/**
 * Connect to MongoDB
 */
const connectDB = async () => {
  try {
    await mongoose.connect(mongoURI);
    console.log('MongoDB connected successfully');
    return true;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

/**
 * Clear existing data from collections
 */
const clearCollections = async () => {
  try {
    await User.deleteMany({});
    await Transaction.deleteMany({});
    await Pool.deleteMany({});
    console.log('All collections cleared');
  } catch (error) {
    console.error('Error clearing collections:', error);
    process.exit(1);
  }
};

/**
 * Seed users collection
 * @returns {Promise<Array>} Array of created users
 */
const seedUsers = async () => {
  try {
    const users = [
      {
        publicKey: 'GBZH7S5NC57XNHKHJ75C5DGMI3SP6ZFJLIKW74K6OSMA5E5DFMYBDD2Z',
        alias: 'Alice'
      },
      {
        publicKey: 'GCUZ6YLL5RQBTYLTTQNZL4EQSW4TQWWDMXICSURB3CPLEQ5K349LPZUW',
        alias: 'Bob'
      }
    ];

    const createdUsers = await User.insertMany(users);
    console.log(`${createdUsers.length} users created`);
    return createdUsers;
  } catch (error) {
    console.error('Error seeding users:', error);
    process.exit(1);
  }
};

/**
 * Seed pools collection
 * @returns {Promise<Array>} Array of created pools
 */
const seedPools = async () => {
  try {
    const pools = [
      {
        corridor: 'USD-MXN',
        assets: ['USD', 'MXN'],
        totalLiquidity: 50000,
        yield: 3.5,
        isActive: true,
        stellarPoolId: '68ae289d7a5e1836811b2eb211b2b9cb19c9300f628df585a157053530e2e588'
      },
      {
        corridor: 'USD-EUR',
        assets: ['USD', 'EUR'],
        totalLiquidity: 75000,
        yield: 2.8,
        isActive: true,
        stellarPoolId: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0'
      },
      {
        corridor: 'XLM-USD',
        assets: ['XLM', 'USD'],
        totalLiquidity: 100000,
        yield: 4.2,
        isActive: true,
        stellarPoolId: '1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z7a8b9c0d'
      }
    ];

    const createdPools = await Pool.insertMany(pools);
    console.log(`${createdPools.length} pools created`);
    return createdPools;
  } catch (error) {
    console.error('Error seeding pools:', error);
    process.exit(1);
  }
};

/**
 * Seed transactions collection
 * @param {Array} users - Array of created users
 * @returns {Promise<Array>} Array of created transactions
 */
const seedTransactions = async (users) => {
  try {
    if (!users || users.length < 2) {
      throw new Error('Users are required to seed transactions');
    }

    const transactions = [
      {
        userId: users[0]._id,
        amount: 500,
        corridor: 'USD-MXN',
        status: 'completed',
        stellarTxHash: 'tx1hash123456789abcdef',
        sourceAsset: 'USD',
        destinationAsset: 'MXN',
        exchangeRate: 18.5
      },
      {
        userId: users[0]._id,
        amount: 1000,
        corridor: 'USD-EUR',
        status: 'completed',
        stellarTxHash: 'tx2hash123456789abcdef',
        sourceAsset: 'USD',
        destinationAsset: 'EUR',
        exchangeRate: 0.92
      },
      {
        userId: users[1]._id,
        amount: 250,
        corridor: 'USD-MXN',
        status: 'completed',
        stellarTxHash: 'tx3hash123456789abcdef',
        sourceAsset: 'USD',
        destinationAsset: 'MXN',
        exchangeRate: 18.6
      },
      {
        userId: users[1]._id,
        amount: 750,
        corridor: 'XLM-USD',
        status: 'completed',
        stellarTxHash: 'tx4hash123456789abcdef',
        sourceAsset: 'XLM',
        destinationAsset: 'USD',
        exchangeRate: 0.12
      },
      {
        userId: users[0]._id,
        amount: 300,
        corridor: 'USD-EUR',
        status: 'pending',
        sourceAsset: 'USD',
        destinationAsset: 'EUR',
        exchangeRate: 0.93
      }
    ];

    const createdTransactions = await Transaction.insertMany(transactions);
    console.log(`${createdTransactions.length} transactions created`);
    return createdTransactions;
  } catch (error) {
    console.error('Error seeding transactions:', error);
    process.exit(1);
  }
};

/**
 * Main function to seed the database
 */
const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Clear existing data
    await clearCollections();

    // Seed collections
    const users = await seedUsers();
    await seedPools();
    await seedTransactions(users);

    console.log('Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seed function
seedDatabase();

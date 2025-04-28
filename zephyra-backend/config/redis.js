const { createClient } = require('redis');

/**
 * Redis Connection
 * Establishes and manages the connection to Redis
 */
const connectRedis = async () => {
  try {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    const client = createClient({
      url: redisUrl
    });

    // Set up event handlers
    client.on('error', (err) => {
      console.error('Redis Client Error:', err);
    });

    client.on('connect', () => {
      console.log('Redis Client Connected');
    });

    client.on('ready', () => {
      console.log('Redis Client Ready');
    });

    // Connect to Redis
    await client.connect();
    
    return client;
  } catch (error) {
    console.error(`Error connecting to Redis: ${error.message}`);
    // Don't exit process here, as Redis might be optional
    return null;
  }
};

module.exports = connectRedis;

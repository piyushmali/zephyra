/**
 * Rate Limiter Middleware for Zephyra
 * 
 * This middleware provides rate limiting for API endpoints
 * in the Zephyra Stellar Testnet remittance platform.
 */

const rateLimit = require('express-rate-limit');

/**
 * Standard API rate limiter - 100 requests per minute
 */
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    error: 'Too many requests',
    message: 'Too many requests from this IP, please try again after a minute'
  }
});

/**
 * Stricter rate limiter for sensitive operations - 10 requests per minute
 */
const strictLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // limit each IP to 10 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many requests',
    message: 'Too many sensitive operations from this IP, please try again after a minute'
  }
});

module.exports = {
  apiLimiter,
  strictLimiter
};

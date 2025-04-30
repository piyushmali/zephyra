/**
 * Validators Middleware for Zephyra
 * 
 * This middleware provides validation functions for API requests
 * in the Zephyra Stellar Testnet remittance platform.
 */

const { check, validationResult } = require('express-validator');
const StellarSdk = require('@stellar/stellar-sdk');

/**
 * Validate pool creation request
 */
const validatePoolCreation = [
  check('corridor', 'Corridor is required').not().isEmpty(),
  check('assets', 'Assets must be an array with at least two elements').isArray({ min: 2 }),
  check('sourceSecretKey', 'Source secret key is required').not().isEmpty(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

/**
 * Validate remittance creation request
 */
const validateRemittanceCreation = [
  check('sourceAsset', 'Source asset is required').not().isEmpty(),
  check('destinationAsset', 'Destination asset is required').not().isEmpty(),
  check('amount', 'Amount must be a positive number').isFloat({ min: 0.000001 }),
  check('destinationAddress', 'Destination Stellar address is required').custom(value => {
    try {
      // Check if the value is a valid Stellar public key
      StellarSdk.StrKey.isValidEd25519PublicKey(value);
      return true;
    } catch (error) {
      throw new Error('Invalid Stellar address');
    }
  }),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

/**
 * Validate transaction XDR
 */
const validateTransactionXDR = [
  check('xdr', 'XDR is required').not().isEmpty(),
  check('xdr', 'Invalid XDR format').custom(value => {
    try {
      // Try to parse the XDR to verify it's valid
      StellarSdk.xdr.TransactionEnvelope.fromXDR(value, 'base64');
      return true;
    } catch (error) {
      throw new Error('Invalid XDR format');
    }
  }),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

/**
 * Validate user creation request
 */
const validateUserCreation = [
  check('publicKey', 'Valid Stellar public key is required').custom(value => {
    try {
      // Check if the value is a valid Stellar public key
      StellarSdk.StrKey.isValidEd25519PublicKey(value);
      return true;
    } catch (error) {
      throw new Error('Invalid Stellar public key');
    }
  }),
  check('alias', 'Alias must be a string').optional().isString(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

module.exports = {
  validatePoolCreation,
  validateRemittanceCreation,
  validateTransactionXDR,
  validateUserCreation
};

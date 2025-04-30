# Zephyra

![Zephyra Logo](zephyra-frontend/public/images/logo.png)

## Overview

Zephyra is a Stellar Testnet remittance platform that enables users to send, receive, and manage digital assets on the Stellar blockchain network. The platform integrates with the Freighter wallet for secure transaction signing and provides features for managing liquidity pools, tracking transaction history, and monitoring account balances.

## Features

- **Wallet Integration**: Seamless connection with Freighter wallet for secure transaction signing
- **Dashboard**: View account balances, recent transactions, and market rates
- **Remittance**: Send digital assets to other Stellar accounts with low fees
- **Transaction History**: Track all your past transactions with detailed information
- **Liquidity Pools**: Participate in liquidity pools to earn rewards and facilitate cross-border payments
- **Multi-Asset Support**: Support for XLM and other Stellar-based assets

## Architecture

Zephyra is built with a modern tech stack:

### Frontend
- React.js for the user interface
- TailwindCSS for styling
- Chart.js for data visualization
- Freighter API for wallet integration

### Backend
- Node.js with Express for the API server
- MongoDB for persistent data storage
- Redis for caching and rate limiting
- Stellar SDK v11.0.1 for blockchain interactions

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- Redis (optional, but recommended for production)
- Freighter wallet browser extension

## Installation

### Clone the repository

```bash
git clone https://github.com/piyushmali/zephyra.git
cd zephyra
```

### Backend Setup

```bash
cd zephyra-backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env file with your configuration
# Required variables:
# - MONGO_URI: MongoDB connection string
# - JWT_SECRET: Secret for JWT token generation
# - HORIZON_URL: Stellar Horizon server URL (defaults to testnet)
# - STELLAR_NETWORK: 'TESTNET' or 'PUBLIC'

# Start the server
npm run dev
```

### Frontend Setup

```bash
cd zephyra-frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env file with your configuration
# Required variables:
# - REACT_APP_API_URL: Backend API URL

# Start the development server
npm start
```

## Usage

1. **Connect Wallet**: Click the "Connect Wallet" button in the header to connect your Freighter wallet
2. **Dashboard**: View your account balances and recent transactions
3. **Send**: Send assets to other Stellar accounts
4. **Transaction History**: View your past transactions
5. **Liquidity Pools**: Add or remove liquidity from pools to earn rewards

## Development

### Backend Structure

- `/config`: Database and Redis configuration
- `/middleware`: Authentication, validation, and rate limiting
- `/models`: MongoDB schema definitions
- `/routes`: API route handlers
- `/services`: Business logic for remittance and pools
- `/utils`: Utility functions for Stellar operations

### Frontend Structure

- `/src/components`: React components
- `/src/utils`: Utility functions and API client
- `/src/assets`: Static assets like images and icons

## API Documentation

The API documentation is available at `/api/docs` when running the backend server.

Key endpoints include:

- `GET /api/users/me`: Get current user information
- `GET /api/transactions`: Get transaction history
- `POST /api/transactions`: Create a new transaction
- `GET /api/pools`: Get available liquidity pools
- `POST /api/pools/add`: Add liquidity to a pool
- `POST /api/pools/remove`: Remove liquidity from a pool

## Stellar Integration

Zephyra uses the Stellar SDK v11.0.1 to interact with the Stellar network. Key integration points include:

- Using `StellarSdk.Horizon.Server` for server instantiation
- Fetching liquidity pool data with `server.liquidityPools().liquidityPoolId()`
- Transaction creation and signing
- Account management and balance checking

## Troubleshooting

### Wallet Connection Issues

If you experience issues with wallet detection and connection:
- Ensure Freighter wallet extension is installed and unlocked
- Check that you're using a compatible browser
- Refresh the page and try connecting again

### Transaction Failures

If transactions fail:
- Ensure your account has sufficient balance
- Check that the recipient address is valid
- Verify that the transaction amount is within limits

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [Stellar Development Foundation](https://stellar.org) for the Stellar blockchain platform
- [Freighter](https://www.freighter.app/) for the Stellar wallet browser extension
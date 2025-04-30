# Zephyra Frontend

<p align="center">
  <img src="public/images/logo.png" alt="Zephyra Logo" width="300">
</p>

Frontend application for Zephyra - A Stellar remittance platform built with React.

## Features

### Wallet Integration
- **Freighter Wallet Connection**: Seamless integration with Freighter wallet for secure transaction signing
- **Multiple Retry Attempts**: Robust wallet detection system with multiple retry attempts
- **Direct API Access**: Simplified connection process with direct access to Freighter API
- **Unified Connection UI**: Single wallet connection button in the header for improved user experience

### Dashboard
- **Account Overview**: View your Stellar account balances and asset holdings at a glance
- **Recent Transactions**: Display of your most recent transactions with status indicators
- **Market Rates**: Real-time exchange rates between different asset pairs
- **Account Statistics**: Visual charts showing transaction history and balance changes

### Remittance Services
- **Cross-Border Payments**: Send digital assets globally with minimal fees
- **Multi-Asset Support**: Transfer XLM and other Stellar-based assets
- **Transaction Confirmation**: Real-time confirmation of transaction status

### Liquidity Pools
- **Pool Participation**: Add liquidity to Stellar liquidity pools to earn rewards
- **Pool Management**: Monitor and manage your liquidity positions
- **Pool Analytics**: View pool composition, volume, and performance metrics

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Create a `.env` file based on `.env.example`:
   ```
   cp .env.example .env
   ```

3. Configure the environment variables:
   ```
   REACT_APP_API_URL=http://localhost:5000/api
   ```

4. Start the development server:
   ```
   npm start
   ```

5. Build for production:
   ```
   npm run build
   ```

## Project Structure

- `/public` - Static assets
- `/src` - Source code
  - `/components` - React components
  - `/utils` - Utility functions
  - `/assets` - Images and styles
  - `/hooks` - Custom React hooks

## Freighter Wallet Integration

The application integrates with Freighter wallet using the `@stellar/freighter-api` package. Key integration points:

```javascript
import { isConnected, getPublicKey } from '@stellar/freighter-api';

// Check if Freighter is connected
const connected = await isConnected();

// Get the user's public key
const publicKey = await getPublicKey();
```

The wallet detection system includes multiple retry attempts and direct API access to ensure reliable connectivity.

## Stellar SDK Integration

The frontend communicates with the Stellar network through the backend API, which uses Stellar SDK v11.0.1.

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm test` - Launches the test runner
- `npm run build` - Builds the app for production
- `npm run eject` - Ejects from create-react-app

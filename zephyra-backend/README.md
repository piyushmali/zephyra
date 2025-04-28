# Zephyra Backend

Backend server for Zephyra - A Stellar Testnet remittance platform.

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Create a `.env` file based on `.env.example`:
   ```
   cp .env.example .env
   ```

3. Make sure MongoDB and Redis are running:
   ```
   # MongoDB should be running on port 27017
   # Redis should be running on port 6379
   ```

4. Start the server:
   ```
   # Development mode with auto-reload
   npm run dev
   
   # Production mode
   npm start
   ```

## API Endpoints

### Users

- `GET /api/users` - Get all users
- `GET /api/users/:publicKey` - Get user by public key
- `POST /api/users` - Create or update a user

### Transactions

- `GET /api/transactions` - Get all transactions
- `GET /api/transactions/user/:userId` - Get transactions by user ID
- `GET /api/transactions/:id` - Get transaction by ID
- `POST /api/transactions` - Create a new transaction
- `PUT /api/transactions/:id` - Update transaction status

### Pools

- `GET /api/pools` - Get all pools
- `GET /api/pools/:corridor` - Get pool by corridor
- `POST /api/pools` - Create a new pool
- `PUT /api/pools/:id` - Update a pool

## Models

### User
- `publicKey`: Stellar public key (unique identifier)
- `alias`: Optional user alias

### Transaction
- `userId`: Reference to User
- `amount`: Transaction amount
- `corridor`: Remittance corridor (e.g., "USD-EUR")
- `status`: Transaction status (pending, processing, completed, failed)
- `stellarTxHash`: Stellar transaction hash
- `sourceAsset`: Source asset code
- `destinationAsset`: Destination asset code
- `exchangeRate`: Exchange rate for the transaction

### Pool
- `corridor`: Remittance corridor (unique)
- `assets`: Array of supported assets
- `totalLiquidity`: Total liquidity in the pool
- `isActive`: Whether the pool is active
- `stellarPoolId`: Stellar liquidity pool ID

# Zephyra UI Wireframes

This document outlines the user interface wireframes for Zephyra, a Stellar Testnet remittance platform. These wireframes serve as a visual guide for the development of the platform's frontend components.

## Table of Contents

1. [Dashboard](#dashboard)
2. [Transaction Form](#transaction-form)
3. [Transaction History](#transaction-history)
4. [Mobile Responsiveness](#mobile-responsiveness)
5. [Color Palette](#color-palette)

## Dashboard

The Dashboard serves as the main landing page after a user connects their Freighter wallet.

### Components

#### Header Section
- **Logo**: Zephyra logo positioned in the top-left corner
- **Navigation**: Links to Dashboard, Transactions, and Documentation
- **Wallet Status**: Shows connection status with Freighter wallet
  - When disconnected: "Connect Freighter Wallet" button
  - When connected: Public key (abbreviated) with copy icon and "Connected" status

#### Wallet Information Panel
- **Account Balance**: Displays XLM balance and other assets
- **Account Health**: Visual indicator of account status (active/inactive)
- **Quick Actions**: Buttons for "Send", "Receive", and "View on Explorer"

#### Remittance Pool Statistics
- **Active Pools**: Card showing number of active remittance corridors
- **Total Liquidity**: Card showing combined liquidity across all pools
- **Your Participation**: Card showing user's contribution to pools
- **Pool Distribution**: Pie chart showing distribution of assets across corridors

#### Savings Metrics
- **Savings Chart**: Line chart showing estimated savings compared to traditional remittance services over time
- **Current Rate**: Display of current exchange rate for popular corridors
- **Fee Comparison**: Visual comparison between Zephyra fees and traditional services

#### Recent Activity
- **Mini Transaction List**: Shows 3-5 most recent transactions with status indicators
- **View All**: Link to full transaction history

### Layout

```
+----------------------------------------------------------------------+
|  LOGO                         Navigation                 Wallet Info  |
+----------------------------------------------------------------------+
|                                                                      |
|  +---------------------------+  +-------------------------------+    |
|  |                           |  |                               |    |
|  |  Wallet Information       |  |  Remittance Pool Statistics   |    |
|  |  - Balance                |  |  - Active Pools               |    |
|  |  - Account Status         |  |  - Total Liquidity            |    |
|  |  - Quick Actions          |  |  - Pool Distribution Chart    |    |
|  |                           |  |                               |    |
|  +---------------------------+  +-------------------------------+    |
|                                                                      |
|  +---------------------------+  +-------------------------------+    |
|  |                           |  |                               |    |
|  |  Savings Metrics          |  |  Recent Activity              |    |
|  |  - Savings Chart          |  |  - Mini Transaction List      |    |
|  |  - Rate Comparison        |  |  - View All Link              |    |
|  |                           |  |                               |    |
|  +---------------------------+  +-------------------------------+    |
|                                                                      |
+----------------------------------------------------------------------+
```

## Transaction Form

The Transaction Form allows users to initiate new remittance transactions.

### Components

#### Transaction Initiation Panel
- **Amount Input**: Field for entering transaction amount
- **Asset Selection**: Dropdown to select source asset (e.g., XLM, USD)
- **Corridor Selection**: Dropdown to select remittance corridor (e.g., USD-EUR, XLM-NGN)
- **Destination Input**: Field for recipient's Stellar address or federation name
- **Memo Field**: Optional memo for the transaction

#### Transaction Preview
- **Exchange Rate**: Current rate for the selected corridor
- **Fee Breakdown**: Itemized list of fees
- **Estimated Delivery**: Expected time for transaction completion
- **Total Amount**: Final amount recipient will receive

#### Confirmation Section
- **Terms Checkbox**: Agreement to terms and conditions
- **Freighter Signing Request**: Button to initiate Freighter wallet signing
- **Transaction Status**: Real-time updates on transaction progress

### Layout

```
+----------------------------------------------------------------------+
|  LOGO                         Navigation                 Wallet Info  |
+----------------------------------------------------------------------+
|                                                                      |
|  +---------------------------+  +-------------------------------+    |
|  |                           |  |                               |    |
|  |  Transaction Details      |  |  Transaction Preview          |    |
|  |  - Amount Input           |  |  - Exchange Rate              |    |
|  |  - Asset Selection        |  |  - Fee Breakdown              |    |
|  |  - Corridor Selection     |  |  - Estimated Delivery         |    |
|  |  - Destination Input      |  |  - Total Amount               |    |
|  |  - Memo Field             |  |                               |    |
|  |                           |  |                               |    |
|  +---------------------------+  +-------------------------------+    |
|                                                                      |
|  +------------------------------------------------------------------+|
|  |                                                                  ||
|  |  Confirmation Section                                            ||
|  |  - Terms Checkbox                                                ||
|  |  - Freighter Signing Request Button                              ||
|  |  - Transaction Status                                            ||
|  |                                                                  ||
|  +------------------------------------------------------------------+|
|                                                                      |
+----------------------------------------------------------------------+
```

## Transaction History

The Transaction History page provides a comprehensive view of past transactions.

### Components

#### Filtering Options
- **Date Range Selector**: Filter transactions by date range
- **Status Filter**: Filter by transaction status (pending, completed, failed)
- **Corridor Filter**: Filter by remittance corridor
- **Search Bar**: Search by transaction ID or recipient

#### Transaction Table
- **Columns**: Date, Amount, Corridor, Recipient, Status, Transaction Hash
- **Pagination**: Controls for navigating through transaction pages
- **Row Actions**: View details, Copy transaction hash, View on Explorer

#### Transaction Analytics
- **Volume Chart**: Bar or line chart showing transaction volume over time
- **Corridor Distribution**: Pie chart showing distribution across corridors
- **Success Rate**: Visual indicator of successful vs. failed transactions

#### Transaction Details Modal
- **Detailed View**: Comprehensive information about a selected transaction
- **Timeline**: Visual representation of transaction stages
- **Technical Details**: Stellar operation details for advanced users

### Layout

```
+----------------------------------------------------------------------+
|  LOGO                         Navigation                 Wallet Info  |
+----------------------------------------------------------------------+
|                                                                      |
|  +------------------------------------------------------------------+|
|  |                                                                  ||
|  |  Filtering Options                                               ||
|  |  [Date Range] [Status] [Corridor] [Search Bar]                   ||
|  |                                                                  ||
|  +------------------------------------------------------------------+|
|                                                                      |
|  +------------------------------------------------------------------+|
|  |                                                                  ||
|  |  Transaction Table                                               ||
|  |  +--------+--------+----------+-----------+--------+----------+ ||
|  |  | Date   | Amount | Corridor | Recipient | Status | Actions  | ||
|  |  +--------+--------+----------+-----------+--------+----------+ ||
|  |  | ...    | ...    | ...      | ...       | ...    | ...      | ||
|  |  +--------+--------+----------+-----------+--------+----------+ ||
|  |                                                                  ||
|  |  [Pagination Controls]                                           ||
|  |                                                                  ||
|  +------------------------------------------------------------------+|
|                                                                      |
|  +---------------------------+  +-------------------------------+    |
|  |                           |  |                               |    |
|  |  Volume Chart             |  |  Corridor Distribution        |    |
|  |  (Transactions over time) |  |  (Pie chart)                  |    |
|  |                           |  |                               |    |
|  +---------------------------+  +-------------------------------+    |
|                                                                      |
+----------------------------------------------------------------------+
```

## Mobile Responsiveness

All wireframes should adapt to mobile devices with the following considerations:

### Mobile Adaptations

- **Navigation**: Collapses into a hamburger menu
- **Dashboard Panels**: Stack vertically in a single column
- **Transaction Form**: Form fields expand to full width
- **Transaction Table**: Horizontal scrolling or card-based view for narrow screens
- **Charts**: Simplified versions with touch-friendly interactions

### Layout Example (Mobile)

```
+----------------------------------+
|  LOGO              [≡] [Wallet]  |
+----------------------------------+
|                                  |
|  +------------------------------+|
|  |                              ||
|  |  Wallet Information          ||
|  |  - Balance                   ||
|  |  - Account Status            ||
|  |  - Quick Actions             ||
|  |                              ||
|  +------------------------------+|
|                                  |
|  +------------------------------+|
|  |                              ||
|  |  Remittance Pool Statistics  ||
|  |  - Active Pools              ||
|  |  - Total Liquidity           ||
|  |  - Pool Distribution Chart   ||
|  |                              ||
|  +------------------------------+|
|                                  |
|  +------------------------------+|
|  |                              ||
|  |  Savings Metrics             ||
|  |  - Savings Chart             ||
|  |  - Rate Comparison           ||
|  |                              ||
|  +------------------------------+|
|                                  |
|  +------------------------------+|
|  |                              ||
|  |  Recent Activity             ||
|  |  - Mini Transaction List     ||
|  |  - View All Link             ||
|  |                              ||
|  +------------------------------+|
|                                  |
+----------------------------------+
```

## Color Palette

The Zephyra platform will use the following color scheme:

- **Primary Color**: Deep indigo (#3F51B5) - For headers, buttons, and primary actions
- **Secondary Color**: Teal (#009688) - For highlights and secondary actions
- **Accent Color**: Amber (#FFC107) - For important notifications and calls to action
- **Background**: Light gray (#F5F7FA) - For the main background
- **Card Background**: White (#FFFFFF) - For cards and panels
- **Text Colors**:
  - Primary Text: Dark gray (#333333)
  - Secondary Text: Medium gray (#666666)
  - Disabled Text: Light gray (#999999)
- **Status Colors**:
  - Success: Green (#4CAF50)
  - Warning: Orange (#FF9800)
  - Error: Red (#F44336)
  - Info: Blue (#2196F3)

## Implementation Notes

- All components should be built using React with Tailwind CSS
- Charts should be implemented using a lightweight library like Chart.js or Recharts
- Freighter wallet integration should be prominent and user-friendly
- All interfaces should be accessible according to WCAG 2.1 AA standards
- Animations and transitions should be subtle and enhance usability
- Loading states should be clearly indicated for all asynchronous operations

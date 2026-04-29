# LendFlow - DeFi Lending Protocol

A decentralized lending & borrowing platform built with Solidity smart contracts and a modern React frontend. Users can deposit assets to earn interest, borrow against collateral, and earn LFT reward tokens.

## Architecture

```
┌─────────────────────────────────────────────────┐
│                  Frontend (React)                │
│  Dashboard │ Deposit │ Borrow │ Positions │ ...  │
├─────────────────────────────────────────────────┤
│              ethers.js / Web3 Provider           │
├─────────────────────────────────────────────────┤
│                Smart Contracts (EVM)             │
│  LendFlow.sol │ LendFlowToken.sol │ PriceOracle │
└─────────────────────────────────────────────────┘
```

## Features

- **Lending & Borrowing** — Deposit assets to earn variable APY, borrow against collateral
- **Dynamic Interest Rates** — Kink-based utilization model (2% base → 10% at 80% → 60% at 100%)
- **Health Factor Monitoring** — Real-time position health tracking with liquidation thresholds
- **Reward Tokens (LFT)** — Earn LendFlow tokens for supplying liquidity
- **Liquidation Engine** — Undercollateralized positions can be liquidated with 5% bonus
- **Emergency Controls** — Owner can pause protocol and perform emergency withdrawals
- **Modern UI** — Glassmorphic dark theme with charts, animations, and responsive design

## Tech Stack

| Layer      | Technology                                              |
|------------|---------------------------------------------------------|
| Contracts  | Solidity (`^0.8.19`/`^0.8.20`), OpenZeppelin v5         |
| Compiler   | Hardhat Solidity compiler `0.8.20`                      |
| Framework  | Hardhat                                                  |
| Frontend   | React 18, Vite, TailwindCSS                             |
| Web3       | ethers.js v6                                             |
| Charts     | Recharts                                                 |

## Quick Start

### Prerequisites
- Node.js >= 18
- MetaMask or any Web3 wallet

### 1. Install Dependencies
```bash
# Root (smart contracts)
npm install

# Frontend
cd frontend && npm install
```

### 2. Compile Contracts
```bash
npm run compile
```

### 3. Deploy Locally
```bash
# Start local blockchain
npm run node

# Deploy contracts (in another terminal)
npm run deploy:local
```

### 4. Run Frontend
```bash
cd frontend
npm run dev
```

### 5. Run Tests (Optional but Recommended)
```bash
npm test
```

### 6. Connect MetaMask
- Network: `http://127.0.0.1:8545`, Chain ID: `1337`
- Import a Hardhat test account private key
- If wallet requests a different network, switch back to local Hardhat (`1337`) before interacting with the app.

## Smart Contracts

| Contract        | Description                                    |
|-----------------|------------------------------------------------|
| `LendFlow.sol`  | Core lending protocol (deposit/borrow/repay/liquidate) |
| `LendFlowToken.sol` | ERC20 reward token (LFT)                   |
| `PriceOracle.sol`   | Token price feed with staleness checks     |
| `MockERC20.sol`     | Mock assets used for local deployment/testing |

## Project Structure

```
LendFlow/
├── contracts/           # Solidity smart contracts
│   ├── interfaces/      # Contract interfaces
│   ├── LendFlow.sol     # Main lending protocol
│   ├── LendFlowToken.sol # Reward token
│   ├── PriceOracle.sol  # Price oracle
│   └── MockERC20.sol    # Mock ERC20 tokens for local/dev
├── frontend/            # React frontend
│   └── src/
│       ├── components/  # Page components
│       ├── context/     # Web3 context
│       ├── utils/       # Helpers & constants
│       ├── styles/      # Global CSS
│       └── deployment.json # Auto-generated deployed addresses
├── scripts/             # Deployment scripts
├── hardhat.config.js    # Hardhat configuration
└── .env.example         # Environment template
```

## Environment Variables

Copy `.env.example` to `.env` and configure:

```
GOERLI_RPC_URL=...         # Goerli RPC endpoint (legacy testnet config)
MAINNET_RPC_URL=...        # Mainnet RPC endpoint
PRIVATE_KEY=...            # Deployer wallet key (never commit)
ETHERSCAN_API_KEY=...      # Contract verification key
VITE_CONTRACT_ADDRESS=...  # Frontend fallback protocol address
VITE_ORACLE_ADDRESS=...    # Frontend fallback oracle address
VITE_NETWORK_ID=1337       # Frontend network id
```

## Deployment Output

Running `npm run deploy:local` writes:

- `deployment.json` in the repository root
- `frontend/src/deployment.json` for frontend auto-consumption

The frontend reads addresses from `frontend/src/deployment.json` first, then falls back to `VITE_CONTRACT_ADDRESS` and `VITE_ORACLE_ADDRESS` when deployment data is unavailable.

## License

MIT

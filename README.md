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

| Layer      | Technology                              |
|------------|-----------------------------------------|
| Contracts  | Solidity 0.8.19, OpenZeppelin v5        |
| Framework  | Hardhat                                 |
| Frontend   | React 18, Vite, TailwindCSS             |
| Web3       | ethers.js v6                            |
| Charts     | Recharts                                |

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
npx hardhat compile
```

### 3. Deploy Locally
```bash
# Start local blockchain
npx hardhat node

# Deploy contracts (in another terminal)
npx hardhat run scripts/deploy.js --network localhost
```

### 4. Run Frontend
```bash
cd frontend
npm run dev
```

### 5. Connect MetaMask
- Network: `http://127.0.0.1:8545`, Chain ID: `1337`
- Import a Hardhat test account private key

## Smart Contracts

| Contract        | Description                                    |
|-----------------|------------------------------------------------|
| `LendFlow.sol`  | Core lending protocol (deposit/borrow/repay/liquidate) |
| `LendFlowToken.sol` | ERC20 reward token (LFT)                   |
| `PriceOracle.sol`   | Token price feed with staleness checks     |

## Project Structure

```
LendFlow/
├── contracts/           # Solidity smart contracts
│   ├── interfaces/      # Contract interfaces
│   ├── LendFlow.sol     # Main lending protocol
│   ├── LendFlowToken.sol # Reward token
│   └── PriceOracle.sol  # Price oracle
├── frontend/            # React frontend
│   └── src/
│       ├── components/  # Page components
│       ├── context/     # Web3 context
│       ├── utils/       # Helpers & constants
│       └── styles/      # Global CSS
├── scripts/             # Deployment scripts
├── hardhat.config.js    # Hardhat configuration
└── .env.example         # Environment template
```

## Environment Variables

Copy `.env.example` to `.env` and configure:

```
GOERLI_RPC_URL=...       # For testnet deployment
PRIVATE_KEY=...          # Deployer wallet key
ETHERSCAN_API_KEY=...    # For contract verification
```

## License

MIT

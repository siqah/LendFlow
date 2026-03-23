// ============ Contract Addresses ============
export const CONTRACT_ADDRESSES = {
  LendFlow: import.meta.env.VITE_CONTRACT_ADDRESS || '0x5FbDB2315678afecb367f032d93F642f64180aa3',
  PriceOracle: import.meta.env.VITE_ORACLE_ADDRESS || '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
};

// ============ Network Config ============
export const NETWORKS = {
  1337: {
    name: 'Hardhat Local',
    rpcUrl: 'http://127.0.0.1:8545',
    chainId: 1337,
    blockExplorer: '',
  },
  5: {
    name: 'Goerli Testnet',
    rpcUrl: 'https://eth-goerli.g.alchemy.com/v2/',
    chainId: 5,
    blockExplorer: 'https://goerli.etherscan.io',
  },
  1: {
    name: 'Ethereum Mainnet',
    rpcUrl: 'https://eth-mainnet.g.alchemy.com/v2/',
    chainId: 1,
    blockExplorer: 'https://etherscan.io',
  },
};

// ============ Token Constants ============
export const TOKENS = {
  ETH: {
    symbol: 'ETH',
    name: 'Ethereum',
    address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
    decimals: 18,
    icon: '⟠',
    color: '#627EEA',
  },
  USDC: {
    symbol: 'USDC',
    name: 'USD Coin',
    address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    decimals: 6,
    icon: '💲',
    color: '#2775CA',
  },
  DAI: {
    symbol: 'DAI',
    name: 'Dai Stablecoin',
    address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    decimals: 18,
    icon: '◆',
    color: '#F5AC37',
  },
};

export const TOKEN_LIST = Object.values(TOKENS);

// ============ ABI (simplified for frontend) ============
export const LENDFLOW_ABI = [
  "function deposit(address _token, uint256 _amount) external",
  "function withdraw(address _token, uint256 _amount) external",
  "function borrow(address _token, uint256 _amount) external",
  "function repay(address _token, uint256 _amount) external",
  "function liquidate(address _user, address _token) external",
  "function getUserHealthFactor(address _user, address _token) external view returns (uint256)",
  "function getSupportedTokens() external view returns (address[])",
  "function getMarketData(address _token) external view returns (uint256, uint256, uint256, uint256, uint256, uint256, uint256, bool)",
  "function getUserPosition(address _user, address _token) external view returns (uint256, uint256, uint256, uint256, uint256)",
  "function users(address, address) external view returns (uint256, uint256, uint256, uint256, uint256)",
  "function markets(address) external view returns (address, uint256, uint256, uint256, uint256, uint256, uint256, uint256, bool)",
  "event Deposited(address indexed user, address indexed token, uint256 amount, uint256 timestamp)",
  "event Withdrawn(address indexed user, address indexed token, uint256 amount, uint256 timestamp)",
  "event Borrowed(address indexed user, address indexed token, uint256 amount, uint256 timestamp)",
  "event Repaid(address indexed user, address indexed token, uint256 amount, uint256 timestamp)",
  "event Liquidated(address indexed user, address indexed token, uint256 amount, uint256 timestamp)",
];

export const PRICE_ORACLE_ABI = [
  "function getPrice(address _token) external view returns (uint256)",
  "function getMultiplePrices(address[] calldata _tokens) external view returns (uint256[])",
];

// ============ Demo / Mock Data ============
export const DEMO_MARKETS = [
  {
    token: TOKENS.ETH,
    totalDeposits: 15420.5,
    totalBorrows: 8750.3,
    utilizationRate: 56.7,
    depositAPY: 4.82,
    borrowAPY: 7.15,
    price: 2000,
    tvl: 30841000,
  },
  {
    token: TOKENS.USDC,
    totalDeposits: 25000000,
    totalBorrows: 18500000,
    utilizationRate: 74.0,
    depositAPY: 6.25,
    borrowAPY: 8.92,
    price: 1,
    tvl: 25000000,
  },
  {
    token: TOKENS.DAI,
    totalDeposits: 12500000,
    totalBorrows: 7800000,
    utilizationRate: 62.4,
    depositAPY: 5.18,
    borrowAPY: 7.85,
    price: 1,
    tvl: 12500000,
  },
];

export const DEMO_STATS = {
  totalValueLocked: 68341000,
  totalBorrows: 27050300,
  activeUsers: 1250,
  avgAPY: 5.42,
  totalRewardsDistributed: 2450000,
  protocolRevenue: 850000,
};

import deployment from '../deployment.json';

const deployedContracts = deployment?.contracts || {};
const deployedMarkets = deployment?.markets || {};

// ============ Contract Addresses ============
export const CONTRACT_ADDRESSES = {
  LendFlow: deployedContracts.LendFlow || import.meta.env.VITE_CONTRACT_ADDRESS,
  PriceOracle: deployedContracts.PriceOracle || import.meta.env.VITE_ORACLE_ADDRESS,
  LendFlowToken: deployedContracts.LendFlowToken,
};

// ============ Network Config ============
export const NETWORKS = {
  1337: {
    name: 'Hardhat Local',
    rpcUrl: 'http://127.0.0.1:8545',
    chainId: 1337,
    blockExplorer: '',
  },
};

// ============ Token Constants ============
export const TOKENS = {
  WETH: {
    symbol: 'WETH',
    name: 'Wrapped Ether',
    address: deployedMarkets.ETH,
    decimals: 18,
    icon: '⟠',
    color: '#627EEA',
  },
  USDC: {
    symbol: 'USDC',
    name: 'USD Coin',
    address: deployedMarkets.USDC,
    decimals: 18, // MockERC20 deploys with 18 decimals by default
    icon: '💲',
    color: '#2775CA',
  },
  DAI: {
    symbol: 'DAI',
    name: 'Dai Stablecoin',
    address: deployedMarkets.DAI,
    decimals: 18,
    icon: '◆',
    color: '#F5AC37',
  },
};

export const TOKEN_LIST = Object.values(TOKENS);

// ============ ABIs ============
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
  "event Repaid(address indexed user, address indexed token, uint256 amount, uint256 timestamp)"
];

export const PRICE_ORACLE_ABI = [
  "function getPrice(address _token) external view returns (uint256)",
  "function setPrice(address _token, uint256 _price) external"
];

export const ERC20_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function balanceOf(address account) external view returns (uint256)",
  "function mint(address to, uint256 amount) public"
];

// Fallback demo stats used during transition
export const DEMO_STATS = {
  totalValueLocked: 68341000,
  totalBorrows: 27050300,
  activeUsers: 1250,
  avgAPY: 5.42,
  totalRewardsDistributed: 2450000,
  protocolRevenue: 850000,
};

export const DEMO_MARKETS = [
  {
    token: TOKENS.WETH,
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

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./interfaces/IPriceOracle.sol";
import "./LendFlowToken.sol";

/**
 * @title LendFlow - DeFi Lending Protocol
 * @notice A decentralized lending platform with interest-bearing deposits and collateralized loans
 * @dev Implements deposit, withdraw, borrow, repay, and liquidation with dynamic interest rates
 */
contract LendFlow is Ownable, ReentrancyGuard, Pausable {
    
    struct UserInfo {
        uint256 depositedAmount;
        uint256 borrowedAmount;
        uint256 lastUpdateTime;
        uint256 accumulatedInterest;
        uint256 totalCollateral;
    }
    
    struct MarketInfo {
        IERC20 token;
        uint256 totalDeposits;
        uint256 totalBorrows;
        uint256 utilizationRate;
        uint256 depositAPY;
        uint256 borrowAPY;
        uint256 collateralFactor;
        uint256 liquidationThreshold;
        bool isActive;
    }
    
    // ============ Constants ============
    uint256 public constant PRECISION = 1e18;
    uint256 public constant BASIS_POINTS = 10000;
    uint256 public constant MAX_COLLATERAL_FACTOR = 8000; // 80%
    uint256 public constant LIQUIDATION_BONUS = 500; // 5%
    uint256 public constant SECONDS_PER_YEAR = 365 days;
    
    // ============ State Variables ============
    mapping(address => mapping(address => UserInfo)) public users;
    mapping(address => MarketInfo) public markets;
    address[] public supportedTokens;
    
    LendFlowToken public rewardToken;
    IPriceOracle public priceOracle;
    
    // ============ Events ============
    event Deposited(address indexed user, address indexed token, uint256 amount, uint256 timestamp);
    event Withdrawn(address indexed user, address indexed token, uint256 amount, uint256 timestamp);
    event Borrowed(address indexed user, address indexed token, uint256 amount, uint256 timestamp);
    event Repaid(address indexed user, address indexed token, uint256 amount, uint256 timestamp);
    event Liquidated(address indexed user, address indexed token, uint256 amount, uint256 timestamp);
    event InterestAccrued(address indexed user, address indexed token, uint256 interest, uint256 timestamp);
    event MarketAdded(address indexed token, uint256 collateralFactor, uint256 liquidationThreshold);
    
    // ============ Constructor ============
    constructor(address _priceOracle) Ownable(msg.sender) {
        require(_priceOracle != address(0), "Invalid oracle address");
        priceOracle = IPriceOracle(_priceOracle);
        rewardToken = new LendFlowToken(address(this));
    }
    
    // ============ Admin Functions ============
    
    /**
     * @dev Add a new supported token market
     * @param _token Address of the ERC20 token
     * @param _collateralFactor Maximum borrow value as % of collateral (in basis points)
     * @param _liquidationThreshold Threshold at which position becomes liquidatable (in basis points)
     */
    function addMarket(
        address _token,
        uint256 _collateralFactor,
        uint256 _liquidationThreshold
    ) external onlyOwner {
        require(_token != address(0), "Invalid token address");
        require(_collateralFactor <= MAX_COLLATERAL_FACTOR, "Collateral factor too high");
        require(_liquidationThreshold > _collateralFactor, "Invalid thresholds");
        require(!markets[_token].isActive, "Market already exists");
        
        markets[_token] = MarketInfo({
            token: IERC20(_token),
            totalDeposits: 0,
            totalBorrows: 0,
            utilizationRate: 0,
            depositAPY: 0,
            borrowAPY: 0,
            collateralFactor: _collateralFactor,
            liquidationThreshold: _liquidationThreshold,
            isActive: true
        });
        
        supportedTokens.push(_token);
        emit MarketAdded(_token, _collateralFactor, _liquidationThreshold);
    }
    
    // ============ Core Functions ============
    
    /**
     * @dev Deposit tokens to earn interest
     * @param _token Address of the token to deposit
     * @param _amount Amount of tokens to deposit
     */
    function deposit(address _token, uint256 _amount) external nonReentrant whenNotPaused {
        require(_amount > 0, "Amount must be > 0");
        MarketInfo storage market = markets[_token];
        require(market.isActive, "Market not active");
        
        _updateInterest(msg.sender, _token);
        
        require(market.token.transferFrom(msg.sender, address(this), _amount), "Transfer failed");
        
        market.totalDeposits += _amount;
        UserInfo storage user = users[msg.sender][_token];
        user.depositedAmount += _amount;
        user.totalCollateral += _getTokenValue(_token, _amount);
        
        _updateRates(_token);
        
        uint256 reward = _calculateReward(_amount, market.depositAPY);
        if (reward > 0) {
            rewardToken.mint(msg.sender, reward);
        }
        
        emit Deposited(msg.sender, _token, _amount, block.timestamp);
    }
    
    /**
     * @dev Withdraw deposited tokens
     * @param _token Address of the token to withdraw
     * @param _amount Amount of tokens to withdraw
     */
    function withdraw(address _token, uint256 _amount) external nonReentrant whenNotPaused {
        require(_amount > 0, "Amount must be > 0");
        MarketInfo storage market = markets[_token];
        UserInfo storage user = users[msg.sender][_token];
        require(user.depositedAmount >= _amount, "Insufficient balance");
        
        _updateInterest(msg.sender, _token);
        
        uint256 withdrawValue = _getTokenValue(_token, _amount);
        uint256 newCollateral = user.totalCollateral > withdrawValue 
            ? user.totalCollateral - withdrawValue 
            : 0;
        require(
            _getHealthFactor(msg.sender, _token, newCollateral) >= PRECISION,
            "Health factor too low"
        );
        
        user.depositedAmount -= _amount;
        market.totalDeposits -= _amount;
        user.totalCollateral = newCollateral;
        
        require(market.token.transfer(msg.sender, _amount), "Transfer failed");
        
        _updateRates(_token);
        
        emit Withdrawn(msg.sender, _token, _amount, block.timestamp);
    }
    
    /**
     * @dev Borrow tokens against collateral
     * @param _token Address of the token to borrow
     * @param _amount Amount of tokens to borrow
     */
    function borrow(address _token, uint256 _amount) external nonReentrant whenNotPaused {
        require(_amount > 0, "Amount must be > 0");
        MarketInfo storage market = markets[_token];
        UserInfo storage user = users[msg.sender][_token];
        
        require(market.totalDeposits - market.totalBorrows >= _amount, "Insufficient liquidity");
        
        _updateInterest(msg.sender, _token);
        
        uint256 borrowValue = _getTokenValue(_token, _amount);
        uint256 maxBorrowValue = (user.totalCollateral * market.collateralFactor) / BASIS_POINTS;
        require(
            user.borrowedAmount + borrowValue <= maxBorrowValue,
            "Exceeds borrow limit"
        );
        
        user.borrowedAmount += borrowValue;
        market.totalBorrows += _amount;
        
        require(market.token.transfer(msg.sender, _amount), "Transfer failed");
        
        _updateRates(_token);
        
        emit Borrowed(msg.sender, _token, _amount, block.timestamp);
    }
    
    /**
     * @dev Repay borrowed tokens
     * @param _token Address of the token to repay
     * @param _amount Amount of tokens to repay
     */
    function repay(address _token, uint256 _amount) external nonReentrant {
        require(_amount > 0, "Amount must be > 0");
        MarketInfo storage market = markets[_token];
        UserInfo storage user = users[msg.sender][_token];
        
        _updateInterest(msg.sender, _token);
        
        uint256 repayValue = _getTokenValue(_token, _amount);
        require(repayValue <= user.borrowedAmount, "Repaying more than borrowed");
        
        user.borrowedAmount -= repayValue;
        market.totalBorrows -= _amount;
        
        require(market.token.transferFrom(msg.sender, address(this), _amount), "Transfer failed");
        
        _updateRates(_token);
        
        emit Repaid(msg.sender, _token, _amount, block.timestamp);
    }
    
    /**
     * @dev Liquidate an undercollateralized position
     * @param _user Address of the user to liquidate
     * @param _token Address of the token market
     */
    function liquidate(address _user, address _token) external nonReentrant {
        MarketInfo storage market = markets[_token];
        UserInfo storage user = users[_user][_token];
        
        _updateInterest(_user, _token);
        
        uint256 healthFactor = _getHealthFactor(_user, _token, user.totalCollateral);
        require(healthFactor < PRECISION, "Position not liquidatable");
        
        uint256 liquidationAmount = user.borrowedAmount;
        uint256 collateralToLiquidate = (liquidationAmount * BASIS_POINTS) / market.liquidationThreshold;
        
        uint256 bonus = (collateralToLiquidate * LIQUIDATION_BONUS) / BASIS_POINTS;
        uint256 totalToSeize = collateralToLiquidate + bonus;
        
        if (totalToSeize > user.depositedAmount) {
            totalToSeize = user.depositedAmount;
        }
        
        user.borrowedAmount = 0;
        user.depositedAmount -= totalToSeize;
        
        uint256 seizedValue = _getTokenValue(_token, totalToSeize);
        user.totalCollateral = user.totalCollateral > seizedValue 
            ? user.totalCollateral - seizedValue 
            : 0;
        market.totalDeposits -= totalToSeize;
        
        require(market.token.transfer(msg.sender, totalToSeize), "Transfer failed");
        
        _updateRates(_token);
        
        emit Liquidated(_user, _token, totalToSeize, block.timestamp);
    }
    
    // ============ Internal Functions ============
    
    /**
     * @dev Update interest rates based on utilization (kink model)
     */
    function _updateRates(address _token) internal {
        MarketInfo storage market = markets[_token];
        
        if (market.totalDeposits == 0) {
            market.utilizationRate = 0;
            market.depositAPY = 0;
            market.borrowAPY = 0;
            return;
        }
        
        market.utilizationRate = (market.totalBorrows * BASIS_POINTS) / market.totalDeposits;
        
        uint256 optimalUtilization = 8000; // 80%
        
        if (market.utilizationRate <= optimalUtilization) {
            // Base rate: 2%, slope: 10% at optimal
            market.borrowAPY = 200 + (market.utilizationRate * 800) / optimalUtilization;
        } else {
            // Steep slope above optimal: up to 60% APY
            market.borrowAPY = 1000 + 
                ((market.utilizationRate - optimalUtilization) * 5000) / 
                (BASIS_POINTS - optimalUtilization);
        }
        
        // Deposit APY = borrowAPY * utilization
        market.depositAPY = (market.borrowAPY * market.utilizationRate) / BASIS_POINTS;
    }
    
    /**
     * @dev Update user's accumulated interest
     */
    function _updateInterest(address _user, address _token) internal {
        UserInfo storage user = users[_user][_token];
        MarketInfo storage market = markets[_token];
        
        if (user.lastUpdateTime > 0 && user.depositedAmount > 0) {
            uint256 timeElapsed = block.timestamp - user.lastUpdateTime;
            uint256 interest = (user.depositedAmount * market.depositAPY * timeElapsed) / 
                (SECONDS_PER_YEAR * BASIS_POINTS);
            user.accumulatedInterest += interest;
            
            emit InterestAccrued(_user, _token, interest, block.timestamp);
        }
        
        user.lastUpdateTime = block.timestamp;
    }
    
    /**
     * @dev Calculate token value in USD
     */
    function _getTokenValue(address _token, uint256 _amount) internal view returns (uint256) {
        uint256 price = priceOracle.getPrice(_token);
        return (_amount * price) / PRECISION;
    }
    
    /**
     * @dev Calculate health factor for a position
     */
    function _getHealthFactor(
        address _user, 
        address _token, 
        uint256 _collateral
    ) internal view returns (uint256) {
        UserInfo storage user = users[_user][_token];
        MarketInfo storage market = markets[_token];
        
        if (user.borrowedAmount == 0) return type(uint256).max;
        
        uint256 maxBorrowable = (_collateral * market.liquidationThreshold) / BASIS_POINTS;
        return (maxBorrowable * PRECISION) / user.borrowedAmount;
    }
    
    /**
     * @dev Calculate reward tokens for deposit
     */
    function _calculateReward(uint256 _amount, uint256 _apy) internal pure returns (uint256) {
        return (_amount * 100) / PRECISION;
    }
    
    // ============ View Functions ============
    
    /**
     * @dev Get user's health factor
     */
    function getUserHealthFactor(address _user, address _token) external view returns (uint256) {
        UserInfo storage user = users[_user][_token];
        return _getHealthFactor(_user, _token, user.totalCollateral);
    }
    
    /**
     * @dev Get all supported tokens
     */
    function getSupportedTokens() external view returns (address[] memory) {
        return supportedTokens;
    }
    
    /**
     * @dev Get market data for a token
     */
    function getMarketData(address _token) external view returns (
        uint256 totalDeposits,
        uint256 totalBorrows,
        uint256 utilizationRate,
        uint256 depositAPY,
        uint256 borrowAPY,
        uint256 collateralFactor,
        uint256 liquidationThreshold,
        bool isActive
    ) {
        MarketInfo storage market = markets[_token];
        return (
            market.totalDeposits,
            market.totalBorrows,
            market.utilizationRate,
            market.depositAPY,
            market.borrowAPY,
            market.collateralFactor,
            market.liquidationThreshold,
            market.isActive
        );
    }
    
    /**
     * @dev Get user position data
     */
    function getUserPosition(address _user, address _token) external view returns (
        uint256 depositedAmount,
        uint256 borrowedAmount,
        uint256 accumulatedInterest,
        uint256 totalCollateral,
        uint256 healthFactor
    ) {
        UserInfo storage user = users[_user][_token];
        return (
            user.depositedAmount,
            user.borrowedAmount,
            user.accumulatedInterest,
            user.totalCollateral,
            _getHealthFactor(_user, _token, user.totalCollateral)
        );
    }
    
    // ============ Emergency Functions ============
    
    /**
     * @dev Emergency withdraw all tokens of a specific type (owner only)
     */
    function emergencyWithdraw(address _token) external onlyOwner {
        MarketInfo storage market = markets[_token];
        uint256 balance = market.token.balanceOf(address(this));
        require(market.token.transfer(owner(), balance), "Transfer failed");
    }
    
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title ILendFlow - Interface for the LendFlow Lending Protocol
 * @notice Defines the external functions for the lending protocol
 */
interface ILendFlow {
    struct UserInfo {
        uint256 depositedAmount;
        uint256 borrowedAmount;
        uint256 lastUpdateTime;
        uint256 accumulatedInterest;
        uint256 totalCollateral;
    }

    struct MarketInfo {
        address token;
        uint256 totalDeposits;
        uint256 totalBorrows;
        uint256 utilizationRate;
        uint256 depositAPY;
        uint256 borrowAPY;
        uint256 collateralFactor;
        uint256 liquidationThreshold;
        bool isActive;
    }

    event Deposited(address indexed user, address indexed token, uint256 amount, uint256 timestamp);
    event Withdrawn(address indexed user, address indexed token, uint256 amount, uint256 timestamp);
    event Borrowed(address indexed user, address indexed token, uint256 amount, uint256 timestamp);
    event Repaid(address indexed user, address indexed token, uint256 amount, uint256 timestamp);
    event Liquidated(address indexed user, address indexed token, uint256 amount, uint256 timestamp);
    event InterestAccrued(address indexed user, address indexed token, uint256 interest, uint256 timestamp);

    function deposit(address _token, uint256 _amount) external;
    function withdraw(address _token, uint256 _amount) external;
    function borrow(address _token, uint256 _amount) external;
    function repay(address _token, uint256 _amount) external;
    function liquidate(address _user, address _token) external;
    function getUserHealthFactor(address _user, address _token) external view returns (uint256);
}

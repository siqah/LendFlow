// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title IPriceOracle - Interface for the Price Oracle
 * @notice Provides price feeds for supported tokens
 */
interface IPriceOracle {
    function getPrice(address _token) external view returns (uint256);
    function getMultiplePrices(address[] calldata _tokens) external view returns (uint256[] memory);
}

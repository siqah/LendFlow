// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IPriceOracle.sol";

/**
 * @title PriceOracle - Token Price Feed
 * @notice Provides USD price feeds for supported tokens with staleness checks
 * @dev In production, this would integrate with Chainlink or another oracle network
 */
contract PriceOracle is IPriceOracle, Ownable {
    mapping(address => uint256) public prices;
    mapping(address => uint256) public lastUpdate;

    uint256 public constant PRECISION = 1e18;
    uint256 public constant MAX_PRICE_AGE = 1 hours;

    event PriceUpdated(address indexed token, uint256 price, uint256 timestamp);

    constructor() Ownable(msg.sender) {
        // Set initial prices for common tokens (in USD with 18 decimals)
        // ETH sentinel address
        address ethAddress = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;
        // USDC mainnet address
        address usdcAddress = 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48;

        prices[ethAddress] = 2000 * PRECISION;
        lastUpdate[ethAddress] = block.timestamp;

        prices[usdcAddress] = 1 * PRECISION;
        lastUpdate[usdcAddress] = block.timestamp;
    }

    /**
     * @dev Get the latest price for a token
     * @param _token Token address
     * @return Price in USD with 18 decimals
     */
    function getPrice(address _token) external view override returns (uint256) {
        require(prices[_token] > 0, "Price not set");
        require(block.timestamp - lastUpdate[_token] <= MAX_PRICE_AGE, "Stale price");
        return prices[_token];
    }

    /**
     * @dev Set the price for a token (owner only)
     * @param _token Token address
     * @param _price Price in USD with 18 decimals
     */
    function setPrice(address _token, uint256 _price) external onlyOwner {
        require(_price > 0, "Invalid price");
        prices[_token] = _price;
        lastUpdate[_token] = block.timestamp;
        emit PriceUpdated(_token, _price, block.timestamp);
    }

    /**
     * @dev Get prices for multiple tokens
     * @param _tokens Array of token addresses
     * @return Array of prices in USD with 18 decimals
     */
    function getMultiplePrices(address[] calldata _tokens) external view override returns (uint256[] memory) {
        uint256[] memory results = new uint256[](_tokens.length);
        for (uint256 i = 0; i < _tokens.length; i++) {
            results[i] = prices[_tokens[i]];
        }
        return results;
    }
}

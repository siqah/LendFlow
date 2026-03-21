// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title LendFlowToken - Protocol Reward Token
 * @notice ERC20 token minted as rewards for depositors in the LendFlow protocol
 */
contract LendFlowToken is ERC20, Ownable {
    address public lendingProtocol;

    modifier onlyProtocol() {
        require(msg.sender == lendingProtocol, "Only protocol can mint");
        _;
    }

    constructor(address _protocol) ERC20("LendFlow Token", "LFT") Ownable(msg.sender) {
        require(_protocol != address(0), "Invalid protocol address");
        lendingProtocol = _protocol;
    }

    /**
     * @dev Mint reward tokens to a depositor
     * @param to Address to mint tokens to
     * @param amount Amount of tokens to mint
     */
    function mint(address to, uint256 amount) external onlyProtocol {
        _mint(to, amount);
    }

    /**
     * @dev Burn tokens from an address
     * @param from Address to burn tokens from
     * @param amount Amount of tokens to burn
     */
    function burn(address from, uint256 amount) external onlyProtocol {
        _burn(from, amount);
    }
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MockUSDC
 * @notice Mock USDC token for testing purposes
 */
contract MockUSDC is ERC20, Ownable {
    uint8 private _decimals = 6;

    constructor() ERC20("USD Coin", "USDC") Ownable(msg.sender) {
        // Mint 1 million USDC to deployer for testing
        _mint(msg.sender, 1_000_000 * 10 ** _decimals);
    }

    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }

    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    // Faucet for testing - anyone can get tokens
    function faucet(uint256 amount) external {
        require(amount <= 10000 * 10 ** _decimals, "Max 10000 USDC per faucet");
        _mint(msg.sender, amount);
    }
}

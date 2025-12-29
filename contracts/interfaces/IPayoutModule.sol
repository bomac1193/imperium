// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IPayoutModule
 * @notice Interface for distributing royalty payments
 * @dev Supports USDC and native token payouts
 */
interface IPayoutModule {

    struct Payout {
        uint256 payoutId;
        uint256 songId;
        uint256 amount;
        address token;          // Address of payment token (or address(0) for native)
        string source;          // "spotify", "apple", "youtube", "sync", etc.
        string region;          // ISO country code
        uint256 timestamp;
        bool distributed;
    }

    struct ClaimableBalance {
        address token;
        uint256 amount;
    }

    event RoyaltyReceived(
        uint256 indexed payoutId,
        uint256 indexed songId,
        uint256 amount,
        address token,
        string source,
        string region
    );

    event RoyaltyDistributed(
        uint256 indexed payoutId,
        uint256 indexed songId,
        address indexed recipient,
        uint256 amount
    );

    event RoyaltyClaimed(
        address indexed recipient,
        address indexed token,
        uint256 amount
    );

    event BatchPayoutProcessed(
        uint256 indexed batchId,
        uint256 totalAmount,
        uint256 songCount
    );

    function depositRoyalty(
        uint256 songId,
        uint256 amount,
        address token,
        string calldata source,
        string calldata region
    ) external returns (uint256 payoutId);

    function distributeRoyalty(uint256 payoutId) external;
    function batchDistribute(uint256[] calldata payoutIds) external;
    function claimRoyalties(address token) external;
    function claimAllRoyalties() external;

    function getClaimableBalance(address recipient, address token) external view returns (uint256);
    function getAllClaimableBalances(address recipient) external view returns (ClaimableBalance[] memory);
    function getPayout(uint256 payoutId) external view returns (Payout memory);
    function getSongPayouts(uint256 songId) external view returns (uint256[] memory);
    function getTotalEarnings(uint256 songId) external view returns (uint256);
}

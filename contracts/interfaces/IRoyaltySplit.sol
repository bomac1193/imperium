// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IRoyaltySplit
 * @notice Interface for managing royalty splits between creators, producers, and stakeholders
 * @dev "No Masters. Take the Throne."
 */
interface IRoyaltySplit {

    struct Split {
        address recipient;
        uint256 percentage;     // Basis points (10000 = 100%)
        string role;            // "artist", "producer", "writer", "label", etc.
        bool active;
    }

    struct SongSplits {
        uint256 songId;
        Split[] splits;
        bool locked;            // Once locked, splits cannot be changed
        uint256 totalPercentage;
    }

    event SplitsConfigured(
        uint256 indexed songId,
        address[] recipients,
        uint256[] percentages,
        string[] roles
    );

    event SplitUpdated(
        uint256 indexed songId,
        address indexed recipient,
        uint256 oldPercentage,
        uint256 newPercentage
    );

    event SplitsLocked(uint256 indexed songId);
    event RecipientAdded(uint256 indexed songId, address recipient, uint256 percentage, string role);
    event RecipientRemoved(uint256 indexed songId, address recipient);

    function configureSplits(
        uint256 songId,
        address[] calldata recipients,
        uint256[] calldata percentages,
        string[] calldata roles
    ) external;

    function addRecipient(
        uint256 songId,
        address recipient,
        uint256 percentage,
        string calldata role
    ) external;

    function removeRecipient(uint256 songId, address recipient) external;
    function updateSplit(uint256 songId, address recipient, uint256 newPercentage) external;
    function lockSplits(uint256 songId) external;
    function getSplits(uint256 songId) external view returns (Split[] memory);
    function getRecipientSplit(uint256 songId, address recipient) external view returns (Split memory);
    function calculatePayout(uint256 songId, uint256 amount) external view returns (address[] memory, uint256[] memory);
}

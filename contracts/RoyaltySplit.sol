// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./interfaces/IRoyaltySplit.sol";
import "./interfaces/ISongRegistry.sol";

/**
 * @title RoyaltySplit
 * @notice Manages royalty split configurations between creators, producers, and stakeholders
 * @dev "No Masters. Take the Throne."
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 * ⬡ IMPERIUM - Music Royalty Platform ⬡
 * ═══════════════════════════════════════════════════════════════════════════════
 */
contract RoyaltySplit is IRoyaltySplit, AccessControl, ReentrancyGuard {

    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");

    // Basis points for percentage calculations (10000 = 100%)
    uint256 public constant BASIS_POINTS = 10000;

    // Song registry reference
    ISongRegistry public immutable songRegistry;

    // Song ID => array of splits
    mapping(uint256 => Split[]) private _songSplits;

    // Song ID => recipient address => index in splits array (+1, 0 means not found)
    mapping(uint256 => mapping(address => uint256)) private _recipientIndex;

    // Song ID => locked status
    mapping(uint256 => bool) private _splitsLocked;

    // Song ID => total allocated percentage
    mapping(uint256 => uint256) private _totalAllocated;

    // ═══════════════════════════════════════════════════════════════════════════
    // Errors
    // ═══════════════════════════════════════════════════════════════════════════

    error SongNotFound();
    error NotSongOwner();
    error SplitsLocked();
    error InvalidArrayLength();
    error InvalidPercentage();
    error TotalExceeds100Percent();
    error RecipientNotFound();
    error RecipientAlreadyExists();
    error ZeroAddress();
    error CannotRemovePrimaryCreator();

    // ═══════════════════════════════════════════════════════════════════════════
    // Constructor
    // ═══════════════════════════════════════════════════════════════════════════

    constructor(address _songRegistry, address admin) {
        songRegistry = ISongRegistry(_songRegistry);
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(OPERATOR_ROLE, admin);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // Modifiers
    // ═══════════════════════════════════════════════════════════════════════════

    modifier onlySongOwnerOrOperator(uint256 songId) {
        ISongRegistry.Song memory song = songRegistry.getSong(songId);
        if (msg.sender != song.primaryCreator && !hasRole(OPERATOR_ROLE, msg.sender)) {
            revert NotSongOwner();
        }
        _;
    }

    modifier splitsNotLocked(uint256 songId) {
        if (_splitsLocked[songId]) revert SplitsLocked();
        _;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // External Functions
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * @notice Configure initial splits for a song
     * @param songId The song ID
     * @param recipients Array of recipient addresses
     * @param percentages Array of percentages in basis points
     * @param roles Array of role descriptions
     */
    function configureSplits(
        uint256 songId,
        address[] calldata recipients,
        uint256[] calldata percentages,
        string[] calldata roles
    ) external override onlySongOwnerOrOperator(songId) splitsNotLocked(songId) {
        if (recipients.length != percentages.length || recipients.length != roles.length) {
            revert InvalidArrayLength();
        }

        // Clear existing splits
        delete _songSplits[songId];
        _totalAllocated[songId] = 0;

        // Clear recipient indices
        for (uint256 i = 0; i < recipients.length; i++) {
            _recipientIndex[songId][recipients[i]] = 0;
        }

        uint256 total = 0;
        for (uint256 i = 0; i < recipients.length; i++) {
            if (recipients[i] == address(0)) revert ZeroAddress();
            if (percentages[i] == 0 || percentages[i] > BASIS_POINTS) revert InvalidPercentage();

            total += percentages[i];
            if (total > BASIS_POINTS) revert TotalExceeds100Percent();

            _songSplits[songId].push(Split({
                recipient: recipients[i],
                percentage: percentages[i],
                role: roles[i],
                active: true
            }));

            _recipientIndex[songId][recipients[i]] = i + 1; // +1 because 0 means not found
        }

        _totalAllocated[songId] = total;

        emit SplitsConfigured(songId, recipients, percentages, roles);
    }

    /**
     * @notice Add a new recipient to song splits
     * @param songId The song ID
     * @param recipient Address of the new recipient
     * @param percentage Percentage in basis points
     * @param role Role description
     */
    function addRecipient(
        uint256 songId,
        address recipient,
        uint256 percentage,
        string calldata role
    ) external override onlySongOwnerOrOperator(songId) splitsNotLocked(songId) {
        if (recipient == address(0)) revert ZeroAddress();
        if (_recipientIndex[songId][recipient] != 0) revert RecipientAlreadyExists();
        if (percentage == 0 || percentage > BASIS_POINTS) revert InvalidPercentage();

        uint256 newTotal = _totalAllocated[songId] + percentage;
        if (newTotal > BASIS_POINTS) revert TotalExceeds100Percent();

        _songSplits[songId].push(Split({
            recipient: recipient,
            percentage: percentage,
            role: role,
            active: true
        }));

        _recipientIndex[songId][recipient] = _songSplits[songId].length;
        _totalAllocated[songId] = newTotal;

        emit RecipientAdded(songId, recipient, percentage, role);
    }

    /**
     * @notice Remove a recipient from song splits
     * @param songId The song ID
     * @param recipient Address to remove
     */
    function removeRecipient(
        uint256 songId,
        address recipient
    ) external override onlySongOwnerOrOperator(songId) splitsNotLocked(songId) {
        uint256 index = _recipientIndex[songId][recipient];
        if (index == 0) revert RecipientNotFound();

        // Cannot remove primary creator
        ISongRegistry.Song memory song = songRegistry.getSong(songId);
        if (recipient == song.primaryCreator) revert CannotRemovePrimaryCreator();

        uint256 arrayIndex = index - 1;
        uint256 percentage = _songSplits[songId][arrayIndex].percentage;

        // Mark as inactive instead of deleting to preserve indices
        _songSplits[songId][arrayIndex].active = false;
        _songSplits[songId][arrayIndex].percentage = 0;
        _recipientIndex[songId][recipient] = 0;
        _totalAllocated[songId] -= percentage;

        emit RecipientRemoved(songId, recipient);
    }

    /**
     * @notice Update a recipient's split percentage
     * @param songId The song ID
     * @param recipient Address of the recipient
     * @param newPercentage New percentage in basis points
     */
    function updateSplit(
        uint256 songId,
        address recipient,
        uint256 newPercentage
    ) external override onlySongOwnerOrOperator(songId) splitsNotLocked(songId) {
        uint256 index = _recipientIndex[songId][recipient];
        if (index == 0) revert RecipientNotFound();
        if (newPercentage == 0 || newPercentage > BASIS_POINTS) revert InvalidPercentage();

        uint256 arrayIndex = index - 1;
        uint256 oldPercentage = _songSplits[songId][arrayIndex].percentage;

        uint256 newTotal = _totalAllocated[songId] - oldPercentage + newPercentage;
        if (newTotal > BASIS_POINTS) revert TotalExceeds100Percent();

        _songSplits[songId][arrayIndex].percentage = newPercentage;
        _totalAllocated[songId] = newTotal;

        emit SplitUpdated(songId, recipient, oldPercentage, newPercentage);
    }

    /**
     * @notice Lock splits permanently (irreversible)
     * @param songId The song ID
     */
    function lockSplits(uint256 songId) external override onlySongOwnerOrOperator(songId) {
        if (_splitsLocked[songId]) revert SplitsLocked();
        _splitsLocked[songId] = true;
        emit SplitsLocked(songId);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // View Functions
    // ═══════════════════════════════════════════════════════════════════════════

    function getSplits(uint256 songId) external view override returns (Split[] memory) {
        return _songSplits[songId];
    }

    function getRecipientSplit(
        uint256 songId,
        address recipient
    ) external view override returns (Split memory) {
        uint256 index = _recipientIndex[songId][recipient];
        if (index == 0) revert RecipientNotFound();
        return _songSplits[songId][index - 1];
    }

    /**
     * @notice Calculate payout amounts for each recipient
     * @param songId The song ID
     * @param amount Total amount to distribute
     * @return recipients Array of recipient addresses
     * @return amounts Array of amounts for each recipient
     */
    function calculatePayout(
        uint256 songId,
        uint256 amount
    ) external view override returns (address[] memory recipients, uint256[] memory amounts) {
        Split[] memory splits = _songSplits[songId];

        // Count active recipients
        uint256 activeCount = 0;
        for (uint256 i = 0; i < splits.length; i++) {
            if (splits[i].active) activeCount++;
        }

        recipients = new address[](activeCount);
        amounts = new uint256[](activeCount);

        uint256 j = 0;
        for (uint256 i = 0; i < splits.length; i++) {
            if (splits[i].active) {
                recipients[j] = splits[i].recipient;
                amounts[j] = (amount * splits[i].percentage) / BASIS_POINTS;
                j++;
            }
        }

        return (recipients, amounts);
    }

    function areSplitsLocked(uint256 songId) external view returns (bool) {
        return _splitsLocked[songId];
    }

    function getTotalAllocated(uint256 songId) external view returns (uint256) {
        return _totalAllocated[songId];
    }
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./interfaces/IPayoutModule.sol";
import "./interfaces/IRoyaltySplit.sol";
import "./interfaces/ISongRegistry.sol";

/**
 * @title PayoutModule
 * @notice Distributes royalty payments to creators based on split configurations
 * @dev "Break the Chain. Own It."
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 * ⬡ IMPERIUM - Music Royalty Platform ⬡
 * ═══════════════════════════════════════════════════════════════════════════════
 */
contract PayoutModule is IPayoutModule, AccessControl, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;

    bytes32 public constant DEPOSITOR_ROLE = keccak256("DEPOSITOR_ROLE");
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");

    // Contract references
    ISongRegistry public immutable songRegistry;
    IRoyaltySplit public immutable royaltySplit;

    // Payout storage
    mapping(uint256 => Payout) private _payouts;
    mapping(uint256 => uint256[]) private _songPayouts;
    mapping(address => mapping(address => uint256)) private _claimableBalances; // recipient => token => amount
    mapping(address => address[]) private _recipientTokens; // recipient => array of tokens with balances
    mapping(address => mapping(address => bool)) private _hasTokenBalance; // tracking for recipientTokens

    // Statistics
    mapping(uint256 => uint256) private _songTotalEarnings;
    mapping(string => uint256) private _regionTotalEarnings; // ISO code => amount
    mapping(string => uint256) private _sourceTotalEarnings; // source => amount

    uint256 private _payoutIdCounter;
    uint256 private _batchIdCounter;

    // Supported payment tokens
    mapping(address => bool) public supportedTokens;
    address[] public tokenList;

    // ═══════════════════════════════════════════════════════════════════════════
    // Events for tracking
    // ═══════════════════════════════════════════════════════════════════════════

    event TokenAdded(address indexed token);
    event TokenRemoved(address indexed token);

    // ═══════════════════════════════════════════════════════════════════════════
    // Errors
    // ═══════════════════════════════════════════════════════════════════════════

    error SongNotFound();
    error PayoutNotFound();
    error PayoutAlreadyDistributed();
    error UnsupportedToken();
    error NoClaimableBalance();
    error TransferFailed();
    error InvalidAmount();

    // ═══════════════════════════════════════════════════════════════════════════
    // Constructor
    // ═══════════════════════════════════════════════════════════════════════════

    constructor(
        address _songRegistry,
        address _royaltySplit,
        address admin,
        address usdcToken
    ) {
        songRegistry = ISongRegistry(_songRegistry);
        royaltySplit = IRoyaltySplit(_royaltySplit);

        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(DEPOSITOR_ROLE, admin);
        _grantRole(OPERATOR_ROLE, admin);

        _payoutIdCounter = 1;
        _batchIdCounter = 1;

        // Add USDC as default supported token
        if (usdcToken != address(0)) {
            supportedTokens[usdcToken] = true;
            tokenList.push(usdcToken);
            emit TokenAdded(usdcToken);
        }

        // Native token (address(0)) is always supported
        supportedTokens[address(0)] = true;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // External Functions
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * @notice Deposit royalties for a song
     * @param songId The song ID
     * @param amount Amount of tokens
     * @param token Token address (address(0) for native)
     * @param source Source platform (e.g., "spotify", "apple")
     * @param region ISO country code
     * @return payoutId The unique payout identifier
     */
    function depositRoyalty(
        uint256 songId,
        uint256 amount,
        address token,
        string calldata source,
        string calldata region
    ) external payable override onlyRole(DEPOSITOR_ROLE) nonReentrant whenNotPaused returns (uint256 payoutId) {
        // Verify song exists
        ISongRegistry.Song memory song = songRegistry.getSong(songId);
        if (song.songId == 0) revert SongNotFound();

        if (!supportedTokens[token]) revert UnsupportedToken();
        if (amount == 0) revert InvalidAmount();

        // Handle token transfer
        if (token == address(0)) {
            if (msg.value != amount) revert InvalidAmount();
        } else {
            IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
        }

        payoutId = _payoutIdCounter++;

        _payouts[payoutId] = Payout({
            payoutId: payoutId,
            songId: songId,
            amount: amount,
            token: token,
            source: source,
            region: region,
            timestamp: block.timestamp,
            distributed: false
        });

        _songPayouts[songId].push(payoutId);
        _songTotalEarnings[songId] += amount;
        _regionTotalEarnings[region] += amount;
        _sourceTotalEarnings[source] += amount;

        emit RoyaltyReceived(payoutId, songId, amount, token, source, region);
    }

    /**
     * @notice Distribute a payout to recipients based on splits
     * @param payoutId The payout to distribute
     */
    function distributeRoyalty(uint256 payoutId) public override nonReentrant whenNotPaused {
        Payout storage payout = _payouts[payoutId];
        if (payout.payoutId == 0) revert PayoutNotFound();
        if (payout.distributed) revert PayoutAlreadyDistributed();

        (address[] memory recipients, uint256[] memory amounts) =
            royaltySplit.calculatePayout(payout.songId, payout.amount);

        payout.distributed = true;

        for (uint256 i = 0; i < recipients.length; i++) {
            if (amounts[i] > 0) {
                _addClaimableBalance(recipients[i], payout.token, amounts[i]);
                emit RoyaltyDistributed(payoutId, payout.songId, recipients[i], amounts[i]);
            }
        }
    }

    /**
     * @notice Batch distribute multiple payouts
     * @param payoutIds Array of payout IDs to distribute
     */
    function batchDistribute(uint256[] calldata payoutIds) external override {
        uint256 totalAmount = 0;

        for (uint256 i = 0; i < payoutIds.length; i++) {
            Payout storage payout = _payouts[payoutIds[i]];
            if (payout.payoutId != 0 && !payout.distributed) {
                distributeRoyalty(payoutIds[i]);
                totalAmount += payout.amount;
            }
        }

        uint256 batchId = _batchIdCounter++;
        emit BatchPayoutProcessed(batchId, totalAmount, payoutIds.length);
    }

    /**
     * @notice Claim accumulated royalties for a specific token
     * @param token The token to claim (address(0) for native)
     */
    function claimRoyalties(address token) external override nonReentrant {
        uint256 amount = _claimableBalances[msg.sender][token];
        if (amount == 0) revert NoClaimableBalance();

        _claimableBalances[msg.sender][token] = 0;

        if (token == address(0)) {
            (bool success, ) = payable(msg.sender).call{value: amount}("");
            if (!success) revert TransferFailed();
        } else {
            IERC20(token).safeTransfer(msg.sender, amount);
        }

        emit RoyaltyClaimed(msg.sender, token, amount);
    }

    /**
     * @notice Claim all accumulated royalties across all tokens
     */
    function claimAllRoyalties() external override nonReentrant {
        address[] memory tokens = _recipientTokens[msg.sender];

        for (uint256 i = 0; i < tokens.length; i++) {
            address token = tokens[i];
            uint256 amount = _claimableBalances[msg.sender][token];

            if (amount > 0) {
                _claimableBalances[msg.sender][token] = 0;

                if (token == address(0)) {
                    (bool success, ) = payable(msg.sender).call{value: amount}("");
                    if (!success) revert TransferFailed();
                } else {
                    IERC20(token).safeTransfer(msg.sender, amount);
                }

                emit RoyaltyClaimed(msg.sender, token, amount);
            }
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // View Functions
    // ═══════════════════════════════════════════════════════════════════════════

    function getClaimableBalance(
        address recipient,
        address token
    ) external view override returns (uint256) {
        return _claimableBalances[recipient][token];
    }

    function getAllClaimableBalances(
        address recipient
    ) external view override returns (ClaimableBalance[] memory) {
        address[] memory tokens = _recipientTokens[recipient];
        ClaimableBalance[] memory balances = new ClaimableBalance[](tokens.length);

        for (uint256 i = 0; i < tokens.length; i++) {
            balances[i] = ClaimableBalance({
                token: tokens[i],
                amount: _claimableBalances[recipient][tokens[i]]
            });
        }

        return balances;
    }

    function getPayout(uint256 payoutId) external view override returns (Payout memory) {
        return _payouts[payoutId];
    }

    function getSongPayouts(uint256 songId) external view override returns (uint256[] memory) {
        return _songPayouts[songId];
    }

    function getTotalEarnings(uint256 songId) external view override returns (uint256) {
        return _songTotalEarnings[songId];
    }

    function getRegionEarnings(string calldata region) external view returns (uint256) {
        return _regionTotalEarnings[region];
    }

    function getSourceEarnings(string calldata source) external view returns (uint256) {
        return _sourceTotalEarnings[source];
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // Admin Functions
    // ═══════════════════════════════════════════════════════════════════════════

    function addSupportedToken(address token) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (!supportedTokens[token]) {
            supportedTokens[token] = true;
            tokenList.push(token);
            emit TokenAdded(token);
        }
    }

    function removeSupportedToken(address token) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (supportedTokens[token] && token != address(0)) {
            supportedTokens[token] = false;
            emit TokenRemoved(token);
        }
    }

    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // Internal Functions
    // ═══════════════════════════════════════════════════════════════════════════

    function _addClaimableBalance(address recipient, address token, uint256 amount) internal {
        if (!_hasTokenBalance[recipient][token]) {
            _recipientTokens[recipient].push(token);
            _hasTokenBalance[recipient][token] = true;
        }
        _claimableBalances[recipient][token] += amount;
    }

    // Allow contract to receive native tokens
    receive() external payable {}
}

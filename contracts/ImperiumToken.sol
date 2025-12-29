// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./interfaces/IImperiumToken.sol";
import "./interfaces/ISongRegistry.sol";

/**
 * @title ImperiumToken
 * @notice ERC-1155 fractional ownership tokens for song royalties
 * @dev "Take the Throne. Own It."
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 * ⬡ IMPERIUM - Music Royalty Platform ⬡
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Each song can have fractional ownership tokens that entitle holders
 * to a portion of the song's royalty earnings.
 */
contract ImperiumToken is
    IImperiumToken,
    ERC1155,
    ERC1155Supply,
    AccessControl,
    ReentrancyGuard,
    Pausable
{
    using SafeERC20 for IERC20;

    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");

    // Basis points for calculations
    uint256 public constant BASIS_POINTS = 10000;
    uint256 public constant MAX_ROYALTY_SHARE = 5000; // Max 50% to token holders

    // Song registry reference
    ISongRegistry public immutable songRegistry;

    // Token info storage
    mapping(uint256 => TokenInfo) private _tokenInfo;
    mapping(uint256 => string) private _tokenURIs;
    mapping(uint256 => uint256) private _songToTokenId;

    // Holder tracking for royalty distribution
    mapping(uint256 => address[]) private _tokenHolders;
    mapping(uint256 => mapping(address => bool)) private _isHolder;
    mapping(uint256 => mapping(address => uint256)) private _holderIndex;

    // Treasury for collected fees
    address public treasury;
    uint256 public platformFeeBps = 250; // 2.5% platform fee

    uint256 private _tokenIdCounter;

    // ═══════════════════════════════════════════════════════════════════════════
    // Errors
    // ═══════════════════════════════════════════════════════════════════════════

    error SongNotFound();
    error TokenNotFound();
    error NotSongOwner();
    error MintingNotActive();
    error ExceedsMaxSupply();
    error InsufficientPayment();
    error InvalidRoyaltyShare();
    error TokenAlreadyExists();
    error ZeroAmount();

    // ═══════════════════════════════════════════════════════════════════════════
    // Constructor
    // ═══════════════════════════════════════════════════════════════════════════

    constructor(
        address _songRegistry,
        address admin,
        address _treasury,
        string memory baseUri
    ) ERC1155(baseUri) {
        songRegistry = ISongRegistry(_songRegistry);
        treasury = _treasury;

        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(MINTER_ROLE, admin);
        _grantRole(OPERATOR_ROLE, admin);

        _tokenIdCounter = 1;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // External Functions
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * @notice Create fractional ownership tokens for a song
     * @param songId The song ID
     * @param maxSupply Maximum number of tokens
     * @param pricePerToken Price per token in payment token units
     * @param paymentToken Token used for purchases (address(0) for native)
     * @param royaltyShareBps Percentage of royalties for token holders (in basis points)
     * @param tokenUri Metadata URI for this token
     * @return tokenId The created token ID
     */
    function createToken(
        uint256 songId,
        uint256 maxSupply,
        uint256 pricePerToken,
        address paymentToken,
        uint256 royaltyShareBps,
        string calldata tokenUri
    ) external override returns (uint256 tokenId) {
        // Verify song exists and caller is owner
        ISongRegistry.Song memory song = songRegistry.getSong(songId);
        if (song.songId == 0) revert SongNotFound();
        if (msg.sender != song.primaryCreator && !hasRole(OPERATOR_ROLE, msg.sender)) {
            revert NotSongOwner();
        }

        // Check if token already exists for this song
        if (_songToTokenId[songId] != 0) revert TokenAlreadyExists();

        // Validate royalty share
        if (royaltyShareBps > MAX_ROYALTY_SHARE) revert InvalidRoyaltyShare();

        tokenId = _tokenIdCounter++;

        _tokenInfo[tokenId] = TokenInfo({
            songId: songId,
            totalSupply: 0,
            maxSupply: maxSupply,
            pricePerToken: pricePerToken,
            paymentToken: paymentToken,
            mintingActive: true,
            royaltyShareBps: royaltyShareBps
        });

        _tokenURIs[tokenId] = tokenUri;
        _songToTokenId[songId] = tokenId;

        emit TokenCreated(tokenId, songId, maxSupply, pricePerToken);
    }

    /**
     * @notice Purchase fractional ownership tokens
     * @param tokenId The token to mint
     * @param amount Number of tokens to mint
     */
    function mintTokens(
        uint256 tokenId,
        uint256 amount
    ) external payable override nonReentrant whenNotPaused {
        TokenInfo storage info = _tokenInfo[tokenId];
        if (info.songId == 0) revert TokenNotFound();
        if (!info.mintingActive) revert MintingNotActive();
        if (amount == 0) revert ZeroAmount();
        if (info.totalSupply + amount > info.maxSupply) revert ExceedsMaxSupply();

        uint256 totalCost = info.pricePerToken * amount;
        uint256 platformFee = (totalCost * platformFeeBps) / BASIS_POINTS;
        uint256 creatorAmount = totalCost - platformFee;

        // Handle payment
        if (info.paymentToken == address(0)) {
            if (msg.value < totalCost) revert InsufficientPayment();

            // Refund excess
            if (msg.value > totalCost) {
                (bool refunded, ) = payable(msg.sender).call{value: msg.value - totalCost}("");
                require(refunded, "Refund failed");
            }

            // Pay creator
            ISongRegistry.Song memory song = songRegistry.getSong(info.songId);
            (bool sentCreator, ) = payable(song.primaryCreator).call{value: creatorAmount}("");
            require(sentCreator, "Creator payment failed");

            // Pay treasury
            if (platformFee > 0) {
                (bool sentTreasury, ) = payable(treasury).call{value: platformFee}("");
                require(sentTreasury, "Treasury payment failed");
            }
        } else {
            IERC20 token = IERC20(info.paymentToken);
            token.safeTransferFrom(msg.sender, address(this), totalCost);

            // Pay creator
            ISongRegistry.Song memory song = songRegistry.getSong(info.songId);
            token.safeTransfer(song.primaryCreator, creatorAmount);

            // Pay treasury
            if (platformFee > 0) {
                token.safeTransfer(treasury, platformFee);
            }
        }

        // Track holder
        _addHolder(tokenId, msg.sender);

        // Mint tokens
        info.totalSupply += amount;
        _mint(msg.sender, tokenId, amount, "");

        emit TokensMinted(tokenId, msg.sender, amount, totalCost);
    }

    /**
     * @notice Burn tokens (gives up royalty share)
     * @param tokenId The token to burn
     * @param amount Number of tokens to burn
     */
    function burnTokens(uint256 tokenId, uint256 amount) external override nonReentrant {
        if (balanceOf(msg.sender, tokenId) < amount) revert ZeroAmount();

        _burn(msg.sender, tokenId, amount);
        _tokenInfo[tokenId].totalSupply -= amount;

        // Remove from holders if balance is zero
        if (balanceOf(msg.sender, tokenId) == 0) {
            _removeHolder(tokenId, msg.sender);
        }

        emit TokensBurned(tokenId, msg.sender, amount);
    }

    /**
     * @notice Toggle minting status
     * @param tokenId The token ID
     * @param active Whether minting is active
     */
    function setMintingActive(uint256 tokenId, bool active) external override {
        TokenInfo storage info = _tokenInfo[tokenId];
        if (info.songId == 0) revert TokenNotFound();

        ISongRegistry.Song memory song = songRegistry.getSong(info.songId);
        if (msg.sender != song.primaryCreator && !hasRole(OPERATOR_ROLE, msg.sender)) {
            revert NotSongOwner();
        }

        info.mintingActive = active;
        emit MintingStatusChanged(tokenId, active);
    }

    /**
     * @notice Update royalty share for token holders
     * @param tokenId The token ID
     * @param newShareBps New share in basis points
     */
    function updateRoyaltyShare(uint256 tokenId, uint256 newShareBps) external override {
        TokenInfo storage info = _tokenInfo[tokenId];
        if (info.songId == 0) revert TokenNotFound();
        if (newShareBps > MAX_ROYALTY_SHARE) revert InvalidRoyaltyShare();

        ISongRegistry.Song memory song = songRegistry.getSong(info.songId);
        if (msg.sender != song.primaryCreator && !hasRole(OPERATOR_ROLE, msg.sender)) {
            revert NotSongOwner();
        }

        uint256 oldShare = info.royaltyShareBps;
        info.royaltyShareBps = newShareBps;

        emit RoyaltyShareUpdated(tokenId, oldShare, newShareBps);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // View Functions
    // ═══════════════════════════════════════════════════════════════════════════

    function getTokenInfo(uint256 tokenId) external view override returns (TokenInfo memory) {
        return _tokenInfo[tokenId];
    }

    function getTokenIdForSong(uint256 songId) external view override returns (uint256) {
        return _songToTokenId[songId];
    }

    /**
     * @notice Get a holder's share of total supply
     * @param tokenId The token ID
     * @param holder The holder address
     * @return Share in basis points
     */
    function getHolderShare(
        uint256 tokenId,
        address holder
    ) external view override returns (uint256) {
        TokenInfo memory info = _tokenInfo[tokenId];
        if (info.totalSupply == 0) return 0;

        uint256 balance = balanceOf(holder, tokenId);
        return (balance * BASIS_POINTS) / info.totalSupply;
    }

    /**
     * @notice Calculate royalty distribution to token holders
     * @param tokenId The token ID
     * @param royaltyAmount Total royalty amount to distribute
     * @return holders Array of holder addresses
     * @return amounts Array of amounts for each holder
     */
    function calculateRoyaltyDistribution(
        uint256 tokenId,
        uint256 royaltyAmount
    ) external view override returns (address[] memory holders, uint256[] memory amounts) {
        TokenInfo memory info = _tokenInfo[tokenId];
        if (info.totalSupply == 0) {
            return (new address[](0), new uint256[](0));
        }

        // Amount going to token holders
        uint256 holderPoolAmount = (royaltyAmount * info.royaltyShareBps) / BASIS_POINTS;

        address[] memory allHolders = _tokenHolders[tokenId];
        holders = new address[](allHolders.length);
        amounts = new uint256[](allHolders.length);

        for (uint256 i = 0; i < allHolders.length; i++) {
            holders[i] = allHolders[i];
            uint256 balance = balanceOf(allHolders[i], tokenId);
            amounts[i] = (holderPoolAmount * balance) / info.totalSupply;
        }

        return (holders, amounts);
    }

    function uri(uint256 tokenId) public view override returns (string memory) {
        string memory tokenUri = _tokenURIs[tokenId];
        if (bytes(tokenUri).length > 0) {
            return tokenUri;
        }
        return super.uri(tokenId);
    }

    function getTokenHolders(uint256 tokenId) external view returns (address[] memory) {
        return _tokenHolders[tokenId];
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // Admin Functions
    // ═══════════════════════════════════════════════════════════════════════════

    function setTreasury(address newTreasury) external onlyRole(DEFAULT_ADMIN_ROLE) {
        treasury = newTreasury;
    }

    function setPlatformFee(uint256 newFeeBps) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(newFeeBps <= 1000, "Fee too high"); // Max 10%
        platformFeeBps = newFeeBps;
    }

    function setURI(string memory newuri) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _setURI(newuri);
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

    function _addHolder(uint256 tokenId, address holder) internal {
        if (!_isHolder[tokenId][holder]) {
            _holderIndex[tokenId][holder] = _tokenHolders[tokenId].length;
            _tokenHolders[tokenId].push(holder);
            _isHolder[tokenId][holder] = true;
        }
    }

    function _removeHolder(uint256 tokenId, address holder) internal {
        if (_isHolder[tokenId][holder]) {
            uint256 index = _holderIndex[tokenId][holder];
            uint256 lastIndex = _tokenHolders[tokenId].length - 1;

            if (index != lastIndex) {
                address lastHolder = _tokenHolders[tokenId][lastIndex];
                _tokenHolders[tokenId][index] = lastHolder;
                _holderIndex[tokenId][lastHolder] = index;
            }

            _tokenHolders[tokenId].pop();
            _isHolder[tokenId][holder] = false;
            delete _holderIndex[tokenId][holder];
        }
    }

    // Required overrides
    function _update(
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory values
    ) internal override(ERC1155, ERC1155Supply) {
        super._update(from, to, ids, values);

        // Track holders on transfer
        for (uint256 i = 0; i < ids.length; i++) {
            if (to != address(0) && values[i] > 0) {
                _addHolder(ids[i], to);
            }
            if (from != address(0) && balanceOf(from, ids[i]) == 0) {
                _removeHolder(ids[i], from);
            }
        }
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC1155, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    receive() external payable {}
}

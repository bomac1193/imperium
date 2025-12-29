// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IImperiumToken
 * @notice Interface for Imperium ERC-1155 fractional ownership tokens
 * @dev Each songId maps to a token ID for fractional ownership
 */
interface IImperiumToken {

    struct TokenInfo {
        uint256 songId;
        uint256 totalSupply;
        uint256 maxSupply;
        uint256 pricePerToken;      // In payment token units
        address paymentToken;
        bool mintingActive;
        uint256 royaltyShareBps;    // Basis points of royalties token holders receive
    }

    event TokenCreated(
        uint256 indexed tokenId,
        uint256 indexed songId,
        uint256 maxSupply,
        uint256 pricePerToken
    );

    event TokensMinted(
        uint256 indexed tokenId,
        address indexed buyer,
        uint256 amount,
        uint256 totalPaid
    );

    event TokensBurned(
        uint256 indexed tokenId,
        address indexed holder,
        uint256 amount
    );

    event RoyaltyShareUpdated(
        uint256 indexed tokenId,
        uint256 oldShare,
        uint256 newShare
    );

    event MintingStatusChanged(uint256 indexed tokenId, bool active);

    function createToken(
        uint256 songId,
        uint256 maxSupply,
        uint256 pricePerToken,
        address paymentToken,
        uint256 royaltyShareBps,
        string calldata uri
    ) external returns (uint256 tokenId);

    function mintTokens(uint256 tokenId, uint256 amount) external payable;
    function burnTokens(uint256 tokenId, uint256 amount) external;
    function setMintingActive(uint256 tokenId, bool active) external;
    function updateRoyaltyShare(uint256 tokenId, uint256 newShareBps) external;

    function getTokenInfo(uint256 tokenId) external view returns (TokenInfo memory);
    function getTokenIdForSong(uint256 songId) external view returns (uint256);
    function getHolderShare(uint256 tokenId, address holder) external view returns (uint256);
    function calculateRoyaltyDistribution(uint256 tokenId, uint256 royaltyAmount)
        external view returns (address[] memory holders, uint256[] memory amounts);
}

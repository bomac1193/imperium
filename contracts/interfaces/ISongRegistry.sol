// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ISongRegistry
 * @notice Interface for the Imperium Song Registry contract
 * @dev "Own It. Break the Chain."
 */
interface ISongRegistry {

    struct Song {
        uint256 songId;
        string isrc;              // International Standard Recording Code
        string title;
        address primaryCreator;
        string metadataURI;       // IPFS/Arweave URI
        bytes32 contentHash;      // Hash of the audio file
        uint256 registeredAt;
        bool verified;
        bool active;
        bytes32 o8DeclarationHash; // Hash of the o8 declaration content
        string o8DeclarationCID;   // IPFS CID of the o8 declaration
    }

    event SongRegistered(
        uint256 indexed songId,
        string isrc,
        address indexed creator,
        string metadataURI,
        uint256 timestamp
    );

    event SongVerified(uint256 indexed songId, address indexed verifier);
    event SongDeactivated(uint256 indexed songId, address indexed deactivator);
    event MetadataUpdated(uint256 indexed songId, string newMetadataURI);
    event O8DeclarationLinked(uint256 indexed songId, bytes32 declarationHash, string declarationCID);

    function registerSong(
        string calldata isrc,
        string calldata title,
        string calldata metadataURI,
        bytes32 contentHash
    ) external returns (uint256 songId);

    function verifySong(uint256 songId) external;
    function deactivateSong(uint256 songId) external;
    function updateMetadata(uint256 songId, string calldata newMetadataURI) external;
    function getSong(uint256 songId) external view returns (Song memory);
    function getSongByISRC(string calldata isrc) external view returns (Song memory);
    function getCreatorSongs(address creator) external view returns (uint256[] memory);
    function totalSongs() external view returns (uint256);

    function linkO8Declaration(uint256 songId, string calldata declarationCID, bytes32 declarationHash) external;
    function getO8Declaration(uint256 songId) external view returns (string memory declarationCID, bytes32 declarationHash);
}

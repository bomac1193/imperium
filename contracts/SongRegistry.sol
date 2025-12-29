// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "./interfaces/ISongRegistry.sol";

/**
 * @title SongRegistry
 * @notice Immutable registry for song metadata on the Imperium platform
 * @dev "Own It. Break the Chain. No Masters. Take the Throne."
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 * ⬡ IMPERIUM - Music Royalty Platform ⬡
 * ═══════════════════════════════════════════════════════════════════════════════
 */
contract SongRegistry is ISongRegistry, AccessControl, ReentrancyGuard, Pausable {

    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");

    // Song storage
    mapping(uint256 => Song) private _songs;
    mapping(string => uint256) private _isrcToSongId;
    mapping(address => uint256[]) private _creatorSongs;
    mapping(bytes32 => bool) private _contentHashExists;

    uint256 private _songIdCounter;

    // ═══════════════════════════════════════════════════════════════════════════
    // Errors
    // ═══════════════════════════════════════════════════════════════════════════

    error InvalidISRC();
    error ISRCAlreadyRegistered();
    error ContentHashAlreadyExists();
    error SongNotFound();
    error NotSongOwner();
    error SongNotActive();
    error SongAlreadyVerified();
    error EmptyMetadataURI();

    // ═══════════════════════════════════════════════════════════════════════════
    // Constructor
    // ═══════════════════════════════════════════════════════════════════════════

    constructor(address admin) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(VERIFIER_ROLE, admin);
        _grantRole(OPERATOR_ROLE, admin);
        _songIdCounter = 1; // Start from 1, 0 means not found
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // External Functions
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * @notice Register a new song on the platform
     * @param isrc International Standard Recording Code
     * @param title Song title
     * @param metadataURI IPFS/Arweave URI containing full metadata
     * @param contentHash Hash of the audio content for verification
     * @return songId The unique identifier for the registered song
     */
    function registerSong(
        string calldata isrc,
        string calldata title,
        string calldata metadataURI,
        bytes32 contentHash
    ) external override nonReentrant whenNotPaused returns (uint256 songId) {
        // Validate inputs
        if (bytes(isrc).length == 0 || bytes(isrc).length > 12) revert InvalidISRC();
        if (_isrcToSongId[isrc] != 0) revert ISRCAlreadyRegistered();
        if (bytes(metadataURI).length == 0) revert EmptyMetadataURI();

        // Check content hash uniqueness (prevent duplicate uploads)
        if (contentHash != bytes32(0) && _contentHashExists[contentHash]) {
            revert ContentHashAlreadyExists();
        }

        songId = _songIdCounter++;

        _songs[songId] = Song({
            songId: songId,
            isrc: isrc,
            title: title,
            primaryCreator: msg.sender,
            metadataURI: metadataURI,
            contentHash: contentHash,
            registeredAt: block.timestamp,
            verified: false,
            active: true
        });

        _isrcToSongId[isrc] = songId;
        _creatorSongs[msg.sender].push(songId);

        if (contentHash != bytes32(0)) {
            _contentHashExists[contentHash] = true;
        }

        emit SongRegistered(songId, isrc, msg.sender, metadataURI, block.timestamp);
    }

    /**
     * @notice Verify a song (oracle/admin function)
     * @param songId The song to verify
     */
    function verifySong(uint256 songId) external override onlyRole(VERIFIER_ROLE) {
        Song storage song = _songs[songId];
        if (song.songId == 0) revert SongNotFound();
        if (song.verified) revert SongAlreadyVerified();

        song.verified = true;
        emit SongVerified(songId, msg.sender);
    }

    /**
     * @notice Deactivate a song (only by creator or admin)
     * @param songId The song to deactivate
     */
    function deactivateSong(uint256 songId) external override {
        Song storage song = _songs[songId];
        if (song.songId == 0) revert SongNotFound();

        if (msg.sender != song.primaryCreator && !hasRole(OPERATOR_ROLE, msg.sender)) {
            revert NotSongOwner();
        }

        song.active = false;
        emit SongDeactivated(songId, msg.sender);
    }

    /**
     * @notice Update song metadata URI
     * @param songId The song to update
     * @param newMetadataURI New IPFS/Arweave URI
     */
    function updateMetadata(
        uint256 songId,
        string calldata newMetadataURI
    ) external override {
        Song storage song = _songs[songId];
        if (song.songId == 0) revert SongNotFound();

        if (msg.sender != song.primaryCreator && !hasRole(OPERATOR_ROLE, msg.sender)) {
            revert NotSongOwner();
        }

        if (bytes(newMetadataURI).length == 0) revert EmptyMetadataURI();

        song.metadataURI = newMetadataURI;
        emit MetadataUpdated(songId, newMetadataURI);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // View Functions
    // ═══════════════════════════════════════════════════════════════════════════

    function getSong(uint256 songId) external view override returns (Song memory) {
        if (_songs[songId].songId == 0) revert SongNotFound();
        return _songs[songId];
    }

    function getSongByISRC(string calldata isrc) external view override returns (Song memory) {
        uint256 songId = _isrcToSongId[isrc];
        if (songId == 0) revert SongNotFound();
        return _songs[songId];
    }

    function getCreatorSongs(address creator) external view override returns (uint256[] memory) {
        return _creatorSongs[creator];
    }

    function totalSongs() external view override returns (uint256) {
        return _songIdCounter - 1;
    }

    function isSongVerified(uint256 songId) external view returns (bool) {
        return _songs[songId].verified;
    }

    function isSongActive(uint256 songId) external view returns (bool) {
        return _songs[songId].active;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // Admin Functions
    // ═══════════════════════════════════════════════════════════════════════════

    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }
}

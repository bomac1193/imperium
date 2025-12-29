// Contract ABIs for Imperium Platform

export const SONG_REGISTRY_ABI = [
  // Events
  "event SongRegistered(uint256 indexed songId, string isrc, address indexed creator, string metadataURI, uint256 timestamp)",
  "event SongVerified(uint256 indexed songId, address indexed verifier)",
  "event SongDeactivated(uint256 indexed songId, address indexed deactivator)",
  "event MetadataUpdated(uint256 indexed songId, string newMetadataURI)",
  // Functions
  "function registerSong(string isrc, string title, string metadataURI, bytes32 contentHash) external returns (uint256)",
  "function verifySong(uint256 songId) external",
  "function deactivateSong(uint256 songId) external",
  "function updateMetadata(uint256 songId, string newMetadataURI) external",
  "function getSong(uint256 songId) external view returns (tuple(uint256 songId, string isrc, string title, address primaryCreator, string metadataURI, bytes32 contentHash, uint256 registeredAt, bool verified, bool active))",
  "function getSongByISRC(string isrc) external view returns (tuple(uint256 songId, string isrc, string title, address primaryCreator, string metadataURI, bytes32 contentHash, uint256 registeredAt, bool verified, bool active))",
  "function getCreatorSongs(address creator) external view returns (uint256[])",
  "function totalSongs() external view returns (uint256)",
  "function isSongVerified(uint256 songId) external view returns (bool)",
  "function isSongActive(uint256 songId) external view returns (bool)",
] as const;

export const ROYALTY_SPLIT_ABI = [
  // Events
  "event SplitsConfigured(uint256 indexed songId, address[] recipients, uint256[] percentages, string[] roles)",
  "event SplitUpdated(uint256 indexed songId, address indexed recipient, uint256 oldPercentage, uint256 newPercentage)",
  "event SplitsLocked(uint256 indexed songId)",
  "event RecipientAdded(uint256 indexed songId, address recipient, uint256 percentage, string role)",
  "event RecipientRemoved(uint256 indexed songId, address recipient)",
  // Functions
  "function configureSplits(uint256 songId, address[] recipients, uint256[] percentages, string[] roles) external",
  "function addRecipient(uint256 songId, address recipient, uint256 percentage, string role) external",
  "function removeRecipient(uint256 songId, address recipient) external",
  "function updateSplit(uint256 songId, address recipient, uint256 newPercentage) external",
  "function lockSplits(uint256 songId) external",
  "function getSplits(uint256 songId) external view returns (tuple(address recipient, uint256 percentage, string role, bool active)[])",
  "function getRecipientSplit(uint256 songId, address recipient) external view returns (tuple(address recipient, uint256 percentage, string role, bool active))",
  "function calculatePayout(uint256 songId, uint256 amount) external view returns (address[], uint256[])",
  "function areSplitsLocked(uint256 songId) external view returns (bool)",
  "function getTotalAllocated(uint256 songId) external view returns (uint256)",
] as const;

export const PAYOUT_MODULE_ABI = [
  // Events
  "event RoyaltyReceived(uint256 indexed payoutId, uint256 indexed songId, uint256 amount, address token, string source, string region)",
  "event RoyaltyDistributed(uint256 indexed payoutId, uint256 indexed songId, address indexed recipient, uint256 amount)",
  "event RoyaltyClaimed(address indexed recipient, address indexed token, uint256 amount)",
  "event BatchPayoutProcessed(uint256 indexed batchId, uint256 totalAmount, uint256 songCount)",
  // Functions
  "function depositRoyalty(uint256 songId, uint256 amount, address token, string source, string region) external payable returns (uint256)",
  "function distributeRoyalty(uint256 payoutId) external",
  "function batchDistribute(uint256[] payoutIds) external",
  "function claimRoyalties(address token) external",
  "function claimAllRoyalties() external",
  "function getClaimableBalance(address recipient, address token) external view returns (uint256)",
  "function getAllClaimableBalances(address recipient) external view returns (tuple(address token, uint256 amount)[])",
  "function getPayout(uint256 payoutId) external view returns (tuple(uint256 payoutId, uint256 songId, uint256 amount, address token, string source, string region, uint256 timestamp, bool distributed))",
  "function getSongPayouts(uint256 songId) external view returns (uint256[])",
  "function getTotalEarnings(uint256 songId) external view returns (uint256)",
  "function getRegionEarnings(string region) external view returns (uint256)",
  "function getSourceEarnings(string source) external view returns (uint256)",
] as const;

export const IMPERIUM_TOKEN_ABI = [
  // Events
  "event TokenCreated(uint256 indexed tokenId, uint256 indexed songId, uint256 maxSupply, uint256 pricePerToken)",
  "event TokensMinted(uint256 indexed tokenId, address indexed buyer, uint256 amount, uint256 totalPaid)",
  "event TokensBurned(uint256 indexed tokenId, address indexed holder, uint256 amount)",
  "event RoyaltyShareUpdated(uint256 indexed tokenId, uint256 oldShare, uint256 newShare)",
  "event MintingStatusChanged(uint256 indexed tokenId, bool active)",
  // Functions
  "function createToken(uint256 songId, uint256 maxSupply, uint256 pricePerToken, address paymentToken, uint256 royaltyShareBps, string uri) external returns (uint256)",
  "function mintTokens(uint256 tokenId, uint256 amount) external payable",
  "function burnTokens(uint256 tokenId, uint256 amount) external",
  "function setMintingActive(uint256 tokenId, bool active) external",
  "function updateRoyaltyShare(uint256 tokenId, uint256 newShareBps) external",
  "function getTokenInfo(uint256 tokenId) external view returns (tuple(uint256 songId, uint256 totalSupply, uint256 maxSupply, uint256 pricePerToken, address paymentToken, bool mintingActive, uint256 royaltyShareBps))",
  "function getTokenIdForSong(uint256 songId) external view returns (uint256)",
  "function getHolderShare(uint256 tokenId, address holder) external view returns (uint256)",
  "function calculateRoyaltyDistribution(uint256 tokenId, uint256 royaltyAmount) external view returns (address[], uint256[])",
  "function balanceOf(address account, uint256 id) external view returns (uint256)",
  "function getTokenHolders(uint256 tokenId) external view returns (address[])",
  "function uri(uint256 tokenId) external view returns (string)",
] as const;

export const ERC20_ABI = [
  "function name() external view returns (string)",
  "function symbol() external view returns (string)",
  "function decimals() external view returns (uint8)",
  "function totalSupply() external view returns (uint256)",
  "function balanceOf(address account) external view returns (uint256)",
  "function transfer(address to, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function transferFrom(address from, address to, uint256 amount) external returns (bool)",
] as const;

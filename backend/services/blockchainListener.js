/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * Blockchain Event Listener Service
 * Monitors contract events and syncs with off-chain database
 * ═══════════════════════════════════════════════════════════════════════════════
 */

const { ethers } = require("ethers");

// Contract ABIs (simplified)
const SONG_REGISTRY_ABI = [
  "event SongRegistered(uint256 indexed songId, string isrc, address indexed creator, string metadataURI, uint256 timestamp)",
  "event SongVerified(uint256 indexed songId, address indexed verifier)",
];

const PAYOUT_MODULE_ABI = [
  "event RoyaltyReceived(uint256 indexed payoutId, uint256 indexed songId, uint256 amount, address token, string source, string region)",
  "event RoyaltyDistributed(uint256 indexed payoutId, uint256 indexed songId, address indexed recipient, uint256 amount)",
  "event RoyaltyClaimed(address indexed recipient, address indexed token, uint256 amount)",
];

const IMPERIUM_TOKEN_ABI = [
  "event TokenCreated(uint256 indexed tokenId, uint256 indexed songId, uint256 maxSupply, uint256 pricePerToken)",
  "event TokensMinted(uint256 indexed tokenId, address indexed buyer, uint256 amount, uint256 totalPaid)",
];

class BlockchainListener {
  constructor() {
    this.provider = null;
    this.contracts = {};
    this.eventHandlers = new Map();
  }

  /**
   * Initialize the blockchain listener
   */
  async initialize() {
    const rpcUrl = process.env.POLYGON_RPC_URL || "http://127.0.0.1:8545";

    try {
      this.provider = new ethers.JsonRpcProvider(rpcUrl);
      await this.provider.getNetwork();
      console.log(`📡 Connected to blockchain at ${rpcUrl}`);
    } catch (error) {
      console.warn(`⚠️ Could not connect to blockchain: ${error.message}`);
      console.log("   Listener will operate in mock mode");
      return;
    }

    // Initialize contract instances
    await this.initializeContracts();

    // Set up event listeners
    this.setupEventListeners();
  }

  /**
   * Initialize contract instances
   */
  async initializeContracts() {
    const songRegistryAddress = process.env.SONG_REGISTRY_ADDRESS;
    const payoutModuleAddress = process.env.PAYOUT_MODULE_ADDRESS;
    const imperiumTokenAddress = process.env.IMPERIUM_TOKEN_ADDRESS;

    if (songRegistryAddress) {
      this.contracts.songRegistry = new ethers.Contract(
        songRegistryAddress,
        SONG_REGISTRY_ABI,
        this.provider
      );
    }

    if (payoutModuleAddress) {
      this.contracts.payoutModule = new ethers.Contract(
        payoutModuleAddress,
        PAYOUT_MODULE_ABI,
        this.provider
      );
    }

    if (imperiumTokenAddress) {
      this.contracts.imperiumToken = new ethers.Contract(
        imperiumTokenAddress,
        IMPERIUM_TOKEN_ABI,
        this.provider
      );
    }

    console.log(`📦 Initialized ${Object.keys(this.contracts).length} contract listeners`);
  }

  /**
   * Set up event listeners for all contracts
   */
  setupEventListeners() {
    // Song Registry Events
    if (this.contracts.songRegistry) {
      this.contracts.songRegistry.on(
        "SongRegistered",
        async (songId, isrc, creator, metadataURI, timestamp, event) => {
          console.log(`🎵 New song registered: #${songId} - ${isrc}`);
          await this.handleSongRegistered({
            songId: songId.toString(),
            isrc,
            creator,
            metadataURI,
            timestamp: timestamp.toString(),
            txHash: event.transactionHash,
          });
        }
      );

      this.contracts.songRegistry.on(
        "SongVerified",
        async (songId, verifier, event) => {
          console.log(`✅ Song verified: #${songId}`);
          await this.handleSongVerified({
            songId: songId.toString(),
            verifier,
            txHash: event.transactionHash,
          });
        }
      );
    }

    // Payout Module Events
    if (this.contracts.payoutModule) {
      this.contracts.payoutModule.on(
        "RoyaltyReceived",
        async (payoutId, songId, amount, token, source, region, event) => {
          console.log(`💰 Royalty received: $${ethers.formatUnits(amount, 6)} for song #${songId}`);
          await this.handleRoyaltyReceived({
            payoutId: payoutId.toString(),
            songId: songId.toString(),
            amount: amount.toString(),
            token,
            source,
            region,
            txHash: event.transactionHash,
          });
        }
      );

      this.contracts.payoutModule.on(
        "RoyaltyClaimed",
        async (recipient, token, amount, event) => {
          console.log(`🎁 Royalty claimed: $${ethers.formatUnits(amount, 6)} by ${recipient}`);
          await this.handleRoyaltyClaimed({
            recipient,
            token,
            amount: amount.toString(),
            txHash: event.transactionHash,
          });
        }
      );
    }

    // Imperium Token Events
    if (this.contracts.imperiumToken) {
      this.contracts.imperiumToken.on(
        "TokensMinted",
        async (tokenId, buyer, amount, totalPaid, event) => {
          console.log(`🪙 Tokens minted: ${amount} tokens for ${buyer}`);
          await this.handleTokensMinted({
            tokenId: tokenId.toString(),
            buyer,
            amount: amount.toString(),
            totalPaid: totalPaid.toString(),
            txHash: event.transactionHash,
          });
        }
      );
    }
  }

  /**
   * Handle SongRegistered event
   */
  async handleSongRegistered(data) {
    // In production: Update database, send notifications, etc.
    const handlers = this.eventHandlers.get("SongRegistered") || [];
    for (const handler of handlers) {
      await handler(data);
    }
  }

  /**
   * Handle SongVerified event
   */
  async handleSongVerified(data) {
    const handlers = this.eventHandlers.get("SongVerified") || [];
    for (const handler of handlers) {
      await handler(data);
    }
  }

  /**
   * Handle RoyaltyReceived event
   */
  async handleRoyaltyReceived(data) {
    const handlers = this.eventHandlers.get("RoyaltyReceived") || [];
    for (const handler of handlers) {
      await handler(data);
    }
  }

  /**
   * Handle RoyaltyClaimed event
   */
  async handleRoyaltyClaimed(data) {
    const handlers = this.eventHandlers.get("RoyaltyClaimed") || [];
    for (const handler of handlers) {
      await handler(data);
    }
  }

  /**
   * Handle TokensMinted event
   */
  async handleTokensMinted(data) {
    const handlers = this.eventHandlers.get("TokensMinted") || [];
    for (const handler of handlers) {
      await handler(data);
    }
  }

  /**
   * Register an event handler
   */
  on(eventName, handler) {
    if (!this.eventHandlers.has(eventName)) {
      this.eventHandlers.set(eventName, []);
    }
    this.eventHandlers.get(eventName).push(handler);
  }

  /**
   * Get connection status
   */
  async getStatus() {
    try {
      const network = await this.provider?.getNetwork();
      const blockNumber = await this.provider?.getBlockNumber();
      return {
        connected: true,
        network: network?.name,
        chainId: network?.chainId?.toString(),
        blockNumber,
        contracts: Object.keys(this.contracts),
      };
    } catch {
      return { connected: false };
    }
  }
}

// Singleton instance
const blockchainListener = new BlockchainListener();

/**
 * Initialize the blockchain listener service
 */
async function initBlockchainListener() {
  await blockchainListener.initialize();
  return blockchainListener;
}

module.exports = {
  initBlockchainListener,
  blockchainListener,
  BlockchainListener,
};

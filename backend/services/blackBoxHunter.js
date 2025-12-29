/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * ⬡ BLACK BOX HUNTER ⬡
 * Retroactive Royalty Matching Service
 * "Break the Chain. Find What's Yours."
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * This service scans traditional royalty databases to find unclaimed royalties
 * and matches them with registered songs on the Imperium platform.
 *
 * Key Features:
 * - ISRC matching across multiple databases
 * - Fuzzy title/artist matching for edge cases
 * - Automated claim filing (Phase 2)
 * - Historical royalty recovery
 * ═══════════════════════════════════════════════════════════════════════════════
 */

const cron = require("node-cron");
const { ethers } = require("ethers");

// Simulated databases of unclaimed royalties
const UNCLAIMED_DATABASES = {
  soundExchange: "SoundExchange Unclaimed Royalties",
  ascap: "ASCAP Unclaimed Works",
  bmi: "BMI Unmatched Royalties",
  ppl: "PPL International Unclaimed",
  gema: "GEMA German Mechanical Rights",
};

/**
 * Black Box Hunter Service
 */
class BlackBoxHunter {
  constructor() {
    this.isRunning = false;
    this.lastScan = null;
    this.matchedClaims = [];
    this.pendingClaims = [];
  }

  /**
   * Initialize the hunter service
   */
  async initialize() {
    console.log("🔍 Initializing Black Box Hunter...");

    // Load registered songs from blockchain
    this.registeredSongs = await this.loadRegisteredSongs();

    console.log(`📊 Loaded ${this.registeredSongs.length} registered songs`);
    console.log("✅ Black Box Hunter ready");
  }

  /**
   * Load all registered songs from the SongRegistry contract
   */
  async loadRegisteredSongs() {
    // In production: Query The Graph or contract directly
    // const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
    // const contract = new ethers.Contract(SONG_REGISTRY_ADDRESS, ABI, provider);
    // const totalSongs = await contract.totalSongs();
    // ... fetch all songs

    // Mock data for demonstration
    return [
      {
        songId: 1,
        isrc: "USRC12345678",
        title: "Break the Chain",
        artist: "Imperium Artist",
        creator: "0x1234567890abcdef1234567890abcdef12345678",
      },
      {
        songId: 2,
        isrc: "USRC87654321",
        title: "No Masters",
        artist: "Imperium Artist",
        creator: "0x1234567890abcdef1234567890abcdef12345678",
      },
      {
        songId: 3,
        isrc: "GBRC11111111",
        title: "Take the Throne",
        artist: "Imperium Artist feat. Guest",
        creator: "0xabcdef1234567890abcdef1234567890abcdef12",
      },
    ];
  }

  /**
   * Scan all black box databases for unclaimed royalties
   */
  async scanAllDatabases() {
    console.log("\n🔍 Starting Black Box scan...");
    this.isRunning = true;
    const startTime = Date.now();

    const results = {
      scanned: 0,
      matched: 0,
      totalAmount: 0,
      byDatabase: {},
    };

    for (const [dbKey, dbName] of Object.entries(UNCLAIMED_DATABASES)) {
      console.log(`  📂 Scanning ${dbName}...`);

      const dbResults = await this.scanDatabase(dbKey);
      results.byDatabase[dbKey] = dbResults;
      results.scanned += dbResults.scanned;
      results.matched += dbResults.matched;
      results.totalAmount += dbResults.amount;
    }

    this.lastScan = new Date().toISOString();
    this.isRunning = false;

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`\n✅ Scan complete in ${duration}s`);
    console.log(`   📊 Scanned: ${results.scanned} records`);
    console.log(`   ✨ Matched: ${results.matched} unclaimed royalties`);
    console.log(`   💰 Total recoverable: $${results.totalAmount.toLocaleString()}`);

    return results;
  }

  /**
   * Scan a specific database
   */
  async scanDatabase(databaseKey) {
    // Simulate database scan
    await this.sleep(500);

    // Generate mock unclaimed royalties
    const unclaimedRecords = this.generateMockUnclaimedRecords(databaseKey);

    let matched = 0;
    let amount = 0;

    for (const record of unclaimedRecords) {
      const match = await this.findMatch(record);
      if (match) {
        matched++;
        amount += record.amount;
        this.pendingClaims.push({
          ...record,
          matchedSong: match,
          database: databaseKey,
          foundAt: new Date().toISOString(),
        });
      }
    }

    return {
      scanned: unclaimedRecords.length,
      matched,
      amount,
    };
  }

  /**
   * Find a match for an unclaimed royalty record
   */
  async findMatch(record) {
    // 1. Exact ISRC match
    const isrcMatch = this.registeredSongs.find(
      (song) => song.isrc === record.isrc
    );
    if (isrcMatch) return { song: isrcMatch, matchType: "isrc_exact", confidence: 1.0 };

    // 2. Fuzzy title + artist match
    const fuzzyMatch = this.registeredSongs.find((song) => {
      const titleSimilarity = this.calculateSimilarity(
        song.title.toLowerCase(),
        record.title.toLowerCase()
      );
      const artistSimilarity = this.calculateSimilarity(
        song.artist.toLowerCase(),
        record.artist.toLowerCase()
      );
      return titleSimilarity > 0.85 && artistSimilarity > 0.8;
    });

    if (fuzzyMatch) {
      return { song: fuzzyMatch, matchType: "fuzzy", confidence: 0.85 };
    }

    return null;
  }

  /**
   * Calculate string similarity (Levenshtein-based)
   */
  calculateSimilarity(str1, str2) {
    if (str1 === str2) return 1;
    if (!str1 || !str2) return 0;

    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;

    if (longer.length === 0) return 1;

    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  /**
   * Levenshtein distance calculation
   */
  levenshteinDistance(str1, str2) {
    const matrix = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2[i - 1] === str1[j - 1]) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }

  /**
   * Generate mock unclaimed records for a database
   */
  generateMockUnclaimedRecords(databaseKey) {
    const records = [];
    const count = Math.floor(Math.random() * 50) + 10;

    for (let i = 0; i < count; i++) {
      // Some records match registered songs, some don't
      const shouldMatch = Math.random() > 0.85;

      if (shouldMatch && this.registeredSongs.length > 0) {
        const song = this.registeredSongs[Math.floor(Math.random() * this.registeredSongs.length)];
        records.push({
          id: `${databaseKey}_${i}`,
          isrc: song.isrc,
          title: song.title,
          artist: song.artist,
          amount: Math.floor(Math.random() * 5000) + 100,
          period: "2023-Q4",
          source: ["Streaming", "Radio", "Sync", "Mechanical"][Math.floor(Math.random() * 4)],
        });
      } else {
        records.push({
          id: `${databaseKey}_${i}`,
          isrc: `XX${Math.random().toString(36).substr(2, 10).toUpperCase()}`,
          title: `Unknown Song ${i}`,
          artist: `Unknown Artist ${i}`,
          amount: Math.floor(Math.random() * 500) + 50,
          period: "2023-Q4",
          source: "Streaming",
        });
      }
    }

    return records;
  }

  /**
   * Get pending claims that can be filed
   */
  getPendingClaims() {
    return this.pendingClaims;
  }

  /**
   * File a claim for matched royalties
   */
  async fileClaim(claimId) {
    const claim = this.pendingClaims.find((c) => c.id === claimId);
    if (!claim) throw new Error("Claim not found");

    // In production: Submit claim to the respective organization
    // and trigger on-chain payout when approved

    claim.status = "filed";
    claim.filedAt = new Date().toISOString();
    this.matchedClaims.push(claim);
    this.pendingClaims = this.pendingClaims.filter((c) => c.id !== claimId);

    console.log(`📝 Claim filed: ${claimId} for $${claim.amount}`);
    return claim;
  }

  /**
   * Get service status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      lastScan: this.lastScan,
      pendingClaimsCount: this.pendingClaims.length,
      pendingClaimsAmount: this.pendingClaims.reduce((sum, c) => sum + c.amount, 0),
      matchedClaimsCount: this.matchedClaims.length,
      registeredSongsCount: this.registeredSongs?.length || 0,
    };
  }

  /**
   * Utility sleep function
   */
  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Singleton instance
const blackBoxHunter = new BlackBoxHunter();

/**
 * Initialize the Black Box Hunter service
 */
async function initBlackBoxHunter() {
  await blackBoxHunter.initialize();

  // Schedule daily scans at 2 AM UTC
  cron.schedule("0 2 * * *", async () => {
    console.log("⏰ Running scheduled Black Box scan...");
    await blackBoxHunter.scanAllDatabases();
  });

  return blackBoxHunter;
}

module.exports = {
  initBlackBoxHunter,
  blackBoxHunter,
  BlackBoxHunter,
};

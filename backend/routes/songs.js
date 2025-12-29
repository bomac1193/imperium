/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * Songs API Routes
 * ═══════════════════════════════════════════════════════════════════════════════
 */

const express = require("express");
const { z } = require("zod");
const router = express.Router();

// Validation schemas
const songSchema = z.object({
  isrc: z.string().length(12),
  title: z.string().min(1).max(200),
  artist: z.string().min(1).max(200),
  metadataURI: z.string().url().optional(),
});

// In-memory cache (replace with Redis/Supabase in production)
const songsCache = new Map();

/**
 * GET /api/songs
 * List all songs with pagination
 */
router.get("/", async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const creator = req.query.creator;

    // Mock data - in production, query The Graph or Covalent
    const songs = [
      {
        songId: 1,
        isrc: "USRC12345678",
        title: "Break the Chain",
        artist: "Imperium Artist",
        verified: true,
        totalEarnings: 45000,
        registeredAt: Date.now() - 86400000 * 30,
      },
      {
        songId: 2,
        isrc: "USRC87654321",
        title: "No Masters",
        artist: "Imperium Artist",
        verified: true,
        totalEarnings: 28000,
        registeredAt: Date.now() - 86400000 * 20,
      },
    ];

    res.json({
      songs,
      pagination: {
        page,
        limit,
        total: songs.length,
        pages: 1,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/songs/:id
 * Get song details by ID
 */
router.get("/:id", async (req, res, next) => {
  try {
    const songId = parseInt(req.params.id);

    // Mock data
    const song = {
      songId,
      isrc: "USRC12345678",
      title: "Break the Chain",
      artist: "Imperium Artist",
      verified: true,
      metadataURI: "ipfs://QmXxxxx",
      registeredAt: Date.now() - 86400000 * 30,
      splits: [
        { address: "0x1234...5678", percentage: 7000, role: "artist" },
        { address: "0x8765...4321", percentage: 3000, role: "producer" },
      ],
      earnings: {
        total: 45000,
        thisMonth: 3200,
        bySource: {
          spotify: 25000,
          apple: 12000,
          youtube: 5000,
          other: 3000,
        },
        byRegion: {
          US: 25000,
          GB: 8000,
          DE: 5000,
          other: 7000,
        },
      },
    };

    res.json(song);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/songs/isrc/:isrc
 * Get song by ISRC code
 */
router.get("/isrc/:isrc", async (req, res, next) => {
  try {
    const { isrc } = req.params;

    // Lookup by ISRC
    const song = {
      songId: 1,
      isrc,
      title: "Break the Chain",
      artist: "Imperium Artist",
      verified: true,
    };

    res.json(song);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/songs/verify
 * Request verification for a song (triggers oracle)
 */
router.post("/verify", async (req, res, next) => {
  try {
    const { songId, isrc } = req.body;

    // In production: trigger Chainlink oracle to verify ISRC
    console.log(`Verification requested for song ${songId} with ISRC ${isrc}`);

    res.json({
      status: "pending",
      message: "Verification request submitted",
      estimatedTime: "5-10 minutes",
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/songs/:id/history
 * Get earnings history for a song
 */
router.get("/:id/history", async (req, res, next) => {
  try {
    const songId = parseInt(req.params.id);
    const period = req.query.period || "30d";

    // Generate mock historical data
    const days = period === "7d" ? 7 : period === "30d" ? 30 : 90;
    const history = Array.from({ length: days }, (_, i) => ({
      date: new Date(Date.now() - (days - i) * 86400000).toISOString().split("T")[0],
      amount: Math.floor(Math.random() * 500) + 100,
      source: ["spotify", "apple", "youtube"][Math.floor(Math.random() * 3)],
    }));

    res.json({ songId, period, history });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * Oracle API Routes
 * For metadata verification and external data feeds
 * ═══════════════════════════════════════════════════════════════════════════════
 */

const express = require("express");
const router = express.Router();

/**
 * POST /api/oracle/verify-isrc
 * Verify ISRC code validity and ownership
 */
router.post("/verify-isrc", async (req, res, next) => {
  try {
    const { isrc, claimedBy } = req.body;

    // In production: Query ISRC database (e.g., PPL, SoundExchange)
    // or use Chainlink oracle for external data

    // Mock verification
    const isValid = /^[A-Z]{2}[A-Z0-9]{3}\d{7}$/.test(isrc);

    const verification = {
      isrc,
      isValid,
      registeredOwner: isValid ? claimedBy : null,
      registrationDate: isValid ? "2024-01-15" : null,
      territory: isValid ? "US" : null,
      label: isValid ? "Independent" : null,
      verifiedAt: new Date().toISOString(),
    };

    res.json(verification);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/oracle/streaming-data/:isrc
 * Get real-time streaming data for a song
 */
router.get("/streaming-data/:isrc", async (req, res, next) => {
  try {
    const { isrc } = req.params;

    // In production: Aggregate from multiple streaming APIs
    // via Chainlink external adapters

    const streamingData = {
      isrc,
      lastUpdated: new Date().toISOString(),
      streams: {
        spotify: { count: 125000, revenue: 450 },
        apple: { count: 85000, revenue: 680 },
        youtube: { count: 250000, revenue: 175 },
        amazon: { count: 45000, revenue: 180 },
        deezer: { count: 22000, revenue: 88 },
      },
      totalStreams: 527000,
      totalRevenue: 1573,
      period: "last_30_days",
    };

    res.json(streamingData);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/oracle/request-payout
 * Request royalty payout via oracle
 */
router.post("/request-payout", async (req, res, next) => {
  try {
    const { songId, source, amount, proof } = req.body;

    // In production: Verify proof via Chainlink
    // then trigger on-chain payout

    const payoutRequest = {
      requestId: `req_${Date.now()}`,
      songId,
      source,
      amount,
      status: "pending",
      estimatedCompletion: new Date(Date.now() + 300000).toISOString(), // 5 mins
      message: "Payout request submitted to oracle network",
    };

    res.json(payoutRequest);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/oracle/exchange-rates
 * Get current exchange rates for supported tokens
 */
router.get("/exchange-rates", async (req, res, next) => {
  try {
    // In production: Use Chainlink price feeds
    const rates = {
      "MATIC/USD": 0.92,
      "ETH/USD": 2350.50,
      "USDC/USD": 1.00,
      lastUpdated: new Date().toISOString(),
      source: "Chainlink Price Feeds",
    };

    res.json(rates);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/oracle/jobs
 * Get pending oracle jobs
 */
router.get("/jobs", async (req, res, next) => {
  try {
    const jobs = [
      {
        id: "job_001",
        type: "verify_isrc",
        status: "completed",
        createdAt: Date.now() - 3600000,
        completedAt: Date.now() - 3540000,
      },
      {
        id: "job_002",
        type: "streaming_sync",
        status: "pending",
        createdAt: Date.now() - 600000,
      },
    ];

    res.json({ jobs });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/oracle/o8-declaration/:cid
 * Fetch an o8 provenance declaration from IPFS and validate its structure
 */
router.get("/o8-declaration/:cid", async (req, res, next) => {
  try {
    const { cid } = req.params;
    const gateway = process.env.IPFS_GATEWAY || "https://ipfs.io/ipfs/";
    const axios = require("axios");

    const response = await axios.get(`${gateway}${cid}`, {
      timeout: 15000,
      headers: { Accept: "application/json" },
    });

    const declaration = response.data;

    // Validate expected o8 declaration structure
    const requiredFields = ["@context", "type", "creator", "contentFingerprint"];
    const missingFields = requiredFields.filter((f) => !declaration[f]);

    res.json({
      cid,
      valid: missingFields.length === 0,
      missingFields: missingFields.length > 0 ? missingFields : undefined,
      declaration,
      fetchedAt: new Date().toISOString(),
    });
  } catch (error) {
    if (error.code === "ECONNABORTED" || error.response?.status === 504) {
      return res.status(504).json({ error: "IPFS gateway timeout", cid: req.params.cid });
    }
    if (error.response?.status === 404) {
      return res.status(404).json({ error: "Declaration not found on IPFS", cid: req.params.cid });
    }
    next(error);
  }
});

/**
 * POST /api/oracle/verify-o8
 * Verify an o8 declaration's content fingerprint matches a song's contentHash
 */
router.post("/verify-o8", async (req, res, next) => {
  try {
    const { cid, songContentHash } = req.body;

    if (!cid || !songContentHash) {
      return res.status(400).json({ error: "cid and songContentHash are required" });
    }

    const gateway = process.env.IPFS_GATEWAY || "https://ipfs.io/ipfs/";
    const axios = require("axios");

    const response = await axios.get(`${gateway}${cid}`, {
      timeout: 15000,
      headers: { Accept: "application/json" },
    });

    const declaration = response.data;

    const fingerprintMatch =
      declaration.contentFingerprint &&
      declaration.contentFingerprint.toLowerCase() === songContentHash.toLowerCase();

    res.json({
      cid,
      songContentHash,
      declarationFingerprint: declaration.contentFingerprint || null,
      match: fingerprintMatch,
      creator: declaration.creator || null,
      verifiedAt: new Date().toISOString(),
    });
  } catch (error) {
    if (error.code === "ECONNABORTED" || error.response?.status === 504) {
      return res.status(504).json({ error: "IPFS gateway timeout" });
    }
    if (error.response?.status === 404) {
      return res.status(404).json({ error: "Declaration not found on IPFS", cid: req.body.cid });
    }
    next(error);
  }
});

module.exports = router;

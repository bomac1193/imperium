/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * Royalties API Routes
 * ═══════════════════════════════════════════════════════════════════════════════
 */

const express = require("express");
const router = express.Router();

/**
 * GET /api/royalties/flows
 * Get real-time royalty flows for visualization
 */
router.get("/flows", async (req, res, next) => {
  try {
    const timeRange = req.query.range || "24h";
    const source = req.query.source;

    // Mock real-time flow data
    const flows = [
      { region: "US", lat: 39.8283, lng: -98.5795, amount: 45000, source: "spotify", timestamp: Date.now() },
      { region: "GB", lat: 55.3781, lng: -3.4360, amount: 18500, source: "apple", timestamp: Date.now() },
      { region: "DE", lat: 51.1657, lng: 10.4515, amount: 12300, source: "spotify", timestamp: Date.now() },
      { region: "JP", lat: 36.2048, lng: 138.2529, amount: 9800, source: "youtube", timestamp: Date.now() },
      { region: "BR", lat: -14.2350, lng: -51.9253, amount: 7600, source: "spotify", timestamp: Date.now() },
      { region: "FR", lat: 46.2276, lng: 2.2137, amount: 8900, source: "deezer", timestamp: Date.now() },
      { region: "AU", lat: -25.2744, lng: 133.7751, amount: 6500, source: "apple", timestamp: Date.now() },
      { region: "CA", lat: 56.1304, lng: -106.3468, amount: 11200, source: "spotify", timestamp: Date.now() },
    ];

    const filteredFlows = source
      ? flows.filter((f) => f.source === source)
      : flows;

    res.json({
      timeRange,
      totalAmount: filteredFlows.reduce((sum, f) => sum + f.amount, 0),
      flows: filteredFlows,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/royalties/claimable/:address
 * Get claimable royalties for an address
 */
router.get("/claimable/:address", async (req, res, next) => {
  try {
    const { address } = req.params;

    // Mock claimable balances
    const claimable = {
      address,
      balances: [
        { token: "USDC", amount: 2450.50, tokenAddress: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174" },
        { token: "MATIC", amount: 125.00, tokenAddress: "0x0000000000000000000000000000000000000000" },
      ],
      totalUSD: 2575.50,
      lastUpdated: new Date().toISOString(),
    };

    res.json(claimable);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/royalties/history/:address
 * Get royalty payment history for an address
 */
router.get("/history/:address", async (req, res, next) => {
  try {
    const { address } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    // Mock payment history
    const payments = [
      {
        id: 1,
        songId: 1,
        songTitle: "Break the Chain",
        amount: 350.00,
        token: "USDC",
        source: "spotify",
        region: "US",
        status: "claimed",
        timestamp: Date.now() - 86400000,
        txHash: "0xabc123...",
      },
      {
        id: 2,
        songId: 2,
        songTitle: "No Masters",
        amount: 180.50,
        token: "USDC",
        source: "apple",
        region: "GB",
        status: "pending",
        timestamp: Date.now() - 43200000,
        txHash: null,
      },
    ];

    res.json({
      address,
      payments,
      pagination: { page, limit, total: payments.length },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/royalties/sources
 * Get royalty breakdown by source
 */
router.get("/sources", async (req, res, next) => {
  try {
    const sources = [
      { name: "Spotify", amount: 78500, percentage: 45, color: "#1DB954" },
      { name: "Apple Music", amount: 42000, percentage: 24, color: "#FC3C44" },
      { name: "YouTube", amount: 28000, percentage: 16, color: "#FF0000" },
      { name: "Amazon", amount: 15000, percentage: 9, color: "#FF9900" },
      { name: "Deezer", amount: 8000, percentage: 5, color: "#00C7F2" },
      { name: "Other", amount: 2500, percentage: 1, color: "#8B5CF6" },
    ];

    res.json({
      total: sources.reduce((sum, s) => sum + s.amount, 0),
      sources,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/royalties/regions
 * Get royalty breakdown by region
 */
router.get("/regions", async (req, res, next) => {
  try {
    const regions = [
      { code: "US", name: "United States", amount: 85000, percentage: 49 },
      { code: "GB", name: "United Kingdom", amount: 25000, percentage: 14 },
      { code: "DE", name: "Germany", amount: 18000, percentage: 10 },
      { code: "JP", name: "Japan", amount: 12000, percentage: 7 },
      { code: "FR", name: "France", amount: 10000, percentage: 6 },
      { code: "CA", name: "Canada", amount: 9000, percentage: 5 },
      { code: "AU", name: "Australia", amount: 7000, percentage: 4 },
      { code: "OTHER", name: "Other", amount: 8000, percentage: 5 },
    ];

    res.json({
      total: regions.reduce((sum, r) => sum + r.amount, 0),
      regions,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

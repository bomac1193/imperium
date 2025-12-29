/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * ⬡ IMPERIUM - Backend API Server ⬡
 * "Own It. Break the Chain. No Masters. Take the Throne."
 * ═══════════════════════════════════════════════════════════════════════════════
 */

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

// Import routes
const songsRoutes = require("./routes/songs");
const royaltiesRoutes = require("./routes/royalties");
const analyticsRoutes = require("./routes/analytics");
const ipfsRoutes = require("./routes/ipfs");
const oracleRoutes = require("./routes/oracle");

// Import services
const { initBlockchainListener } = require("./services/blockchainListener");
const { initBlackBoxHunter } = require("./services/blackBoxHunter");

const app = express();
const PORT = process.env.PORT || 3001;

// ═══════════════════════════════════════════════════════════════════════════════
// Middleware
// ═══════════════════════════════════════════════════════════════════════════════

app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
}));
app.use(morgan("dev"));
app.use(express.json());

// ═══════════════════════════════════════════════════════════════════════════════
// Routes
// ═══════════════════════════════════════════════════════════════════════════════

app.get("/", (req, res) => {
  res.json({
    name: "Imperium API",
    version: "1.0.0",
    message: "Own It. Break the Chain.",
    endpoints: {
      songs: "/api/songs",
      royalties: "/api/royalties",
      analytics: "/api/analytics",
      ipfs: "/api/ipfs",
      oracle: "/api/oracle",
    },
  });
});

app.use("/api/songs", songsRoutes);
app.use("/api/royalties", royaltiesRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/ipfs", ipfsRoutes);
app.use("/api/oracle", oracleRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

// ═══════════════════════════════════════════════════════════════════════════════
// Error Handling
// ═══════════════════════════════════════════════════════════════════════════════

app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(err.status || 500).json({
    error: err.message || "Internal server error",
    code: err.code || "UNKNOWN_ERROR",
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// ═══════════════════════════════════════════════════════════════════════════════
// Server Startup
// ═══════════════════════════════════════════════════════════════════════════════

async function startServer() {
  try {
    // Initialize blockchain event listener
    if (process.env.ENABLE_BLOCKCHAIN_LISTENER === "true") {
      await initBlockchainListener();
      console.log("✅ Blockchain listener initialized");
    }

    // Initialize Black Box Hunter (optional)
    if (process.env.ENABLE_BLACK_BOX_HUNTER === "true") {
      await initBlackBoxHunter();
      console.log("✅ Black Box Hunter initialized");
    }

    app.listen(PORT, () => {
      console.log(`
═══════════════════════════════════════════════════════════════
⬡ IMPERIUM API Server ⬡
═══════════════════════════════════════════════════════════════
🚀 Server running on http://localhost:${PORT}
📡 Environment: ${process.env.NODE_ENV || "development"}
═══════════════════════════════════════════════════════════════
      `);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * IPFS/Arweave Storage Routes
 * ═══════════════════════════════════════════════════════════════════════════════
 */

const express = require("express");
const router = express.Router();

/**
 * POST /api/ipfs/upload
 * Upload metadata to IPFS via Pinata
 */
router.post("/upload", async (req, res, next) => {
  try {
    const { metadata } = req.body;

    // In production: Upload to Pinata
    // const pinata = new PinataSDK({
    //   pinataApiKey: process.env.PINATA_API_KEY,
    //   pinataSecretApiKey: process.env.PINATA_SECRET_KEY,
    // });
    // const result = await pinata.pinJSONToIPFS(metadata);

    // Mock response
    const mockCID = `Qm${Buffer.from(JSON.stringify(metadata)).toString("base64").slice(0, 44)}`;

    res.json({
      success: true,
      cid: mockCID,
      uri: `ipfs://${mockCID}`,
      gateway: `https://gateway.pinata.cloud/ipfs/${mockCID}`,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/ipfs/:cid
 * Fetch metadata from IPFS
 */
router.get("/:cid", async (req, res, next) => {
  try {
    const { cid } = req.params;

    // In production: Fetch from IPFS gateway
    // const response = await axios.get(`https://gateway.pinata.cloud/ipfs/${cid}`);

    // Mock response
    const mockMetadata = {
      name: "Song Title",
      description: "Song description",
      image: `ipfs://${cid}/cover.jpg`,
      external_url: "https://imperium.music",
      attributes: [
        { trait_type: "Genre", value: "Electronic" },
        { trait_type: "BPM", value: 128 },
        { trait_type: "Duration", value: "3:45" },
      ],
      properties: {
        isrc: "USRC12345678",
        artist: "Imperium Artist",
        album: "Break the Chain",
        releaseDate: "2024-01-15",
      },
    };

    res.json(mockMetadata);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/ipfs/pin
 * Pin existing CID
 */
router.post("/pin", async (req, res, next) => {
  try {
    const { cid } = req.body;

    // In production: Pin to Pinata
    res.json({
      success: true,
      cid,
      message: "Content pinned successfully",
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/ipfs/unpin/:cid
 * Unpin a CID
 */
router.delete("/unpin/:cid", async (req, res, next) => {
  try {
    const { cid } = req.params;

    // In production: Unpin from Pinata
    res.json({
      success: true,
      cid,
      message: "Content unpinned successfully",
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

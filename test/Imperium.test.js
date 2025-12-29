/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * ⬡ IMPERIUM - Test Suite ⬡
 * "Own It. Break the Chain."
 * ═══════════════════════════════════════════════════════════════════════════════
 */

const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Imperium Platform", function () {
  let songRegistry;
  let royaltySplit;
  let payoutModule;
  let imperiumToken;
  let mockUsdc;
  let owner;
  let artist;
  let producer;
  let fan;

  const ISRC = "USRC12345678";
  const TITLE = "Break the Chain";
  const METADATA_URI = "ipfs://QmXxxxxYYYYYZZZZZ";
  const CONTENT_HASH = ethers.keccak256(ethers.toUtf8Bytes("audio-content"));

  beforeEach(async function () {
    [owner, artist, producer, fan] = await ethers.getSigners();

    // Deploy MockUSDC
    const MockUSDC = await ethers.getContractFactory("MockUSDC");
    mockUsdc = await MockUSDC.deploy();
    await mockUsdc.waitForDeployment();

    // Deploy SongRegistry
    const SongRegistry = await ethers.getContractFactory("SongRegistry");
    songRegistry = await SongRegistry.deploy(owner.address);
    await songRegistry.waitForDeployment();

    // Deploy RoyaltySplit
    const RoyaltySplit = await ethers.getContractFactory("RoyaltySplit");
    royaltySplit = await RoyaltySplit.deploy(
      await songRegistry.getAddress(),
      owner.address
    );
    await royaltySplit.waitForDeployment();

    // Deploy PayoutModule
    const PayoutModule = await ethers.getContractFactory("PayoutModule");
    payoutModule = await PayoutModule.deploy(
      await songRegistry.getAddress(),
      await royaltySplit.getAddress(),
      owner.address,
      await mockUsdc.getAddress()
    );
    await payoutModule.waitForDeployment();

    // Deploy ImperiumToken
    const ImperiumToken = await ethers.getContractFactory("ImperiumToken");
    imperiumToken = await ImperiumToken.deploy(
      await songRegistry.getAddress(),
      owner.address,
      owner.address,
      "https://api.imperium.music/tokens/{id}.json"
    );
    await imperiumToken.waitForDeployment();

    // Grant roles
    const DEPOSITOR_ROLE = ethers.keccak256(ethers.toUtf8Bytes("DEPOSITOR_ROLE"));
    await payoutModule.grantRole(DEPOSITOR_ROLE, owner.address);
  });

  describe("SongRegistry", function () {
    it("Should register a new song", async function () {
      await expect(
        songRegistry.connect(artist).registerSong(ISRC, TITLE, METADATA_URI, CONTENT_HASH)
      )
        .to.emit(songRegistry, "SongRegistered")
        .withArgs(1, ISRC, artist.address, METADATA_URI, (await ethers.provider.getBlock("latest")).timestamp + 1);

      const song = await songRegistry.getSong(1);
      expect(song.isrc).to.equal(ISRC);
      expect(song.title).to.equal(TITLE);
      expect(song.primaryCreator).to.equal(artist.address);
      expect(song.verified).to.equal(false);
      expect(song.active).to.equal(true);
    });

    it("Should not allow duplicate ISRC", async function () {
      await songRegistry.connect(artist).registerSong(ISRC, TITLE, METADATA_URI, CONTENT_HASH);

      await expect(
        songRegistry.connect(artist).registerSong(ISRC, "Another Song", METADATA_URI, ethers.ZeroHash)
      ).to.be.revertedWithCustomError(songRegistry, "ISRCAlreadyRegistered");
    });

    it("Should verify a song", async function () {
      await songRegistry.connect(artist).registerSong(ISRC, TITLE, METADATA_URI, CONTENT_HASH);

      await expect(songRegistry.verifySong(1))
        .to.emit(songRegistry, "SongVerified")
        .withArgs(1, owner.address);

      const song = await songRegistry.getSong(1);
      expect(song.verified).to.equal(true);
    });

    it("Should get songs by creator", async function () {
      await songRegistry.connect(artist).registerSong(ISRC, TITLE, METADATA_URI, CONTENT_HASH);
      await songRegistry.connect(artist).registerSong("USRC87654321", "Second Song", METADATA_URI, ethers.ZeroHash);

      const songs = await songRegistry.getCreatorSongs(artist.address);
      expect(songs.length).to.equal(2);
      expect(songs[0]).to.equal(1n);
      expect(songs[1]).to.equal(2n);
    });
  });

  describe("RoyaltySplit", function () {
    beforeEach(async function () {
      await songRegistry.connect(artist).registerSong(ISRC, TITLE, METADATA_URI, CONTENT_HASH);
    });

    it("Should configure splits", async function () {
      const recipients = [artist.address, producer.address];
      const percentages = [7000, 3000]; // 70% artist, 30% producer
      const roles = ["artist", "producer"];

      await expect(
        royaltySplit.connect(artist).configureSplits(1, recipients, percentages, roles)
      ).to.emit(royaltySplit, "SplitsConfigured");

      const splits = await royaltySplit.getSplits(1);
      expect(splits.length).to.equal(2);
      expect(splits[0].recipient).to.equal(artist.address);
      expect(splits[0].percentage).to.equal(7000n);
      expect(splits[1].recipient).to.equal(producer.address);
      expect(splits[1].percentage).to.equal(3000n);
    });

    it("Should not allow splits exceeding 100%", async function () {
      await expect(
        royaltySplit.connect(artist).configureSplits(
          1,
          [artist.address, producer.address],
          [7000, 4000], // 110%
          ["artist", "producer"]
        )
      ).to.be.revertedWithCustomError(royaltySplit, "TotalExceeds100Percent");
    });

    it("Should calculate payout correctly", async function () {
      await royaltySplit.connect(artist).configureSplits(
        1,
        [artist.address, producer.address],
        [7000, 3000],
        ["artist", "producer"]
      );

      const [recipients, amounts] = await royaltySplit.calculatePayout(1, ethers.parseUnits("1000", 6));
      expect(recipients[0]).to.equal(artist.address);
      expect(recipients[1]).to.equal(producer.address);
      expect(amounts[0]).to.equal(ethers.parseUnits("700", 6));
      expect(amounts[1]).to.equal(ethers.parseUnits("300", 6));
    });

    it("Should lock splits", async function () {
      await royaltySplit.connect(artist).configureSplits(
        1,
        [artist.address],
        [10000],
        ["artist"]
      );

      await royaltySplit.connect(artist).lockSplits(1);

      await expect(
        royaltySplit.connect(artist).updateSplit(1, artist.address, 5000)
      ).to.be.revertedWithCustomError(royaltySplit, "SplitsLocked");
    });
  });

  describe("PayoutModule", function () {
    beforeEach(async function () {
      // Register song and configure splits
      await songRegistry.connect(artist).registerSong(ISRC, TITLE, METADATA_URI, CONTENT_HASH);
      await royaltySplit.connect(artist).configureSplits(
        1,
        [artist.address, producer.address],
        [7000, 3000],
        ["artist", "producer"]
      );

      // Mint USDC to owner for deposits
      await mockUsdc.mint(owner.address, ethers.parseUnits("100000", 6));
      await mockUsdc.approve(await payoutModule.getAddress(), ethers.parseUnits("100000", 6));
    });

    it("Should deposit royalty", async function () {
      const amount = ethers.parseUnits("1000", 6);

      await expect(
        payoutModule.depositRoyalty(1, amount, await mockUsdc.getAddress(), "spotify", "US")
      )
        .to.emit(payoutModule, "RoyaltyReceived")
        .withArgs(1, 1, amount, await mockUsdc.getAddress(), "spotify", "US");

      const payout = await payoutModule.getPayout(1);
      expect(payout.amount).to.equal(amount);
      expect(payout.distributed).to.equal(false);
    });

    it("Should distribute royalty", async function () {
      const amount = ethers.parseUnits("1000", 6);
      await payoutModule.depositRoyalty(1, amount, await mockUsdc.getAddress(), "spotify", "US");

      await expect(payoutModule.distributeRoyalty(1))
        .to.emit(payoutModule, "RoyaltyDistributed");

      // Check claimable balances
      const artistBalance = await payoutModule.getClaimableBalance(artist.address, await mockUsdc.getAddress());
      const producerBalance = await payoutModule.getClaimableBalance(producer.address, await mockUsdc.getAddress());

      expect(artistBalance).to.equal(ethers.parseUnits("700", 6));
      expect(producerBalance).to.equal(ethers.parseUnits("300", 6));
    });

    it("Should allow claiming royalties", async function () {
      const amount = ethers.parseUnits("1000", 6);
      await payoutModule.depositRoyalty(1, amount, await mockUsdc.getAddress(), "spotify", "US");
      await payoutModule.distributeRoyalty(1);

      const artistBalanceBefore = await mockUsdc.balanceOf(artist.address);

      await expect(payoutModule.connect(artist).claimRoyalties(await mockUsdc.getAddress()))
        .to.emit(payoutModule, "RoyaltyClaimed")
        .withArgs(artist.address, await mockUsdc.getAddress(), ethers.parseUnits("700", 6));

      const artistBalanceAfter = await mockUsdc.balanceOf(artist.address);
      expect(artistBalanceAfter - artistBalanceBefore).to.equal(ethers.parseUnits("700", 6));
    });
  });

  describe("ImperiumToken", function () {
    beforeEach(async function () {
      await songRegistry.connect(artist).registerSong(ISRC, TITLE, METADATA_URI, CONTENT_HASH);
    });

    it("Should create fractional ownership token", async function () {
      await expect(
        imperiumToken.connect(artist).createToken(
          1, // songId
          10000, // maxSupply
          ethers.parseEther("0.01"), // pricePerToken
          ethers.ZeroAddress, // Native token payment
          2500, // 25% royalty share to token holders
          "ipfs://token-metadata"
        )
      )
        .to.emit(imperiumToken, "TokenCreated")
        .withArgs(1, 1, 10000, ethers.parseEther("0.01"));

      const tokenInfo = await imperiumToken.getTokenInfo(1);
      expect(tokenInfo.songId).to.equal(1n);
      expect(tokenInfo.maxSupply).to.equal(10000n);
      expect(tokenInfo.mintingActive).to.equal(true);
    });

    it("Should mint tokens with payment", async function () {
      await imperiumToken.connect(artist).createToken(
        1,
        10000,
        ethers.parseEther("0.01"),
        ethers.ZeroAddress,
        2500,
        "ipfs://token-metadata"
      );

      const cost = ethers.parseEther("0.1"); // 10 tokens * 0.01 ETH
      await expect(
        imperiumToken.connect(fan).mintTokens(1, 10, { value: cost })
      )
        .to.emit(imperiumToken, "TokensMinted")
        .withArgs(1, fan.address, 10, cost);

      const balance = await imperiumToken.balanceOf(fan.address, 1);
      expect(balance).to.equal(10n);
    });

    it("Should calculate royalty distribution to token holders", async function () {
      await imperiumToken.connect(artist).createToken(
        1,
        10000,
        ethers.parseEther("0.01"),
        ethers.ZeroAddress,
        2500, // 25% to token holders
        "ipfs://token-metadata"
      );

      // Fan buys 100 tokens (1% of supply)
      await imperiumToken.connect(fan).mintTokens(1, 100, { value: ethers.parseEther("1") });

      const [holders, amounts] = await imperiumToken.calculateRoyaltyDistribution(
        1,
        ethers.parseUnits("1000", 6) // 1000 USDC royalty
      );

      expect(holders[0]).to.equal(fan.address);
      // 25% of 1000 USDC = 250 USDC to token holders
      // Fan has 100% of minted tokens = 250 USDC
      expect(amounts[0]).to.equal(ethers.parseUnits("250", 6));
    });
  });
});

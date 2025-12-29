/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * ⬡ IMPERIUM - Music Royalty Platform ⬡
 * Deployment Script
 * "Own It. Break the Chain. No Masters. Take the Throne."
 * ═══════════════════════════════════════════════════════════════════════════════
 */

const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("\n═══════════════════════════════════════════════════════════════");
  console.log("⬡ IMPERIUM - Deploying Music Royalty Platform ⬡");
  console.log("═══════════════════════════════════════════════════════════════\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address)), "ETH\n");

  const network = hre.network.name;
  console.log("Network:", network);

  // Get USDC address based on network
  let usdcAddress;
  if (network === "polygon") {
    usdcAddress = "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174"; // Polygon USDC
  } else if (network === "mumbai") {
    usdcAddress = "0x0FA8781a83E46826621b3BC094Ea2A0212e71B23"; // Mumbai test USDC
  } else {
    // Deploy mock USDC for local/hardhat network
    console.log("\n📦 Deploying MockUSDC...");
    const MockUSDC = await hre.ethers.getContractFactory("MockUSDC");
    const mockUsdc = await MockUSDC.deploy();
    await mockUsdc.waitForDeployment();
    usdcAddress = await mockUsdc.getAddress();
    console.log("✅ MockUSDC deployed to:", usdcAddress);
  }

  // Deploy SongRegistry
  console.log("\n📦 Deploying SongRegistry...");
  const SongRegistry = await hre.ethers.getContractFactory("SongRegistry");
  const songRegistry = await SongRegistry.deploy(deployer.address);
  await songRegistry.waitForDeployment();
  const songRegistryAddress = await songRegistry.getAddress();
  console.log("✅ SongRegistry deployed to:", songRegistryAddress);

  // Deploy RoyaltySplit
  console.log("\n📦 Deploying RoyaltySplit...");
  const RoyaltySplit = await hre.ethers.getContractFactory("RoyaltySplit");
  const royaltySplit = await RoyaltySplit.deploy(songRegistryAddress, deployer.address);
  await royaltySplit.waitForDeployment();
  const royaltySplitAddress = await royaltySplit.getAddress();
  console.log("✅ RoyaltySplit deployed to:", royaltySplitAddress);

  // Deploy PayoutModule
  console.log("\n📦 Deploying PayoutModule...");
  const PayoutModule = await hre.ethers.getContractFactory("PayoutModule");
  const payoutModule = await PayoutModule.deploy(
    songRegistryAddress,
    royaltySplitAddress,
    deployer.address,
    usdcAddress
  );
  await payoutModule.waitForDeployment();
  const payoutModuleAddress = await payoutModule.getAddress();
  console.log("✅ PayoutModule deployed to:", payoutModuleAddress);

  // Deploy ImperiumToken
  console.log("\n📦 Deploying ImperiumToken...");
  const ImperiumToken = await hre.ethers.getContractFactory("ImperiumToken");
  const imperiumToken = await ImperiumToken.deploy(
    songRegistryAddress,
    deployer.address,
    deployer.address, // Treasury (use deployer for now)
    "https://api.imperium.music/tokens/{id}.json"
  );
  await imperiumToken.waitForDeployment();
  const imperiumTokenAddress = await imperiumToken.getAddress();
  console.log("✅ ImperiumToken deployed to:", imperiumTokenAddress);

  // Deploy ZKPrivacySplits (Phase 2 placeholder)
  console.log("\n📦 Deploying ZKPrivacySplits (Phase 2 Placeholder)...");
  const ZKPrivacySplits = await hre.ethers.getContractFactory("ZKPrivacySplits");
  const zkPrivacySplits = await ZKPrivacySplits.deploy(deployer.address);
  await zkPrivacySplits.waitForDeployment();
  const zkPrivacySplitsAddress = await zkPrivacySplits.getAddress();
  console.log("✅ ZKPrivacySplits deployed to:", zkPrivacySplitsAddress);

  // Summary
  console.log("\n═══════════════════════════════════════════════════════════════");
  console.log("⬡ DEPLOYMENT COMPLETE ⬡");
  console.log("═══════════════════════════════════════════════════════════════\n");

  const deploymentInfo = {
    network: network,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {
      SongRegistry: songRegistryAddress,
      RoyaltySplit: royaltySplitAddress,
      PayoutModule: payoutModuleAddress,
      ImperiumToken: imperiumTokenAddress,
      ZKPrivacySplits: zkPrivacySplitsAddress,
      USDC: usdcAddress,
    },
  };

  console.log("Contract Addresses:");
  console.log("─────────────────────────────────────────────────────────────────");
  console.log("SongRegistry:     ", songRegistryAddress);
  console.log("RoyaltySplit:     ", royaltySplitAddress);
  console.log("PayoutModule:     ", payoutModuleAddress);
  console.log("ImperiumToken:    ", imperiumTokenAddress);
  console.log("ZKPrivacySplits:  ", zkPrivacySplitsAddress);
  console.log("USDC:             ", usdcAddress);
  console.log("─────────────────────────────────────────────────────────────────\n");

  // Save deployment info
  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const deploymentFile = path.join(deploymentsDir, `${network}.json`);
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
  console.log("📁 Deployment info saved to:", deploymentFile);

  // Generate frontend config
  const frontendConfigDir = path.join(__dirname, "../frontend/lib");
  if (!fs.existsSync(frontendConfigDir)) {
    fs.mkdirSync(frontendConfigDir, { recursive: true });
  }

  const frontendConfig = `// Auto-generated deployment addresses
// Network: ${network}
// Generated: ${deploymentInfo.timestamp}

export const CONTRACTS = {
  SONG_REGISTRY: "${songRegistryAddress}",
  ROYALTY_SPLIT: "${royaltySplitAddress}",
  PAYOUT_MODULE: "${payoutModuleAddress}",
  IMPERIUM_TOKEN: "${imperiumTokenAddress}",
  ZK_PRIVACY_SPLITS: "${zkPrivacySplitsAddress}",
  USDC: "${usdcAddress}",
};

export const CHAIN_ID = ${network === "polygon" ? 137 : network === "mumbai" ? 80001 : 31337};
export const NETWORK_NAME = "${network}";
`;

  fs.writeFileSync(path.join(frontendConfigDir, "contracts.ts"), frontendConfig);
  console.log("📁 Frontend config saved to:", path.join(frontendConfigDir, "contracts.ts"));

  // Verify contracts on Polygonscan (if on Polygon/Mumbai)
  if (network === "polygon" || network === "mumbai") {
    console.log("\n📋 Verifying contracts on Polygonscan...");
    console.log("Run the following commands to verify:");
    console.log(`npx hardhat verify --network ${network} ${songRegistryAddress} ${deployer.address}`);
    console.log(`npx hardhat verify --network ${network} ${royaltySplitAddress} ${songRegistryAddress} ${deployer.address}`);
    console.log(`npx hardhat verify --network ${network} ${payoutModuleAddress} ${songRegistryAddress} ${royaltySplitAddress} ${deployer.address} ${usdcAddress}`);
  }

  console.log("\n⬡ Imperium. Own It. ⬡\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

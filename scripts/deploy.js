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
    usdcAddress = "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359"; // Polygon USDC (native)
  } else if (network === "amoy") {
    usdcAddress = "0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582"; // Amoy test USDC
  } else if (network === "base") {
    usdcAddress = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"; // Base USDC (native)
  } else if (network === "baseSepolia") {
    usdcAddress = "0x036CbD53842c5426634e7929541eC2318f3dCF7e"; // Base Sepolia test USDC
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

export const CHAIN_ID = ${
    network === "polygon" ? 137 :
    network === "amoy" ? 80002 :
    network === "base" ? 8453 :
    network === "baseSepolia" ? 84532 :
    31337
  };
export const NETWORK_NAME = "${network}";
`;

  fs.writeFileSync(path.join(frontendConfigDir, "contracts.ts"), frontendConfig);
  console.log("📁 Frontend config saved to:", path.join(frontendConfigDir, "contracts.ts"));

  // Verify contracts on block explorer (if on a public network)
  if (["polygon", "amoy", "base", "baseSepolia"].includes(network)) {
    const explorerName = network.startsWith("base") ? "Basescan" : "Polygonscan";
    console.log(`\n📋 Verifying contracts on ${explorerName}...`);
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

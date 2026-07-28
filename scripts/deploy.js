const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Deploying contracts to:", hre.network.name);
  console.log("Deployer:", (await hre.ethers.getSigners())[0].address);
  console.log("");

  const deployments = {};

  // Counter
  const Counter = await hre.ethers.getContractFactory("Counter");
  const counter = await Counter.deploy();
  await counter.waitForDeployment();
  deployments.counter = await counter.getAddress();
  console.log("Counter     deployed:", deployments.counter);

  // ERC-20 Token
  const MyToken = await hre.ethers.getContractFactory("MyToken");
  const myToken = await MyToken.deploy("MyToken", "MTK", 1000000);
  await myToken.waitForDeployment();
  deployments.token = await myToken.getAddress();
  console.log("MyToken     deployed:", deployments.token);

  // NFT
  const MyNFT = await hre.ethers.getContractFactory("MyNFT");
  const myNFT = await MyNFT.deploy();
  await myNFT.waitForDeployment();
  deployments.nft = await myNFT.getAddress();
  console.log("MyNFT       deployed:", deployments.nft);

  // Faucet
  const Faucet = await hre.ethers.getContractFactory("Faucet");
  const faucet = await Faucet.deploy();
  await faucet.waitForDeployment();
  deployments.faucet = await faucet.getAddress();
  console.log("Faucet      deployed:", deployments.faucet);

  // DEX (needs token pair)
  const dexTokenA = await hre.ethers.getContractFactory("MyToken");
  const tokenA = await dexTokenA.deploy("TokenA", "TKA", 1000000);
  await tokenA.waitForDeployment();
  const tokenB = await dexTokenA.deploy("TokenB", "TKB", 1000000);
  await tokenB.waitForDeployment();

  const SimpleDEX = await hre.ethers.getContractFactory("SimpleDEX");
  const dex = await SimpleDEX.deploy(await tokenA.getAddress(), await tokenB.getAddress());
  await dex.waitForDeployment();
  deployments.dex = await dex.getAddress();
  console.log("SimpleDEX   deployed:", deployments.dex);
  console.log("  TokenA:", await tokenA.getAddress());
  console.log("  TokenB:", await tokenB.getAddress());

  const network = hre.network.name;
  const output = {
    network,
    deployer: (await hre.ethers.getSigners())[0].address,
    timestamp: new Date().toISOString(),
    contracts: deployments,
  };

  const outPath = path.join(__dirname, "..", "frontend", "deployments.json");
  fs.writeFileSync(outPath, JSON.stringify(output, null, 2));
  console.log("\nDeployment info saved to:", outPath);
  console.log("\nAll 5 contracts deployed successfully!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
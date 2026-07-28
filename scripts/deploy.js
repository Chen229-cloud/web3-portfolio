const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Deploying contracts to:", hre.network.name);
  console.log("Deployer:", (await hre.ethers.getSigners())[0].address);
  console.log("");

  const deployments = {};

  const Counter = await hre.ethers.getContractFactory("Counter");
  const counter = await Counter.deploy();
  await counter.waitForDeployment();
  deployments.counter = await counter.getAddress();
  console.log("Counter  deployed:", deployments.counter);

  const MyToken = await hre.ethers.getContractFactory("MyToken");
  const myToken = await MyToken.deploy("MyToken", "MTK", 1000000);
  await myToken.waitForDeployment();
  deployments.token = await myToken.getAddress();
  console.log("MyToken  deployed:", deployments.token);

  const MyNFT = await hre.ethers.getContractFactory("MyNFT");
  const myNFT = await MyNFT.deploy();
  await myNFT.waitForDeployment();
  deployments.nft = await myNFT.getAddress();
  console.log("MyNFT    deployed:", deployments.nft);

  const Faucet = await hre.ethers.getContractFactory("Faucet");
  const faucet = await Faucet.deploy();
  await faucet.waitForDeployment();
  deployments.faucet = await faucet.getAddress();
  console.log("Faucet   deployed:", deployments.faucet);

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
  console.log("\nAll contracts deployed successfully!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
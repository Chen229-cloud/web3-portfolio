const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Deploying to:", hre.network.name);
  const deployer = (await hre.ethers.getSigners())[0];
  console.log("Deployer:", deployer.address);
  console.log("");

  const deployments = {};

  const Counter = await hre.ethers.getContractFactory("Counter");
  const counter = await Counter.deploy();
  await counter.waitForDeployment();
  deployments.counter = await counter.getAddress();
  console.log("Counter     :", deployments.counter);

  const MyToken = await hre.ethers.getContractFactory("MyToken");
  const myToken = await MyToken.deploy("MyToken", "MTK", 1000000);
  await myToken.waitForDeployment();
  deployments.token = await myToken.getAddress();
  console.log("MyToken     :", deployments.token);

  const MyNFT = await hre.ethers.getContractFactory("MyNFT");
  const myNFT = await MyNFT.deploy();
  await myNFT.waitForDeployment();
  deployments.nft = await myNFT.getAddress();
  console.log("MyNFT       :", deployments.nft);

  const Faucet = await hre.ethers.getContractFactory("Faucet");
  const faucet = await Faucet.deploy();
  await faucet.waitForDeployment();
  deployments.faucet = await faucet.getAddress();
  console.log("Faucet      :", deployments.faucet);

  const dexTokenA = await hre.ethers.getContractFactory("MyToken");
  const tA = await dexTokenA.deploy("TokenA", "TKA", 1000000);
  await tA.waitForDeployment();
  const tB = await dexTokenA.deploy("TokenB", "TKB", 1000000);
  await tB.waitForDeployment();
  const SimpleDEX = await hre.ethers.getContractFactory("SimpleDEX");
  const dex = await SimpleDEX.deploy(await tA.getAddress(), await tB.getAddress());
  await dex.waitForDeployment();
  deployments.dex = await dex.getAddress();
  console.log("SimpleDEX   :", deployments.dex);

  const Staking = await hre.ethers.getContractFactory("Staking");
  const stk = await dexTokenA.deploy("Stake", "STK", 1000000);
  await stk.waitForDeployment();
  const rwd = await dexTokenA.deploy("Reward", "RWD", 1000000);
  await rwd.waitForDeployment();
  const staking = await Staking.deploy(
    await stk.getAddress(), await rwd.getAddress(), hre.ethers.parseEther("1")
  );
  await staking.waitForDeployment();
  deployments.staking = await staking.getAddress();
  console.log("Staking     :", deployments.staking);

  const SimpleDAO = await hre.ethers.getContractFactory("SimpleDAO");
  const govToken = await dexTokenA.deploy("GovToken", "GOV", 1000000);
  await govToken.waitForDeployment();
  const dao = await SimpleDAO.deploy(await govToken.getAddress());
  await dao.waitForDeployment();
  deployments.dao = await dao.getAddress();
  console.log("SimpleDAO   :", deployments.dao);

  const output = {
    network: hre.network.name,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: deployments,
  };
  fs.writeFileSync(path.join(__dirname, "..", "frontend", "deployments.json"), JSON.stringify(output, null, 2));
  console.log("\n✅ 7 contracts deployed!");
}

main().catch(e => { console.error(e); process.exitCode = 1; });
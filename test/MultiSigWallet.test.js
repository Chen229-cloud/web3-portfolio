const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MultiSigWallet", function () {
  let wallet, owner1, owner2, owner3, outsider;

  beforeEach(async function () {
    [owner1, owner2, owner3, outsider] = await ethers.getSigners();
    const MSW = await ethers.getContractFactory("MultiSigWallet");
    wallet = await MSW.deploy(
      [owner1.address, owner2.address, owner3.address],
      2
    );
    await wallet.waitForDeployment();
  });

  it("should have correct owners and threshold", async function () {
    expect(await wallet.getOwners()).to.have.lengthOf(3);
    expect(await wallet.required()).to.equal(2);
  });

  it("should accept ETH deposits", async function () {
    await owner1.sendTransaction({ to: await wallet.getAddress(), value: ethers.parseEther("1") });
    expect(await ethers.provider.getBalance(await wallet.getAddress())).to.equal(ethers.parseEther("1"));
  });

  it("should submit a transaction", async function () {
    await wallet.connect(owner1).submitTransaction(outsider.address, ethers.parseEther("0.1"), "0x");
    expect(await wallet.transactionCount()).to.equal(1);
  });

  it("should require confirmations to execute", async function () {
    await owner1.sendTransaction({ to: await wallet.getAddress(), value: ethers.parseEther("1") });
    await wallet.connect(owner1).submitTransaction(outsider.address, ethers.parseEther("0.1"), "0x");
    await expect(
      wallet.connect(owner1).executeTransaction(0)
    ).to.be.revertedWith("Not enough confirmations");
  });

  it("should auto-execute after 2 confirmations", async function () {
    await owner1.sendTransaction({ to: await wallet.getAddress(), value: ethers.parseEther("1") });
    await wallet.connect(owner1).submitTransaction(outsider.address, ethers.parseEther("0.1"), "0x");
    await wallet.connect(owner1).confirmTransaction(0);
    await wallet.connect(owner2).confirmTransaction(0);
    expect(await wallet.isConfirmed(0)).to.equal(true);
  });

  it("should reject non-owners", async function () {
    await expect(
      wallet.connect(outsider).submitTransaction(outsider.address, 0, "0x")
    ).to.be.revertedWith("Not an owner");
  });

  it("should allow revoking confirmation", async function () {
    await wallet.connect(owner1).submitTransaction(outsider.address, 0, "0x");
    await wallet.connect(owner1).confirmTransaction(0);
    await wallet.connect(owner1).revokeConfirmation(0);
    expect(await wallet.isConfirmed(0)).to.equal(false);
  });

  it("should reject duplicate owners in constructor", async function () {
    const MSW = await ethers.getContractFactory("MultiSigWallet");
    await expect(
      MSW.deploy([owner1.address, owner1.address], 1)
    ).to.be.revertedWith("Duplicate owner");
  });
});
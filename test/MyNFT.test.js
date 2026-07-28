const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MyNFT", function () {
  let nft, owner, addr1;

  beforeEach(async function () {
    [owner, addr1] = await ethers.getSigners();
    const MyNFT = await ethers.getContractFactory("MyNFT");
    nft = await MyNFT.deploy();
    await nft.waitForDeployment();
  });

  it("should mint an NFT for correct payment", async function () {
    await nft.connect(addr1).mint({ value: ethers.parseEther("0.01") });
    expect(await nft.ownerOf(0)).to.equal(addr1.address);
    expect(await nft.totalMinted()).to.equal(1);
  });

  it("should reject insufficient payment", async function () {
    await expect(
      nft.connect(addr1).mint({ value: ethers.parseEther("0.001") })
    ).to.be.revertedWith("Insufficient payment");
  });

  it("should allow owner to withdraw", async function () {
    await nft.connect(addr1).mint({ value: ethers.parseEther("0.01") });
    const balanceBefore = await ethers.provider.getBalance(owner.address);
    const tx = await nft.withdraw();
    const receipt = await tx.wait();
    const gasCost = receipt.gasUsed * receipt.gasPrice;
    const balanceAfter = await ethers.provider.getBalance(owner.address);
    expect(balanceAfter - balanceBefore + gasCost).to.equal(ethers.parseEther("0.01"));
  });
});
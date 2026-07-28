const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MyToken", function () {
  let token, owner, addr1;

  beforeEach(async function () {
    [owner, addr1] = await ethers.getSigners();
    const MyToken = await ethers.getContractFactory("MyToken");
    token = await MyToken.deploy("MyToken", "MTK", 1000000);
    await token.waitForDeployment();
  });

  it("should have correct name and symbol", async function () {
    expect(await token.name()).to.equal("MyToken");
    expect(await token.symbol()).to.equal("MTK");
  });

  it("should mint initial supply to owner", async function () {
    const totalSupply = await token.totalSupply();
    const ownerBalance = await token.balanceOf(owner.address);
    expect(ownerBalance).to.equal(totalSupply);
  });

  it("should allow owner to mint", async function () {
    await token.mint(addr1.address, 1000n * 10n ** 18n);
    expect(await token.balanceOf(addr1.address)).to.equal(1000n * 10n ** 18n);
  });

  it("should not allow non-owner to mint", async function () {
    await expect(
      token.connect(addr1).mint(addr1.address, 1000n * 10n ** 18n)
    ).to.be.reverted;
  });
});
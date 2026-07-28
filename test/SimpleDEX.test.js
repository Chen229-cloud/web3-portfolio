const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SimpleDEX", function () {
  let dex, tokenA, tokenB, owner, user;

  beforeEach(async function () {
    [owner, user] = await ethers.getSigners();

    const ERC20 = await ethers.getContractFactory("MyToken");
    tokenA = await ERC20.deploy("TokenA", "TKA", 1000000);
    tokenB = await ERC20.deploy("TokenB", "TKB", 1000000);
    await tokenA.waitForDeployment();
    await tokenB.waitForDeployment();

    const DEX = await ethers.getContractFactory("SimpleDEX");
    dex = await DEX.deploy(await tokenA.getAddress(), await tokenB.getAddress());
    await dex.waitForDeployment();

    await tokenA.mint(user.address, ethers.parseEther("10000"));
    await tokenB.mint(user.address, ethers.parseEther("10000"));
    await tokenA.connect(user).approve(await dex.getAddress(), ethers.MaxUint256);
    await tokenB.connect(user).approve(await dex.getAddress(), ethers.MaxUint256);
    await tokenA.approve(await dex.getAddress(), ethers.MaxUint256);
    await tokenB.approve(await dex.getAddress(), ethers.MaxUint256);
  });

  it("should add initial liquidity", async function () {
    await dex.addLiquidity(ethers.parseEther("100"), ethers.parseEther("200"));
    const [rA, rB] = await dex.getReserves();
    expect(rA).to.equal(ethers.parseEther("100"));
    expect(rB).to.equal(ethers.parseEther("200"));
  });

  it("should swap A for B", async function () {
    await dex.addLiquidity(ethers.parseEther("1000"), ethers.parseEther("1000"));
    const before = await tokenB.balanceOf(user.address);

    await tokenA.connect(user).approve(await dex.getAddress(), ethers.MaxUint256);
    await dex.connect(user).swapAforB(ethers.parseEther("10"));

    const after = await tokenB.balanceOf(user.address);
    expect(after - before).to.be.gt(0);
  });

  it("should swap B for A", async function () {
    await dex.addLiquidity(ethers.parseEther("1000"), ethers.parseEther("1000"));
    await tokenB.connect(user).approve(await dex.getAddress(), ethers.MaxUint256);
    await expect(dex.connect(user).swapBforA(ethers.parseEther("10")))
      .to.not.be.reverted;
  });

  it("should remove liquidity and return tokens", async function () {
    await dex.addLiquidity(ethers.parseEther("100"), ethers.parseEther("200"));
    const lpBalance = await dex.liquidity(owner.address);

    const [rA, rB] = await dex.getReserves();
    await dex.removeLiquidity(lpBalance);
    const [rA2, rB2] = await dex.getReserves();

    expect(rA2).to.equal(0);
    expect(rB2).to.equal(0);
  });

  it("should revert swap with no liquidity", async function () {
    await expect(
      dex.connect(user).swapAforB(ethers.parseEther("1"))
    ).to.be.revertedWith("No liquidity");
  });

  it("should revert zero amount operations", async function () {
    await expect(dex.addLiquidity(0, ethers.parseEther("100")))
      .to.be.revertedWith("Zero amounts");
  });

  it("should maintain constant product invariant after swap", async function () {
    await dex.addLiquidity(ethers.parseEther("1000"), ethers.parseEther("1000"));
    const [rA0, rB0] = await dex.getReserves();
    const k0 = rA0 * rB0;

    await tokenA.connect(user).approve(await dex.getAddress(), ethers.MaxUint256);
    await dex.connect(user).swapAforB(ethers.parseEther("50"));
    const [rA1, rB1] = await dex.getReserves();
    const k1 = rA1 * rB1;
    expect(k1).to.be.gte(k0);
  });
});
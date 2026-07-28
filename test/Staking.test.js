const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Staking", function () {
  let staking, stakingToken, rewardToken, owner, user;

  beforeEach(async function () {
    [owner, user] = await ethers.getSigners();

    const ERC20 = await ethers.getContractFactory("MyToken");
    stakingToken = await ERC20.deploy("Stake", "STK", 1000000);
    rewardToken = await ERC20.deploy("Reward", "RWD", 1000000);
    await stakingToken.waitForDeployment();
    await rewardToken.waitForDeployment();

    // Reward rate: 1 token per second per staked token (scaled 1e18)
    // For practical tests, set to 1e18 (1 token/sec per full token staked)
    const Staking = await ethers.getContractFactory("Staking");
    staking = await Staking.deploy(
      await stakingToken.getAddress(),
      await rewardToken.getAddress(),
      ethers.parseEther("1")
    );
    await staking.waitForDeployment();

    // Give user tokens
    await stakingToken.mint(user.address, ethers.parseEther("1000"));
    await rewardToken.mint(owner.address, ethers.parseEther("100000"));
    await stakingToken.connect(user).approve(await staking.getAddress(), ethers.MaxUint256);
    await rewardToken.approve(await staking.getAddress(), ethers.MaxUint256);

    // Fund rewards
    await rewardToken.approve(await staking.getAddress(), ethers.MaxUint256);
    await staking.fundRewards(ethers.parseEther("50000"));
  });

  it("should allow staking", async function () {
    await staking.connect(user).stake(ethers.parseEther("100"));
    expect(await staking.stakedBalance(user.address)).to.equal(ethers.parseEther("100"));
    expect(await staking.totalStaked()).to.equal(ethers.parseEther("100"));
  });

  it("should earn rewards over time", async function () {
    await staking.connect(user).stake(ethers.parseEther("100"));
    await ethers.provider.send("evm_increaseTime", [3600]); // +1 hour
    await ethers.provider.send("evm_mine");

    const earned = await staking.earned(user.address);
    expect(earned).to.be.gt(0);
  });

  it("should claim rewards", async function () {
    await staking.connect(user).stake(ethers.parseEther("100"));
    await ethers.provider.send("evm_increaseTime", [3600]);
    await ethers.provider.send("evm_mine");

    await staking.connect(user).claimReward();
    const balance = await rewardToken.balanceOf(user.address);
    expect(balance).to.be.gt(0);
  });

  it("should withdraw staked tokens", async function () {
    await staking.connect(user).stake(ethers.parseEther("100"));
    await staking.connect(user).withdraw(ethers.parseEther("50"));
    expect(await staking.stakedBalance(user.address)).to.equal(ethers.parseEther("50"));
    expect(await staking.totalStaked()).to.equal(ethers.parseEther("50"));
  });

  it("should revert withdraw more than staked", async function () {
    await staking.connect(user).stake(ethers.parseEther("100"));
    await expect(
      staking.connect(user).withdraw(ethers.parseEther("200"))
    ).to.be.revertedWith("Insufficient balance");
  });

  it("should allow owner to change reward rate", async function () {
    await staking.setRewardRate(ethers.parseEther("2"));
    expect(await staking.rewardRate()).to.equal(ethers.parseEther("2"));
  });
});
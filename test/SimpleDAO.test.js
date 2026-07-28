const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SimpleDAO", function () {
  let dao, token, owner, voter1, voter2;

  beforeEach(async function () {
    [owner, voter1, voter2] = await ethers.getSigners();
    const ERC20 = await ethers.getContractFactory("MyToken");
    token = await ERC20.deploy("GovToken", "GOV", 1000000);
    await token.waitForDeployment();

    // Give voters some governance power
    await token.mint(voter1.address, ethers.parseEther("50000"));
    await token.mint(voter2.address, ethers.parseEther("60000"));

    const DAO = await ethers.getContractFactory("SimpleDAO");
    dao = await DAO.deploy(await token.getAddress());
    await dao.waitForDeployment();
  });

  it("should create a proposal", async function () {
    await dao.createProposal("Fund the treasury");
    const p = await dao.getProposal(1);
    expect(p.description).to.equal("Fund the treasury");
    expect(p.proposer).to.equal(owner.address);
    expect(p.executed).to.equal(false);
  });

  it("should allow voting", async function () {
    await dao.createProposal("Change fee to 0.1%");
    await dao.connect(voter1).vote(1, true);

    const p = await dao.getProposal(1);
    expect(p.forVotes).to.equal(ethers.parseEther("50000"));
    expect(await dao.hasVoted(1, voter1.address)).to.equal(true);
  });

  it("should prevent double voting", async function () {
    await dao.createProposal("Burn tokens");
    await dao.connect(voter1).vote(1, true);
    await expect(dao.connect(voter1).vote(1, false)).to.be.revertedWith("Already voted");
  });

  it("should execute a passed proposal", async function () {
    await dao.createProposal("Update protocol");
    await dao.connect(voter1).vote(1, true);
    await dao.connect(voter2).vote(1, true);

    await ethers.provider.send("evm_increaseTime", [3 * 86400 + 1]);
    await ethers.provider.send("evm_mine");

    await dao.executeProposal(1);
    const p = await dao.getProposal(1);
    expect(p.executed).to.equal(true);
  });

  it("should reject proposal without majority", async function () {
    await dao.createProposal("Bad idea");
    await dao.connect(voter1).vote(1, false);
    await dao.connect(voter2).vote(1, false);

    await ethers.provider.send("evm_increaseTime", [3 * 86400 + 1]);
    await ethers.provider.send("evm_mine");

    await expect(dao.executeProposal(1)).to.be.revertedWith("Proposal did not pass");
  });
});
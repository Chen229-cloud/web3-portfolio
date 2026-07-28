const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Counter", function () {
  let counter;

  beforeEach(async function () {
    const Counter = await ethers.getContractFactory("Counter");
    counter = await Counter.deploy();
    await counter.waitForDeployment();
  });

  it("should start at 0", async function () {
    expect(await counter.count()).to.equal(0);
  });

  it("should increment", async function () {
    await counter.increment();
    expect(await counter.count()).to.equal(1);
  });

  it("should decrement", async function () {
    await counter.increment();
    await counter.increment();
    await counter.decrement();
    expect(await counter.count()).to.equal(1);
  });

  it("should not decrement below 0", async function () {
    await expect(counter.decrement()).to.be.revertedWith("Counter: underflow");
  });

  it("should reset to 0", async function () {
    await counter.increment();
    await counter.increment();
    await counter.reset();
    expect(await counter.count()).to.equal(0);
  });

  it("should emit CountChanged event", async function () {
    await expect(counter.increment())
      .to.emit(counter, "CountChanged")
      .withArgs(1, await (await ethers.getSigners())[0].getAddress());
  });
});
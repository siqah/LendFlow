const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("PriceOracle", function () {
  let priceOracle;
  let owner;
  let user1;
  let token;

  beforeEach(async function () {
    [owner, user1] = await ethers.getSigners();
    const PriceOracle = await ethers.getContractFactory("PriceOracle");
    priceOracle = await PriceOracle.deploy();
    await priceOracle.waitForDeployment();

    const MockERC20 = await ethers.getContractFactory("MockERC20");
    token = await MockERC20.deploy("Mock Token", "MOCK");
    await token.waitForDeployment();
  });

  it("reverts when price is not set", async function () {
    await expect(priceOracle.getPrice(await token.getAddress())).to.be.revertedWith("Price not set");
  });

  it("reverts when price is stale", async function () {
    await priceOracle.setPrice(await token.getAddress(), ethers.parseEther("1"));
    await ethers.provider.send("evm_increaseTime", [3601]);
    await ethers.provider.send("evm_mine", []);

    await expect(priceOracle.getPrice(await token.getAddress())).to.be.revertedWith("Stale price");
  });

  it("restricts setPrice to owner", async function () {
    await expect(
      priceOracle.connect(user1).setPrice(await token.getAddress(), ethers.parseEther("1"))
    )
      .to.be.revertedWithCustomError(priceOracle, "OwnableUnauthorizedAccount")
      .withArgs(user1.address);
  });

  it("returns prices for multiple tokens in order", async function () {
    const tokenB = await (await ethers.getContractFactory("MockERC20")).deploy("Mock Token B", "MKB");
    await tokenB.waitForDeployment();

    await priceOracle.setPrice(await token.getAddress(), ethers.parseEther("10"));
    await priceOracle.setPrice(await tokenB.getAddress(), ethers.parseEther("20"));

    const prices = await priceOracle.getMultiplePrices([await token.getAddress(), await tokenB.getAddress()]);
    expect(prices[0]).to.equal(ethers.parseEther("10"));
    expect(prices[1]).to.equal(ethers.parseEther("20"));
  });
});

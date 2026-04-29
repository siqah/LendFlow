const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("LendFlow Protocol", function () {
  let lendFlow;
  let priceOracle;
  let token;
  let rewardToken;
  let owner;
  let user1;
  let user2;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    const PriceOracle = await ethers.getContractFactory("PriceOracle");
    priceOracle = await PriceOracle.deploy();
    await priceOracle.waitForDeployment();

    const LendFlow = await ethers.getContractFactory("LendFlow");
    lendFlow = await LendFlow.deploy(await priceOracle.getAddress());
    await lendFlow.waitForDeployment();

    const rewardTokenAddress = await lendFlow.rewardToken();
    rewardToken = await ethers.getContractAt("LendFlowToken", rewardTokenAddress);

    const MockERC20 = await ethers.getContractFactory("MockERC20");
    token = await MockERC20.deploy("Mock WETH", "mWETH");
    await token.waitForDeployment();

    await lendFlow.addMarket(await token.getAddress(), 7500, 8000);
    await priceOracle.setPrice(await token.getAddress(), ethers.parseEther("2000"));

    await token.mint(user1.address, ethers.parseEther("200"));
    await token.mint(user2.address, ethers.parseEther("200"));

    await token.connect(user1).approve(await lendFlow.getAddress(), ethers.parseEther("1000"));
    await token.connect(user2).approve(await lendFlow.getAddress(), ethers.parseEther("1000"));
  });

  describe("Core flows", function () {
    it("allows users to deposit tokens", async function () {
      const depositAmount = ethers.parseEther("10");

      await expect(lendFlow.connect(user1).deposit(await token.getAddress(), depositAmount))
        .to.emit(lendFlow, "Deposited")
        .withArgs(user1.address, await token.getAddress(), depositAmount, anyValue);

      const userPos = await lendFlow.getUserPosition(user1.address, await token.getAddress());
      expect(userPos.depositedAmount).to.equal(depositAmount);
    });

    it("mints reward tokens on deposit", async function () {
      await lendFlow.connect(user1).deposit(await token.getAddress(), ethers.parseEther("10"));
      expect(await rewardToken.balanceOf(user1.address)).to.be.gt(0);
    });

    it("allows borrowing within collateral limits", async function () {
      await lendFlow.connect(user1).deposit(await token.getAddress(), ethers.parseEther("10"));

      const borrowAmount = ethers.parseEther("5");
      await expect(lendFlow.connect(user1).borrow(await token.getAddress(), borrowAmount))
        .to.emit(lendFlow, "Borrowed");

      const userPos = await lendFlow.getUserPosition(user1.address, await token.getAddress());
      expect(userPos.borrowedAmount).to.equal(ethers.parseEther("10000"));
    });

    it("rejects borrowing above collateral limit", async function () {
      await lendFlow.connect(user1).deposit(await token.getAddress(), ethers.parseEther("1"));

      await expect(
        lendFlow.connect(user1).borrow(await token.getAddress(), ethers.parseEther("0.8"))
      ).to.be.revertedWith("Exceeds borrow limit");
    });

    it("allows repaying active borrows", async function () {
      await lendFlow.connect(user1).deposit(await token.getAddress(), ethers.parseEther("10"));
      await lendFlow.connect(user1).borrow(await token.getAddress(), ethers.parseEther("2"));

      await expect(
        lendFlow.connect(user1).repay(await token.getAddress(), ethers.parseEther("2"))
      ).to.emit(lendFlow, "Repaid");

      const userPos = await lendFlow.getUserPosition(user1.address, await token.getAddress());
      expect(userPos.borrowedAmount).to.equal(0);
    });
  });

  describe("Pause and withdraw guardrails", function () {
    it("only owner can pause/unpause protocol", async function () {
      await expect(lendFlow.connect(user1).pause())
        .to.be.revertedWithCustomError(lendFlow, "OwnableUnauthorizedAccount")
        .withArgs(user1.address);

      await lendFlow.pause();
      expect(await lendFlow.paused()).to.equal(true);

      await expect(lendFlow.connect(user1).unpause())
        .to.be.revertedWithCustomError(lendFlow, "OwnableUnauthorizedAccount")
        .withArgs(user1.address);

      await lendFlow.unpause();
      expect(await lendFlow.paused()).to.equal(false);
    });

    it("blocks deposits and withdrawals while paused", async function () {
      const depositAmount = ethers.parseEther("10");
      await lendFlow.connect(user1).deposit(await token.getAddress(), depositAmount);

      await lendFlow.pause();

      await expect(
        lendFlow.connect(user1).deposit(await token.getAddress(), ethers.parseEther("1"))
      ).to.be.revertedWith("Pausable: paused");

      await expect(
        lendFlow.connect(user1).withdraw(await token.getAddress(), ethers.parseEther("1"))
      ).to.be.revertedWith("Pausable: paused");
    });

    it("rejects withdraw above user deposit", async function () {
      await lendFlow.connect(user1).deposit(await token.getAddress(), ethers.parseEther("2"));

      await expect(
        lendFlow.connect(user1).withdraw(await token.getAddress(), ethers.parseEther("3"))
      ).to.be.revertedWith("Insufficient balance");
    });

    it("rejects withdraw that would break health factor", async function () {
      await lendFlow.connect(user1).deposit(await token.getAddress(), ethers.parseEther("10"));
      await lendFlow.connect(user1).borrow(await token.getAddress(), ethers.parseEther("5"));

      await expect(
        lendFlow.connect(user1).withdraw(await token.getAddress(), ethers.parseEther("6"))
      ).to.be.revertedWith("Health factor too low");
    });
  });

  describe("Liquidation behavior", function () {
    it("reverts when trying to liquidate a healthy position", async function () {
      await lendFlow.connect(user1).deposit(await token.getAddress(), ethers.parseEther("10"));
      await lendFlow.connect(user1).borrow(await token.getAddress(), ethers.parseEther("2"));

      await expect(
        lendFlow.connect(user2).liquidate(user1.address, await token.getAddress())
      ).to.be.revertedWith("Position not liquidatable");
    });
  });
});


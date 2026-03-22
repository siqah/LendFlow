const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("LendFlow Protocol", function () {
  let LendFlow, lendFlow, PriceOracle, priceOracle, token, LendFlowToken, rewardToken;
  let owner, user1, user2;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    // Deploy Price Oracle
    PriceOracle = await ethers.getContractFactory("PriceOracle");
    priceOracle = await PriceOracle.deploy();
    await priceOracle.waitForDeployment();

    // Deploy LendFlow
    LendFlow = await ethers.getContractFactory("LendFlow");
    lendFlow = await LendFlow.deploy(await priceOracle.getAddress());
    await lendFlow.waitForDeployment();

    // Get Reward Token
    const rewardTokenAddress = await lendFlow.rewardToken();
    rewardToken = await ethers.getContractAt("LendFlowToken", rewardTokenAddress);

    // Deploy a mock test token - using LendFlowToken as simple ERC20
    // But we need a separate contract for the actual asset
    const MockToken = await ethers.getContractFactory("LendFlowToken");
    token = await MockToken.deploy(owner.address);
    await token.waitForDeployment();

    // Add market for the mock token
    await lendFlow.addMarket(await token.getAddress(), 7500, 8000); // 75% CF, 80% LT
    
    // Set price for mock token
    await priceOracle.setPrice(await token.getAddress(), ethers.parseEther("2000")); // $2000
    
    // Mint tokens to users (MockToken owner is 'owner', so only 'owner' can mint)
    await token.connect(owner).mint(user1.address, ethers.parseEther("100"));
    await token.connect(owner).mint(user2.address, ethers.parseEther("100"));
    
    // Approve LendFlow
    await token.connect(user1).approve(await lendFlow.getAddress(), ethers.parseEther("1000"));
    await token.connect(user2).approve(await lendFlow.getAddress(), ethers.parseEther("1000"));
  });

  describe("Deposits", function () {
    it("Should allow users to deposit tokens", async function () {
      const depositAmount = ethers.parseEther("10");
      await expect(lendFlow.connect(user1).deposit(await token.getAddress(), depositAmount))
        .to.emit(lendFlow, "Deposited")
        .withArgs(user1.address, await token.getAddress(), depositAmount, anyValue);

      const userPos = await lendFlow.getUserPosition(user1.address, await token.getAddress());
      expect(userPos.depositedAmount).to.equal(depositAmount);
    });

    it("Should mint reward tokens on deposit", async function () {
      const depositAmount = ethers.parseEther("10");
      await lendFlow.connect(user1).deposit(await token.getAddress(), depositAmount);
      
      const rewardBalance = await rewardToken.balanceOf(user1.address);
      expect(rewardBalance).to.be.gt(0);
    });
  });

  describe("Borrowing", function () {
    it("Should allow users to borrow against collateral", async function () {
      // User1 deposits 10 tokens ($20,000)
      const depositAmount = ethers.parseEther("10");
      await lendFlow.connect(user1).deposit(await token.getAddress(), depositAmount);

      // User1 borrows 5 tokens ($10,000)
      // Max borrow = 20,000 * 0.75 = $15,000
      const borrowAmount = ethers.parseEther("5");
      await expect(lendFlow.connect(user1).borrow(await token.getAddress(), borrowAmount))
        .to.emit(lendFlow, "Borrowed");

      const userPos = await lendFlow.getUserPosition(user1.address, await token.getAddress());
      // user.borrowedAmount stores the USD value (10,000 * 1e18)
      expect(userPos.borrowedAmount).to.equal(ethers.parseEther("10000"));
    });

    it("Should fail if borrow exceeds limit", async function () {
      const depositAmount = ethers.parseEther("1"); // $2000
      await lendFlow.connect(user1).deposit(await token.getAddress(), depositAmount);

      // Max borrow = 2000 * 0.75 = $1500 (0.75 tokens)
      const borrowAmount = ethers.parseEther("0.8"); // $1600
      await expect(lendFlow.connect(user1).borrow(await token.getAddress(), borrowAmount))
        .to.be.revertedWith("Exceeds borrow limit");
    });
  });

  describe("Repayment", function () {
    it("Should allow users to repay loans", async function () {
      const depositAmount = ethers.parseEther("10");
      await lendFlow.connect(user1).deposit(await token.getAddress(), depositAmount);
      
      const borrowAmount = ethers.parseEther("2");
      await lendFlow.connect(user1).borrow(await token.getAddress(), borrowAmount);

      await expect(lendFlow.connect(user1).repay(await token.getAddress(), borrowAmount))
        .to.emit(lendFlow, "Repaid");

      const userPos = await lendFlow.getUserPosition(user1.address, await token.getAddress());
      expect(userPos.borrowedAmount).to.equal(0);
    });
  });
});


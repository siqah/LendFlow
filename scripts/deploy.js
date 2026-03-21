const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying LendFlow Protocol...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", (await hre.ethers.provider.getBalance(deployer.address)).toString());
  console.log("");

  // ---- Deploy Price Oracle ----
  const PriceOracle = await hre.ethers.getContractFactory("PriceOracle");
  const priceOracle = await PriceOracle.deploy();
  await priceOracle.waitForDeployment();
  const oracleAddress = await priceOracle.getAddress();
  console.log("✅ PriceOracle deployed to:", oracleAddress);

  // ---- Deploy LendFlow Protocol ----
  const LendFlow = await hre.ethers.getContractFactory("LendFlow");
  const lendFlow = await LendFlow.deploy(oracleAddress);
  await lendFlow.waitForDeployment();
  const protocolAddress = await lendFlow.getAddress();
  console.log("✅ LendFlow Protocol deployed to:", protocolAddress);

  // ---- Get Reward Token Address ----
  const rewardTokenAddress = await lendFlow.rewardToken();
  console.log("✅ LFT Reward Token at:", rewardTokenAddress);

  // ---- Add Markets ----
  const ETH_ADDRESS = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
  const USDC_ADDRESS = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
  const DAI_ADDRESS = "0x6B175474E89094C44Da98b954EedeAC495271d0F";

  // Collateral factors: 75% for ETH, 80% for stablecoins
  await lendFlow.addMarket(ETH_ADDRESS, 7500, 8000);
  console.log("   Added ETH market (CF: 75%, LT: 80%)");

  await lendFlow.addMarket(USDC_ADDRESS, 8000, 8500);
  console.log("   Added USDC market (CF: 80%, LT: 85%)");

  await lendFlow.addMarket(DAI_ADDRESS, 8000, 8500);
  console.log("   Added DAI market (CF: 80%, LT: 85%)");

  // ---- Set Initial Prices ----
  await priceOracle.setPrice(ETH_ADDRESS, hre.ethers.parseEther("2000"));
  await priceOracle.setPrice(USDC_ADDRESS, hre.ethers.parseEther("1"));
  await priceOracle.setPrice(DAI_ADDRESS, hre.ethers.parseEther("1"));
  console.log("   Set initial token prices");

  // ---- Summary ----
  console.log("\n================================");
  console.log("🎉 Deployment Complete!");
  console.log("================================");
  console.log("Protocol Address:", protocolAddress);
  console.log("Oracle Address: ", oracleAddress);
  console.log("Reward Token:   ", rewardTokenAddress);
  console.log("================================\n");

  // Save deployment addresses
  const fs = require("fs");
  const deploymentInfo = {
    network: hre.network.name,
    timestamp: new Date().toISOString(),
    contracts: {
      LendFlow: protocolAddress,
      PriceOracle: oracleAddress,
      LendFlowToken: rewardTokenAddress,
    },
    markets: {
      ETH: ETH_ADDRESS,
      USDC: USDC_ADDRESS,
      DAI: DAI_ADDRESS,
    },
  };

  fs.writeFileSync(
    "deployment.json",
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log("📄 Deployment info saved to deployment.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });

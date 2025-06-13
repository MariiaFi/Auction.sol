const hre = require("hardhat");

async function main() {
  // Set auction duration in seconds (e.g., 5 minutes)
  const AUCTION_DURATION = 5 * 60; // 5 minutes

  // Compile and get the Auction contract
  const Auction = await hre.ethers.getContractFactory("Auction");

  // Deploy the contract with the specified duration
  const auction = await Auction.deploy(AUCTION_DURATION);
  await auction.deployed();

  console.log(`Auction deployed to: ${auction.address}`);
}

main().catch((error) => {
  console.error("Deployment failed:", error);
  process.exitCode = 1;
});

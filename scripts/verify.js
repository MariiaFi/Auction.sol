const hre = require("hardhat");

async function main() {
  const contractAddress = "YOUR_DEPLOYED_CONTRACT_ADDRESS";
  const constructorArgs = [300]; 
  
  await hre.run("verify:verify", {
    address: contractAddress,
    constructorArguments: constructorArgs,
  });

  console.log("Contract verified on Etherscan.");
}

main().catch((error) => {
  console.error("Verification failed:", error);
  process.exitCode = 1;
});

import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Deploying SupplyChain contract...");

  // Get the deployer's address
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  // Get the contract factory
  const SupplyChain = await ethers.getContractFactory("SupplyChain");
  
  // Deploy the contract
  const supplyChain = await SupplyChain.deploy();
  
  await supplyChain.waitForDeployment();
  
  const contractAddress = await supplyChain.getAddress();
  console.log("✅ SupplyChain contract deployed to:", contractAddress);
  
  console.log("\n📋 Deployment Summary:");
  console.log("Contract Address:", contractAddress);
  console.log("Network:", (await ethers.provider.getNetwork()).name);
  console.log("Deployer:", deployer.address);
  
  // Save deployment info
  const fs = require("fs");
  const path = require("path");
  
  const deploymentInfo = {
    contractAddress,
    deployer: deployer.address,
    network: (await ethers.provider.getNetwork()).name,
    timestamp: new Date().toISOString(),
  };
  
  const deploymentPath = path.join(__dirname, "../deployment-info.json");
  fs.writeFileSync(
    deploymentPath,
    JSON.stringify(deploymentInfo, null, 2)
  );
  
  console.log(`\n💾 Deployment info saved to ${deploymentPath}`);
}

// Handle errors
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

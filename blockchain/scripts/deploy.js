const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Deploying Traceability contract...");

  const Traceability = await hre.ethers.getContractFactory("Traceability");
  const traceability = await Traceability.deploy();

  await traceability.waitForDeployment();
  const address = await traceability.getAddress();

  console.log(`Traceability deployed to: ${address}`);

  // Save the address to a local file so the backend can easily pick it up
  const addressFile = path.join(__dirname, "..", "contract-address.json");
  const tempFile = addressFile + ".tmp";
  fs.writeFileSync(tempFile, JSON.stringify({ Traceability: address }, null, 2));
  fs.renameSync(tempFile, addressFile);
  console.log(`Address saved to ${addressFile}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

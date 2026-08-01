require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config({ path: "../.env" });

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.24",
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545"
    },
    amoy: {
      url: process.env.POLYGON_RPC_URL || "https://polygon-amoy-bor-rpc.publicnode.com",
      accounts: process.env.CONTRACT_OWNER_PRIVATE_KEY ? [process.env.CONTRACT_OWNER_PRIVATE_KEY] : []
    }
  }
};

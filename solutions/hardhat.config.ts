import { HardhatUserConfig, task } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import { config as confenv } from "dotenv";
import { HardhatRuntimeEnvironment } from "hardhat/types";

confenv();

const { PRIVATE_KEY, URL } = process.env;
const setupAccounts = () => {
  if (!PRIVATE_KEY) {
    console.error("Missing mnemonic from environment variable...");
    process.exit();
  }

  return PRIVATE_KEY;
}

const accounts = [setupAccounts()];

if (accounts.length === 0) {
  console.error("Account could not be found. Make sure the MNEMONIC is set in .env");
  process.exit();
}

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      { version: "0.8.7" },
      { version: "0.8.10" },
      { version: "0.8.13" },
      { version: "0.6.10" },
    ],
  },
  networks: {
    montrehack: {
      chainId: 77777,
      accounts,
      url: URL || "http://localhost:8545"
    }
  },
  mocha: {
    timeout: 100000000
  },
};

task("storage", "Get a challenge's storage", async (taskArgs: any, hre: HardhatRuntimeEnvironment) => {
  for (let i = 0; true; i++) {
    const storage = await hre.ethers.provider.getStorageAt(taskArgs.address, i);
    console.log(storage);
  };
}).addParam("address", "Contract's address")


export default config;

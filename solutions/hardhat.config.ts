import { HardhatUserConfig, task } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import { config as confenv } from "dotenv";
import { HardhatRuntimeEnvironment } from "hardhat/types";

confenv();

const { PRIVATE_KEY, ROPSTEN_URL, URL } = process.env;
const setupAccounts = () => {
  if (!PRIVATE_KEY) {
    console.error("Missing private key in env variable...");
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
      { version: "0.8.0" },
      { version: "0.8.7" },
      { version: "0.8.10" },
      { version: "0.8.13" },
      { version: "0.8.15" },
      { version: "0.6.10" },
    ],
  },
  networks: {
    montrehack: {
      chainId: 77777,
      accounts,
      url: URL || "http://localhost:7777"
    },
    ropsten : {
      url: ROPSTEN_URL,
      accounts,
      chainId: 3
    }
  },
  mocha: {
    timeout: 1000000000
  },
};

task("storage", "Get a challenge's storage", async (taskArgs: any, hre: HardhatRuntimeEnvironment) => {
  for (let i = 0; true; i++) {
    const storage = await hre.ethers.provider.getStorageAt(taskArgs.address, i);
    console.log(storage);
  };
}).addParam("address", "Contract's address")


export default config;

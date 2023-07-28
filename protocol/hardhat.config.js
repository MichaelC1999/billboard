require("hardhat-deploy");
require("@nomiclabs/hardhat-ethers");
require("@typechain/hardhat");
require('@openzeppelin/hardhat-upgrades');
require('dotenv').config({ path: __dirname + '/.env' });

module.exports = {
  defaultNetwork: "sepolia",
  solidity: {
    version: "0.8.9",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 1337,
      allowUnlimitedContractSize: true
    },
    localhost: {
      chainId: 31337,
      allowUnlimitedContractSize: true
    },
    goerli: {
      url: "https://goerli.infura.io/v3/" + process.env.INFURA_API_KEY,
      chainId: 5,
      accounts: [process.env.WALLET_PK]
    },
    sepolia: {
      url: "https://sepolia.infura.io/v3/" + process.env.INFURA_API_KEY,
      chainId: 11155111,
      accounts: [process.env.WALLET_PK]
    },
    arbitrumGoerli: {
      url: "https://goerli-rollup.arbitrum.io/rpc",
      chainId: 421613,
      accounts: [process.env.WALLET_PK]
    },
    lineaGoerli: {
      url: "https://rpc.goerli.linea.build",
      chainId: 59140,
      accounts: [process.env.WALLET_PK]
    }
  },
  namedAccounts: {
    deployer: {
      default: 0
    }
  }
};

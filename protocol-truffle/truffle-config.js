require("dotenv").config();
const HDWalletProvider = require("@truffle/hdwallet-provider");
const { INFURA_API_KEY, WALLET_PK } = process.env;

module.exports = {
  compilers: {
    solc: {
      version: '0.8.9',
      parser: 'solcjs',
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*",
    },
    sepolia: {
      provider: () => new HDWalletProvider({ privateKeys: [WALLET_PK], providerOrUrl: "https://sepolia.infura.io/v3/" + INFURA_API_KEY }),
      network_id: "11155111",
      gas: (30000000 - 1),
    },
    lineaGoerli: {
      provider: () => new HDWalletProvider({ privateKeys: [WALLET_PK], providerOrUrl: "https://linea-goerli.infura.io/v3/" + INFURA_API_KEY }),
      network_id: "59140",
      gas: 30000000
    }
  },
};
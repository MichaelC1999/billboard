import { w3mConnectors, w3mProvider } from '@web3modal/ethereum'
import { configureChains, createConfig } from 'wagmi'
import { arbitrumGoerli, goerli, hardhat, lineaTestnet, localhost, mainnet, sepolia } from 'wagmi/chains'
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc'


const infuraKey: string = process.env.INFURA_API_KEY || ""

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [mainnet, goerli, sepolia, localhost, hardhat, arbitrumGoerli, lineaTestnet],
  [jsonRpcProvider({
    rpc: () => ({
      http: `https://linea-goerli.infura.io/v3/${infuraKey}`,
    }),
  })],
)

export const config = createConfig({
  autoConnect: true,
  connectors: w3mConnectors({
    chains,
    projectId: process.env.walletConnectProjectId || "",
    version: 2,
  }),
  publicClient,
  webSocketPublicClient,
})

export { chains }

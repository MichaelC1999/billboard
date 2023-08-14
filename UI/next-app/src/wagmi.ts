import { w3mConnectors, w3mProvider } from '@web3modal/ethereum'
import { configureChains, createConfig } from 'wagmi'
import { arbitrumGoerli, goerli, hardhat, lineaTestnet, localhost, mainnet, sepolia } from 'wagmi/chains'

export const walletConnectProjectId = 'aaf7b9205e5a03a94452c354a29aa86e'

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [mainnet, goerli, sepolia, localhost, hardhat, arbitrumGoerli, lineaTestnet],
  [w3mProvider({ projectId: walletConnectProjectId })],
)

export const config = createConfig({
  autoConnect: true,
  connectors: w3mConnectors({
    chains,
    projectId: walletConnectProjectId,
    version: 2,
  }),
  publicClient,
  webSocketPublicClient,
})

export { chains }

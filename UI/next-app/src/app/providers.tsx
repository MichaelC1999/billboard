'use client'

import { EthereumClient } from '@web3modal/ethereum'
import { Web3Modal } from '@web3modal/react'
import * as React from 'react'
import { WagmiConfig } from 'wagmi'

import { chains, config } from '../wagmi'
import { connectSnap, getSnap } from '../utils'
import { defaultSnapOrigin } from '../config'
import { NetworkSwitcher } from '../components/NetworkSwitcher'

const ethereumClient = new EthereumClient(config, chains)

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])
  React.useEffect(() => {
    window.ethereum.on('chainChanged', (chainId) => {
      if (chainId == "0xe704") {
        return window.location.reload()
      }
    });
  }, [])

  return (
    <WagmiConfig config={config}>
      {mounted && children}
      <Web3Modal
        projectId={process.env.walletConnectProjectId || ""}
        ethereumClient={ethereumClient}
      />
    </WagmiConfig>
  )
}

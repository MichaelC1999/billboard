'use client'

import { EthereumClient } from '@web3modal/ethereum'
import { Web3Modal } from '@web3modal/react'
import * as React from 'react'
import { WagmiConfig } from 'wagmi'

import { chains, config, walletConnectProjectId } from '../wagmi'
import { connectSnap, getSnap } from '../utils'
import { defaultSnapOrigin } from '../config'

const ethereumClient = new EthereumClient(config, chains)

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])
  React.useEffect(() => {
    const provider: any = window;
    const providerEth = provider.ethereum;
    isFlask(providerEth)
    window.ethereum.on('chainChanged', (chainId) => window.location.reload());
  }, [])

  const installBillboardSnap = async () => {
    await connectSnap(defaultSnapOrigin, "", {});
  }

  const isFlask = async (providerEth: any) => {
    try {
      const clientVersion = await providerEth?.request({
        method: 'web3_clientVersion',
      });
      const isFlaskDetected = (clientVersion as string[])?.includes('flask');

      const installedSnap = await getSnap();
      console.log(isFlaskDetected, providerEth, installedSnap)
      if (installedSnap?.id !== defaultSnapOrigin) {
        installBillboardSnap()
      }
      return Boolean(providerEth && isFlaskDetected);
    } catch {
      return false;
    }
  };


  return (
    <WagmiConfig config={config}>
      {mounted && children}
      <Web3Modal
        projectId={walletConnectProjectId}
        ethereumClient={ethereumClient}
      />
    </WagmiConfig>
  )
}

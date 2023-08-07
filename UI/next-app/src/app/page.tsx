'use client'

import { useContext, useEffect } from 'react'
import { Connected } from '../components/Connected'
import { NetworkSwitcher } from '../components/NetworkSwitcher'
import { ReadContract } from '../components/ReadContract'
import { Web3Button } from '../components/Web3Button'
import { WriteContract } from '../components/WriteContract'
import { connectSnap, getSnap } from '../utils'
import { MetaMaskContext } from '../hooks'
import { defaultSnapOrigin } from '../config'
import { SignMessage } from '../components/SignMessage'

export function Page() {
  const [state, dispatch] = useContext(MetaMaskContext);

  useEffect(() => {
    const provider: any = window;
    const providerEth = provider.ethereum;
    isFlask(providerEth)

  }, [])

  const isFlask = async (providerEth: any) => {
    try {
      const clientVersion = await providerEth?.request({
        method: 'web3_clientVersion',
      });
      const isFlaskDetected = (clientVersion as string[])?.includes('flask');

      await connectSnap(defaultSnapOrigin, "TEST", {});
      const installedSnap = await getSnap();
      console.log(isFlaskDetected, providerEth, installedSnap)
      return Boolean(providerEth && isFlaskDetected);
    } catch {
      return false;
    }
  };

  return (
    <>
      <h1>wagmi + Web3Modal + Next.js</h1>
      <Web3Button />

      <Connected>
        <hr />
        <h2>Network</h2>
        <NetworkSwitcher />
        <br />
        <hr />
        <h2>Read Contract</h2>
        <ReadContract />
        <br />
        <hr />
        <h2>Write Contract</h2>
        <WriteContract />
        <SignMessage />
      </Connected>
    </>
  )
}

export default Page

'use client'

import { useContext, useEffect } from 'react'
import { Connected } from '../components/Connected'
import { connectSnap, getSnap } from '../utils'
import { MetaMaskContext } from '../hooks'
import { defaultSnapOrigin } from '../config'

const HomePage = () => {

  useEffect(() => {
    const provider: any = window;
    const providerEth = provider.ethereum;
    isFlask(providerEth)
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
    <h2>Home</h2>
  )
}

export default HomePage

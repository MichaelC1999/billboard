'use client'

import { useEffect, useState } from 'react'
import { recoverTypedDataAddress, zeroAddress } from 'viem'
import { type Address, useSignTypedData } from 'wagmi'


export function SignTypedData({ }: any) {
  const domain = {
    name: 'Integrator',
    version: '1',
    chainId: Number(process.env.CHAIN_ID || 1),
    verifyingContract: "0xf58695E7c102F49b4B9A036Cd7a3E07f23d9E1D7" //"0x2EBAd578983CE1217C79a73CF4B6f428ef6550B1",
  } as const

  const message = {
    currentCampaignAddress: zeroAddress,
  };

  const types = {
    //maybe type address?
    EIP712Domain: [
      { name: "name", type: "string" },
      { name: "version", type: "string" },
      { name: "chainId", type: "uint256" },
      { name: "verifyingContract", type: "address" },
    ],
    Campaign: [
      { name: 'currentCampaignAddress', type: 'address' },
    ],
  } as const


  const { data, error, isLoading, signTypedData } = useSignTypedData({
    domain,
    types,
    message,
    primaryType: 'Campaign',
  })

  const [recoveredAddress, setRecoveredAddress] = useState<Address>()
  useEffect(() => {
    if (!data) return
      ; (async () => {
        setRecoveredAddress(
          await recoverTypedDataAddress({
            domain,
            types,
            message,
            primaryType: 'Campaign',
            signature: data,
          }),
        )
      })()
  }, [data])

  return (
    <>
      <button disabled={isLoading} onClick={() => signTypedData()}>
        {isLoading ? 'Check Wallet' : 'Sign Message'}
      </button>

      {data && (
        <div>
          <div>Signature: {data}</div>
          <div>Recovered address {recoveredAddress}</div>
        </div>
      )}
      {error && <div>Error: {error?.message}</div>}
    </>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { Address, useAccount, useContractRead, useContractReads, useContractWrite, useSignTypedData, useWaitForTransaction } from 'wagmi'
import ERC20ABI from "../ABIs/ERC20.json";


export function TokenApprove({ tokenAddress, balance, addressToApprove, approvalLoadingSetter, approveSuccessSetter }: any) {
    const { address: userAddress }: any = useAccount()
    const [signSuccess, signSuccessSetter] = useState<any>(null)

    const { write: approve, data: txapprove, isLoading } = useContractWrite({
        abi: ERC20ABI,
        address: tokenAddress,
        functionName: 'approve',
        chainId: Number(process.env.CHAIN_ID || 1)
    })

    const {
        isSuccess: isSuccessApprove,
    } = useWaitForTransaction({ hash: txapprove?.hash })

    useEffect(() => {
        approve({ args: [addressToApprove, balance] })
    }, [])

    useEffect(() => {
        if (isLoading === true) {
            approvalLoadingSetter()
        }
    }, [isLoading])

    useEffect(() => {
        if (isSuccessApprove == true) {
            approveSuccessSetter(true)
        }
    }, [isSuccessApprove])

    return null
}
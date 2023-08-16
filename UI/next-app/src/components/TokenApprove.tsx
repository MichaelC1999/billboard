'use client'

import { useEffect, useState } from 'react'
import ERC20ABI from "../ABIs/ERC20.json";
import { decodeEventLog, encodeFunctionData } from 'viem';


export function TokenApprove({ tokenAddress, balance, addressToApprove, approveSuccessSetter, errorSetter }: any) {

    useEffect(() => {
        handleApprove()
    }, [])

    const approve = async () => {
        const data = encodeFunctionData({
            abi: ERC20ABI,
            functionName: 'approve',
            args: [addressToApprove, balance]
        })
        const txHash = await window.ethereum.request({
            "method": "eth_sendTransaction",
            "params": [
                {
                    to: tokenAddress,
                    from: window.ethereum.selectedAddress,
                    data
                }
            ]
        });
        return txHash
    }

    async function waitForTransactionReceipt(ethereum: any, txHash: string) {
        return new Promise((resolve, reject) => {
            const interval = setInterval(async () => {
                try {
                    const receipt = await ethereum.request({
                        method: 'eth_getTransactionReceipt',
                        params: [txHash]
                    })

                    if (receipt && receipt.transactionHash) {
                        clearInterval(interval);
                        console.log(receipt)
                        resolve(receipt);
                    }
                } catch (error) {
                    clearInterval(interval);
                    reject(error);
                }
            }, 5000); // Poll every 5 seconds
        });
    }

    const handleApprove = async () => {
        try {
            const hash: any = await approve()
            const res: any = await waitForTransactionReceipt(window.ethereum, hash)
            if (res) {
                const topics = decodeEventLog({
                    abi: ERC20ABI,
                    data: res.logs[0].data,
                    topics: res.logs[0].topics
                })
                const args: any = topics.args
                console.log(args)
            }
            approveSuccessSetter(true)

        } catch (err: any) {
            errorSetter(err?.message)
        }
    }

    return null
}
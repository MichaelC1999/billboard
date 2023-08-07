'use client'

import React, { useEffect } from 'react';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import { concat, hashMessage, decodeFunctionResult, decodeFunctionData, encodeFunctionData, keccak256, toBytes, toHex, decodeEventLog } from 'viem';

import { useContractWrite, useSignMessage, useWaitForTransaction } from 'wagmi';
import IntegratorABI from "../../ABIs/Integrator.json"
import ExampleIntegratorABI from "../../ABIs/ExampleIntegrator.json"


const MintNFT = () => {
    const integratorAddress = "0xDBE32bF4881A35714D05dcbCef97184B58531A26"
    const currentAccount = window.ethereum.selectedAddress;

    const { write, data, isSuccess } = useContractWrite({
        abi: IntegratorABI,
        address: integratorAddress,
        functionName: 'interactionTriggered',
        chainId: 11155111
    })

    const {
        data: signature,
        variables,
        error,
        isLoading,
        signMessage,
    } = useSignMessage()

    const readCurrentAdCampaign = async () => {
        try {

            const dataHex = keccak256(toHex('displayCurrentAd()')).slice(0, 10)

            const dataToDecode: any = await window.ethereum.request({
                method: "eth_call",
                params: [{
                    from: currentAccount,
                    to: integratorAddress,
                    data: dataHex,
                    accessList: []
                }, null]
            })
            if (dataToDecode?.length > 0) {
                const decode = dataToDecode.split("000000000000000000000000").join("")
                let decodedAddr = ""
                dataToDecode.split("").forEach((x: any, idx: any) => {
                    if (idx < 2 || idx >= 26) {
                        decodedAddr += x;
                    }
                })
                return decodedAddr
            }
        } catch (err) {
            console.log(err)
        }
    }

    const makeSignature = async () => {
        // Read the current ad for user
        // getSigMessage(bytes32 r, bytes32 s, uint8 v, bytes memory sig)
        const currentAdForUser = await readCurrentAdCampaign()
        const data = (integratorAddress + currentAdForUser)
        console.log(currentAccount, currentAdForUser, 'ACCT')
        await signMessage({ message: data })
        // Prompt user to make a signature over the data
        // Call interactionTriggered() on the integrator for the mintNft function
    };

    useEffect(() => {
        if (signature) {
            console.log('SIGNATURE:', signature)
            const functionSignature = keccak256(toHex("mintNFT(address)")).slice(0, 10)
            write({
                from: currentAccount,
                args: [
                    signature, functionSignature, "0x000000000000000000000000" + currentAccount?.slice(2, 42)
                ]
            })
        }
    }, [signature])

    const { data: receiptTx, isLoading: isPendingTx, isSuccess: isSuccessTx } = useWaitForTransaction({ hash: data?.hash })


    useEffect(() => {
        if (receiptTx) {
            const topics = decodeEventLog({
                abi: ExampleIntegratorABI,
                data: receiptTx.logs[0].data,
                topics: receiptTx.logs[0].topics
            })
            console.log(topics.args, "TOPICS DECODED")

        }
    }, [isSuccessTx])

    return (
        <Box textAlign="center" m={2}>
            <Typography variant="h2" gutterBottom>
                MintNft Protocol
            </Typography>
            <Typography variant="body1" gutterBottom>
                This is an example integrator protocol that is using Billboard as a revenue source. It mints a simple NFT that is free to the end user (aside from gas). The protocol fees are generated from ad revenue earned from displaying Billboard campaigns in metamask as a snap before transactions.
            </Typography>
            <Button variant="contained" color="primary" onClick={makeSignature}>
                Mint me an NFT
            </Button>
        </Box>
    );
};

export default MintNFT;
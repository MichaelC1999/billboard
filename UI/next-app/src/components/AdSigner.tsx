'use client'

import { Button, makeStyles } from '@material-ui/core'
import { defaultSnapOrigin } from '../config';
import { keccak256, toHex } from 'viem';
import { useNetwork, useSignMessage } from 'wagmi';
import { useEffect } from 'react';

const useStyles = makeStyles((theme) => ({
    button: {
        marginTop: theme.spacing(2),
        marginBottom: theme.spacing(2),
        minWidth: '256px', // Button takes full width
    },
}));

export function AdSigner({ integratorAddress, passSignature, buttonLabel }: any) {
    const currentAddress = window.ethereum.selectedAddress;
    const classes = useStyles();
    const { chain } = useNetwork()

    const {
        data: signature,
        signMessage,
    } = useSignMessage()

    const executionFlow = async () => {
        const adData: any = await window.ethereum.request({
            method: 'wallet_invokeSnap',
            params: { snapId: defaultSnapOrigin, request: { method: `signAd-${currentAddress}-${integratorAddress}` } },
        });

        if (adData === null) {
            return
        }
        const data: string = keccak256(toHex(adData || "0x0"))
        await signMessage({ message: data })
    }

    useEffect(() => {
        if (signature) {
            passSignature(signature)
        }
    }, [signature])

    return (
        <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
            <Button variant="contained" color="primary" disabled={chain?.id !== process.env.CHAIN_ID} onClick={executionFlow} className={classes.button}>
                {buttonLabel}
            </Button>
        </div>
    )
}
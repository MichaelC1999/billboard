'use client'

import { Button, makeStyles } from '@material-ui/core'
import { defaultSnapOrigin } from '../config';
import { keccak256, toHex } from 'viem';
import { useNetwork, useSignMessage } from 'wagmi';
import { useEffect, useState } from 'react';
import ErrorPopup from './ErrorPopup';
import { connectSnap } from '../utils';

const useStyles = makeStyles((theme) => ({
    button: {
        marginTop: theme.spacing(2),
        marginBottom: theme.spacing(2),
        minWidth: '256px', // Button takes full width
    },
}));

export function AdSigner({ integratorAddress, passSignature, buttonLabel, disabled }: any) {
    const currentAddress = window.ethereum.selectedAddress;
    const classes = useStyles();
    const [errorMessage, setErrorMessage] = useState<string>("")

    const signMessage = async (message: string) => {
        const sig = await window.ethereum.request({
            "method": "personal_sign",
            "params": [message, currentAddress]
        });
        return sig
    }

    const executionFlow = async () => {
        try {
            if (disabled) {
                await connectSnap(defaultSnapOrigin, "", {});
            }
            const adData: any = await window.ethereum.request({
                method: 'wallet_invokeSnap',
                params: { snapId: defaultSnapOrigin, request: { method: `signAd-${currentAddress}-${integratorAddress}` } },
            });

            if (adData === null) {
                return
            }
            const data: string = keccak256(toHex(adData || "0x0"))
            const signature = await signMessage(data)

            passSignature(signature)
        } catch (err: any) {
            setErrorMessage(err?.message)
        }
    }

    return (
        <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
            <ErrorPopup errorMessage={errorMessage} errorMessageCallback={() => setErrorMessage("")} />
            <Button variant="contained" color="primary" disabled={window.ethereum.networkVersion + "" !== process.env.NEXT_PUBLIC_CHAIN_ID + ""} onClick={executionFlow} className={classes.button}>
                {buttonLabel}
            </Button>
        </div>
    )
}
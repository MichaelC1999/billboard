'use client'

import React, { useEffect, useState } from 'react';
import Typography from '@material-ui/core/Typography';
import { keccak256, toBytes, toHex, encodeFunctionData } from 'viem';

import IntegratorABI from "../../ABIs/Integrator.json"
import { Container, Grid, ThemeProvider, makeStyles } from '@material-ui/core';
import { darkTheme } from '../../config/theme';
import { AdSigner } from '../../components/AdSigner';
import InstallSnap from '../../components/InstallSnap';
import Header from '../../components/Header';
import { NetworkSwitcher } from '../../components/NetworkSwitcher';
import ErrorPopup from '../../components/ErrorPopup';
import { getSnap } from '../../utils';
import { defaultSnapOrigin } from '../../config';

const useStyles = makeStyles((theme) => ({
    container: {
        marginTop: theme.spacing(3),
    },
}));

const MintNFT = () => {
    const currentAccount = window.ethereum.selectedAddress;

    const classes = useStyles();
    const [signature, setSignature] = useState<string>("");
    const [errorMessage, setErrorMessage] = useState<string>("")
    const integratorAddress = "0xa8f50F114BAA9A97F1B80DdAE76C35fd933d624A";
    const [account, setAccount] = useState<string | null>(currentAccount)
    const [snapInstalled, setSnapInstalled] = useState<Boolean>(false)
    const [hash, setHash] = useState<any>(null)

    useEffect(() => {
        if (!window.ethereum.isConnected() || !currentAccount) {
            window?.ethereum?.enable()
        }
        window.ethereum.on('accountsChanged', (accounts: any) => setAccount(accounts[0]));
    }, [])

    useEffect(() => {
        if (signature) {
            handleSubmit()
        }
    }, [signature])

    useEffect(() => {
        isSnapInstalled()
    }, [])

    const mintToken = async () => {
        const functionSignature = keccak256(toHex("mintNFT(address)")).slice(0, 10)
        const data = encodeFunctionData({
            abi: IntegratorABI,
            functionName: 'routeInteraction',
            args: [
                signature, functionSignature, "0x000000000000000000000000" + currentAccount?.slice(2, 42)
            ]
        })
        const txHash = await window.ethereum.request({
            "method": "eth_sendTransaction",
            "params": [
                {
                    to: integratorAddress,
                    from: account,
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
            }, 5000);
        });
    }

    const handleSubmit = async () => {
        try {
            const hash: any = await mintToken()
            const res: any = await waitForTransactionReceipt(window.ethereum, hash)
            if (res) {
                setSignature("")
                setHash(hash)
            }
        } catch (err: any) {
            setErrorMessage(err?.message)
        }
    };

    const isSnapInstalled = async () => {
        try {
            const clientVersion = await window.ethereum?.request({
                method: 'web3_clientVersion',
            });

            const installedSnap = await getSnap();
            if (installedSnap?.id === defaultSnapOrigin) {
                setSnapInstalled(true)
            }
        } catch {
            return false;
        }
    };


    return (<>
        <Header />
        <ThemeProvider theme={darkTheme}>
            <NetworkSwitcher />
            <ErrorPopup errorMessage={errorMessage} errorMessageCallback={() => setErrorMessage("")} />
            <Container maxWidth="lg" className={classes.container}>
                <Grid container direction="column" alignItems="center">
                    <Grid item xs={12}>
                        <Typography color="textPrimary" variant="h2" gutterBottom align="center">
                            MintNFT Protocol
                        </Typography>
                    </Grid>
                    <Grid item xs={12}>
                        <Typography color="textPrimary" variant="body1" gutterBottom align="center">
                            MintNFT is an example of an external protocol that uses Billboard as a revenue source. It mints a simple NFT that is free to the end user (aside from gas). The protocol fees are offset by ad revenue earned from displaying Billboard campaigns in a Metamask snap before transactions.
                            All of the interactions with the MintNFT protocol are routed through an integrator contract before minting your NFT.
                        </Typography>
                    </Grid>
                    {hash ? (
                        <Grid style={{ marginTop: "16px" }} item xs={12}>
                            <Typography color="textPrimary"><b>NFT Successfully minted! Transaction Hash: {hash}</b></Typography>
                        </Grid>
                    ) : <Grid style={{ marginTop: "16px" }} item xs={12}>
                        <Typography>...</Typography>
                    </Grid>}
                    <Grid style={{ marginTop: "16px" }} item xs={12}>
                        <AdSigner integratorAddress={integratorAddress} passSignature={(x: string) => {
                            if (x === signature) {
                                handleSubmit()
                            } else {
                                setSignature(x)
                            }
                        }} buttonLabel="Mint me an NFT" disabled={!snapInstalled} />
                    </Grid>
                </Grid>
                <InstallSnap displayManualInstall={true} />
            </Container>
        </ThemeProvider>
    </>
    );
};

export default MintNFT;
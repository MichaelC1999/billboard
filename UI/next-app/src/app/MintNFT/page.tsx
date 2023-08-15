'use client'

import React, { useEffect, useState } from 'react';
import Typography from '@material-ui/core/Typography';
import { keccak256, toBytes, toHex, decodeEventLog, encodeFunctionData } from 'viem';

import { useContractWrite, useWaitForTransaction } from 'wagmi';
import IntegratorABI from "../../ABIs/Integrator.json"
import ExampleIntegratorABI from "../../ABIs/ExampleIntegrator.json"
import { Container, Grid, ThemeProvider, makeStyles } from '@material-ui/core';
import { darkTheme } from '../../config/theme';
import { AdSigner } from '../../components/AdSigner';
import InstallSnap from '../../components/InstallSnap';
import Header from '../../components/Header';
import { NetworkSwitcher } from '../../components/NetworkSwitcher';

const useStyles = makeStyles((theme) => ({
    container: {
        marginTop: theme.spacing(3),
    },
}));

const MintNFT = () => {
    const classes = useStyles();

    const [signature, setSignature] = useState<string>("");

    const integratorAddress = "0xa8f50F114BAA9A97F1B80DdAE76C35fd933d624A";
    const currentAccount = window.ethereum.selectedAddress;
    const [account, setAccount] = useState<string | null>(currentAccount)

    const deployCampaign = async () => {
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
            }, 5000); // Poll every 5 seconds
        });
    }

    useEffect(() => {
        if (!window.ethereum.isConnected() || !currentAccount) {
            window?.ethereum?.enable()
        }
        window.ethereum.on('accountsChanged', (accounts: any) => setAccount(accounts[0]));
    }, [])

    const [results, setResults] = useState<any>(null)

    useEffect(() => {
        handleSubmit()
    }, [signature])

    const handleSubmit = async () => {
        try {
            const hash: any = await deployCampaign()
            const res: any = await waitForTransactionReceipt(window.ethereum, hash)
            if (res) {
                const topics = decodeEventLog({
                    abi: ExampleIntegratorABI,
                    data: res.logs[0].data,
                    topics: res.logs[0].topics
                })
                const args: any = topics.args
                console.log(args)
                setResults(args)
            }
        } catch (err) {
            console.log(err)
        }
    };

    return (<>
        <Header />
        <ThemeProvider theme={darkTheme}>
            <NetworkSwitcher />
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
                    {results ? (
                        <Grid style={{ marginTop: "16px" }} item xs={12}>
                            <Typography color="textPrimary"><b>NFT Successfully minted! Transaction Hash: {JSON.stringify(results)}</b></Typography>
                        </Grid>
                    ) : <Grid style={{ marginTop: "16px" }} item xs={12}>
                        <Typography>...</Typography>
                    </Grid>}
                    <Grid style={{ marginTop: "16px" }} item xs={12}>
                        <AdSigner integratorAddress={integratorAddress} passSignature={(x: string) => setSignature(x)} buttonLabel="Mint me an NFT" />
                    </Grid>
                </Grid>
                <InstallSnap displayManualInstall={true} />
            </Container>
        </ThemeProvider>
    </>
    );
};

export default MintNFT;
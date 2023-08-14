'use client'

import React, { useEffect, useState } from 'react';
import Typography from '@material-ui/core/Typography';
import { keccak256, toBytes, toHex, decodeEventLog } from 'viem';

import { useAccount, useConnect, useContractReads, useContractWrite, useWaitForTransaction } from 'wagmi';
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

    const { isConnected } = useAccount()
    useEffect(() => {
        if (!isConnected) {
            window?.ethereum?.enable()
        }
        window.ethereum.on('accountsChanged', (accounts: any) => setAccount(accounts[0]));
    }, [])


    const { write, data } = useContractWrite({
        abi: IntegratorABI,
        address: integratorAddress,
        functionName: 'routeInteraction',
        chainId: Number(process.env.CHAIN_ID || 1)
    })

    useEffect(() => {
        if (signature) {
            console.log('SIGNATURE:', signature)
            const functionSignature = keccak256(toHex("mintNFT(address)")).slice(0, 10)
            write({
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
                    {isSuccessTx ? (
                        <Grid style={{ marginTop: "16px" }} item xs={12}>
                            <Typography color="textPrimary"><b>NFT Successfully minted! Transaction Hash: {data?.hash}</b></Typography>
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
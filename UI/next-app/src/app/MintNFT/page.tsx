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

const useStyles = makeStyles((theme) => ({
    container: {
        marginTop: theme.spacing(3),
    },
}));

const MintNFT = () => {
    const classes = useStyles();

    const [signature, setSignature] = useState<string>("");

    const integratorAddress = "0x2852d405eD7d122737f870AcF26762d310A408B5"
    const currentAccount: any = window.ethereum.selectedAddress;

    const { isConnected } = useAccount()

    useEffect(() => {
        if (!isConnected) {
            window?.ethereum?.enable()
        }
    }, [])

    const { write, data, isSuccess } = useContractWrite({
        abi: IntegratorABI,
        address: integratorAddress,
        functionName: 'routeInteraction',
        chainId: Number(process.env.CHAIN_ID || 1)
    })

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


    useEffect(() => {
        if (signature) {
            console.log('SIGNATURE:', signature)
            const functionSignature = keccak256(toHex("MintNFT(address)")).slice(0, 10)
            write({
                args: [
                    signature, functionSignature, "0x000000000000000000000000" + currentAccount?.slice(2, 42)
                ]
            })
        }
    }, [signature])

    const { data: receiptTx, isLoading: isPendingTx, isSuccess: isSuccessTx } = useWaitForTransaction({ hash: data?.hash })


    useEffect(() => {
        console.log('In the useEffect')
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
            <Container maxWidth="lg" className={classes.container}>
                <Grid container direction="column" alignItems="center">
                    <Grid item xs={12}>
                        <Typography color="textPrimary" variant="h2" gutterBottom align="center">
                            MintNFT Protocol
                        </Typography>
                    </Grid>
                    <Grid item xs={12}>
                        <Typography color="textPrimary" variant="body1" gutterBottom align="center">
                            This is an example of an External Protocol that uses Billboard as a revenue source. It mints a simple NFT that is free to the end user (aside from gas). The protocol fees are offset by from ad revenue earned from displaying Billboard campaigns in Metamask as a snap before transactions.
                            All of the interactions with the MintNFT protocol are routed through an integrator contract instance to update the ledger and manage ad displays.
                        </Typography>
                    </Grid>
                    <Grid style={{ marginTop: "16px" }} item xs={12}>
                        <AdSigner integratorAddress={integratorAddress} passSignature={(x: string) => setSignature(x)} />
                    </Grid>
                    {isSuccessTx && (
                        <Grid style={{ marginTop: "16px" }} item xs={12}>
                            <Typography color="textPrimary">NFT Successfully minted! Transaction Hash: {data?.hash}</Typography>
                        </Grid>
                    )}
                </Grid>
                <InstallSnap displayManualInstall={true} />
            </Container>
        </ThemeProvider>
    </>
    );
};

export default MintNFT;
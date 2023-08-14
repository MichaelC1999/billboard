'use client'

import React, { useEffect, useState } from "react";
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import { ThemeProvider, makeStyles } from '@material-ui/core/styles';
import CampaignABI from "../ABIs/Campaign.json"


import { type Address, useContractRead, useContractWrite, useWaitForTransaction, useAccount, useConnect } from 'wagmi'
import { stringToHex } from "viem";
import { useRouter } from 'next/navigation'
import { useNetwork, useBalance } from 'wagmi'
import { Box, Grid, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@material-ui/core";
import CampaignListItem from "./CampaignListItem";
import { darkTheme } from "../config/theme";
import Header from "./Header";
import NetworkManager from "./NetworkManager";

const useStyles = makeStyles((theme) => ({
    root: {
        '& > *': {
            margin: theme.spacing(1),
        },
    },
    table: {
        marginBottom: theme.spacing(2),
    },
    button: {
        marginTop: theme.spacing(2),
        height: '56px', // Height same as TextField
        width: '150px', // Standard width for buttons
    },
    input: {
        height: '56px', // Height same as Button
    },
}));


function CampaignPage({ campaignAddress, closeCampaign }: any) {
    const currentAddress = window.ethereum.selectedAddress;
    const { isConnected } = useAccount()
    useEffect(() => {
        if (!isConnected) {
            window?.ethereum?.enable()
        }
    }, [])

    const classes = useStyles();
    const [depositAmount, setDepositAmount] = useState("");
    const [withdrawAmount, setWithdrawAmount] = useState("");
    const { write: withdraw, data: dataWithdraw, } = useContractWrite({
        abi: CampaignABI,
        address: campaignAddress,
        functionName: 'withdrawSpend',
        chainId: Number(process.env.CHAIN_ID || 1)
    })

    const { data: receiptTxWithdraw, isLoading: isPendingTxWithdraw, isSuccess: isSuccessTxWithdraw } = useWaitForTransaction({ hash: dataWithdraw?.hash })

    const handleWithdraw = () => {
        withdraw({
            args: [parseFloat(withdrawAmount) * (10 ** 18)]
        })
    }

    useEffect(() => {
        if (isSuccessTxWithdraw) {
            console.log("Successful Withdraw", receiptTxWithdraw)
        }
    }, [receiptTxWithdraw, isSuccessTxWithdraw])


    const { write: deposit, data: dataDeposit } = useContractWrite({
        abi: CampaignABI,
        address: campaignAddress,
        functionName: 'depositSpend',
        chainId: Number(process.env.CHAIN_ID || 1)
    })

    const { data: receiptTxDeposit, isSuccess: isSuccessTxDeposit } = useWaitForTransaction({ hash: dataDeposit?.hash })

    const handleDeposit = () => {
        deposit({
            args: [parseFloat(depositAmount) * (10 ** 18), currentAddress]
        })
    }

    useEffect(() => {
        if (isSuccessTxDeposit) {
            console.log("Successful Deposit", receiptTxDeposit)
        }
    }, [receiptTxDeposit, isSuccessTxDeposit])

    return (<>
        <Header />
        <ThemeProvider theme={darkTheme}>
            <NetworkManager />
            <Button color="secondary" style={{ margin: "24px", minWidth: "120px", textAlign: "center", backgroundColor: "white" }} onClick={closeCampaign}>BACK</Button>
            <Container>
                <Box className={classes.root}>
                    <Typography variant="h3" color="textPrimary" style={{ margin: "24px 12px" }}>Campaign Management Page</Typography>
                    <Grid container direction="column" alignItems="stretch" className={classes.root}>
                        <Grid item xs={12} className={classes.table}>
                            <TableContainer component={Paper} style={{ width: '100%' }}>
                                <Table>
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Campaign Address</TableCell>
                                                <TableCell></TableCell>
                                                <TableCell>Campaign Title</TableCell>
                                                <TableCell>Ad Content</TableCell>
                                                <TableCell>Total Views</TableCell>
                                                <TableCell>Total Queued</TableCell>
                                                <TableCell>Base Spend</TableCell>
                                                <TableCell>Remaining Spend</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            <CampaignListItem address={campaignAddress} category={""} />
                                        </TableBody>
                                    </Table>
                                </Table>
                            </TableContainer>
                        </Grid>
                        <Grid item container xs={12} alignItems="flex-end">
                            <TextField
                                id="outlined-basic"
                                label="Deposit Amount"
                                variant="outlined"
                                type="number"
                                value={depositAmount}
                                onChange={e => setDepositAmount(e.target.value)}
                            />
                            <Grid item>
                                <Button variant="contained" color="primary" onClick={handleDeposit} size="large" className={classes.button}>Deposit</Button>
                            </Grid>
                            <Grid item xs={12}>
                                {isSuccessTxDeposit ? (
                                    <Typography color="textPrimary">Deposit Successful! Transaction Hash: <a style={{ color: "white" }} href={"https://explorer.goerli.linea.build/tx/" + receiptTxDeposit?.transactionHash}>{receiptTxDeposit?.transactionHash}</a></Typography>
                                ) : <Typography>No Deposit</Typography>}
                            </Grid>
                        </Grid>
                        <Grid item container xs={12} alignItems="flex-end">
                            <TextField
                                id="outlined-basic"
                                label="Withdraw Amount"
                                variant="outlined"
                                type="number"
                                value={withdrawAmount}
                                onChange={e => setWithdrawAmount(e.target.value)}
                            />
                            <Grid item>
                                <Button variant="contained" color="primary" onClick={handleWithdraw} size="large" className={classes.button}>Withdraw</Button>
                            </Grid>
                            <Grid item xs={12}>
                                {isSuccessTxWithdraw ? (
                                    <Typography color="textPrimary">Withdraw Successful! Transaction Hash: <a style={{ color: "white" }} href={"https://explorer.goerli.linea.build/tx/" + receiptTxWithdraw?.transactionHash}>{receiptTxWithdraw?.transactionHash}</a></Typography>
                                ) : <Typography>No Withdraw</Typography>}
                            </Grid>
                        </Grid>
                    </Grid>
                </Box>
            </Container>
        </ThemeProvider>
    </>);
}

export default CampaignPage;

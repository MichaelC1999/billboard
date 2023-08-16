'use client'

import React, { useEffect, useState } from "react";
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import { ThemeProvider, makeStyles } from '@material-ui/core/styles';
import CampaignABI from "../ABIs/Campaign.json"
import { Box, Grid, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@material-ui/core";
import CampaignListItem from "./CampaignListItem";
import { darkTheme } from "../config/theme";
import Header from "./Header";
import { NetworkSwitcher } from "./NetworkSwitcher";
import { decodeEventLog, encodeFunctionData } from "viem";
import ErrorPopup from "./ErrorPopup";

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
    const currentAccount = window.ethereum.selectedAddress;
    const [account, setAccount] = useState<string | null>(currentAccount)
    const [errorMessage, setErrorMessage] = useState<string>("")

    useEffect(() => {
        if (!window.ethereum.isConnected() || !currentAccount) {
            window?.ethereum?.enable()
        }
        window.ethereum.on('accountsChanged', (accounts: any) => setAccount(accounts[0]));
    }, [])

    const classes = useStyles();
    const [depositAmount, setDepositAmount] = useState("");
    const [withdrawAmount, setWithdrawAmount] = useState("");

    const withdrawSpend = async () => {

        const data = encodeFunctionData({
            abi: CampaignABI,
            functionName: 'withdrawSpend',
            args: [parseFloat(withdrawAmount) * (10 ** 18)]

        })
        const txHash = await window.ethereum.request({
            "method": "eth_sendTransaction",
            "params": [
                {
                    to: campaignAddress,
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

    const handleWithdraw = async () => {
        try {
            const hash: any = await withdrawSpend()
            const res: any = await waitForTransactionReceipt(window.ethereum, hash)
            if (res) {
                const topics = decodeEventLog({
                    abi: CampaignABI,
                    data: res.logs[0].data,
                    topics: res.logs[0].topics
                })
                const args: any = topics.args
                console.log(args)
            }
            setReceiptTxWithdraw(hash)
        } catch (err: any) {
            setErrorMessage(err?.message)
        }
    }
    const [receiptTxWithdraw, setReceiptTxWithdraw] = useState<any>(null)

    const depositSpend = async () => {
        const data = encodeFunctionData({
            abi: CampaignABI,
            functionName: 'depositSpend',
            args: [parseFloat(depositAmount) * (10 ** 18), account]
        })
        const txHash = await window.ethereum.request({
            "method": "eth_sendTransaction",
            "params": [
                {
                    to: campaignAddress,
                    from: account,
                    data
                }
            ]
        });
        return txHash
    }

    const handleDeposit = async () => {
        try {
            const hash: any = await depositSpend()
            const res: any = await waitForTransactionReceipt(window.ethereum, hash)
            if (res) {
                const topics = decodeEventLog({
                    abi: CampaignABI,
                    data: res.logs[0].data,
                    topics: res.logs[0].topics
                })
                const args: any = topics.args
                console.log(args)
            }
            setReceiptTxDeposit(hash)
        } catch (err: any) {
            setErrorMessage(err?.message)
        }
    }
    const [receiptTxDeposit, setReceiptTxDeposit] = useState<any>(null)

    return (<>
        <Header />
        <ThemeProvider theme={darkTheme}>
            <NetworkSwitcher />
            <ErrorPopup errorMessage={errorMessage} errorMessageCallback={() => setErrorMessage("")} />
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
                                            <CampaignListItem address={campaignAddress} selectCampaign={() => null} category={""} setErrorMessage={setErrorMessage} />
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
                                {receiptTxDeposit ? (
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
                                {receiptTxWithdraw ? (
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

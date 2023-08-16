'use client'

import React, { useEffect, useState } from "react";
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import { ThemeProvider, makeStyles } from '@material-ui/core/styles';
import IntegratorABI from "../ABIs/Integrator.json"
import IntegratorListItem from "./IntegratorListItem";
import { Box, Grid, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@material-ui/core";
import { darkTheme } from "../config/theme";
import Header from "./Header";
import { NetworkSwitcher } from "./NetworkSwitcher";
import { decodeEventLog, encodeFunctionData } from "viem";
import ErrorPopup from "./ErrorPopup";

const useStyles = makeStyles((theme) => ({
    root: {
        '& > *': {
            margin: theme.spacing(0),
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

function IntegratorPage({ integratorAddress, closeIntegrator }: any) {
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

    const [withdrawAmount, setWithdrawAmount] = useState("");

    const withdrawSpend = async () => {

        const data = encodeFunctionData({
            abi: IntegratorABI,
            functionName: 'integratorWithdraw',
            args: [parseFloat(withdrawAmount) * (10 ** 18)]

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

    const handleWithdraw = async () => {
        try {
            const hash: any = await withdrawSpend()
            const res: any = await waitForTransactionReceipt(window.ethereum, hash)
            if (res) {
                const topics = decodeEventLog({
                    abi: IntegratorABI,
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

    return (<>
        <Header />
        <ThemeProvider theme={darkTheme}>
            <NetworkSwitcher />
            <ErrorPopup errorMessage={errorMessage} errorMessageCallback={() => setErrorMessage("")} />
            <Button color="secondary" style={{ margin: "24px", minWidth: "120px", textAlign: "center", backgroundColor: "white" }} onClick={closeIntegrator}>BACK</Button>
            <Container>
                <Box className={classes.root}>
                    <Typography variant="h3" style={{ margin: "16px 0" }} color="textPrimary">Integrator Management Page</Typography>
                    <Grid container direction="column" alignItems="center" className={classes.root}>
                        <Grid item xs={12} className={classes.table}>
                            <TableContainer component={Paper}>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Integrator Address</TableCell>
                                            <TableCell></TableCell>
                                            <TableCell>External Protocol Address</TableCell>
                                            <TableCell>Enabled Functions</TableCell>
                                            <TableCell></TableCell>
                                            <TableCell>Revenue To Withdraw</TableCell>
                                            <TableCell>Cumulative Revenue</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        <IntegratorListItem address={integratorAddress} selectedIntegrator={() => null} setErrorMessage={setErrorMessage} category={""} />
                                    </TableBody>
                                </Table>
                            </TableContainer>
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
                        <Grid style={{ marginTop: "16px" }} item xs={12}>
                            {receiptTxWithdraw ? (
                                <Typography color="textPrimary">Withdraw Successful! Transaction Hash: <a style={{ color: "white" }} href={"https://explorer.goerli.linea.build/tx/" + receiptTxWithdraw}>{receiptTxWithdraw}</a></Typography>
                            ) : <Typography>No Withdraw</Typography>}
                        </Grid>
                    </Grid>
                </Box>
            </Container>
        </ThemeProvider>
    </>);
}

export default IntegratorPage;

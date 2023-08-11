'use client'

import React, { useEffect, useState } from "react";
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import { ThemeProvider, makeStyles } from '@material-ui/core/styles';

import { type Address, useContractRead, useContractWrite, useWaitForTransaction, useAccount, useConnect } from 'wagmi'
import { stringToHex } from "viem";
import { useRouter } from 'next/navigation'
import { useNetwork, useBalance } from 'wagmi'
import IntegratorABI from "../ABIs/Integrator.json"
import IntegratorListItem from "./IntegratorListItem";
import { Box, Grid, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@material-ui/core";
import { darkTheme } from "../config/theme";
import Header from "./Header";


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
    const { isConnected } = useAccount()
    useEffect(() => {
        if (!isConnected) {
            window?.ethereum?.enable()
        }
    }, [])
    const classes = useStyles();

    const [withdrawAmount, setWithdrawAmount] = useState("");

    const { write, data, isSuccess } = useContractWrite({
        abi: IntegratorABI,
        address: integratorAddress,
        functionName: 'integratorWithdraw',
        chainId: Number(process.env.CHAIN_ID || 1)
    })

    const { data: receiptTx, isLoading: isPendingTx, isSuccess: isSuccessTx } = useWaitForTransaction({ hash: data?.hash })

    const handleWithdraw = () => {
        write({
            args: [parseFloat(withdrawAmount) * (10 ** 18)]
        })
    }

    useEffect(() => {
        if (isSuccessTx) {
            console.log("Successful Withdraw", receiptTx)
        }
    }, [receiptTx, isSuccessTx])

    return (<>
        <Header />
        <ThemeProvider theme={darkTheme}>
            <Container>
                <Box className={classes.root}>
                    <Button color="secondary" style={{ marginTop: "12px", minWidth: "100px", textAlign: "center", backgroundColor: "white" }} onClick={closeIntegrator}>BACK</Button>
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
                                        <IntegratorListItem address={integratorAddress} category={""} />
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
                            {isSuccessTx ? (
                                <Typography color="textPrimary">Withdraw Successful! Transaction Hash: <a style={{ color: "white" }} href={"https://explorer.goerli.linea.build/tx/" + receiptTx?.transactionHash}>{receiptTx?.transactionHash}</a></Typography>
                            ) : <Typography>No Withdraw</Typography>}
                        </Grid>
                    </Grid>
                </Box>
            </Container>
        </ThemeProvider>
    </>);
}

export default IntegratorPage;

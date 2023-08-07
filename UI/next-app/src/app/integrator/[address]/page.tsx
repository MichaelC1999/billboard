'use client'

import React, { useEffect, useState } from "react";
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';

import { type Address, useContractRead, useContractWrite, useWaitForTransaction, useAccount, useConnect } from 'wagmi'
import { stringToHex } from "viem";
import { useRouter } from 'next/navigation'
import { useNetwork, useBalance } from 'wagmi'
import IntegratorABI from "../../../ABIs/Integrator.json"
import IntegratorListItem from "../../../components/IntegratorListItem";
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@material-ui/core";


const useStyles = makeStyles((theme) => ({
    root: {
        '& > *': {
            margin: theme.spacing(1),
        },
    },
}));

function IntegratorPage({ params }: any) {
    const router = useRouter()
    const { chain, chains } = useNetwork()
    const { connector: activeConnector, isConnected, address: userAddress } = useAccount()
    const { connect, connectors, error, isLoading, pendingConnector } = useConnect()

    const classes = useStyles();

    const [withdrawAmount, setWithdrawAmount] = useState("");

    const { write, data, isSuccess } = useContractWrite({
        abi: IntegratorABI,
        address: params.address,
        functionName: 'integratorWithdraw',
        chainId: 11155111
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

    return (
        <Container>
            <Typography variant="h3">Integrator Management Page</Typography>
            <div className={classes.root}>
                <div>
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Integrator Address</TableCell>
                                    <TableCell></TableCell>
                                    <TableCell>Protocol Address</TableCell>
                                    <TableCell>Enabled Functions</TableCell>
                                    <TableCell>Revenue To Withdraw</TableCell>
                                    <TableCell>Cumulative Revenue</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>

                                <IntegratorListItem address={params.address} category={""} />
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <TextField
                        id="outlined-basic"
                        label="Withdraw"
                        variant="outlined"
                        type="number"
                        value={withdrawAmount}
                        onChange={e => setWithdrawAmount(e.target.value)}
                    />
                    <Button variant="contained" color="primary" onClick={handleWithdraw}>Make Withdraw</Button>
                </div>
            </div>
        </Container>
    );
}

export default IntegratorPage;

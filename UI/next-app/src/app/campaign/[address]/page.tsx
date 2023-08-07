'use client'

import React, { useEffect, useState } from "react";
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import CampaignABI from "../../../ABIs/Campaign.json"


import { type Address, useContractRead, useContractWrite, useWaitForTransaction, useAccount, useConnect } from 'wagmi'
import { stringToHex } from "viem";
import { useRouter } from 'next/navigation'
import { useNetwork, useBalance } from 'wagmi'
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@material-ui/core";
import CampaignListItem from "../../../components/CampaignListItem";

const useStyles = makeStyles((theme) => ({
    root: {
        '& > *': {
            margin: theme.spacing(1),
        },
    },
}));

function CampaignPage({ params }: any) {
    const router = useRouter()
    const currentAddress = window.ethereum.selectedAddress;


    const classes = useStyles();

    const [depositAmount, setDepositAmount] = useState("");
    const [withdrawAmount, setWithdrawAmount] = useState("");


    const { write: withdraw, data: dataWithdraw, } = useContractWrite({
        abi: CampaignABI,
        address: params.address,
        functionName: 'withdrawSpend',
        chainId: 11155111
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
        address: params.address,
        functionName: 'depositSpend',
        chainId: 11155111
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

    return (
        <Container>
            <Typography variant="h3">Campaign {params.address}</Typography>
            <div className={classes.root}>
                <div>
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Campaign Address</TableCell>
                                    <TableCell></TableCell>
                                    <TableCell>Campaign Title</TableCell>
                                    <TableCell>Base Ad Spend</TableCell>
                                    <TableCell>Remaining Ad Spend</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                <CampaignListItem address={params.address} category={""} />
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <TextField
                        id="outlined-basic"
                        label="Deposit"
                        variant="outlined"
                        type="number"
                        value={depositAmount}
                        onChange={e => setDepositAmount(e.target.value)}
                    />
                    <Button variant="contained" color="primary" onClick={handleDeposit}>Make Deposit</Button>
                </div>
                <div>
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

export default CampaignPage;

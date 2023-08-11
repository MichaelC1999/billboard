'use client'

import React, { useEffect, useState } from "react";

import { type Address, useContractRead, useContractWrite, useWaitForTransaction, useAccount, useConnect } from 'wagmi'
import { decodeEventLog, stringToHex } from "viem";
import { useRouter } from 'next/navigation'
import { useNetwork, useBalance } from 'wagmi'
import InputForm from "../../../components/InputForm";
import { Box, Button, Container, Grid, ThemeProvider, Typography, makeStyles } from "@material-ui/core";
import FactoryABI from "../../../ABIs/Factory.json"
import { darkTheme } from "../../../config/theme";
import Header from "../../../components/Header";

const useStyles = makeStyles((theme) => ({
    txContainer: {
        marginTop: theme.spacing(3),
        marginBottom: theme.spacing(3),
        padding: "24px"
    },
}));

function Integrator() {
    const classes = useStyles();

    const factoryAddress: any = process.env.factoryAddress;

    const { isConnected } = useAccount()

    useEffect(() => {
        if (!isConnected) {
            window?.ethereum?.enable()
        }
    }, [])

    const { write, data, isSuccess, isLoading } = useContractWrite({
        abi: FactoryABI,
        address: factoryAddress,
        functionName: 'deployNewIntegrator',
        chainId: Number(process.env.CHAIN_ID || 1)
    })

    const { data: receiptTx, isLoading: isPendingTx, isSuccess: isSuccessTx } = useWaitForTransaction({ hash: data?.hash })


    useEffect(() => {
        if (receiptTx) {
            console.log(receiptTx.logs[0].topics, data, 'RECEIPT')
            const topics = decodeEventLog({
                abi: FactoryABI,
                data: receiptTx.logs[0].data,
                topics: receiptTx.logs[0].topics
            })
            const args: any = topics.args
            console.log(args._address, "TOPICS DECODED - GET INT ADDR")
            if (args._address) {
                setDeployedAddr(args._address)
            }
        }

    }, [isSuccessTx])

    const [inputs, setInputs] = useState<any>({});
    const [deployedAddr, setDeployedAddr] = useState<string>("")
    const [funcSigCount, setFuncSigCount] = useState(1);

    const elements = [
        {
            label: "External Protocol Contract Address",
            name: "externalProtocol",
            type: "text"
        },
        {
            label: "Revenue Withdraw Address",
            name: "withdrawAddress",
            type: "text"
        },
        {
            label: "Protocol Category",
            name: "protocolCategory",
            type: "select",
            options: ["lend", "nft", "dex", "other"]
        },
        ...Array.from({ length: funcSigCount }, (_, i) => ({
            label: `Function Signature ${i + 1}`,
            name: `functionSignature${i + 1}`,
            type: "text"
        })),
        {
            label: "Add Function Signature",
            name: "addElement",
            type: "addElement"
        },
        {
            label: "Remove Function Signature",
            name: "removeElement",
            type: "removeElement"
        }
    ];

    const handleSubmit = async () => {
        const signatures: string[] = [];
        Object.keys(inputs).forEach((x) => {
            if (x.includes('functionSignature')) {
                signatures.push(inputs[x])
            }
        })
        await write({
            args: [
                inputs.externalProtocol,
                inputs.withdrawAddress,
                inputs.protocolCategory,
                signatures,
            ],
        })
    };

    const handleAddFuncSig = () => {
        setFuncSigCount((prev) => prev + 1);
    };

    const handleRemoveLastFuncSig = () => {
        if (funcSigCount > 1) {
            setFuncSigCount((prev) => prev - 1);
            const updatedInputs = { ...inputs };
            delete updatedInputs[`functionSignature${funcSigCount}`];
            setInputs(updatedInputs);
        }
    };

    let txDisplay = null
    if (isPendingTx) {
        txDisplay = <Typography color="primary">Transaction pending...</Typography>
    }
    if (deployedAddr) {
        txDisplay = <Typography color="primary">New Integrator for {inputs.protocolName} deployed at: <a style={{ color: "white" }} href={"https://explorer.goerli.linea.build/address/" + deployedAddr}>{deployedAddr}</a></Typography>
    }

    return (<>
        <Header />
        <ThemeProvider theme={darkTheme}>
            <Container maxWidth="sm">
                <InputForm inputs={inputs} setInputs={setInputs} handleSubmit={handleSubmit} title="Deploy New Integrator" elements={elements} addElement={handleAddFuncSig} removeElement={handleRemoveLastFuncSig} />
                <Grid item xs={12} md={8} className={classes.txContainer}>

                    {txDisplay}
                </Grid>
            </Container>
        </ThemeProvider>
    </>);
}

export default Integrator;

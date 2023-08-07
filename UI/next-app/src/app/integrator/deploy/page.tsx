'use client'

import React, { useEffect, useState } from "react";

import { type Address, useContractRead, useContractWrite, useWaitForTransaction, useAccount, useConnect } from 'wagmi'
import { decodeEventLog, stringToHex } from "viem";
import { useRouter } from 'next/navigation'
import { useNetwork, useBalance } from 'wagmi'
import InputForm from "../../../components/InputForm";
import { Box, Button, Container, Grid } from "@material-ui/core";
import FactoryABI from "../../../ABIs/Factory.json"


//This page is for the integrator deployment 


function Integrator() {
    const router = useRouter()
    const exampleProtocolAddr = process.env.exampleProtocol
    const factoryAddress = process.env.factoryAddress;

    const { write, data, isSuccess, isLoading } = useContractWrite({
        abi: FactoryABI,
        address: factoryAddress,
        functionName: 'deployNewIntegrator',
        chainId: 11155111
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
            console.log(topics.args._address, "TOPICS DECODED - GET INT ADDR")
        }
        if (isSuccessTx && !isPendingTx) {
            router.push('/integrator/')
        }
    }, [isSuccessTx])

    const [inputs, setInputs] = useState<any>({});
    const [funcSigCount, setFuncSigCount] = useState(1);

    const elements = [
        {
            label: "Integrator Protocol Address",
            name: "protocolAddress",
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
                inputs.protocolAddress,
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

    return (
        <Container maxWidth="sm">
            <h3>IMPORTANT: {exampleProtocolAddr} - mintNFT(address)</h3>
            <InputForm inputs={inputs} setInputs={setInputs} handleSubmit={handleSubmit} title="Deploy New Integrator" elements={elements} />
            <Box mt={2} mb={2}>
                <Grid container justify="center" spacing={2}>
                    <Grid item>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleAddFuncSig}
                        >
                            Add Function Signature
                        </Button>
                    </Grid>
                    <Grid item>
                        <Button
                            variant="contained"
                            color="secondary"
                            onClick={handleRemoveLastFuncSig}
                        >
                            Remove Last Function Signature
                        </Button>
                    </Grid>
                </Grid>
            </Box>
        </Container>
    );
}

export default Integrator;

'use client'

import React, { useEffect, useState } from "react";
import { decodeEventLog, encodeFunctionData, stringToHex } from "viem";
import InputForm from "../../../components/InputForm";
import { Box, Button, Container, Grid, ThemeProvider, Typography, makeStyles } from "@material-ui/core";
import FactoryABI from "../../../ABIs/Factory.json"
import { darkTheme } from "../../../config/theme";
import Header from "../../../components/Header";
import { NetworkSwitcher } from "../../../components/NetworkSwitcher";
import ErrorPopup from "../../../components/ErrorPopup";

const useStyles = makeStyles((theme) => ({
    txContainer: {
        marginTop: theme.spacing(3),
        marginBottom: theme.spacing(3),
        padding: "24px"
    },
}));

function Integrator() {
    const classes = useStyles();
    const factoryAddress: any = process.env.NEXT_PUBLIC_FACTORY_ADDRESS;
    const currentAccount = window.ethereum.selectedAddress;
    const [account, setAccount] = useState<string | null>(currentAccount)
    const [errorMessage, setErrorMessage] = useState<string>("")
    console.log(currentAccount)
    useEffect(() => {
        if (!window.ethereum.isConnected() || !currentAccount) {
            window?.ethereum?.enable()
        }
        window.ethereum.on('accountsChanged', (accounts: any) => setAccount(accounts[0]));
    }, [])

    const deployIntegrator = async () => {
        const signatures: string[] = [];
        Object.keys(inputs).forEach((x) => {
            if (x.includes('functionSignature')) {
                signatures.push(inputs[x])
            }
        })
        const data = encodeFunctionData({
            abi: FactoryABI,
            functionName: 'deployNewIntegrator',
            args: [
                inputs.externalProtocol,
                inputs.withdrawAddress,
                inputs.protocolCategory,
                signatures
            ]
        })
        const txHash = await window.ethereum.request({
            "method": "eth_sendTransaction",
            "params": [
                {
                    to: factoryAddress,
                    from: account,
                    data
                }
            ]
        });
        return txHash
    }

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

    async function waitForTransactionReceipt(ethereum: any, txHash: string) {
        return new Promise((resolve, reject) => {
            const interval = setInterval(async () => {
                try {
                    const receipt = await ethereum.request({
                        method: 'eth_getTransactionReceipt',
                        params: [txHash]
                    });

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

    const handleSubmit = async () => {
        try {
            const hash: any = await deployIntegrator()
            const res: any = await waitForTransactionReceipt(window.ethereum, hash)
            if (res) {
                const topics = decodeEventLog({
                    abi: FactoryABI,
                    data: res.logs[0].data,
                    topics: res.logs[0].topics
                })
                const args: any = topics.args
                console.log(args._address, "TOPICS DECODED - GET INT ADDR")
                if (args._address) {
                    setDeployedAddr(args._address)
                }
            }
        } catch (err: any) {
            setErrorMessage(err?.message)
        }
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
    if (deployedAddr) {
        txDisplay = <Typography color="primary">New Integrator for {inputs.protocolName} deployed at: <a style={{ color: "white" }} href={"https://explorer.goerli.linea.build/address/" + deployedAddr}>{deployedAddr}</a></Typography>
    }

    return (<>
        <Header />
        <ThemeProvider theme={darkTheme}>
            <NetworkSwitcher />
            <ErrorPopup errorMessage={errorMessage} errorMessageCallback={() => setErrorMessage("")} />
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

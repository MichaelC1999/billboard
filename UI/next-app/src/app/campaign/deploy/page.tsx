'use client'

import React, { useEffect, useMemo, useState } from "react";

import { useContractWrite, useWaitForTransaction } from 'wagmi'
import { BaseError, decodeEventLog, decodeFunctionResult, encodeFunctionData, stringToHex, toBytes, zeroAddress } from "viem";
import InputForm from "../../../components/InputForm";
import FactoryABI from "../../../ABIs/Factory.json"
import ProtocolTokenABI from "../../../ABIs/ProtocolToken.json"

import MintProtocolToken from "../../../components/MintProtocolToken";
import { TokenApprove } from "../../../components/TokenApprove";
import { darkTheme } from "../../../config/theme";
import { Box, Button, CircularProgress, Grid, ThemeProvider, Typography, makeStyles } from "@material-ui/core";
import Header from "../../../components/Header";
import { NetworkSwitcher } from "../../../components/NetworkSwitcher";

const useStyles = makeStyles((theme) => ({
    formContainer: {
        marginTop: theme.spacing(3),
    },
    tokenContainer: {
        marginTop: theme.spacing(3),
        marginBottom: theme.spacing(3),
        textAlign: "center"
    },
}));

function CreateCampaign() {
    const classes = useStyles();
    const currentAccount = window.ethereum.selectedAddress;
    const [account, setAccount] = useState<string | null>(currentAccount)

    useEffect(() => {
        if (!window.ethereum.isConnected() || !currentAccount) {
            window?.ethereum?.enable()
        }
        window.ethereum.on('accountsChanged', (accounts: any) => setAccount(accounts[0]));
    }, [])

    const factoryAddress: any = process.env.factoryAddress;
    const [allowance, setAllowance] = useState<Number>(0);

    useEffect(() => {
        if (window.ethereum.networkVersion == process.env.CHAIN_ID) {
            getAllowance()
        }
    }, [account])

    const getAllowance = async () => {
        try {
            const encodedTxData = encodeFunctionData({
                abi: ProtocolTokenABI,
                functionName: 'allowance',
                args: [currentAccount, process.env.treasuryAddress]
            })
            const dataToDecode: any = await window.ethereum.request({
                method: "eth_call",
                params: [{
                    from: currentAccount,
                    to: process.env.protocolTokenAddress,
                    data: encodedTxData,
                    accessList: []
                }, null]
            })
            if (dataToDecode?.length > 0) {
                const decode: any = decodeFunctionResult({
                    abi: ProtocolTokenABI,
                    functionName: 'allowance',
                    data: dataToDecode
                })
                setAllowance(decode)
            }
        } catch (err) {
            console.log(err)
        }
    }

    const deployCampaign = async () => {
        const signatures: string[] = [];
        Object.keys(inputs).forEach((x) => {
            if (x.includes('functionSignature')) {
                signatures.push(inputs[x])
            }
        })
        const data = encodeFunctionData({
            abi: FactoryABI,
            functionName: 'deployNewCampaign',
            args: [
                inputs.campaignCategory,
                inputs.protocolName,
                inputs.initialCampaignSpend * (10 ** 18),
                inputs.campaignTitle,
                inputs.campaignContent,
                zeroAddress
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

    const handleSubmit = async () => {

        try {
            const hash: any = await deployCampaign()
            const res: any = await waitForTransactionReceipt(window.ethereum, hash)
            if (res) {
                const topics = decodeEventLog({
                    abi: FactoryABI,
                    data: res.logs[2].data,
                    topics: res.logs[2].topics
                })
                const args: any = topics.args
                if (args._address) {
                    setDeployedAddr(args._address)
                }
            }
        } catch (err) {
            console.log(err)
        }
        setExecuteApproval(false)
    };

    const [inputs, setInputs] = useState<any>({});
    const [deployedAddr, setDeployedAddr] = useState<string>("")

    const elements = [
        {
            label: "Campaign Title",
            name: "campaignTitle",
            type: "text"
        },
        {
            label: "Protocol Name",
            name: "protocolName",
            type: "text"
        },
        {
            label: "Campaign Content",
            name: "campaignContent",
            type: "text"
        },
        {
            label: "Initial Campaign Spend",
            name: "initialCampaignSpend",
            type: "number"
        },
        {
            label: "Campaign Category",
            name: "campaignCategory",
            type: "select",
            options: ["lend", "nft", "dex", "other"]
        }
    ];

    const [executeApproval, setExecuteApproval] = useState<Boolean>(false);
    let approvalRender = null;
    if (executeApproval) {
        if (Number(allowance) < Number(inputs.initialCampaignSpend * (10 ** 18))) {
            approvalRender = (
                <TokenApprove
                    tokenAddress={process.env.protocolTokenAddress}
                    balance={inputs.initialCampaignSpend * (10 ** 18)}
                    addressToApprove={process.env.treasuryAddress}
                    approvalLoadingSetter={() => null}
                    approveSuccessSetter={handleSubmit}
                />
            )
        } else {
            handleSubmit()
        }
    }

    let txDisplay = <Typography>No Transaction</Typography>

    if (deployedAddr) {
        txDisplay = <Typography color="primary">New Campaign Contract at: <a style={{ color: "white" }} href={"https://explorer.goerli.linea.build/address/" + deployedAddr}>{deployedAddr}</a></Typography>
    }

    return (<>
        <Header />
        <ThemeProvider theme={darkTheme}>
            <NetworkSwitcher />
            <Box className="createCampaign">
                <Grid container direction="column" alignItems="center">
                    <Grid item xs={12} md={8} className={classes.formContainer}>
                        <InputForm
                            inputs={inputs}
                            setInputs={setInputs}
                            title="Create New Campaign"
                            elements={elements}
                            addElement={() => null}
                            removeElement={() => null}
                            handleSubmit={() => {
                                setExecuteApproval(true)
                            }} />
                    </Grid>

                    <Grid item xs={12} md={8} className={classes.tokenContainer}>
                        {txDisplay}
                        <MintProtocolToken />
                    </Grid>
                    <Grid item xs={12} md={8}>
                        {approvalRender}
                    </Grid>
                </Grid>
            </Box>
        </ThemeProvider>
    </>);
}

export default CreateCampaign;

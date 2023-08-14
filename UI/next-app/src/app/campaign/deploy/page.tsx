'use client'

import React, { useEffect, useMemo, useState } from "react";

import { type Address, useContractRead, useContractWrite, useWaitForTransaction, useAccount, useConnect, erc20ABI } from 'wagmi'
import { BaseError, decodeEventLog, decodeFunctionResult, encodeFunctionData, stringToHex, toBytes, zeroAddress } from "viem";
import { useRouter } from 'next/navigation'
import { useNetwork, useBalance } from 'wagmi'
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
    const { isConnected } = useAccount()
    const currentAccount = window.ethereum.selectedAddress;
    const [account, setAccount] = useState<string | null>(currentAccount)

    useEffect(() => {
        if (!isConnected) {
            window?.ethereum?.enable()
        }
        window.ethereum.on('accountsChanged', (accounts: any) => setAccount(accounts[0]));
    }, [])

    const factoryAddress: any = process.env.factoryAddress;
    const [allowance, setAllowance] = useState<Number>(0);

    const { data: treasuryAddrOnChain } = useContractRead({
        abi: FactoryABI,
        address: factoryAddress,
        functionName: 'treasuryAddress',
        args: [],
        enabled: true,
    })

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

    const { write, data } = useContractWrite({
        abi: FactoryABI,
        address: factoryAddress,
        functionName: 'deployNewCampaign',
        chainId: Number(process.env.CHAIN_ID || 1)
    })

    const { data: receiptTx, isLoading: isPendingTx, isSuccess: isSuccessTx, isError: isErrorTx } = useWaitForTransaction({ hash: data?.hash })

    useEffect(() => {
        if (receiptTx) {
            const topics = decodeEventLog({
                abi: FactoryABI,
                data: receiptTx.logs[2].data,
                topics: receiptTx.logs[2].topics
            })
            const args: any = topics.args
            setDeployedAddr(args._address)
            const txHash = data?.hash
        }
        if (isSuccessTx && !isPendingTx) {
            setExecuteApproval(false)

        }
    }, [isSuccessTx])

    const [inputs, setInputs] = useState<any>({});
    const [deployedAddr, setDeployedAddr] = useState<string>("")

    const handleSubmit = async () => {
        setExecuteApproval(false)
        console.log("INPUTS", inputs);
        await write({
            args: [
                inputs.campaignCategory,
                inputs.protocolName,
                inputs.initialCampaignSpend * (10 ** 18),
                inputs.campaignTitle,
                inputs.campaignContent,
                zeroAddress
            ],
        })
    };

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
    if (isPendingTx) {
        txDisplay = <Typography color="primary">Transaction pending...</Typography>
    }
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

'use client'

import React, { useEffect, useMemo, useState } from "react";

import { type Address, useContractRead, useContractWrite, useWaitForTransaction, useAccount, useConnect } from 'wagmi'
import { decodeFunctionResult, encodeFunctionData, stringToHex, toBytes } from "viem";
import { useRouter } from 'next/navigation'
import { useNetwork, useBalance } from 'wagmi'
import InputForm from "../../../components/InputForm";
import FactoryABI from "../../../ABIs/Factory.json"
import ProtocolTokenABI from "../../../ABIs/ProtocolToken.json"

import MintProtocolToken from "../../../components/MintProtocolToken";
import { TokenApprove } from "../../../components/TokenApprove";

function CreateCampaign() {
    const router = useRouter()
    const { chain, chains } = useNetwork()
    const { connector: activeConnector, isConnected, address: userAddress } = useAccount()
    const { connect, connectors, error, pendingConnector } = useConnect()

    const factoryAddress = process.env.factoryAddress;
    const currentAccount = window.ethereum.selectedAddress;

    const [allowance, setAllowance] = useState<Number>(0);

    useEffect(() => {
        getAllowance()
    }, [])

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

    const { write, data, isSuccess, isLoading } = useContractWrite({
        abi: FactoryABI,
        address: factoryAddress,
        functionName: 'deployNewCampaign',
        chainId: 11155111
    })
    // deployNewCampaign(string memory category, string memory protocolName, uint initialAdSpend, string memory campaignTitleParam, string memory campaignContentParam, uint deadline, uint8 v, bytes32 r, bytes32 s)

    const { data: receiptTx, isLoading: isPendingTx, isSuccess: isSuccessTx } = useWaitForTransaction({ hash: data?.hash })

    useEffect(() => {
        if (receiptTx) {
            console.log(receiptTx.logs, data, 'GET THE TOPICS')
            // const topics = decodeEventLog({
            //     abi: FactoryABI,
            //     data: receiptTx.logs[0].data,
            //     topics: receiptTx.logs[0].topics
            // })
        }
        if (isSuccessTx && !isPendingTx) {
            setExecuteApproval(false)
            router.push('/campaign/')
        }
    }, [isSuccessTx])

    const [inputs, setInputs] = useState<any>({});

    const handleSubmit = async () => {
        setExecuteApproval(false)
        console.log("INPUTS", inputs);
        await write({
            args: [
                inputs.campaignCategory,
                inputs.protocolName,
                inputs.initialCampaignSpend * (10 ** 18),
                inputs.campaignTitle,
                inputs.campaignContent
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
        console.log(Number(allowance) < Number(inputs.initialCampaignSpend * (10 ** 18)), allowance)
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

    return (<>
        <div className="createCampaign">
            <div style={{ width: "100%" }}>
                <InputForm inputs={inputs} setInputs={setInputs} handleSubmit={() => {
                    setExecuteApproval(true)
                }} title="Create New Campaign" elements={elements} />
            </div>
            <MintProtocolToken />
            {approvalRender}
        </div>
    </>
    );
}

export default CreateCampaign;

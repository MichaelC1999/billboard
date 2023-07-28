'use client'

import React, { useEffect, useState } from "react";

import { type Address, useContractRead, useContractWrite, useWaitForTransaction, useAccount, useConnect } from 'wagmi'
import { stringToHex, toBytes } from "viem";
import { useRouter } from 'next/navigation'
import { useNetwork, useBalance } from 'wagmi'
import InputForm from "../../../components/InputForm";
import CampaignFactoryABI from "../../../ABIs/CampaignFactory.json"



function CreateCampaign() {
    const router = useRouter()
    const { chain, chains } = useNetwork()
    const { connector: activeConnector, isConnected, address: userAddress } = useAccount()
    const { connect, connectors, error, pendingConnector } = useConnect()

    const campaignFactoryAddress = "0x793d3503f679607e2BA6620A44465Ba01F4F9fb7";

    const { write, data, isSuccess, isLoading } = useContractWrite({
        abi: CampaignFactoryABI,
        address: campaignFactoryAddress,
        functionName: 'deployNewCampaign',
        chainId: 11155111
    })

    const { data: receiptTx, isLoading: isPendingTx, isSuccess: isSuccessTx } = useWaitForTransaction({ hash: data?.hash })

    useEffect(() => {
        console.log(receiptTx, data, 'RECEIPT')
        if (isSuccessTx && !isPendingTx) {
            router.push('/campaign/')
        }
    }, [isSuccessTx])

    const [inputs, setInputs] = useState<any>({});

    const handleSubmit = async () => {
        console.log("INPUTS", inputs);
        await write({
            args: [
                inputs.campaignCategory,
                inputs.protocolName,
                inputs.initialCampaignSpend,
                inputs.campaignTitle,
                inputs.campaignContentParam
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

    // deployNewCampaign(bytes32 category, bytes32 protocolName, uint initialAdSpend, string memory campaignTitleParam, string memory campaignContentParam)

    return (<>
        <div className="createCampaign">
            <div style={{ width: "100%" }}>
                <InputForm inputs={inputs} setInputs={setInputs} handleSubmit={handleSubmit} title="Create New Campaign" elements={elements} />
            </div>
        </div>
    </>
    );
}

export default CreateCampaign;

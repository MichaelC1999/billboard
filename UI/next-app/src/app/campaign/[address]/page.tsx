'use client'

import React, { useEffect, useState } from "react";

import { type Address, useContractRead, useContractWrite, useWaitForTransaction, useAccount, useConnect } from 'wagmi'
import { stringToHex } from "viem";
import { useRouter } from 'next/navigation'
import { useNetwork, useBalance } from 'wagmi'


function CampaignPage({ params }: any) {
    const router = useRouter()
    const { chain, chains } = useNetwork()
    const { connector: activeConnector, isConnected, address: userAddress } = useAccount()
    const { connect, connectors, error, isLoading, pendingConnector } = useConnect()
    return (<>
        <div className="CampaignPage">
            <h3>Campaign {params.address}</h3>
            <div style={{ width: "100%" }}>

            </div>
        </div>
    </>
    );
}

export default CampaignPage;

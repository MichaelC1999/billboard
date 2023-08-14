'use client'

import React, { useState, useEffect } from "react";
import { useAccount, useNetwork } from "wagmi";
import { NetworkSwitcher } from "./NetworkSwitcher";

const NetworkManager = () => {
    const { chain } = useNetwork()
    const { isConnected, address } = useAccount()

    const [showSwitchNetwork, setShowSwitchNetwork] = useState<Boolean>(false)

    useEffect(() => {
        if (chain?.id !== process.env.CHAIN_ID && isConnected) {
            setShowSwitchNetwork(true)
        } else {
            setShowSwitchNetwork(false)
        }
    }, [chain])

    useEffect(() => {
        if (!isConnected) {
            window?.ethereum?.enable()
        }
    }, [isConnected, address])

    let switchNetworkDisplay = null
    if (showSwitchNetwork) {
        switchNetworkDisplay = <NetworkSwitcher />
    }

    return (<>{switchNetworkDisplay}</>);
};

export default NetworkManager;
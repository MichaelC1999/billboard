'use client'

import React, { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { NetworkSwitcher } from "./NetworkSwitcher";

const NetworkManager = () => {
    const { isConnected, address } = useAccount()

    const [showSwitchNetwork, setShowSwitchNetwork] = useState<Boolean>(false)

    useEffect(() => {
        if (window.ethereum.networkVersion !== process.env.CHAIN_ID && isConnected) {
            setShowSwitchNetwork(true)
        } else {
            setShowSwitchNetwork(false)
        }
    }, [window.ethereum.networkVersion])

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
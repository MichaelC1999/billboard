'use client'

import React, { useEffect } from 'react';
import { SignTypedData } from '../../components/SignTypedData';
import { useContractReads } from 'wagmi';
import { zeroAddress } from 'viem';

const SignData = () => {
    // function getSigner(address _myValue, bytes memory _signature)
    const { data: checksData } = useContractReads({
        contracts: [
            {
                address: "0xA304B627541caf5c172D60BAe8d64B0B7705A82a",
                args: [(zeroAddress), "0xee50878cd49eca8b208b595d06210b479faf0b8de206bad780820c9917ccfbb327e05c59a2d28e1ebcf31c2265b6c6318ef5f00cad77e7f158d998282e6a7add1c"],
                functionName: "getSigner"
            },
        ]
    })

    useEffect(() => {
        console.log("checksData", checksData)
    }, [checksData])
    return (
        <SignTypedData />
    );
};

export default SignData;
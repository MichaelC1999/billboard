'use client'

import React, { useState, useEffect } from "react";
import { TableCell, TableRow, CircularProgress, Typography } from "@material-ui/core";
import { useRouter } from "next/navigation";
import { decodeFunctionResult, encodeFunctionData } from "viem";
import IntegratorABI from '../ABIs/Integrator.json';

const IntegratorListItem = ({ address, category }: any) => {
    const router = useRouter()
    const [integratorData, setIntegratorData] = useState<{ [x: string]: any } | null>(null);
    const currentAccount = window.ethereum.selectedAddress;
    const formatTokenDecimals = (decode: any) => {
        let str = decode + ""
        while (str.length < 18) {
            str = '0' + str;
        }
        const decimalIndex = str.length - 18;

        str = str.slice(0, decimalIndex) + '.' + str.slice(decimalIndex).replace(/\.?0+$/, "");
        if (str[str.length - 1] === ".") {
            str += "0";
        }
        return str
    }

    const pullIntegratorValue = async (valueName: string) => {
        try {
            const encodedTxData = encodeFunctionData({
                abi: IntegratorABI,
                functionName: valueName,
                args: []
            })
            const dataToDecode: any = await window.ethereum.request({
                method: "eth_call",
                params: [{
                    from: currentAccount,
                    to: address,
                    data: encodedTxData,
                    accessList: []
                }, null]
            })
            if (dataToDecode?.length > 0) {
                const decode = decodeFunctionResult({
                    abi: IntegratorABI,
                    functionName: valueName,
                    data: dataToDecode
                })

                setIntegratorData((prevState) => ({ ...prevState, [valueName]: decode }))
            }
        } catch (err) {
            console.log(valueName, err)
        }
    }

    useEffect(() => {
        pullIntegratorValue("protocol")
        pullIntegratorValue('getFunctionSignatures')
        pullIntegratorValue("currentAvailableAdRevenue")
        pullIntegratorValue('cumulativeAdRevenue')
        pullIntegratorValue('servedAdCounter')
    }, [address]);

    if (!integratorData) {
        return (
            <TableRow>
                <TableCell colSpan={4} align="left">
                    <CircularProgress />
                </TableCell>
            </TableRow>
        );
    }

    return (
        <TableRow>
            <TableCell>
                <Typography
                    variant="body1"
                    style={{ cursor: 'pointer', color: 'blue', textDecoration: 'underline' }}
                    onClick={() => router.push(`/integrator/${address}`)}
                >
                    {address}
                </Typography>
            </TableCell>
            <TableCell>{category}</TableCell>
            <TableCell>{integratorData?.protocol}</TableCell>
            <TableCell>{integratorData?.getFunctionSignatures?.join(", ")}</TableCell>
            <TableCell>{integratorData?.servedAdCounter}</TableCell>
            <TableCell>{formatTokenDecimals(integratorData?.currentAvailableAdRevenue)} BILL</TableCell>
            <TableCell>{formatTokenDecimals(integratorData?.cumulativeAdRevenue)} BILL</TableCell>
        </TableRow>
    );
};

export default IntegratorListItem;

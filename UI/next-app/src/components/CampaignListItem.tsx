'use client'

import React, { useState, useEffect } from "react";
import { TableCell, TableRow, CircularProgress, Typography } from "@material-ui/core";
import { Link } from "react-router-dom";
import { useRouter } from "next/navigation";
import { decodeFunctionResult, encodeFunctionData } from "viem";
import CampaignABI from '../ABIs/Campaign.json';

const CampaignListItem = ({ address }: any) => {
    const router = useRouter()

    const [campaignData, setCampaignData] = useState<{ [x: string]: any } | null>(null);

    const pullCampaignTitle = async () => {
        try {
            const encodedTxData = encodeFunctionData({
                abi: CampaignABI,
                functionName: 'campaignTitle',
                args: []
            })
            const dataToDecode: any = await window.ethereum.request({
                method: "eth_call",
                params: [{
                    from: "0x1CA2b10c61D0d92f2096209385c6cB33E3691b5E",
                    to: address,
                    data: encodedTxData,
                    accessList: []
                }, null]
            })
            console.log(dataToDecode, encodedTxData, "LIST")
            if (dataToDecode?.length > 0) {
                const decode = decodeFunctionResult({
                    abi: CampaignABI,
                    functionName: 'campaignTitle',
                    data: dataToDecode
                })
                console.log('DECODE: ', decode)
                setCampaignData((prevState) => ({ ...prevState, campaignTitle: decode }))
            }
        } catch (err) {
            console.log(err)
        }
    }


    const pullBaseAdSpend = async () => {
        try {
            const encodedTxData = encodeFunctionData({
                abi: CampaignABI,
                functionName: 'baseAdSpend',
                args: []
            })
            const dataToDecode: any = await window.ethereum.request({
                method: "eth_call",
                params: [{
                    from: "0x1CA2b10c61D0d92f2096209385c6cB33E3691b5E",
                    to: address,
                    data: encodedTxData,
                    accessList: []
                }, null]
            })
            console.log(dataToDecode, encodedTxData, "LIST")
            if (dataToDecode?.length > 0) {
                const decode = decodeFunctionResult({
                    abi: CampaignABI,
                    functionName: 'baseAdSpend',
                    data: dataToDecode
                })
                console.log('DECODE: ', decode)
                setCampaignData((prevState) => ({ ...prevState, baseAdSpend: decode }))
            }
        } catch (err) {
            console.log(err)
        }
    }

    useEffect(() => {
        pullCampaignTitle()
        pullBaseAdSpend()
    }, [address]);

    if (!campaignData) {
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
                    onClick={() => router.push(`/campaign/${address}`)}
                >
                    {address}
                </Typography>
            </TableCell>
            <TableCell>{campaignData?.campaignTitle}</TableCell>
            <TableCell>{campaignData?.baseAdSpend?.toString()}</TableCell>
            <TableCell>{campaignData?.spendRemaining}</TableCell>
        </TableRow>
    );
};

export default CampaignListItem;

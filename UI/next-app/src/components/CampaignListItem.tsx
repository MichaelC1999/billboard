'use client'

import React, { useState, useEffect } from "react";
import { TableCell, TableRow, CircularProgress, Typography, Tooltip, makeStyles } from "@material-ui/core";
import { useRouter } from "next/navigation";
import { decodeFunctionResult, encodeFunctionData } from "viem";
import CampaignABI from '../ABIs/Campaign.json';

const useStyles = makeStyles((theme) => ({
    tooltip: {
        fontSize: "1.5em",
    },
}));

const CampaignListItem = ({ address, category }: any) => {
    const router = useRouter()
    const classes = useStyles();

    const [campaignData, setCampaignData] = useState<{ [x: string]: any } | null>(null);
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

    const pullCampaignValue = async (valueName: string) => {
        try {
            const encodedTxData = encodeFunctionData({
                abi: CampaignABI,
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
                    abi: CampaignABI,
                    functionName: valueName,
                    data: dataToDecode
                })
                setCampaignData((prevState) => ({ ...prevState, [valueName]: decode }))
            }
        } catch (err) {
            console.log(err)
        }
    }

    useEffect(() => {
        pullCampaignValue("remainingAvailableAdSpend")
        pullCampaignValue("campaignTitle")
        pullCampaignValue('baseAdSpend')
        pullCampaignValue('campaignContent')
        pullCampaignValue('cumulativeAdViews')
        pullCampaignValue('cumulativeAdQueued')
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
        <Tooltip title={campaignData.campaignContent} classes={{ tooltip: classes.tooltip }}>
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
                <TableCell>{category}</TableCell>
                <TableCell>{campaignData?.campaignTitle}</TableCell>
                <TableCell>{campaignData?.cumulativeAdViews}</TableCell>
                <TableCell>{campaignData?.cumulativeAdQueued}</TableCell>
                <TableCell>{formatTokenDecimals(campaignData?.baseAdSpend)} BILL</TableCell>
                <TableCell>{formatTokenDecimals(campaignData?.remainingAvailableAdSpend)} BILL</TableCell>
            </TableRow>
        </Tooltip>
    );
};

export default CampaignListItem;

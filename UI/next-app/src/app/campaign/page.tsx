'use client'

import React, { useState, useEffect } from "react";
import { Button, Container, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, ThemeProvider } from "@material-ui/core";
import { Link } from "react-router-dom";
import { useRouter } from 'next/navigation'
import CampaignListItem from "../../components/CampaignListItem";
import { useAccount, useContractRead, useContractReads } from "wagmi";
import FactoryABI from "../../ABIs/Factory.json"
import { decodeFunctionResult, stringToHex, toBytes, zeroAddress } from "viem";
import { encodeFunctionData } from 'viem'
import { darkTheme } from "../../config/theme";
import Header from "../../components/Header";


const CampaignList = () => {
    const router = useRouter()
    const currentAccount = window.ethereum.selectedAddress;
    const factoryAddress = process.env.factoryAddress;
    const [campaigns, setCampaigns] = useState<{ [x: string]: string[] }>({});
    const { isConnected } = useAccount()

    useEffect(() => {
        if (!isConnected) {
            window?.ethereum?.enable()
        }
    }, [])

    const getCampaigns = async (category: string) => {
        try {
            const encodedTxData = encodeFunctionData({
                abi: FactoryABI,
                functionName: 'getCampaignAddresses',
                args: [category]
            })
            const dataToDecode: any = await window.ethereum.request({
                method: "eth_call",
                params: [{
                    from: currentAccount,
                    to: factoryAddress,
                    data: encodedTxData,
                    accessList: []
                }, null]
            })
            if (dataToDecode?.length > 0) {
                const decode = decodeFunctionResult({
                    abi: FactoryABI,
                    functionName: 'getCampaignAddresses',
                    data: dataToDecode
                })
                setCampaigns((prevState) => {
                    return { ...prevState, [category]: decode }
                })
            }
        } catch (err) {
            console.log(err)
        }
    }

    useEffect(() => {
        getCampaigns("lend")
        getCampaigns('dex')
        getCampaigns('nft')
        getCampaigns('other')
    }, [])

    let campaignList = null
    let totalListlength = 0
    Object.keys(campaigns).forEach((cat: string) => {
        totalListlength += campaigns[cat].length;
    })
    if (totalListlength > 0) {
        campaignList = Object.keys(campaigns).map((category: string) => {
            return (
                <>
                    {campaigns[category].map((campaignAddress: string) => {
                        return (
                            <CampaignListItem key={campaignAddress} category={category} address={campaignAddress} />
                        )
                    })}
                </>
            )
        })
    } else if (Object.keys(campaigns).length === 4) {
        campaignList = (
            <TableRow>
                <TableCell>No Campaigns Deployed</TableCell>
                <TableCell></TableCell>
                <TableCell></TableCell>
                <TableCell></TableCell>
                <TableCell></TableCell>
                <TableCell></TableCell>
                <TableCell></TableCell>
            </TableRow>
        )
    }

    return (<>
        <Header />
        <ThemeProvider theme={darkTheme}>
            <Container maxWidth="xl">
                <Typography style={{ margin: "16px 0" }} variant="h3" color="primary" gutterBottom>
                    Campaigns
                </Typography>
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Campaign Address</TableCell>
                                <TableCell>Category</TableCell>
                                <TableCell>Campaign Title</TableCell>
                                <TableCell>cumulativeAdViews</TableCell>
                                <TableCell>cumulativeAdQueued</TableCell>
                                <TableCell>Base Ad Spend</TableCell>
                                <TableCell>Remaining Ad Spend</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {campaignList}
                        </TableBody>
                    </Table>
                </TableContainer>
                <Button
                    variant="contained"
                    color="primary"
                    style={{ marginTop: '20px' }}
                    onClick={() => router.push('/campaign/deploy')}
                >
                    Deploy New Campaign
                </Button>
            </Container>
        </ThemeProvider>
    </>);
};

export default CampaignList;
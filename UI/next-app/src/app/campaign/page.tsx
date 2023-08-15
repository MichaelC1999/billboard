'use client'

import React, { useState, useEffect } from "react";
import { Button, Container, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, ThemeProvider } from "@material-ui/core";
import { useRouter } from 'next/navigation'
import CampaignListItem from "../../components/CampaignListItem";
import FactoryABI from "../../ABIs/Factory.json"
import { decodeFunctionResult } from "viem";
import { encodeFunctionData } from 'viem'
import { darkTheme } from "../../config/theme";
import Header from "../../components/Header";
import CampaignPage from "../../components/CampaignPage";
import { NetworkSwitcher } from "../../components/NetworkSwitcher";


const CampaignList = () => {
    const router = useRouter()

    const factoryAddress = process.env.factoryAddress;
    const [campaigns, setCampaigns] = useState<{ [x: string]: string[] }>({});
    const [selectedCampaign, setSelectedCampaign] = useState<string>("")

    const currentAccount = window.ethereum.selectedAddress;
    const [account, setAccount] = useState<string | null>(currentAccount)

    useEffect(() => {
        if (!window.ethereum.isConnected() || !currentAccount) {
            window?.ethereum?.enable()
        }
        window.ethereum.on('accountsChanged', (accounts: any) => setAccount(accounts[0]));
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
                setCampaigns((prevState: any) => {
                    return { ...prevState, [category]: decode }
                })
            }
        } catch (err) {
            console.log(err)
        }
    }

    useEffect(() => {
        if (window.ethereum.networkVersion == process.env.CHAIN_ID) {
            getCampaigns("lend")
            getCampaigns('dex')
            getCampaigns('nft')
            getCampaigns('other')
        }
    }, [account])

    if (selectedCampaign) {
        return <CampaignPage campaignAddress={selectedCampaign} closeCampaign={() => setSelectedCampaign("")} />
    }

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
                            <CampaignListItem key={campaignAddress} category={category} address={campaignAddress} selectCampaign={(x: string) => setSelectedCampaign(x)} />
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
                <TableCell></TableCell>
            </TableRow>
        )
    }

    return (<>
        <Header />
        <ThemeProvider theme={darkTheme}>
            <NetworkSwitcher />
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
                                <TableCell>Ad Content</TableCell>
                                <TableCell>Total Views</TableCell>
                                <TableCell>Total Queued</TableCell>
                                <TableCell>Base Spend</TableCell>
                                <TableCell>Remaining Spend</TableCell>
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
'use client'

import React, { useState, useEffect } from "react";
import { Button, Container, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from "@material-ui/core";
import { Link } from "react-router-dom";
import { useRouter } from 'next/navigation'
import CampaignListItem from "../../components/CampaignListItem";
import { useContractRead, useContractReads } from "wagmi";
import { wagmiContractConfig } from "../../components/contracts";
import CampaignFactoryABI from "../../ABIs/CampaignFactory.json"
import { decodeFunctionResult, stringToHex, toBytes, zeroAddress } from "viem";
import { encodeFunctionData } from 'viem'


const CampaignList = () => {
    const router = useRouter()

    const campaignFactoryAddress = "0x793d3503f679607e2BA6620A44465Ba01F4F9fb7";
    const [campaigns, setCampaigns] = useState<string[]>([]);

    const getLendCampaigns = async () => {
        try {
            const encodedTxData = encodeFunctionData({
                abi: CampaignFactoryABI,
                functionName: 'getAddresses',
                args: ['lend']
            })
            const dataToDecode: any = await window.ethereum.request({
                method: "eth_call",
                params: [{
                    from: "0x1CA2b10c61D0d92f2096209385c6cB33E3691b5E",
                    to: campaignFactoryAddress,
                    data: encodedTxData,
                    accessList: []
                }, null]
            })
            console.log(dataToDecode, encodedTxData, "LIST")
            if (dataToDecode?.length > 0) {
                const decode = decodeFunctionResult({
                    abi: CampaignFactoryABI,
                    functionName: 'getAddresses',
                    data: dataToDecode
                })
                console.log('DECODE: ', decode)
                setCampaigns((prevState) => {
                    let elementsToAdd = [];
                    if (Array.isArray(decode)) {
                        elementsToAdd = decode.filter((addr: string) => !prevState.includes(addr));
                    }
                    return [...prevState, ...elementsToAdd] as any
                })
            }
        } catch (err) {
            console.log(err)
        }
    }

    const getNftCampaigns = async () => {

        try {
            const encodedTxData = encodeFunctionData({
                abi: CampaignFactoryABI,
                functionName: 'getAddresses',
                args: ['nft']
            })
            const dataToDecode: any = await window.ethereum.request({
                method: "eth_call",
                params: [{
                    from: "0x1CA2b10c61D0d92f2096209385c6cB33E3691b5E",
                    to: campaignFactoryAddress,
                    data: encodedTxData,
                    accessList: []
                }, null]
            })
            console.log(dataToDecode, encodedTxData, "LIST")
            if (dataToDecode?.length > 0) {
                const decode = decodeFunctionResult({
                    abi: CampaignFactoryABI,
                    functionName: 'getAddresses',
                    data: dataToDecode
                })
                console.log('DECODE: ', decode)
                setCampaigns((prevState) => {

                    let elementsToAdd = [];
                    if (Array.isArray(decode)) {
                        elementsToAdd = decode.filter((addr: string) => !prevState.includes(addr));
                    }
                    return [...prevState, ...elementsToAdd] as any
                })
            }
        } catch (err) {
            console.log(err)
        }
    }

    const getDexCampaigns = async () => {

        try {
            const encodedTxData = encodeFunctionData({
                abi: CampaignFactoryABI,
                functionName: 'getAddresses',
                args: ['dex']
            })
            const dataToDecode: any = await window.ethereum.request({
                method: "eth_call",
                params: [{
                    from: "0x1CA2b10c61D0d92f2096209385c6cB33E3691b5E",
                    to: campaignFactoryAddress,
                    data: encodedTxData,
                    accessList: []
                }, null]
            })
            console.log(dataToDecode, encodedTxData, "LIST")
            if (dataToDecode?.length > 0) {
                const decode = decodeFunctionResult({
                    abi: CampaignFactoryABI,
                    functionName: 'getAddresses',
                    data: dataToDecode
                })
                console.log('DECODE: ', decode)
                setCampaigns((prevState) => {

                    let elementsToAdd = [];
                    if (Array.isArray(decode)) {
                        elementsToAdd = decode.filter((addr: string) => !prevState.includes(addr));
                    }
                    return [...prevState, ...elementsToAdd] as any
                })
            }
        } catch (err) {
            console.log(err)
        }
    }

    const getOtherCampaigns = async () => {

        try {
            const encodedTxData = encodeFunctionData({
                abi: CampaignFactoryABI,
                functionName: 'getAddresses',
                args: ['other']
            })
            const dataToDecode: any = await window.ethereum.request({
                method: "eth_call",
                params: [{
                    from: "0x1CA2b10c61D0d92f2096209385c6cB33E3691b5E",
                    to: campaignFactoryAddress,
                    data: encodedTxData,
                    accessList: []
                }, null]
            })
            console.log(dataToDecode, encodedTxData, "LIST")
            if (dataToDecode?.length > 0) {
                const decode = decodeFunctionResult({
                    abi: CampaignFactoryABI,
                    functionName: 'getAddresses',
                    data: dataToDecode
                })
                console.log('DECODE: ', decode)
                setCampaigns((prevState) => {

                    let elementsToAdd = [];
                    if (Array.isArray(decode)) {
                        elementsToAdd = decode.filter((addr: string) => !prevState.includes(addr));
                    }
                    return [...prevState, ...elementsToAdd] as any
                })
            }
        } catch (err) {
            console.log(err)
        }
    }

    useEffect(() => {
        getLendCampaigns()
        getDexCampaigns()
        getNftCampaigns()
        getOtherCampaigns()
    }, [])

    useEffect(() => {
        console.log(campaigns, "CAMPAIGNS")
    }, [campaigns])


    return (
        <Container maxWidth="sm">
            <Typography variant="h6" color="primary" gutterBottom>
                Campaigns
            </Typography>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Campaign Address</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {campaigns.map((campaign) => {
                            return (
                                <CampaignListItem key={campaign} address={campaign} />
                            )
                        })}
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
    );
};

export default CampaignList;
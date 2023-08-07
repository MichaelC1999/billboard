'use client'

import React, { useState, useEffect } from "react";
import { Button, Container, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from "@material-ui/core";
import { Link } from "react-router-dom";
import { useRouter } from 'next/navigation'
import IntegratorListItem from "../../components/IntegratorListItem";
import { useContractRead, useContractReads } from "wagmi";
import { wagmiContractConfig } from "../../components/contracts";
import FactoryABI from "../../ABIs/Factory.json"
import { decodeFunctionResult, stringToHex, toBytes, zeroAddress } from "viem";
import { encodeFunctionData } from 'viem'


const IntegratorList = () => {
    const router = useRouter()
    const currentAccount = window.ethereum.selectedAddress;

    const integratorFactoryAddress = process.env.factoryAddress;
    const [integrators, setIntegrators] = useState<{ [x: string]: string[] }>({});

    const getIntegrators = async (category: string) => {
        try {
            const encodedTxData = encodeFunctionData({
                abi: FactoryABI,
                functionName: 'getIntegratorAddresses',
                args: [category]
            })
            const dataToDecode: any = await window.ethereum.request({
                method: "eth_call",
                params: [{
                    from: currentAccount,
                    to: integratorFactoryAddress,
                    data: encodedTxData,
                    accessList: []
                }, null]
            })
            if (dataToDecode?.length > 0) {
                const decode = decodeFunctionResult({
                    abi: FactoryABI,
                    functionName: 'getIntegratorAddresses',
                    data: dataToDecode
                })
                setIntegrators((prevState: any) => {
                    return { ...prevState, [category]: decode }
                })
            }
        } catch (err) {
            console.log(err)
        }
    }

    useEffect(() => {
        getIntegrators("lend")
        getIntegrators('dex')
        getIntegrators('nft')
        getIntegrators('other')
    }, [])

    return (
        <Container maxWidth="lg">
            <Typography variant="h6" color="primary" gutterBottom>
                Integrators
            </Typography>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Integrator Address</TableCell>
                            <TableCell>Category</TableCell>
                            <TableCell>Protocol Address</TableCell>
                            <TableCell>Enabled Functions</TableCell>
                            <TableCell>Ads Served</TableCell>
                            <TableCell>Revenue To Withdraw</TableCell>
                            <TableCell>Cumulative Revenue</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {Object.keys(integrators).map((category: string) => {
                            return (
                                <>
                                    {integrators[category].map((integratorAddress: string) => {
                                        return (
                                            <IntegratorListItem key={integratorAddress} category={category} address={integratorAddress} />
                                        )
                                    })}
                                </>
                            )
                        })}
                    </TableBody>
                </Table>
            </TableContainer>
            <Button
                variant="contained"
                color="primary"
                style={{ marginTop: '20px' }}
                onClick={() => router.push('/integrator/deploy')}
            >
                Deploy New Integrator
            </Button>
        </Container>
    );
};

export default IntegratorList;
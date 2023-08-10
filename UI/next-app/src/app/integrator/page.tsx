'use client'

import React, { useState, useEffect } from "react";
import { Button, Container, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, makeStyles, ThemeProvider, createMuiTheme, Box } from "@material-ui/core";
import { Link } from "react-router-dom";
import { useRouter } from 'next/navigation'
import IntegratorListItem from "../../components/IntegratorListItem";
import { useAccount, useContractRead, useContractReads } from "wagmi";
import { wagmiContractConfig } from "../../components/contracts";
import FactoryABI from "../../ABIs/Factory.json"
import { decodeFunctionResult, stringToHex, toBytes, zeroAddress } from "viem";
import { encodeFunctionData } from 'viem'
import { darkTheme } from "../../config/theme";
import Header from "../../components/Header";

const useStyles = makeStyles((theme) => ({
    table: {
        marginTop: theme.spacing(2),
    },
    button: {
        marginTop: theme.spacing(2),
        marginBottom: theme.spacing(2),
    },
    title: {
        marginTop: theme.spacing(2),
    },
    description: {
        marginTop: theme.spacing(2),
        marginBottom: theme.spacing(2),
    }
}));


const IntegratorList = () => {
    const classes = useStyles();
    const router = useRouter()
    const currentAccount = window.ethereum.selectedAddress;

    const integratorFactoryAddress = process.env.factoryAddress;
    const [integrators, setIntegrators] = useState<{ [x: string]: string[] }>({});

    const { isConnected } = useAccount()

    useEffect(() => {
        if (!isConnected) {
            window?.ethereum?.enable()
        }
    }, [])

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

    let integratorList = null
    let totalListlength = 0
    Object.keys(integrators).forEach((cat: string) => {
        totalListlength += integrators[cat].length;
    })
    if (totalListlength > 0) {
        integratorList = Object.keys(integrators).map((category: string) => {
            return (
                <>
                    {integrators[category].map((integratorAddress: string) => {
                        return (
                            <IntegratorListItem key={integratorAddress} category={category} address={integratorAddress} />
                        )
                    })}
                </>
            )
        })
    } else if (Object.keys(integrators).length === 4) {
        integratorList = (
            <TableRow>
                <TableCell>No Integrators Deployed</TableCell>
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
                <Typography variant="h3" color="primary" className={classes.title}>
                    Integrators
                </Typography>
                <TableContainer component={Paper} className={classes.table}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Integrator Address</TableCell>
                                <TableCell>Category</TableCell>
                                <TableCell>External Protocol Address</TableCell>
                                <TableCell>Enabled Functions</TableCell>
                                <TableCell>Ads Served</TableCell>
                                <TableCell>Revenue To Withdraw</TableCell>
                                <TableCell>Cumulative Revenue</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {integratorList}
                        </TableBody>
                    </Table>
                </TableContainer>
                <Button
                    variant="contained"
                    color="primary"
                    className={classes.button}
                    onClick={() => router.push('/integrator/deploy')}
                >
                    Deploy New Integrator
                </Button>
                <Typography variant="h6" color="primary" className={classes.description}>
                    Want to test out an integrator? Click on this button to be taken to "MintNFT", a dummy dApp with a functioning integrator
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    className={classes.button}
                    onClick={() => router.push('/MintNFT')}
                >
                    MintNFT Protocol
                </Button>
            </Container>
        </ThemeProvider>
    </>);
};

export default IntegratorList;
'use client'

import React, { useState, useEffect } from "react";
import { Button, Container, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, makeStyles, ThemeProvider } from "@material-ui/core";
import { useRouter } from 'next/navigation'
import IntegratorListItem from "../../components/IntegratorListItem";
import FactoryABI from "../../ABIs/Factory.json"
import { decodeFunctionResult } from "viem";
import { encodeFunctionData } from 'viem'
import { darkTheme } from "../../config/theme";
import Header from "../../components/Header";
import IntegratorPage from "../../components/IntegratorPage";
import { NetworkSwitcher } from "../../components/NetworkSwitcher";
import ErrorPopup from "../../components/ErrorPopup";

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
    const router = useRouter();
    const currentAccount = window.ethereum.selectedAddress;
    const [account, setAccount] = useState<string | null>(currentAccount)
    const integratorFactoryAddress = process.env.NEXT_PUBLIC_FACTORY_ADDRESS;
    const [integrators, setIntegrators] = useState<{ [x: string]: string[] }>({});
    const [selectedIntegrator, setSelectedIntegrator] = useState<string>("")
    const [errorMessage, setErrorMessage] = useState<string>("")


    useEffect(() => {
        if (!window.ethereum.isConnected() || !currentAccount) {
            window?.ethereum?.enable()
        }
        window.ethereum.on('accountsChanged', (accounts: any) => setAccount(accounts[0]));
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
        } catch (err: any) {
            setErrorMessage(err?.message)
        }
    }

    useEffect(() => {
        if (window.ethereum.networkVersion == process.env.NEXT_PUBLIC_CHAIN_ID) {
            getIntegrators("lend")
            getIntegrators('dex')
            getIntegrators('nft')
            getIntegrators('other')
        }
    }, [account])

    if (selectedIntegrator) {
        return <IntegratorPage integratorAddress={selectedIntegrator} closeIntegrator={() => setSelectedIntegrator("")} />
    }

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
                            <IntegratorListItem key={integratorAddress} category={category} address={integratorAddress} setErrorMessage={setErrorMessage} selectIntegrator={(x: string) => setSelectedIntegrator(x)} />
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
    } else {
        // This should display something to tell a user to sign into metamask and then refresh
    }

    return (<>
        <Header />
        <ThemeProvider theme={darkTheme}>
            <NetworkSwitcher />
            <ErrorPopup errorMessage={errorMessage} errorMessageCallback={() => setErrorMessage("")} />
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
                    onClick={() => router.push('/MintNFT')}
                >
                    MintNFT Protocol
                </Button>
            </Container>
        </ThemeProvider>
    </>);
};

export default IntegratorList;
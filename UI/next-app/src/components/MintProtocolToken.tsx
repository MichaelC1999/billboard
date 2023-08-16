import { Button, TextField, Typography, CircularProgress, Container, Grid, makeStyles } from "@material-ui/core";
import ProtocolTokenABI from "../ABIs/ProtocolToken.json"
import { BaseError, decodeEventLog, encodeFunctionData } from "viem";
import { useState } from "react";
import ErrorPopup from "./ErrorPopup";

const useStyles = makeStyles((theme) => ({
    button: {
        marginTop: theme.spacing(2),
        marginBottom: theme.spacing(2),
        width: '600px', // Button takes full width
    },
}));

function MintProtocolToken() {
    const classes = useStyles();
    const protocolTokenAddress: any = process.env.NEXT_PUBLIC_PROTOCOL_TOKEN_ADDRESS
    const currentAccount = window.ethereum.selectedAddress;
    const [errorMessage, setErrorMessage] = useState<string>("")

    const mintCall = async () => {

        const data = encodeFunctionData({
            abi: ProtocolTokenABI,
            functionName: 'mint',
            args: [currentAccount, 10 ** 20],

        })
        const txHash = await window.ethereum.request({
            "method": "eth_sendTransaction",
            "params": [
                {
                    to: protocolTokenAddress,
                    from: currentAccount,
                    data
                }
            ]
        });
        return txHash
    }

    async function waitForTransactionReceipt(ethereum: any, txHash: string) {
        return new Promise((resolve, reject) => {
            const interval = setInterval(async () => {
                try {
                    const receipt = await ethereum.request({
                        method: 'eth_getTransactionReceipt',
                        params: [txHash]
                    })

                    if (receipt && receipt.transactionHash) {
                        clearInterval(interval);
                        console.log(receipt)
                        resolve(receipt);
                    }
                } catch (error) {
                    clearInterval(interval);
                    reject(error);
                }
            }, 5000); // Poll every 5 seconds
        });
    }

    const handleMint = async () => {
        try {
            const hash: any = await mintCall()
            const res: any = await waitForTransactionReceipt(window.ethereum, hash)
            if (res) {
                const topics = decodeEventLog({
                    abi: protocolTokenAddress,
                    data: res.logs[0].data,
                    topics: res.logs[0].topics
                })
                const args: any = topics.args
                console.log(args)
            }
            setReceiptTxMint(hash)

        } catch (err: any) {
            setErrorMessage(err?.message)
        }
    }
    const [receiptTxMint, setReceiptTxMint] = useState<any>(null)

    return (<>
        <ErrorPopup errorMessage={errorMessage} errorMessageCallback={() => setErrorMessage("")} />
        <Container maxWidth="md" style={{ margin: "32px" }}>
            <Grid container direction="column" alignItems="center">
                <Typography variant="h6" color="primary">Need test tokens to fund a campaign? Mint with the button below!</Typography>
                <Button variant="contained" color="primary" disabled={window.ethereum.networkVersion + "" !== process.env.NEXT_PUBLIC_CHAIN_ID + ""} onClick={handleMint} className={classes.button}>
                    Mint 100 BILL
                </Button>

                {receiptTxMint && (
                    <Typography>Transaction Hash: {receiptTxMint}</Typography>
                )}
            </Grid>
        </Container>
    </>);
}

export default MintProtocolToken;
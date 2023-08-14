import { Button, TextField, Typography, CircularProgress, Container, Grid, makeStyles } from "@material-ui/core";
import { useContractWrite, useNetwork, useWaitForTransaction } from 'wagmi'
import ProtocolTokenABI from "../ABIs/ProtocolToken.json"
import { stringify } from '../utils/stringify'
import { BaseError } from "viem";

const useStyles = makeStyles((theme) => ({
    button: {
        marginTop: theme.spacing(2),
        marginBottom: theme.spacing(2),
        width: '600px', // Button takes full width
    },
}));

function MintProtocolToken() {
    const classes = useStyles();
    const { chain } = useNetwork();
    const protocolTokenAddress: any = process.env.protocolTokenAddress
    const currentAccount = window.ethereum.selectedAddress;

    const { write, data, error, isLoading, isError } = useContractWrite({
        abi: ProtocolTokenABI,
        address: protocolTokenAddress,
        functionName: 'mint',
    })

    const {
        data: receipt,
        isLoading: isPending,
        isSuccess,
    } = useWaitForTransaction({ hash: data?.hash })

    const handleMint = () => {
        write({
            args: [currentAccount, 10 ** 20],
        });
    }

    return (
        <Container maxWidth="md" style={{ margin: "32px" }}>
            <Grid container direction="column" alignItems="center">
                <Typography variant="h6" color="primary">Need test tokens to fund a campaign? Mint with the button below!</Typography>
                <Button variant="contained" color="primary" disabled={isLoading || window.ethereum.networkVersion + "" !== process.env.CHAIN_ID + ""} onClick={handleMint} className={classes.button}>
                    Mint 100 BILL
                </Button>

                {isLoading && <CircularProgress />}
                {isPending && <Typography>Transaction pending...</Typography>}
                {isSuccess && (
                    <Typography>Transaction Hash: {data?.hash}</Typography>
                )}
                {isError && <Typography color="error">{(error as BaseError)?.shortMessage}</Typography>}
            </Grid>
        </Container>
    );
}

export default MintProtocolToken;
import { Button, TextField, Typography, CircularProgress } from "@material-ui/core";
import { useContractWrite, useWaitForTransaction } from 'wagmi'
import ProtocolTokenABI from "../ABIs/ProtocolToken.json"
import { wagmiContractConfig } from './contracts'
import { stringify } from '../utils/stringify'
import { BaseError } from "viem";

function MintProtocolToken() {
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
        <div>

            <Typography variant="h6">Need test tokens to fund a campaign? Mint with the button below!</Typography>
            <Button variant="contained" color="primary" disabled={isLoading} onClick={handleMint}>
                Mint 100 BILL
            </Button>

            {isLoading && <CircularProgress />}
            {isPending && <Typography>Transaction pending...</Typography>}
            {isSuccess && (
                <>
                    <Typography>Transaction Hash: {data?.hash}</Typography>
                </>
            )}
            {isError && <Typography color="error">{(error as BaseError)?.shortMessage}</Typography>}
        </div>
    );
}

export default MintProtocolToken;
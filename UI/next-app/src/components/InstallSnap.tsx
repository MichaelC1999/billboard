'use client'

import { useContext, useEffect } from 'react'
import { Connected } from '../components/Connected'
import { connectSnap, getSnap } from '../utils'
import { MetaMaskContext } from '../hooks'
import { defaultSnapOrigin } from '../config'
import { Button, makeStyles } from '@material-ui/core'
import { useAccount } from 'wagmi'

const useStyles = makeStyles((theme) => ({
    button: {
        marginTop: theme.spacing(2),
        marginBottom: theme.spacing(2),
        minWidth: "256px"
    },
}));

export function InstallSnap({ displayManualInstall }: any) {
    const classes = useStyles();

    const { isConnected } = useAccount()

    useEffect(() => {
        if (!isConnected) {
            window?.ethereum?.enable()
        }
    }, [])


    useEffect(() => {
        const provider: any = window;
        const providerEth = provider.ethereum;
        isFlask(providerEth)

    }, [])

    const installBillboardSnap = async () => {
        await connectSnap(defaultSnapOrigin, "", {});
    }

    const isFlask = async (providerEth: any) => {
        try {
            const clientVersion = await providerEth?.request({
                method: 'web3_clientVersion',
            });
            const isFlaskDetected = (clientVersion as string[])?.includes('flask');

            const installedSnap = await getSnap();
            console.log(isFlaskDetected, providerEth, installedSnap)
            if (installedSnap?.id !== defaultSnapOrigin) {
                installBillboardSnap()
            }
            return Boolean(providerEth && isFlaskDetected);
        } catch {
            return false;
        }
    };

    let button = null;
    if (displayManualInstall) {
        button = <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
            <Button variant="contained" color="primary" onClick={installBillboardSnap} className={classes.button}>
                Install Billboard Snap
            </Button>
        </div>
    }

    return (<>
        {button}
    </>
    )
}

export default InstallSnap
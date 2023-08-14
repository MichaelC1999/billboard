import React, { useState } from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import { Box, Button, Typography } from '@material-ui/core';
import { chains } from '../wagmi';

export function NetworkSwitcher() {
  const [errorMessage, setErrorMessage] = useState<string>("")
  const chainToUse = chains.find((x: any) => x.id === process.env.CHAIN_ID);
  const chain: any = chains?.find((x: any) => x.id == window.ethereum.networkVersion)
  const switchNetwork = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0xe704' }],
      });
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask.
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: '0xe704',
                chainName: 'linea-testnet',
                rpcUrls: ["https://linea-goerli.infura.io/v3/" + process.env.INFURA_API_KEY],
              },
            ],
          });
        } catch (addError: any) {
          setErrorMessage(addError.message);
        }
      }
      setErrorMessage(switchError.message);
    }
  }

  if (window.ethereum.networkVersion == process.env.CHAIN_ID) {
    return null
  }

  return (
    <div>
      <Dialog open={true} aria-labelledby="network-switcher-title">
        <DialogTitle id="network-switcher-title">
          <Typography variant="h5" align="center">
            Network Switcher
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" alignItems="center" >
            <Typography variant="body1">
              This dApp is deployed on {chainToUse?.name}.
            </Typography>
            <Typography variant="body1">
              You are currently connected to {chain?.name ?? chain?.id}
            </Typography>

            {switchNetwork && (
              <Box mt={2}>
                {chainToUse ? (
                  <Button
                    key={chainToUse.id}
                    variant="contained"
                    color="primary"
                    onClick={() => switchNetwork()}
                  >
                    Switch to {chainToUse.name}
                  </Button>
                ) : (
                  chains.map((x) =>
                    x.id === chain?.id ? null : (
                      <Button
                        key={x.id}
                        variant="outlined"
                        color="default"
                        onClick={() => switchNetwork()}
                        style={{ margin: '5px' }}
                      >
                        {x.name}
                      </Button>
                    )
                  )
                )}
              </Box>
            )}

            <Box mt={2}>
              <Typography variant="body2" color="error">
                {errorMessage}
              </Typography>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </div>
  );
}

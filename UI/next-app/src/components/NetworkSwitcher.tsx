import React from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import { useSwitchNetwork } from 'wagmi';
import { Box, Button, Typography } from '@material-ui/core';

export function NetworkSwitcher() {
  const { chains, error, isLoading, pendingChainId, switchNetwork } = useSwitchNetwork();
  console.log('MNETWORKSWITCHER', chains)

  const chainToUse = chains.find((x: any) => x.id === process.env.CHAIN_ID);
  const currentChain: any = chains.find((x: any) => x.id === window?.ethereum?.networkVersion);

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
              You are currently connected to {currentChain?.name ?? currentChain?.id}
              {currentChain?.unsupported && ' (unsupported)'}
            </Typography>

            {switchNetwork && (
              <Box mt={2}>
                {chainToUse ? (
                  <Button
                    key={chainToUse.id}
                    variant="contained"
                    color="primary"
                    onClick={() => switchNetwork(chainToUse.id)}
                  >
                    Switch to {chainToUse.name}
                    {isLoading && chainToUse.id === pendingChainId && ' (switching)'}
                  </Button>
                ) : (
                  chains.map((x) =>
                    x.id === currentChain?.id ? null : (
                      <Button
                        key={x.id}
                        variant="outlined"
                        color="default"
                        onClick={() => switchNetwork(x.id)}
                        style={{ margin: '5px' }}
                      >
                        {x.name}
                        {isLoading && x.id === pendingChainId && ' (switching)'}
                      </Button>
                    )
                  )
                )}
              </Box>
            )}

            <Box mt={2}>
              <Typography variant="body2" color="error">
                {error?.message}
              </Typography>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </div>
  );
}

While Billboard itself does not need a front end, dApps looking to earn ad revenue need to integrate Billboard into their front end. After instantiating their Integrator contract, they have to install the Billboard Snap to display the ads and perfom verifications. There are three modifications to normal dApp transaction flow. Upon whatever behavior triggers the transaction call (button click, React event etc), implement the following steps:
- Insert the Snap trigger code snippet
- After the Snap executes and returns the `dataToSign` value, prompt the user to make a EIP-191 signature over this data
- Send the signature and the original, user intended function signature and arguments to the `routeInteraction()` function on your Integrator

Below is the Snap trigger code snippet mentioned above. This will connect UI elements to the RPC methods necessary to show the Snap.

```
const dataToSign = await window.ethereum.request({
    method: 'wallet_invokeSnap',
    params: { snapId: "npm:Billboard-Snap", request: { method: `signAd-${currentAddress}-${integratorAddress}` } },
});
```

As the development of Metamask Snaps continues progressing forwards, here are some features that will be included:
- Snap displays advertisement as an image, rather than just text format campaigns
- Possibly using the Keyring API to sign the ad content with the Snap for proof of view, making the verification system even more robust and abuse-resistant
- Prompting the user signature directly from the Snap, rather than passing data from the Snap through the frontend to be signed over.

Furthermore, the entire front end installation logic will be contained in a single React component, making integration as simple as importing a file.

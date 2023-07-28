import { OnRpcRequestHandler, OnTransactionHandler } from '@metamask/snaps-types';
import { heading, panel, text } from '@metamask/snaps-ui';

/**
 * Handle incoming JSON-RPC requests, sent through `wallet_invokeSnap`.
 *
 * @param args - The request handler args as object.
 * @param args.origin - The origin of the request, e.g., the website that
 * invoked the snap.
 * @param args.request - A validated JSON-RPC request object.
 * @returns The result of `snap_dialog`.
 * @throws If the request method is not valid for this snap.
 */
export const onRpcRequest: OnRpcRequestHandler = async ({ origin, request }) => {
  // If user address not accessible by API calls, include the user address in request.method title
  switch (request.method) {
    case 'signAd':
      const win: any = window

      // call getCurrentCampaignHash() on integrator contract
      // const hash = await win.ethereum.request({
      //   method: "eth_call",
      //   params: [{
      //     from: "0x0000000000000000000000000000000000000000",
      //     to: "0x5d9BDa36E79011d709315F49C61EeCa22DCEBc07",
      //     data: "0x0",
      //     accessList: []
      //   }, null]
      // })

      // const uint8Array = new Uint8Array(hash.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
      // const string = new TextDecoder().decode(uint8Array).replace(/[^\x20-\x7E]/g, '').trim();

      // //This call to the integrator displayCurrentAd() gets the campaign address
      // const campaignAddress = await win.ethereum.request({
      //   method: "eth_call",
      //   params: [{
      //     from: "0x0000000000000000000000000000000000000000",
      //     to: "0x5d9BDa36E79011d709315F49C61EeCa22DCEBc07",
      //     data: "0x0",
      //     accessList: []
      //   }, null]
      // })

      // // Call to the campaign contract to read its content at public var campaignContent
      // const campaignContent = await win.ethereum.request({
      //   method: "eth_call",
      //   params: [{
      //     from: "0x0000000000000000000000000000000000000000",
      //     to: campaignAddress,
      //     data: "0x0",
      //     accessList: []
      //   }, null]
      // })

      return snap.request({
        method: 'snap_dialog',
        params: {
          type: 'prompt',
          content: panel([
            text(`Hello, **${origin}**!`),
            // text(campaignContent),
            // text(
            //   'Copy this hash into the prompt to confirm receiving the ad campaign - ' + string,
            // ),
          ]),
        },
      });

    default:
      throw new Error('Method not found.');
  }
};

// button function calls verifyHash() function read with newHash to check if the newHash is now currentHash with the current nonce
// if so, set currentHash to newHash and newHash to ""
// else if currentHash is verified in verifyHash(), pass currentHash to front end
// Send currentHash to front end

export const onTransaction: OnTransactionHandler = async ({
  transaction,
  chainId,
  transactionOrigin,
}) => {
  const win: any = window
  //Get the hash passed in transaction data, this will be enforced as the first argument in applicable integrator functions
  const dataBytes: any = transaction.data;
  const hash = dataBytes.slice(10, 74);
  console.log(transaction, hash)

  // IMPORTANT STILL NEED TO DO STATE MANAGEMENT

  //Get the hash saved in state
  const state = await snap.request({
    method: 'snap_manageState',
    params: { operation: 'get' },
  });

  const stateHashEqual = state?.priorHash === hash;

  //Make a call to the integrator contract to confirm the hash
  const hashFromChain = await win.ethereum.request({
    method: "eth_call",
    params: [{
      from: "0x1CA2b10c61D0d92f2096209385c6cB33E3691b5E",
      to: "0x98718d0F57466fd780b1d01C55F5316429E68BAA",
      data: "0x3fdada7a8f7fc23dc4ff2bcf900f69a82ad88e3476dd57342c12c739aad579d703d6eaec",
      accessList: []
    }, null]
  })

  const list = await win.ethereum.request({
    method: "eth_call",
    params: [{
      from: "0x1CA2b10c61D0d92f2096209385c6cB33E3691b5E",
      to: "0x6A86FE3B8724622794e82f7398E9e55D0789Fe90",
      data: "0x39b64c308f7fc23dc4ff2bcf900f69a82ad88e3476dd57342c12c739aad579d703d6eaec",
      accessList: []
    }, "latest"]
  })

  let returnVal = null

  if (hash === hashFromChain) {
    returnVal = null //Needs to be a UI content item displaying the campaign content
    if (!stateHashEqual) {
      //Ad warning message to returnVal below campaign content
    }
    //Clear the snap state, as the transaction is assumed to be approved (based on the hashes matching). If it still fails, user will need to re init the hash signature
    await snap.request({
      method: 'snap_manageState',
      params: { operation: 'clear' },
    });
  } else {
    returnVal = null //UI content item displaying a warning message that tx will fail
  }

  console.log('CHECKING THE LOGS', transaction, transactionOrigin, window)

  return {
    content: panel([
      heading('My Transaction Insights'),
      text('Here are the insights:')
    ])
  };
};
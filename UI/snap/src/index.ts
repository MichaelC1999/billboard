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
  switch (request.method) {
    case 'signAd':
      const win: any = window
      console.log(Reflect.ownKeys(snap), Reflect.ownKeys(win.ethereum),)
      const res = await win.ethereum.request({
        method: "eth_call",
        params: [{
          from: "0x1CA2b10c61D0d92f2096209385c6cB33E3691b5E",
          to: "0x8a0E31de20651fe58A369fD6f76c21A8FF7f8d42",
          data: "0x95d89b41",
          accessList: []
        }, null]
      })

      const uint8Array = new Uint8Array(res.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
      const string = new TextDecoder().decode(uint8Array).replace(/[^\x20-\x7E]/g, '').trim();

      console.log('made 0x8a0E31de20651fe58A369fD6f76c21A8FF7f8d42')

      await snap.request({
        method: 'snap_manageState',
        params: { operation: 'update', newState: { hello: 'world' } },
      });
      console.log('SAVED')
      return snap.request({
        method: 'snap_dialog',
        params: {
          type: 'confirmation',
          content: panel([
            text(`Hello, **${origin}**!`),
            text('This custom confirmation is just for display purposes.'),
            text(
              'But you can edit the snap source code to make it do something, if you want to!',
            ),
          ]),
        },
      });
    default:
      throw new Error('Method not found.');
  }
};

export const onTransaction: any = async ({
  transaction,
  chainId,
  transactionOrigin,
}) => {
  console.log('CHECKING THE LOGS 123', transaction, transactionOrigin, window)

  // At a later time, get the data stored.
  const persistedData = await snap.request({
    method: 'snap_manageState',
    params: { operation: 'get' },
  });

  console.log(persistedData);
  return {
    content: panel([
      heading('My Transaction Insights'),
      text('Here are the insights:')
    ])
  };
};
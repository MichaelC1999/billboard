import { OnTransactionHandler } from '@metamask/snaps-types';
import { heading, panel, text } from '@metamask/snaps-ui';


export const onTransaction: OnTransactionHandler = async ({
  transaction,
  chainId,
  transactionOrigin,
}) => {
  const win: any = window
  //Get the hash passed in transaction data, this will be enforced as the first argument in applicable integrator functions
  const dataBytes: any = transaction.data;
  const fromAddress: any = transaction.from;
  console.log(transaction)

  // Only execute on "interactionTriggered()" transactions
  if (dataBytes.slice(0, 10) !== "0xfa51cde5") {
    console.log('INVALID FUNC')
    return;
  }

  const displayCurrentAdSignature = "0x4b54c97c";
  const currentAdForUserInBytes = await win.ethereum.request({
    method: "eth_call",
    params: [{
      from: transaction.from,
      to: transaction.to,
      data: displayCurrentAdSignature,
      accessList: []
    }, null]
  })
  console.log(currentAdForUserInBytes, "CURRENT CAMPIGN ADDR")
  const currentAdForUser = "0x" + currentAdForUserInBytes.slice(26, 66)
  console.log(dataBytes, 'DATA PASSING IN TX, GET SIG')

  // Pull out the signature bytes from the interactionTriggered() transaction data
  // Make read call to integrator to verify the signature pertains to the user making the transaction
  // Check will be made with signature here to validateUserSignature() on integrator
  // response gets set to isValid
  const isValid = true

  let returnVal: any = []

  const contentFunctionSignature = "0xdfff0b20"
  // fetch the ad campaign content
  const campaignContent = await win.ethereum.request({
    method: "eth_call",
    params: [{
      from: transaction.from,
      to: currentAdForUser,
      data: contentFunctionSignature,
      accessList: []
    }, null]
  })

  const uint8Array = new Uint8Array(campaignContent.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
  const string = new TextDecoder().decode(uint8Array).replace(/[^\x20-\x7E]/g, '').trim();

  if (!!string) {
    returnVal.push(text("Ad Content: " + string));
  } else {
    returnVal.push(text("Ad campaign returned no content"));
  }

  if (!isValid) {
    returnVal.unshift(heading('WARNING: Signature passed to interaction is invalid. Function will revert. Sign the ad message for a succesful interaction.'));
  }

  console.log('CHECKING THE LOGS', transaction, transactionOrigin, campaignContent, string)

  return {
    content: panel(returnVal)
  };
};
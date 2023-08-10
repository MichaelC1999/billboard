import { OnRpcRequestHandler } from '@metamask/snaps-types';
import { heading, panel, text } from '@metamask/snaps-ui';

export const onRpcRequest: OnRpcRequestHandler = async ({ origin, request }) => {
  const type = request.method.split("-")[0];
  const userAddress = request.method.split("-")[1];
  const integratorAddress = request.method.split("-")[2];

  const win: any = window

  if (type !== "signAd") {
    return;
  }

  const displayCurrentAdSignature = "0x4b54c97c";
  const currentAdForUserInBytes = await win.ethereum.request({
    method: "eth_call",
    params: [{
      from: userAddress,
      to: integratorAddress,
      data: displayCurrentAdSignature,
      accessList: []
    }, null]
  })
  console.log(currentAdForUserInBytes, "CURRENT CAMPIGN ADDR")
  const currentAdForUser = "0x" + currentAdForUserInBytes.slice(26, 66)

  const isValid = true

  let returnVal: any = []
  let dialogType: any = "alert"

  const contentFunctionSignature = "0xdfff0b20"
  // fetch the ad campaign content
  const campaignContent = await win.ethereum.request({
    method: "eth_call",
    params: [{
      from: userAddress,
      to: currentAdForUser,
      data: contentFunctionSignature,
      accessList: []
    }, null]
  })

  const uint8Array = new Uint8Array(campaignContent.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
  const string = new TextDecoder().decode(uint8Array).replace(/[^\x20-\x7E]/g, '').trim();
  const hashBuffer = await crypto.subtle.digest('SHA-256', uint8Array);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');

  if (!!string) {
    returnVal.push(text("Ad Content: " + string + '\n\n\n\n\nCopy the following hash and place it into the input box: \n\n' + hashHex));
    dialogType = "prompt"
  } else {
    returnVal.push(text("Ad campaign returned no content"));
  }

  if (!isValid) {
    returnVal.unshift(heading('WARNING: Signature passed to interaction is invalid. Function will revert. Sign the ad message for a succesful interaction.'));
  }

  return snap.request({
    method: 'snap_dialog',
    params: {
      type: dialogType,
      content: panel(returnVal)
    }
  })

}

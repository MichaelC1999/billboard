# BILLBOARD

Billboard is a decentralized advertising platform for DeFi protocols, DAOs, and other smart contract-based entities. The platform utilizes Metamask Snaps, which are integrated into the user interface of dApps to enable protocols to earn revenue by displaying ads within Snaps while also providing marketing services for decentralized protocols.

This platform introduces a new revenue stream and marketing strategies for protocols without the need for centralized elements. The Billboard Snap seamlessly integrates into existing UIs, displaying the ad at the most engaging point of the UX flow without being obtrusive. The smart contract architecture is designed to be backward-compatible with most existing smart contracts.

Digital Marketing is a $500 billion dollar industry. As Web3 continues to grow, there's still a need for decentralized, scalable, abuse-resistant marketing protocols. Metamask Snaps provide the perfect environment for this solution.

This project was developed for the Consensys NAVH Hackathon.

## REPO STRUCTURE

`UI/next-app` contains the next.js front end for the Campaigns/Integrators dashboard and the "MintNFT" example protocol front end
`UI/snap` contains the project for the Billboard snap

`protocol-hardhat` directory contains the solidity contract code and deployment environment for Hardhat
`protocol-truffle` directory contains the same solidity contract code and a Truffle deployment environment 

## Table of Contents

- [INTRO](#BILLBOARD)
- [REPO STRUCTURE](#REPO-STRUCTURE)
  - [UI/next-app](#UInext-app)
  - [UI/snap](#UIsnap)
  - [protocol-hardhat](#protocol-hardhat)
  - [protocol-truffle](#protocol-truffle)
- [CONTRACTS](#CONTRACTS)
  - [Factory Contract](#Factory-Contract)
  - [Campaign Contract](#Campaign-Contract)
  - [Integrator Contract](#Integrator-Contract)
  - [Treasury Contract](#Treasury-Contract)
- [FRONT END](#FRONT-END)
  - [Snap Trigger Code Snippet](#Snap-Trigger-Code-Snippet)
  - [MintNFT](#MintNFT)
- [BOUNTIES](#BOUNTIES)
- [NEXT STEPS AND FEEDBACK](#NEXT-STEPS-AND-FEEDBACK)
  - [Next Steps](#Next-Steps)
    - [Snaps Essential Feature Requests](#Essential-Features)
    - [Nice-to-Have Improvements](#Nice-to-Have-Improvements)
- [GLOSSARY](#GLOSSARY)
  - [Campaign](#Campaign)
  - [Integrator](#Integrator)
  - [External Protocol](#External-Protocol)

## CONTRACTS

Here is a flowchart showing the main contracts and how they relate to each other

![](./UI/next-app/src/img/contractsFlowchart.png) 

### Factory Contract

The Factory contract is a manager for deploying and registering other contracts on the Billboard protocol. It has functions that deploy new instances of contracts and assign ad campaigns to users.

### Campaign Contract

Campaigns are contracts that hold content and metadata about an advertisement campaign. They are deployed through a factory contract and designed to be creatable from other protocols. While the functionality is designed to be callable from external smart contracts or from within a Governance vote, anyone can call the factory's `deployNewCampaign()` function and launch their advertising campaign. Using filtering and categorization, this ad gets assigned to users and displayed when they interact with other dApps that enable Billboard for ad revenue.

Currently, the ad content is limited to text format. However, a Snaps UI capable of rendering images would serve a JPG ad saved on the contract as an IPFS URI. Also, Billboard plans to draft marketing guidelines and outsource Campaign approval to a judgment protocol like UMA or Kleros to ensure that ad campaigns are appropriate and follow standards.

The revenue earned per ad view is currently hardcoded. One of the upcoming tasks is to develop a dynamic bidding price system that accounts for more factors and filtering. For development purposes, ad spend is denominated and transacted in the Billboard Protocol token (BILL). In production, this will likely change to USDC/DAI.

Below is a flowchart demonstrating how a Campaign is launched and how it gets assigned to users:

![](./UI/next-app/src/img/campaignFlowchart.png)

### Integrator Contract

An Integrator contract pertains to dApps looking to display ads as a revenue source. A dApp looking to implement Billboard ads will deploy a new instance of this Integrator contract. The Integrator acts as middleware between the front end and the dApp’s on-chain functions. The Integrator contract verifies on-chain that an ad was served using encryption.

Currently, this verification is made by a user making a signature on the front end over data served in the Billboard Snap. Potentially, with the keyring API, it will be possible to build a closed-circuit encryption system that proves the user was served the ad and viewed it inside the snap.

After performing verifications, the Integrator registers the ad view and then executes the call made to the external protocol, completing the original transaction the user intended to make. The Integrator assigns the user a new ad to be viewed on their next interaction with the protocol. This contract is compatible with most existing smart contracts, opening up new business models and income streams for any protocol.

After registering ad views, the revenue is held in the Treasury contract and can be withdrawn by accounts approved by the Integrator deployer.

![](./UI/next-app/src/img/integratorFlowchart.png) 


### Treasury Contract

The Treasury contract handles the ledger and the entirety of token balances on the protocol. The ad spend/revenue mechanism is based on an escrow system. When an ad is queued to a user on an Integrator, the Treasury moves the campaign's `spendPerDisplay` amount of ad spend to a "pending" ledger that makes both the Campaign and Integrator unable to withdraw. Once the user performs an interaction and confirms the ad was viewed, these tokens become available to the Integrator. The Treasury handles all of the token transfers in and out of the protocol. Campaign ad spend deposits transfer the tokens to the Treasury contract. The tokens remain on this contract until they are withdrawn, either as Integrator revenue or revoked ad spend. To protect revenues/deposits from illegitimate withdrawals, all withdrawal recipients must be predefined.

## FRONT END

While Billboard itself doesn't need a front end, dApps looking to earn ad revenue need to integrate Billboard into their front end. After instantiating their Integrator contract, they must install the Billboard Snap to display the ads and perform verifications. There are three modifications to the normal dApp transaction flow. Upon whatever behavior triggers the transaction call (button click, React event, etc.), implement the following steps:
- Insert the Snap trigger code snippet
- After the Snap executes and returns the `dataToSign` value, prompt the user to make a EIP-191 signature over this data
- Send the signature and the original, user-intended function signature and arguments to the `routeInteraction()` function on your Integrator.

Below is the Snap trigger code snippet mentioned above. This will connect UI elements to the RPC methods necessary to show the Snap.

```
const dataToSign = await window.ethereum.request({
    method: 'wallet_invokeSnap',
    params: { snapId: "npm:Billboard-Snap", request: { method: `signAd-${currentAddress}-${integratorAddress}` } },
});
```

As Metamask Snaps development progresses, here are some features to be included:
- Snap displays advertisements as images, not just text format campaigns.
- Possibly using the Keyring API to sign the ad content with the Snap for proof of view, enhancing the verification system.
- Prompt the user signature directly from the Snap instead of passing data from the Snap through the frontend.

Moreover, the entire front-end installation logic will be contained in a single React component, making integration as simple as importing a file.

### MintNFT

To further demonstrate how Billboard works and affects user experience, MintNFT was created as an example. This is a simple dApp where users can mint an NFT. MintNFT doesn't charge any fees; all the revenue comes from showing Billboard ads. When a user wants their NFT, they click the "MINT" button. This first triggers the Billboard Snap and shows the ad. The user copies the hash at the bottom of the Snap content and pastes it into the input. Then the user is prompted for a signature over that hash. After signing, MintNFT prompts a routeInteraction() call to their Integrator contract. Now MintNFT must pass the function signature of the method on their contract that executes the user's initial request. In this case, the action is to call the `MintNFT(address)` function. This has a bytes4 function signature of `0x54ba0f27`. The address we want to pass as the argument is whatever destination address will receive the NFT, for this example, it can be `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`. We pass the user signature, the function signature, and the bytes of function call data into `routeInteraction()`. The Integrator contract performs verifications, queues the user their next ad, allocates the earned ad revenue to the MintNFT protocol, and then executes `MintNFT(0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266)` on the MintNFT protocol contract. The user receives their new NFT, and MintNFT earns ad revenue.

### Contracts Dashboard

## BOUNTIES

## NEXT STEPS AND FEEDBACK

As Billboard continues to develop, only a handful of tasks remain before  MVP status. 

### Next steps

General Revision: Smoothing out the UI and refactoring contract code 

Campaign Standards Enforcement: Using UMA/Kleros, Billboard needs a mechanism to ensure all advertisements maintain a certain level of quality and relevance.

Enhanced Ad Assignment & Bidding: Optimize the process by which ads are allocated to platforms, and the bidding system that determines their placement.

Broad Integrator Compatibility: Enhance the range of integrators to ensure a wider spectrum of applications can incorporate Billboard's capabilities.

Simplified Front-End Installation: Streamline the installation process for a hassle-free integration on the client side.

#### Essential Features:
- Image Display: Introduce image-based ads for more diverse and engaging content.
- Keyring API: Once available, this will strengthen ad view validation by verifying and authenticating ad impressions within the snap. 

#### Nice-to-Have Improvements:

- Keccak Hashing in Snap: Import a library with Keccak 256 hashing to match EVM chains for consistency.
- Snap-Prompted Transaction Data: Allow Snaps to prompt transaction data/parameters for the user to authorize, making dApp interactions more modular within a Snap.
- Access to Connected Address: Improve the OnRPCHandler to readily provide the currently connected Metamask address, rather than passing the address through the method name.
- Contract Calling Library: Although `window.ethereum.request({method: "eth_call", ...})` works great to read on chain data, it would be great to have a utility that can accept a function signature and plain text inputs, facilitating on-chain data reads directly from the snap without manual byte conversion.


## GLOSSARY

### Campaign
A Campaign is a Contract that holds content and metadata about an advertisement
### Integrator
An Integrator is a specific contract within the Billboard protocol designed to function as middleware for a dApp receiving ad revenue. This contract is responsible for recording ad metrics and executing verifications that originate from the frontend interface. An Integrator gets deployed for each protocol looking to serve ads
### External Protocol
This term describes a protocol that earns ad revenue by routing their contract interactions through an Integrator contract and implements the Billboard Snap on their front end

# BILLBOARD

## TABLE OF CONTENTS

- [BILLBOARD](#billboard)
- [SUBMISSION DETAILS](#submission-details)
  - [Project Description](#project-description)
    - [Important Links](#important-links)
    - [Contract Addresses](#protocol-level-contract-addresses)
  - [Bounties](#bounties)
  - [Contributors](#contributors)
  - [Future Plans](#future-plans)
  - [Tooling Feedback](#tooling-feedback) 
    - [Essential Feature Requests](#essential-features)
    - [Nice-to-Have Improvements](#nice-to-have-improvements)
  - [Tech Stack](#tech-stack)
- [REPO STRUCTURE](#repo-structure)
- [CONTRACTS](#contracts)
  - [Factory Contract](#factory-contract)
  - [Campaign Contract](#campaign-contract)
  - [Integrator Contract](#integrator-contract)
  - [Treasury Contract](#treasury-contract)
- [FRONT END](#front-end)
  - [Environment Variables](#environment-variables)
  - [MintNFT](#mintnft)
- [GLOSSARY](#glossary)
  - [Campaign](#campaign)
  - [Integrator](#integrator)
  - [External Protocol](#external-protocol)


## SUBMISSION DETAILS

### Project Description

Billboard is a decentralized advertising platform for smart contract protocols. The platform utilizes Metamask Snaps, which are integrated into the user interface of dApps to enable protocols to earn revenue by displaying ad campaigns launched by other decentralized protocols.

This platform introduces a new revenue stream and marketing strategies for protocols without the need for centralized elements. The Billboard Snap seamlessly integrates into existing UIs, displaying the ad at the most engaging point of the UX flow without being obtrusive. The smart contract architecture is designed to be backward-compatible with most existing smart contracts.

Digital Marketing is a $500 billion dollar industry. As Web3 continues to grow, there's still a need for decentralized, scalable, abuse-resistant marketing protocols. Metamask Snaps provide the perfect environment for this solution.

This project was developed for the Consensys NAVH Hackathon.

#### What Problem Does Billboard Solve?

Web3 currently lacks a fully decentralized advertising platform. Digital marketing is a $500 Billion industry, but platforms like Google AdSense are centralized and incompatible with blockchain protocols. DAOs, DeFi protocols, and NFT platforms looking to advertise would have to take steps impossible to execute by Governance vote: opening a bank account and converting ad spend to fiat. Moreover, these platforms can't ensure that the specifics decided upon by token holders are faithfully executed in the ad campaigns.  Without access to these Web2 tools, protocols struggle to publicize their unique services, products, or promotions. Web2 advertising platforms let websites innovate by creating business models that were built off of the ad revenue earned from showing the user relevant ads embedded within free content. Traditional website ad display methods don't fit well within the Web3 environment, where the emphasis is more on transacting value than on consumable content. Even if there was a smart contract equivalent to AdSense, integrating this into a dApp front end would be a nightmare without some modular component to serve the ads. To accommodate ads, they would need to overhaul their front-end design, prove ad views are not manipulated, and potentially redeploy their smart contracts for compatibility.

Billboard presents a revolutionary solution to the Web3 advertising dilemma. In fully decentralized environment, Protocols can launch targeted advertising campaigns, reaching users based on specific criteria. The engaged users are already active in the crypto space, transacting on-chain and interacting with products similar to the advertisements. Billboard's unique design allows ads to be shown in a Metamask Snap, ensuring the user sees the ad at a pivotal moment in their transaction without being obnoxious. With the addition of the Keyring API, the Billboard protocol can guarantee ad view legitimacy, cryptographically ensuring users have seen the ad prior interacting with the dApp. This not only confirms the ad's effectiveness but also instills trust in the advertiser. What's more, Billboard's design ensures easy installation into dApp interfaces. The contract structure is backward compatible with the majority of existing smart contracts. Billboard makes it super easy for a dApp to start earning revenue by showing ads. As more dApps integrate ads into their UX, more protocols will see the value in putting their name in front of all these users, encouraging more dApps to cash in on ad revenue. Rather than just being a forkable smart contract, this design makes a network effect towards widespread adoption until Billboard is the go-to Web3 marketing solution.

#### Important Links

The Billboard Protocol is a set of smart contracts that are meant to be interfaced by other protocols. There is no Billboard frontend for an end user to interact with ads. With that said, there are dashboards for Campaigns and Integrators respectively. These help users visualize what each entity is, what data gets collected by each, and list out instances of these contracts. They also contain functionality to deploy Campaigns and Integrators, even though these were built to be deployed by other smart contracts.

MintNFT is an example dApp that has its own smart contracts + frontend, but uses a Billboard Integrator + Snap combination to display ads and earn revenue.

- [Billboard Homepage](https://billboard-alpha.vercel.app/)
- [Billboard Campaigns Dashboard](https://billboard-alpha.vercel.app/campaign)
- [Billboard Integrator Dashboard](https://billboard-alpha.vercel.app/integrator)
- [MintNFT Prototype](https://billboard-alpha.vercel.app/MintNFT)

#### Protocol Level Contract Addresses

Linea Goerli

- [Factory: 0x4Fc30D461B0f73680660Ee305882B8E0ddD65199](https://explorer.goerli.linea.build/address/0x4Fc30D461B0f73680660Ee305882B8E0ddD65199)
- [BILL Token: 0xE94dbD94bcF271a6204f7A00A0a6a761cac710C1](https://explorer.goerli.linea.build/address/0xE94dbD94bcF271a6204f7A00A0a6a761cac710C1)
- [Treasury: 0x6BA604cB8166f8D6b48346FB2a87521bBd9C07E0](https://explorer.goerli.linea.build/address/0x6BA604cB8166f8D6b48346FB2a87521bBd9C07E0)
- [MintNFT Integrator Example: 0x26A0B0b3F79884a9Ecbc85A5bFEAfE44d1daB46D](https://explorer.goerli.linea.build/address/0x26A0B0b3F79884a9Ecbc85A5bFEAfE44d1daB46D)

Sepolia

- [Factory: 0x47Fffb6baB17D7bEfEDf61140836715513C29a3B](https://sepolia.etherscan.io/address/0x47Fffb6baB17D7bEfEDf61140836715513C29a3B)
- [BILL Token: 0x632CcDA8DF45BC41049111598070bAc89FBbDB12](https://sepolia.etherscan.io/address/0x632CcDA8DF45BC41049111598070bAc89FBbDB12)
- [Treasury: 0x557573DbD2f05162AcEE65e00396FC53D15a0f86](https://sepolia.etherscan.io/address/0x557573DbD2f05162AcEE65e00396FC53D15a0f86)
- [MintNFT Integrator Example: 0x723bB8e64115A583643c500Df4151b00Cb0559aD](https://sepolia.etherscan.io/address/0x723bB8e64115A583643c500Df4151b00Cb0559aD)

### Bounties

#### To Infura and Beyond
  - Used in Hardhat/Truffle for deployments and testing
    - `protocol-hardhat/hardhat.config.js`
    - `protocol-truffle/truffle-config.js`
  - Infura's RPC services are known for their robustness and reliability, making them ideal for any decentralized protocol's production. Using Infura ensures high uptime and efficiency in the deployment and testing phase, ensuring Billboard remains decentralized and scalable as intended.
  - The endpoints for Linea Goerli ("https://linea-goerli.infura.io/v3/..."), Sepolia ("https://sepolia.infura.io/v3/..."), and Ethereum Goerli ("https://goerli.infura.io/v3/...") were used in developing Billboard
    - See [Contract Addresses](#protocol-level-contract-addresses) for deployments on these networks
  - The Infura API key is held in an environment variable `INFURA_API_KEY` rather than being exposed publicly in the code base

#### IYKYK Linea edition
  - See the [Project Description](#project-description) section for an overview of what Billboard solves and how it works
  - To run Billboard locally, navigate to `UI/next-app` directory. Set up the [environment variables](#environment-variables) and then call `npm run dev`.
  - Contract Links
    - Factory: https://explorer.goerli.linea.build/address/0x4Fc30D461B0f73680660Ee305882B8E0ddD65199
      - The Factory contract serves as a central manager for the Billboard protocol. It's responsible for deploying and registering new contracts. Moreover, it streamlines the process of assigning advertisement campaigns to users.
    - Protocol Token: https://explorer.goerli.linea.build/address/0xE94dbD94bcF271a6204f7A00A0a6a761cac710C1
      - BILL is the internal cryptocurrency for Billboard. Its primary function is to facilitate ad transactions within the ecosystem. For the development phase, ad expenditures are denominated in BILL.
    - Treasury: https://explorer.goerli.linea.build/address/0x6BA604cB8166f8D6b48346FB2a87521bBd9C07E0
      - The Treasury contract supervises the entire ledger and manages token balances within the system. From allocating funds for queued advertisements to overseeing the finalization of ad views, the Treasury is responsible for all token transfers, ensuring the integrity and transparency of transactions.
    - Campaign (Example): https://explorer.goerli.linea.build/address/0xBd8E26cb9fA294c322D7097f2354A8919E4B5A5c
      - The Campaign contract is an individual instance that stores content and metadata related to an advertising campaign. Each campaign is deployed through the factory contract and can be initiated from other protocols. This provided link is just a sample instance illustrating the concept.
    - Integrator (Example): https://explorer.goerli.linea.build/address/0xbFE840a8b74c66088efD2A8841DC89Cdc1a3EE8B
      - An Integrator contract gets deployed by dApps intending to showcase ads for revenue generation. It acts as an intermediary, bridging the gap between the user frontend and the on-chain functions of a dApp. This provided link is just a sample instance illustrating the concept.
    - MintNFT: https://explorer.goerli.linea.build/address/0x26A0B0b3F79884a9Ecbc85A5bFEAfE44d1daB46D
      - MintNFT serves as a prototype for protocols intending to utilize a Billboard Integrator contract. By doing so, MintNFT demonstrates how diverse protocols can adapt and leverage Billboard's advertising capabilities to foster new revenue streams and business models.

#### OH SNAP!
  - `UI/snap` contains the code base for the Billboard Snap
  - The Billboard snap is published at `npm:billboard-snap`
  - This Snap serves ad content to the front end and generates hashes that get passed to the integrator contract for verification that the ad was served
  - A live example is [MintNFT](https://billboard-alpha.vercel.app/MintNFT/), which was developed to serve as a prototype for protocols that want to earn ad revenue. 
    - When clicking on the `Mint Me an NFT` button, the Snap makes a read call to the Integrator contract for the current ad content assigned to the user
    - The ad content gets displayed, and the user confirms the ad view by copying the hash output by the snap into the prompt input
    - This gets signed over by the user and confirmed on chain
  - As Metamask Snaps develop further, Billboard could display image ad content and make use of the Keyring API for stronger verifications
  - For further reading about Snaps and their role in this project, go to the [FRONT END](#FRONT-END) section.

#### Make a Dapp That Slaps, No Cap
  - Project: BILLBOARD
  - See the [Project Description](#project-description) section for an overview of what Billboard solves and how it works
  - Products Used:
    - Infura
      - Used in Hardhat/Truffle for deployments and testing
      - `protocol-hardhat/hardhat.config.js`
      - `protocol-truffle/truffle-config.js`
    - Linea
      - The Billboard Protocol is deployed on Linea Goerli
      - See the `IYKYK Linea edition` point in this section for futher explanation and contract links
    - Snaps
      - `UI/snap` contains the code base for the Billboard Snap
    - Metamask Flask
      - The Flask Development build is necessary for implementing and testing the snaps
    - Truffle
      - I initially opted for Truffle to deploy Billboard's contracts but faced issues. Despite using the same contracts and standard migration scripts, Truffle's compiled builds mostly failed, with successful deployments having notably higher gas fees than Hardhat. It could be possible that some Truffle configurations would make these deployments more efficient, these transactions were all standard configs. Both "protocol-hardhat" and "protocol-truffle" environments are available in my repository to reproduce these results.
        - Hardhat Deployments:
          - [Protocol Token: .001 ETH](https://goerli.lineascan.build/tx/0x7b2564a8ed406e5fade3753e77fbe7c581a7a2132cadfeda97f69d391093f4af)
          - [Factory contract: .0092 ETH](https://goerli.lineascan.build/tx/0x576062fbdcbd5a30a324dc7f6ddf1657821280e50c34f634d06d4f2e9be3618a)
        - Truffle Deployments:
          - [Protocol token: .003 ETH](https://goerli.lineascan.build/tx/0xa51a8386d4e428e0901030d98b1fed3b1bae6da69d0da4fee1355309ce96c36a)
          - [Factory contract (Failed): .075 ETH](https://goerli.lineascan.build/tx/0x8c1475b7a394fcb545443978d1ec97ac0d509292dcbedc6091bd317b3f087203)

### Contributors

- Michael Manzano Carroll
  - Telegram: https://t.me/MichaelManzano
  - GitHub: https://github.com/MichaelC1999
  - Email: manzanotechnologiesinc@protonmail.com
  - Discord: manzanotechnologies

### Future Plans

As Billboard continues to develop, only a handful of tasks remain before MVP status. This includes:

- General Revision: Smoothing out the UI and refactoring contract code 

- Campaign Standards Enforcement: Using UMA/Kleros, Billboard needs a mechanism to ensure all advertisements maintain a certain level of quality and relevance.

- Enhanced Ad Assignment & Bidding: Optimize the process by which ads are allocated to platforms, and the bidding system that determines their placement.

- Broad Integrator Compatibility: Enhance the range of integrators to ensure a wider spectrum of applications can incorporate Billboard's capabilities.

- Simplified Front-End Installation: Streamline the installation process for a hassle-free integration on the client side.

For growth and scaling, Billboard will prioritize targeting protocols in need of ad revenue (Integrators) or user acquisition (Campaigns). Resources could be used to grow the protocol by subsidizing Campaign spends and Integrator revenues. Temporarily making it cheaper to fund campaigns and more lucrative to implement an Integrator would help adoption.

Integrator acquisition will emphasize quality over quantity. Adopting Billboard ads impacts the user experience, requiring evaluation of the protocol's business model and overall design. Ideally, early adopting Integrators would be high-traffic, low-margin dApps seeking to benefit from voluminous transactions without adjusting their fee structures. Initially, Integrator deployment will not be permissionless, until the abuse resistance system is air-tight. This precaution prevents potential misuse where bad actors could set up dummy integrator protocols to drain campaign funds. Another avenue for Integrator growth involves engaging with "frontend operators" or urging developers to design new frontends for established protocols, monetizing them through Billboard. Protocols like Liquity, which lacks an official frontend but has numerous "frontend operators", could replace their current kickback systems with Billboard Integrators. This approach would maintain revenue streams without the need to change fee structures.

Launching campaigns can be low investment for protocols that want to experiment with marketing on Billboard. Attracting Campaigns can be done through an airdrop of Bill tokens to existing protocols, providing them with credit to market their services. These credits could be accessed through a Governance vote, where token holders propose their protocol's campaign content.

### Tooling Feedback 

#### Essential Features:

- Image Display: Introduce image-based ads for more diverse and engaging content.
- Keyring API: Once available, this will strengthen ad view validation by verifying and authenticating ad impressions within the snap. 

#### Nice-to-Have Improvements:

- Keccak Hashing in Snap: Import a library with Keccak 256 hashing to match EVM chains for consistency.
- Snap-Prompted Transaction Data: Allow Snaps to prompt transaction data/parameters for the user to authorize, making dApp interactions more modular within a Snap.
- Access to Connected Address: Improve the OnRPCHandler to readily provide the currently connected Metamask address, rather than passing the address through the method name.
- Contract Calling Library: Although `window.ethereum.request({method: "eth_call", ...})` works great to read on chain data, it would be great to have a utility that can accept a function signature and plain text inputs, facilitating on-chain data reads directly from the snap without manual byte conversion.
- Snap Install Browser Event: In the injected provider, similar to how `window.ethereum.on` has event listeners for `accountChanged` and `chainChanged` it would be great to have a `snapInstalled` event to trigger behavior upon snap installation.

### Tech Stack

The following languages, tools and frameworks were used in writing and deploying the smart contracts comprising the Billboard Protocol:

- Solidity
- Remix IDE
- Hardhat
- Truffle
  - Deploying the same exact smart contracts were using significantly more gas than Hardhat.
  - See the Truffle section of the dApp bounty under [Bounties](#bounties)
- Infura RPC
- Linea Goerli, Sepolia, and Hardhat Localhost networks

For testing smart contracts, and building the dashboard/MintNFT frontends, the contracts were interfaced with the following stack:

- next.js
- Metamask Flask for Snaps support
- Viem for interacting with the blockchain, encoding data, and handling conversion between user friendly data with contract transaction data
- Metamask injected Ethereum provider API
  - Best handled initiating transactions, listening for chain/account events
- Wagmi for simplifying communication between user and chain and front end behaviors
  - Removed most Wagmi logic after deploying static build, providers nor hooks were working.
- Vercel for deploying static build

## REPO STRUCTURE

`UI/next-app` contains the next.js front end for the Campaigns/Integrators dashboard and the "MintNFT" example protocol front end

`UI/snap` contains the project for the Billboard snap


`protocol-hardhat` directory contains the solidity contract code and deployment environment for Hardhat

`protocol-truffle` directory contains the same solidity contract code and a Truffle deployment environment 

## CONTRACTS

Here is a flowchart showing the main contracts and how they relate to each other

![](./UI/next-app/src/img/contractsFlowchart.png) 

### Factory Contract

The Factory contract is a manager for deploying and registering other contracts on the Billboard protocol. It has functions that deploy new instances of contracts and assign ad campaigns to users.

### Campaign Contract

Campaigns are contracts that hold content and metadata about an advertisement campaign. They are deployed through a factory contract and designed to be creatable from other protocols. While the functionality is designed to be callable from external smart contracts or from within a Governance vote, anyone can call the factory's `deployNewCampaign()` function and launch their advertising campaign. Using filtering and categorization, this ad gets assigned to users and displayed when they interact with other dApps that enable Billboard for ad revenue.

Currently, the ad content is limited to text format. However, a Snaps UI capable of rendering images would serve a JPG ad saved on the contract as an IPFS URI. Also, Billboard plans to draft marketing guidelines and outsource Campaign approval to a judgment protocol like UMA or Kleros to ensure that ad campaigns are appropriate and follow standards.

The revenue earned per ad view is currently hardcoded. One of the upcoming tasks is to develop a dynamic bidding price system that accounts for more factors and filtering. For development purposes, ad spend is denominated and transacted in the Billboard Protocol token (BILL).

While Campaigns are meant to be more of a "backend" infrastructure for a protocol to interact with on chain, the [Billboard Campaign Dashboard](https://billboard-alpha.vercel.app/campaign) helps demonstrate how campaigns can be deployed, managed, and analyzed.

Below is a flowchart demonstrating how a Campaign is launched and how it ends up getting shown to users:

![](./UI/next-app/src/img/campaignFlowchart.png)

### Integrator Contract

An Integrator contract pertains to dApps looking to display ads as a revenue source. A dApp looking to implement Billboard ads will deploy a new instance of this Integrator contract. The Integrator acts as middleware between the front end and the dApp’s on-chain functions. The Integrator contract verifies on-chain that an ad was served using encryption.

Currently, this verification is made by a user making a signature on the front end over data served in the Billboard Snap. Potentially, with the keyring API, it will be possible to build a closed-circuit encryption system that proves the user was served the ad and viewed it inside the snap.

After performing verifications, the Integrator registers the ad view and then executes the call made to the external protocol, completing the original transaction the user intended to make. The Integrator assigns the user a new ad to be viewed on their next interaction with the protocol. This contract is compatible with most existing smart contracts, opening up new business models and income streams for any protocol.

Integrators are supposed to be connected to an existing protocols front end. There is a [Billboard Integrator Dashboard](https://billboard-alpha.vercel.app/integrator) for deploying a new integrator or viewing revenues and metrics on existing integrators.

After registering ad views, the revenue is held in the Treasury contract and can be withdrawn by accounts approved by the Integrator deployer.

![](./UI/next-app/src/img/integratorFlowchart.png) 


### Treasury Contract

The Treasury contract handles the ledger and the entirety of token balances on the protocol. The ad spend/revenue mechanism is based on an escrow system. When an ad is queued to a user on an Integrator, the Treasury moves the campaign's `spendPerDisplay` amount of ad spend to a "pending" ledger that makes both the Campaign and Integrator unable to withdraw. Once the user performs an interaction and confirms the ad was viewed, these tokens become available to the Integrator. The Treasury handles all of the token transfers in and out of the protocol. Campaign ad spend deposits transfer the tokens to the Treasury contract. The tokens remain on this contract until they are withdrawn, either as Integrator revenue or revoked ad spend. To protect revenues/deposits from illegitimate withdrawals, all withdrawal recipients must be predefined.

## FRONT END

While Billboard itself doesn't need a front end, dApps looking to earn ad revenue need to integrate Billboard into their front end. After instantiating their Integrator contract, they must install the Billboard Snap to display the ads and perform verifications. There are three modifications to the normal dApp transaction flow. Upon whatever behavior triggers the transaction call (button click, React event, etc.), implement the following steps:
- Insert the Snap trigger code snippet
- After the Snap executes and returns the `dataToSign` value, prompt the user to make a EIP-191 signature over this data
- Send the signature and the original, user-intended function signature and arguments to the `routeInteraction()` function on your Integrator.

Below is the Snap trigger code mentioned above. This will connect UI elements to the RPC methods necessary to show the Snap.

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

#### Environment Variables

In order to run the dashboard on a local next.js server, you must set the following environment variables:

`NEXT_PUBLIC_FACTORY_ADDRESS`: A string holding the address of the factory

`NEXT_PUBLIC_PROTOCOL_TOKEN_ADDRESS`: A string holding the address of the protocol token, the token that is used to fund campaigns, earn revenue etc

`NEXT_PUBLIC_TREASURY_ADDRESS`: A string holding the address of the Billboard treasury

`NEXT_PUBLIC_INFURA_API_KEY`: A string holding your Infura API key 

`NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID`: A string holding your WalletConnect Project Id

`NEXT_PUBLIC_CHAIN_ID`: The integer value of the chain Id that you are interacting with

### MintNFT

To further demonstrate how Billboard works and affects user experience, [MintNFT was created as an example](https://billboard-alpha.vercel.app/MintNFT). This is a simple dApp where users can mint an NFT. MintNFT doesn't charge any fees; all the revenue comes from showing Billboard ads. When a user wants their NFT, they click the "MINT" button. This first triggers the Billboard Snap and shows the ad. The user copies the hash at the bottom of the Snap content and pastes it into the input. Then the user is prompted for a signature over that hash. After signing, MintNFT prompts a routeInteraction() call to their Integrator contract. Now MintNFT must pass the function signature of the method on their contract that executes the user's initial request. In this case, the action is to call the `MintNFT(address)` function. This has a bytes4 function signature of `0x54ba0f27`. The address we want to pass as the argument is whatever destination address will receive the NFT, for this example, it can be `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`. We pass the user signature, the function signature bytes4, and the bytes of function call data into `routeInteraction()`. The Integrator contract performs verifications, queues the user their next ad, allocates the earned ad revenue to the MintNFT protocol, and then executes `MintNFT(0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266)` on the MintNFT protocol contract. The user receives their new NFT, and MintNFT earns ad revenue.

## GLOSSARY

### Campaign
A Campaign is a Contract that holds content and metadata about an advertisement
### Integrator
An Integrator is a specific contract within the Billboard protocol designed to function as middleware for a dApp receiving ad revenue. This contract is responsible for recording ad metrics and executing verifications that originate from the frontend interface. An Integrator gets deployed for each protocol looking to serve ads
### External Protocol
This term describes a protocol that earns ad revenue by routing their contract interactions through an Integrator contract and implements the Billboard Snap on their front end

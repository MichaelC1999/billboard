pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./CampaignFactory.sol";

/// @title Integrator
/// @author Michael Manzano
/// @notice This contract is for handling ad revenues for platforms integrating the Billboard protocol to their interaction flow
contract Integrator {

    address campaignFactory;

    address protocol;

    bytes32 protocolCategory;

    uint protocolAdPriceBucket;

    /// defaultAdCampaign is the campaign to show for users with nonce 0 or other cases where campaign selection has not been made
    address defaultAdCampaign = address(0);
    
    /// userToInteractionNonce holds the counter for number of times a user has interacted with the integrated protocol's campaign functions
    mapping(address => uint) userToInteractionNonce;

    /// userToCurrentAdSelected holds the current campaign to be displayed to a given user for this nonce
    mapping(address => address) private userToCurrentAdSelected;

    mapping(address => bytes32) private userToCampaignHash;

    mapping(address => uint) userToCampaignCountAtSelection;

    mapping(address => uint) userToPendingAmount;

    constructor(address integratingProtocol) {
        /// This contract should be deployed from the integrated protocols contracts. This contract deployment saves the msg.sender address 
        /// as the address that can validly call interactionTriggered and receives payouts
        campaignFactory = msg.sender;
        protocol = integratingProtocol;
    }

    function interactionTriggered(bytes32 hashPassed) external {
        /// IMPORTANT for the sake of development, we will assume for now the amount per ad is pulled from the campaign contract. In practice this will probably be calculated from other factors and changing from each request

        /// Take the userAddress+curentAdCampaignAddress hash passed in from function call, generate a hash from msg.sender + displayCurrentAd() and compare
        bytes32 onChainHash = sha256(abi.encodePacked(msg.sender, userToCurrentAdSelected[msg.sender], address(this)));
        require(onChainHash == hashPassed, "The interaction hash passed to the smart contract does not match the hash generated on chain.");

        /// -Current campaign pending balance subtracts ad spend, treasury transfers the spend amount from ad campaign to integrator
        /// Call campaignFactory.updatePendingSpend(userToCurrentAdSelected[msg.sender])

        address completedCampaignAddress = userToCurrentAdSelected[msg.sender];
        Campaign completedCampaign = Campaign(completedCampaignAddress);

        /// -Update campaign metrics
        completedCampaign.adExecuted();

        
        CampaignFactory factoryInstance = CampaignFactory(campaignFactory);
        factoryInstance.spendCompleted(completedCampaign.amount(), userToCurrentAdSelected[msg.sender]);
        

        /// -getCampaignForUser() called to select and save new campaign for user
        address campaignQueuedAddress = setUserAdToDisplay(sender);
        Campaign campaignQueued = Campaign(campaignQueuedAddress);
        
        /// -Add spend amount to new campaigns pending balance 
        factoryInstance.newPendingSpend(campaignQueued.amount(), campaignQueuedAddress);  

    }

    function displayCurrentAd() public view returns (address) {
        if (userToCurrentAdSelected[msg.sender] == address(0)) {
            return defaultAdCampaign;
        }
        /// check if userToCurrentAdSelected[msg.sender] instantiates as a campaign contract
        /// if not return defaultAdCampaign
        return userToCurrentAdSelected[msg.sender];
    }

    function getCurrentCampaignHash() external view returns (bytes32) {
        return sha256(abi.encodePacked(msg.sender, userToCurrentAdSelected[msg.sender], address(this)));
    }

    /// Should only be called from function that records an interaction has been made on the integrator protocol
    function setUserAdToDisplay(address sender) internal returns (address) {
        CampaignFactory factory = CampaignFactory(campaignFactory);
        (address newAdCampaign, uint campaignCount) = factory.getCampaignForUser(protocolCategory, sender, userToInteractionNonce[sender], userToCampaignCountAtSelection[sender]);
        userToCampaignCountAtSelection[sender] = campaignCount;
        userToCurrentAdSelected[sender] = newAdCampaign;

        userToInteractionNonce[sender] += 1;
        return newAdCampaign;
    }

    function displayAdOnTransactionSuccess(address sender) internal returns (address) {
        CampaignFactory factory = CampaignFactory(campaignFactory);
        (address newAdCampaign, ) = factory.getCampaignForUser(protocolCategory, sender, userToInteractionNonce[sender], userToCampaignCountAtSelection[sender]);

        ///Upon transaction success, display another ad in metamask snap
        ///This ad will be auto displayed by snap.
        ///Update campaign counter since the snap is known to have displayed the ad once
    }

    address currentWithdrawAssertion;
    function initiateWithdrawProfit() public {
        /// check assertion on UMA that integrator protocol transactions that constituted the profit are not fraudelent
    }

    function withdrawProfit() public {
        /// check assertion on UMA, require approved
        /// Call withdraw revenues function on treasury
    }
}

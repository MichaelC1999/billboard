pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./CampaignFactory.sol";

/// @title Integrator
/// @author Michael Manzano
/// @notice This contract is for handling ad revenues for platforms integrating the Billboard protocol to their interaction flow
contract Integrator {

    address campaignFactory;

    address parentAddress;

    bytes32 protocolCategory;

    uint protocolAdPriceBucket;

    /// defaultAdCampaign is the campaign to show for users with nonce 0 or other cases where campaign selection has not been made
    address defaultAdCampaign = address(0);
    
    /// userToInteractionNonce holds the counter for number of times a user has interacted with the integrated protocol's campaign functions
    mapping(address => uint) userToInteractionNonce;

    /// userToCurrentAdSelected holds the current campaign to be displayed to a given user for this nonce
    mapping(address => address) userToCurrentAdSelected;

    mapping(address => uint) userToCampaignCountAtSelection;

    constructor() {
        /// This contract should be deployed from the integrated protocols contracts. This contract deployment saves the msg.sender address 
        /// as the address that can validly call interactionTriggered and receives payouts
        parentAddress = msg.sender;
    }

    function interactionTriggered(address sender) external {
        /// This function should be called from the integrated protocol contract, not the end users provider 
        
        address newCampaignForUser = setUserAdToDisplay(sender);
        Campaign(newCampaignForUser).adQueued();
    }

    function displayCurrentAd() public view returns (address) {
        if (userToCurrentAdSelected[msg.sender] == address(0)) {
            return defaultAdCampaign;
        }
        /// check if userToCurrentAdSelected[msg.sender] instantiates as a campaign contract
        /// if not return defaultAdCampaign
        return userToCurrentAdSelected[msg.sender];
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

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./CampaignFactory.sol";
import "./Treasury.sol";

/// @title Campaign
/// @author Michael Manzano
/// @notice This contract is ad campaign contract logic
contract Campaign {

    bool enabled = false;

    uint public baseAdSpend;

    address campaignInitiator;

    address campaignFactoryAddress;

    string public campaignTitle;

    string public campaignContent;

    string campaignCategory;

    constructor(address initiator, string memory category, string memory protocolName, uint initialAdSpend, string memory campaignTitleParam, string memory campaignContentParam) {
        campaignInitiator = initiator;
        baseAdSpend = initialAdSpend;
        campaignFactoryAddress = msg.sender;
        campaignTitle = campaignTitleParam;
        campaignContent = campaignContentParam;
        campaignCategory = category;
        /// Upon deployment, initiate enabled as false and send an assertTruth UMA protocol call
        /// transfer USDC/DAI from protocol that initiated campaign to treasury
    }

    function remainingAvailableAdSpend() public view returns (uint) {
        address treasuryAddress = CampaignFactory(campaignFactoryAddress).treasuryAddress();
        Treasury treasury = Treasury(treasuryAddress);
        return treasury.getAvailableAdSpend();
    }

    function withdrawSpend(uint amount) public {
        if (amount < baseAdSpend) {
        baseAdSpend -= amount;
        } else {
            baseAdSpend = 0;
        }

        ///Reorder protocols in CampaignFactory by baseAdSpend
        /// transfer tokens back to campaignInitiator
    }

    function depositSpend(uint amount) public {

        baseAdSpend += amount;
        ///Reorder protocols in CampaignFactory by baseAdSpend
        /// transfer tokens to treasury
    }

    function adExecuted() public {
        /// This function records the effects from queueing an ad to a user
        /// Update local metrics
    }

    function enableCampaign() public {
        /// requires UMA protocol assertion as valid
        /// changes enabled variable on this contract and that of factory mapping
    }

    function disableCampaign() public {
        
    }

    function campaignRejected() public {
        /// if UMA assertion is rejected, refund all deposited ad spend
    }


}

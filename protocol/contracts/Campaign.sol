pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/// @title Campaign
/// @author Michael Manzano
/// @notice This contract is ad campaign contract logic
contract Campaign {

    bool enabled = false;

    uint baseAdSpend;

    address campaignInitiator;

    address campaignFactoryAddress;

    constructor(address initiator, bytes32 category, bytes32 protocolName, uint initialAdSpend) {
        /// Upon deployment, initiate campaign as disable and send an assertTruth UMA protocol call
        /// transfer USDC/DAI from protocol that initiated campaign to treasury
        campaignInitiator = initiator;
        baseAdSpend = initialAdSpend;
        campaignFactoryAddress = msg.sender;
    }

    function currentAdSpend() public view returns (uint) {
        /// get address(this) balance of USDC
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

    function adQueued() public {
        /// This function records the effects from queueing an ad to a user

        ///Transfer USDC from treasury to the integrator
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

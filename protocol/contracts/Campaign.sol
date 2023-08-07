pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./Factory.sol";
import "./Treasury.sol";

/// @title Campaign
/// @author Michael Manzano
/// @notice This contract is ad campaign contract logic
contract Campaign {

    bool enabled = false;
    uint public baseAdSpend;
    uint public cumulativeAdViews;
    uint public cumulativeAdQueued;
    address campaignInitiator;
    address factoryAddress;
    address treasuryAddress;
    string campaignCategory;
    string public campaignTitle;
    string public campaignContent;

    constructor(address initiator, address treasury, string memory category, string memory protocolName, uint initialAdSpend, string memory campaignTitleParam, string memory campaignContentParam) {
        campaignInitiator = initiator;
        treasuryAddress = treasury;
        if (keccak256(abi.encodePacked(category)) != keccak256(abi.encodePacked("fallback"))) {
            depositSpend(initialAdSpend);
        }
        factoryAddress = msg.sender;
        campaignTitle = campaignTitleParam;
        campaignContent = campaignContentParam;
        campaignCategory = category;
    }

    function incCumulativeAdViews() external {
        cumulativeAdViews += 1;
    }

    function incCumulativeAdQueued() external {
        cumulativeAdQueued += 1;
    }

    function remainingAvailableAdSpend() public view returns (uint) {
        Treasury treasury = Treasury(treasuryAddress);
        return treasury.getAvailableAdSpend();
    }

    function withdrawSpend(uint amount) public {
        require(msg.sender == campaignInitiator, "Campaign fund withdraw can only be initiated by campaign deployer.");
        if (amount < baseAdSpend) {
            baseAdSpend -= amount;
        } else {
            baseAdSpend = 0;
        }
        Treasury(treasuryAddress).campaignWithdraw(amount, campaignInitiator);
    }

    function depositSpend(uint amount) public {
        address initiator = msg.sender;
        if (initiator == address(this)) {
            initiator = campaignInitiator;
        }
        baseAdSpend += amount;
        Treasury(treasuryAddress).depositSpend(amount, initiator);
    }

    function enableCampaign() public {

    }

    function disableCampaign() public {
        
    }

    function campaignRejected() public {

    }


}

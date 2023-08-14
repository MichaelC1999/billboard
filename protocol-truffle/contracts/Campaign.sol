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
    uint public cumulativeAdViews = 0;
    uint public cumulativeAdQueued = 0;
    address factoryAddress;
    address treasuryAddress;
    string campaignCategory;
    string public campaignTitle;
    string public campaignContent;

    /// @notice Creates a new Campaign contract instance.
    /// @param initiator The address of the campaign initiator.
    /// @param treasury The address of the treasury contract.
    /// @param category The category of the campaign.
    /// @param protocolName The name of the protocol.
    /// @param initialAdSpend The initial ad spend.
    /// @param campaignTitleParam The title of the campaign.
    /// @param campaignContentParam The content of the campaign.
    constructor(
        address initiator,
        address treasury,
        string memory category,
        string memory protocolName,
        uint initialAdSpend,
        string memory campaignTitleParam,
        string memory campaignContentParam
        ) {
        treasuryAddress = treasury;
        if (keccak256(abi.encodePacked(category)) != keccak256(abi.encodePacked("fallback"))) {
            depositSpend(initialAdSpend, initiator);
        }
        factoryAddress = msg.sender;
        campaignTitle = campaignTitleParam;
        campaignContent = campaignContentParam;
        campaignCategory = category;
    }

    /// @notice Increments the cumulative ad view count by 1.
    function incCumulativeAdViews() external {
        cumulativeAdViews += 1;
    }

    /// @notice Increments the cumulative ad queue count by 1.
    function incCumulativeAdQueued() external {
        cumulativeAdQueued += 1;
    }

    /// @notice Retrieves the remaining available ad spend from the Treasury for this campaign, subtracting out all allocated pending spend
    /// @return The available ad spend.
    function remainingAvailableAdSpend() public view returns (uint) {
        Treasury treasury = Treasury(treasuryAddress);
        return treasury.getAvailableAdSpend();
    }

    /// @notice Withdraws a specified amount from the campaign fund.
    /// @param amount The amount to be withdrawn.
    /// @dev Only the approved campaign withdraw address can initiate this and receive the withdrawn assets
    function withdrawSpend(uint amount) public {
        require(msg.sender == Treasury(treasuryAddress).campaignWithdrawAddresses(address(this)), "Campaign fund withdraw can only be initiated by approved campaign withdraw address.");
        if (amount < baseAdSpend) {
            baseAdSpend -= amount;
        } else {
            baseAdSpend = 0;
        }
        Treasury(treasuryAddress).campaignWithdraw(amount);
    }

    /// @notice Deposits a specified amount to the campaign fund, adding to campaign spend
    /// @param amount The amount to be deposited.
    /// @param initiator The address initiating the deposit.
    function depositSpend(uint amount, address initiator) public {
        baseAdSpend += amount;
        Treasury(treasuryAddress).depositSpend(amount, initiator);
    }

}

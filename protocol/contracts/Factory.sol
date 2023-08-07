pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./Integrator.sol";
import "./Treasury.sol";
import "./ProtocolToken.sol";


/// @title Factory
/// @author Michael Manzano
/// @notice This contract is for deploying new ad campaign contracts
contract Factory {

    // Globals
    address private deployer;
    address public protocolToken;
    address public treasuryAddress;
    address public fallbackAddress;
    uint public totalCampaignCount;
    uint spendPerDisplay = 1e16; /// Currently the spendPerDisplay is hardcoded as .01 BILL, in implementation this will be calculated by factors on campaign + integrator
    uint public totalIntegratorCount = 0;

    string[] public categories = ["lend", "nft", "dex", "other"];

    mapping(address => bool) campaignOpen; /// This is for manually closing a campaign by campaign deployer or by UMA/Kleros vote
    mapping(address => bool) integratorOpen;
    mapping(uint => uint) internal campaignCountByType;
    mapping(uint => uint) internal integratorCountByType;
    mapping(uint => mapping(uint => address)) private campaignAddressesByCategory;
    mapping(uint => mapping(uint => address)) private integratorAddressesByCategory;
    mapping(uint => bool) public isCategory;

    event AddressEvent(address indexed _address);

    constructor(address tokenAddress) {
        deployer = msg.sender;
        protocolToken = tokenAddress;
        deployTreasury();
        for (uint i = 0; i < categories.length; i++) {
            isCategory[i] = true;
        }
        deployDefaultCampaign();
    }

    function deployDefaultCampaign() internal {
        Campaign campaignDeployed = new Campaign(address(this), treasuryAddress, "fallback", "Billboard", 0, "fallbackAddress", "THIS PROTOCOL USES BILLBOARD PROTOCOL BLA BLA BLA");
        address newCampaignAddress = address(campaignDeployed);
        fallbackAddress = newCampaignAddress;
        campaignOpen[newCampaignAddress] = true;
    }

    function deployNewCampaign(string memory category, string memory protocolName, uint initialAdSpend, string memory campaignTitleParam, string memory campaignContentParam) public {
        ///ProtocolToken(protocolToken).permit(msg.sender, treasuryAddress, initialAdSpend, deadline, v, r, s);

        require(initialAdSpend >= spendPerDisplay, "Ad Spend must be higher than the cost of spend per display");
        require(treasuryAddress != address(0), "Treasury needs to be initialized");
        Campaign campaignDeployed = new Campaign(msg.sender, treasuryAddress, category, protocolName, initialAdSpend, campaignTitleParam, campaignContentParam);
        address newCampaignAddress = address(campaignDeployed);
        uint catIndex = getCategoryIndex(category);
        campaignAddressesByCategory[catIndex][campaignCountByType[catIndex]] = newCampaignAddress;
        campaignCountByType[catIndex] += 1;
        campaignOpen[newCampaignAddress] = true;
        totalCampaignCount += 1;
        emit AddressEvent(newCampaignAddress);
    }

    // Modified deployNewIntegrator method to include record keeping for integrators
    function deployNewIntegrator(address protocolAddress, address withdrawAddress, string memory integratorCategory, string[] memory functionSignatures) external {
        Integrator integrator = new Integrator(protocolAddress, withdrawAddress, integratorCategory, functionSignatures);
        integratorOpen[address(integrator)] = true;
        uint catIndex = getCategoryIndex(integratorCategory);
        integratorAddressesByCategory[catIndex][integratorCountByType[catIndex]] = address(integrator);
        integratorCountByType[catIndex] += 1;
        totalIntegratorCount += 1;
        emit AddressEvent(address(integrator));
    }

    function deployTreasury() internal {
        require(treasuryAddress == address(0), "Treasury has already been deployed");
        treasuryAddress = address(new Treasury(protocolToken, address(this)));
        emit AddressEvent(treasuryAddress);
    }

    function setProtocolToken(address tokenAddress) public {
        require(msg.sender == deployer, "Function can only be called by the original deployer of the factory");
        protocolToken = tokenAddress;
    }

    function getCampaignForUser(string memory category, address user, uint userNonce, uint campaignCountAtUser) public view returns (address, uint) {
        address integrator = msg.sender;
        uint count = campaignCountAtUser;
        uint catIdx = getCategoryIndex(category);
        if (campaignCountAtUser == 0) {
            count = campaignCountByType[catIdx];
        }

        uint campaignIndex = 0;
        address campaignAddress = address(0);
        uint index = 0;
        for (uint256 i = 0; i < count; i++) {
            index += 1;
            campaignIndex = uint(keccak256(abi.encodePacked(user, integrator, campaignIndex + userNonce))) % (count);
            if (campaignIsOpen(campaignAddressesByCategory[catIdx][campaignIndex]) == true) {
                campaignAddress = campaignAddressesByCategory[catIdx][campaignIndex];
                break;
            }
        }
        require(index > 0, "LOOP NEVER EXECUTED");
        return (campaignAddress, campaignCountByType[catIdx]);
    }

    function getCampaignAddresses(string memory category) external view returns(address[] memory) {
        //This function should be called by front end for each category
        uint catIdx = getCategoryIndex(category);
        require(msg.sender == deployer, "The address list can only be viewed by the contract deployer");
        if (campaignCountByType[catIdx] == 0) {
            return new address[](0);
        }
        address[] memory addresses = new address[](campaignCountByType[catIdx]);
        for(uint i = 0; i < campaignCountByType[catIdx]; i++){
            addresses[i] = campaignAddressesByCategory[catIdx][i];
        }
        return addresses;
    }

    function getCategoryIndex(string memory cat) public view returns (uint) {
        uint idx = 0;
        bool set = false;
        
        for(uint i = 0; i < categories.length; i++){
            if (keccak256(abi.encodePacked(categories[i])) == keccak256(abi.encodePacked(cat))) {
                idx = i;
                set = true;
            }
        }

        require(set == true, "Category not supported");
        return idx;
    }


    // New method to get integrator addresses for a category
    function getIntegratorAddresses(string memory category) external view returns(address[] memory) {
        // This function should be called by front end for each category
        uint catIdx = getCategoryIndex(category);
        require(msg.sender == deployer, "The address list can only be viewed by the contract deployer");
        if (integratorCountByType[catIdx] == 0) {
            return new address[](0);
        }
        address[] memory addresses = new address[](integratorCountByType[catIdx]);
        for(uint i = 0; i < integratorCountByType[catIdx]; i++){
            addresses[i] = integratorAddressesByCategory[catIdx][i];
        }
        return addresses;
    }

    function campaignIsOpen(address campaign) public view returns (bool) {
        uint remainingOpenSpend = Campaign(campaign).remainingAvailableAdSpend();
        if (campaignOpen[campaign] == false || remainingOpenSpend < spendPerDisplay) {
            return false;
        }
        return true;
    }

    function newPendingSpend(address campaign) external {
        require(campaignIsOpen(campaign) == true, "Campaign to update spend invalid or closed");
        require(integratorOpen[msg.sender] == true, "This function can only be called from an open integrator contract");
        Treasury(treasuryAddress).newPendingSpend(spendPerDisplay, campaign);
    }

    function spendCompleted(address campaign) external {
        require(campaignIsOpen(campaign) == true, "Campaign to update spend invalid or closed");
        require(integratorOpen[msg.sender] == true, "This function can only be called from an open integrator contract");
        Treasury(treasuryAddress).spendCompleted(spendPerDisplay, msg.sender, campaign);
    }
}

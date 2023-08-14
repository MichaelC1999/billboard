pragma solidity ^0.8.0;

import "./Integrator.sol";
import "./Treasury.sol";
import "./ProtocolToken.sol";


/// @title Factory
/// @author Michael Manzano
/// @notice This contract is for deploying other contracts and maintaining registries
contract Factory {

    // Globals
    address private deployer;
    address public protocolToken;
    address public treasuryAddress;
    address public fallbackAddress;
    uint public totalCampaignCount;
    uint spendPerView = 1e16; /// Currently the spendPerView is hardcoded as .01 BILL, in implementation this will be calculated by factors on campaign + integrator
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

    /// @notice Initializes a new Factory contract.
    /// @param tokenAddress The address of the protocol token.
    constructor(address tokenAddress) {
        deployer = msg.sender;
        protocolToken = tokenAddress;
        deployTreasury();
        for (uint i = 0; i < categories.length; i++) {
            isCategory[i] = true;
        }
        deployDefaultCampaign();
    }

    /// @notice Deploys the default campaign.
    /// @dev This default campaign is what is always displayed to a user at nonce 0 for a given integrator
    /// @dev This campaign explains that the protocol uses Billboard
    function deployDefaultCampaign() internal {
        Campaign campaignDeployed = new Campaign(address(this), treasuryAddress, "fallback", "Billboard", 0, "fallbackAddress", "THIS PROTOCOL USES BILLBOARD PROTOCOL. ALL TRANSACTIONS WITH THIS PROTOCOL GET ROUTED THROUGH AN INTEGRATOR CONTRACT. EVERY APPLICABLE INTERACTION WITH THIS PROTOCOL WILL SERVE ADVERTISEMENTS IN METAMASK. BY AUTHORIZING THIS INTERACTION YOU AGREE TO BE SHOWN ADS.");
        address newCampaignAddress = address(campaignDeployed);
        fallbackAddress = newCampaignAddress;
        campaignOpen[newCampaignAddress] = true;
    }

    /// @notice Deploys a new campaign.
    /// @param category The category of the new campaign - Must be in categories array defined above
    /// @param protocolName The name of the protocol associated with the campaign.
    /// @param initialAdSpend The initial ad spend for the campaign. This amount will be transfered from the deployment initiator to the treasury
    /// @param campaignTitleParam The title for the new campaign.
    /// @param campaignContentParam The content for the new campaign. Currently this is an advertisement in text format but later would likely be an IPFS URI pointing towards a jpg 
    /// @param managerAddress The address of the campaign manager. This manager is authorized to withdraw campaign spend
    function deployNewCampaign(string memory category, string memory protocolName, uint initialAdSpend, string memory campaignTitleParam, string memory campaignContentParam, address managerAddress) public {
        require(initialAdSpend >= spendPerView, "Ad Spend must be higher than the cost of spend per display");
        require(treasuryAddress != address(0), "Treasury needs to be initialized");
        Campaign campaignDeployed = new Campaign(msg.sender, treasuryAddress, category, protocolName, initialAdSpend, campaignTitleParam, campaignContentParam);
        address newCampaignAddress = address(campaignDeployed);
        if (managerAddress == address(0)) {
            managerAddress = msg.sender;
        }
        Treasury(treasuryAddress).setCampaignWithdrawAddress(newCampaignAddress, managerAddress);
        uint catIndex = getCategoryIndex(category);
        campaignAddressesByCategory[catIndex][campaignCountByType[catIndex]] = newCampaignAddress;
        campaignCountByType[catIndex] += 1;
        campaignOpen[newCampaignAddress] = true;
        totalCampaignCount += 1;
        emit AddressEvent(newCampaignAddress);
    }

    /// @notice Deploys a new integrator.
    /// @param protocolAddress The address of the contract whose functions will be routed through the integrator.
    /// @param withdrawAddress The address to receive withdrawals from integrator revenues 
    /// @param integratorCategory The category for the integrator - Must be in categories array defined above
    /// @param functionSignatures The function signatures on the contract that will be routed through the integrator
    /// @dev functionSignatures should not be in bytes format. Example of a correct function signature argument: "mintNFT(address)"
    function deployNewIntegrator(address protocolAddress, address withdrawAddress, string memory integratorCategory, string[] memory functionSignatures) external {
        Integrator integrator = new Integrator(protocolAddress, integratorCategory, functionSignatures);
        if (withdrawAddress == address(0)) {
            withdrawAddress = msg.sender;
        }
        Treasury(treasuryAddress).setIntegratorWithdrawAddress(address(integrator), withdrawAddress);
        integratorOpen[address(integrator)] = true;
        uint catIndex = getCategoryIndex(integratorCategory);
        integratorAddressesByCategory[catIndex][integratorCountByType[catIndex]] = address(integrator);
        integratorCountByType[catIndex] += 1;
        totalIntegratorCount += 1;
        emit AddressEvent(address(integrator));
    }

    /// @notice Deploys the treasury contract
    function deployTreasury() internal {
        require(treasuryAddress == address(0), "Treasury has already been deployed");
        treasuryAddress = address(new Treasury(protocolToken));
        emit AddressEvent(treasuryAddress);
    }

    /// @notice Sets the protocol token, campaign spend and revenues will be denominated in this token
    /// @param tokenAddress The address of the new protocol token.
    function setProtocolToken(address tokenAddress) public {
        require(msg.sender == deployer, "Function can only be called by the original deployer of the factory");
        protocolToken = tokenAddress;
    }

    /// @notice Assigns a campaign for a user.
    /// @param category The category to filter campaigns.
    /// @param user The address of the user.
    /// @param userNonce The nonce for the user on the calling integrator
    /// @param campaignCountAtUser The count of campaigns available to the user.
    /// @return The address of the newly selected campaign and the count of campaigns.
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
        return (campaignAddress, campaignCountByType[catIdx]);
    }

    /// @notice Gets an array of the addresses of campaigns in a category.
    /// @param category The category to filter campaigns.
    /// @return A list of campaign addresses.
    function getCampaignAddresses(string memory category) external view returns(address[] memory) {
        uint catIdx = getCategoryIndex(category);
        if (campaignCountByType[catIdx] == 0) {
            return new address[](0);
        }
        address[] memory addresses = new address[](campaignCountByType[catIdx]);
        for(uint i = 0; i < campaignCountByType[catIdx]; i++){
            addresses[i] = campaignAddressesByCategory[catIdx][i];
        }
        return addresses;
    }

    /// @notice Gets the index of a category.
    /// @param cat The category name.
    /// @return The index of the category.
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

    /// @notice Gets a list of the addresses of integrators in a category.
    /// @param category The category to filter integrators.
    /// @return A list of integrator addresses.
    function getIntegratorAddresses(string memory category) external view returns(address[] memory) {
        uint catIdx = getCategoryIndex(category);
        if (integratorCountByType[catIdx] == 0) {
            return new address[](0);
        }
        address[] memory addresses = new address[](integratorCountByType[catIdx]);
        for(uint i = 0; i < integratorCountByType[catIdx]; i++){
            addresses[i] = integratorAddressesByCategory[catIdx][i];
        }
        return addresses;
    }

    /// @notice Determines if a campaign is open and has sufficient spend to be assigned to a user
    /// @param campaign The address of the campaign.
    /// @return A boolean indicating if the campaign is open.
    function campaignIsOpen(address campaign) public view returns (bool) {
        uint remainingOpenSpend = Campaign(campaign).remainingAvailableAdSpend();
        if (campaignOpen[campaign] == false || remainingOpenSpend < spendPerView) {
            return false;
        }
        return true;
    }

    /// @notice Updates the pending spend for a campaign.
    /// @param campaign The address of the campaign.
    function newPendingSpend(address campaign) external {
        require(campaignIsOpen(campaign) == true, "Campaign to update spend invalid or closed");
        require(integratorOpen[msg.sender] == true, "This function can only be called from an open integrator contract");
        Treasury(treasuryAddress).newPendingSpend(spendPerView, campaign);
    }

    /// @notice Marks the completion of a spend for a campaign.
    /// @param campaign The address of the campaign.
    function spendCompleted(address campaign) external {
        require(campaignIsOpen(campaign) == true, "Campaign to update spend invalid or closed");
        require(integratorOpen[msg.sender] == true, "This function can only be called from an open integrator contract");
        Treasury(treasuryAddress).spendCompleted(spendPerView, msg.sender, campaign);
    }
}

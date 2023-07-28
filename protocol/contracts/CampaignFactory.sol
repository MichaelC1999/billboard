pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./Integrator.sol";
import "./Treasury.sol";

/// @title CampaignFactory
/// @author Michael Manzano
/// @notice This contract is for deploying new ad campaign contracts
contract CampaignFactory {
    address private deployer;

    address public protocolToken;

    address public treasuryAddress;

    uint public totalCampaignCount = 0;

    string[] public categories = ["lend", "nft", "dex", "other"];

    mapping(address => bool) integratorOpen;

    mapping(uint => uint) internal campaignCountByType;

    mapping(uint => mapping(uint => address)) private addressesByFilter;

    mapping(uint => bool) public isCategory;

    /// campaignInitialBalance only gets set when deploying a new campaign, or called from campaign contract to lower the initial balance on a withdraw
    /// Upon adding a new campaign to group or initial balance changing, need to reorder groupingNumber>IndexInGrouping mapping
    mapping(address => uint) private campaignInitialBalance;
    /// campaignOpen gets set on campaign deployment or called from campaign contract when balance is spent or manually disabled/enabled
    mapping(address => bool) campaignOpen;

    event AddressEvent(address indexed _address);

    function getCampaignForUser(string memory category, address user, uint userNonce, uint campaignCountAtUser) public view returns (address, uint) {
        address integrator = msg.sender;
        
        /// Should get random index (but deterministic based on the integrator and user nonce)
        uint campaignIndex = 0;
        uint catIdx = getCategoryIndex(category);
        address campaignAddress = address(0);
        for (uint256 i = 0; i < campaignCountAtUser; i++) {
            campaignIndex = uint(keccak256(abi.encodePacked(user, integrator, campaignIndex + userNonce))) % (campaignCountAtUser);
            if (campaignOpen[addressesByFilter[catIdx][campaignIndex]] == true) {
                campaignAddress = addressesByFilter[catIdx][campaignIndex];
                break;
            }
        }

        return (campaignAddress, totalCampaignCount);
    }

    function getAddresses(string memory category) external view returns(address[] memory) {
        //This function should be called by front end for each category
        uint catIdx = getCategoryIndex(category);
        require(msg.sender == deployer, "The address list can only be viewed by the contract deployer");
        if (campaignCountByType[catIdx] == 0) {
            return new address[](0);
        }
        address[] memory addresses = new address[](campaignCountByType[catIdx]);
        for(uint i = 0; i < campaignCountByType[catIdx]; i++){
            addresses[i] = addressesByFilter[catIdx][i];
        }
        return addresses;
    }

    constructor(address tokenAddress) {
        deployer = msg.sender;
        protocolToken = tokenAddress;
        deployTreasury();
        isCategory[0] = true;
        isCategory[1] = true;
        isCategory[2] = true;
        isCategory[3] = true;
        campaignCountByType[0] = 0;
        campaignCountByType[1] = 0;
        campaignCountByType[2] = 0;
        campaignCountByType[3] = 0;
    }

    function deployNewCampaign(string memory category, string memory protocolName, uint initialAdSpend, string memory campaignTitleParam, string memory campaignContentParam) external {
        // require category is in a list of approved category types
        uint catIndex = getCategoryIndex(category);
        Campaign campaignDeployed = new Campaign(msg.sender, category, protocolName, initialAdSpend, campaignTitleParam, campaignContentParam);
        address newCampaignAddress = address(campaignDeployed);
        addressesByFilter[catIndex][campaignCountByType[catIndex]] = newCampaignAddress;
        campaignCountByType[catIndex] += 1;
        totalCampaignCount += 1;
        emit AddressEvent(newCampaignAddress);
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

    function deployNewIntegrator() external {
        /// Deploy new integrator
        /// Add to registry on this contract
        /// This function must be called from the integrator protocol. The address that calls this function will be instantiated in some of the other function calls

        Integrator integrator = new Integrator(msg.sender);
        integratorOpen[address(integrator)] = true;
        emit AddressEvent(address(integrator));
    }

    function deployTreasury() internal {
        require(treasuryAddress == address(0), "Treasury has already been deployed");
        treasuryAddress = address(new Treasury(protocolToken, address(this)));
        emit AddressEvent(treasuryAddress);

    }

    function newPendingSpend(address campaign) external {
        require(campaignOpen[campaign] == true, "Campaign to update spend invalid or closed");
        require(integratorOpen[msg.sender] == true, "This function can only be called from an open integrator contract");
    }

    function spendCompleted(address campaign) external {
        require(campaignOpen[campaign] == true, "Campaign to update spend invalid or closed");
        require(integratorOpen[msg.sender] == true, "This function can only be called from an open integrator contract");
    }
}

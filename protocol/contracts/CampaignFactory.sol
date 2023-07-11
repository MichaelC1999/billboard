pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./Campaign.sol";

/// @title CampaignFactory
/// @author Michael Manzano
/// @notice This contract is for deploying new ad campaign contracts
contract CampaignFactory {
    address public protocolToken;

    uint campaignCount = 0;

    mapping(address => bool) integratorOpen;

    mapping(bytes32 => mapping(uint => address)) private addressesByFilter;

    /// campaignInitialBalance only gets set when deploying a new campaign, or called from campaign contract to lower the initial balance on a withdraw
    /// Upon adding a new campaign to group or initial balance changing, need to reorder groupingNumber>IndexInGrouping mapping
    mapping(address => uint) private campaignInitialBalance;
    /// campaignOpen gets set on campaign deployment or called from campaign contract when balance is spent or manually disabled/enabled
    mapping(address => bool) campaignOpen;

    function getCampaignForUser(bytes32 category, address user, uint userNonce, uint campaignCountAtUser) public view returns (address, uint) {
        address integrator = msg.sender;
        
        /// Should get random index (but deterministic based on the integrator and user nonce)
        uint campaignIndex = 0;

        address campaignAddress = address(0);
        for (uint256 i = 0; i < campaignCountAtUser; i++) {
            campaignIndex = uint(keccak256(abi.encodePacked(user, integrator, campaignIndex + userNonce))) % (campaignCountAtUser);
            if (campaignOpen[addressesByFilter[category][campaignIndex]] == true) {
                campaignAddress = addressesByFilter[category][campaignIndex];
                break;
            }
        }

        return (campaignAddress, campaignCount);
    }


    function initialize(address tokenAddress) external {
        protocolToken = tokenAddress;
    }

    function deployNewCampaign(bytes32 category, bytes32 protocolName, uint initialAdSpend) external {
        Campaign campaignDeployed = new Campaign(msg.sender, category, protocolName, initialAdSpend);
        address newCampaignAddress = address(campaignDeployed);

        campaignCount += 1;
    }

    function deployNewIntegrator() external {
        /// Deploy new integrator
        /// Add to registry on this contract
        /// This function must be called from the integrator protocol. The address that calls this function will be instantiated in some of the other function calls

        Integrator integrator = new Integrator(msg.sender);
        integratorOpen[address(integrator)] = true;
    }

    function newPendingSpend(uint amount, address campaign) external {
        require(campaignOpen[campaign] == true, "Campaign to update spend invalid or closed");
        require(integratorOpen[msg.sender] == true, "This function can only be called from an open integrator contract");
    }

    function spendCompleted(uint amount, address campaign) external {
        require(campaignOpen[campaign] == true, "Campaign to update spend invalid or closed");
        require(integratorOpen[msg.sender] == true, "This function can only be called from an open integrator contract");
    }
}

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/// @title Treasury
/// @author Michael Manzano
/// @notice This contract is for handling protocol level revenues
contract Treasury {
    address public protocolToken;
    address public campaignRegistry; 

    mapping(address => uint) campaignSpendPending;
    mapping(address => uint) campaignSpendRemaining;
    mapping(address => uint) integratorRevenueUncollected;
    mapping(address => uint) integratorRevenueWithdrawn;
    mapping(address => uint) integratorSourceCount;
    mapping(address => mapping(uint => address)) integratorRevenueSources;
    mapping(address => mapping(address => uint)) integratorRevenueBySource;
    
    constructor(address tokenAddress, address campaignRegistryAddress) {
        protocolToken = tokenAddress;
        campaignRegistry = campaignRegistryAddress;
    }
    
    function depositSpend(uint amount, address initiator) public {
        campaignSpendRemaining[msg.sender] += amount;
        IERC20(protocolToken).transferFrom(initiator, address(this), amount);
    }
    
    function newPendingSpend(uint amount, address campaign) external returns (uint newPendingBalance) {
        require(msg.sender == campaignRegistry, "This function can only be called by the campaign registry contract");
        return campaignSpendPending[campaign] += amount;
    }

    function campaignWithdraw(uint amount, address campaignInitiator) external {
        require((campaignSpendRemaining[msg.sender] - campaignSpendPending[msg.sender]) >= amount, "Cannot withdraw more than remaining spend");
        campaignSpendRemaining[msg.sender] -= amount;
        IERC20(protocolToken).transfer(campaignInitiator, amount);
    }

    function integratorWithdraw(uint amount, address integratorInitiator) external {
        require(integratorRevenueUncollected[msg.sender] >= amount, "Cannot withdraw more than uncollected revenues allocated to integrator");
        integratorRevenueUncollected[msg.sender] -= amount;
        integratorRevenueWithdrawn[msg.sender] += amount;
        IERC20(protocolToken).transfer(integratorInitiator, amount);
    }

    function spendCompleted(uint amount, address integrator, address campaign) external returns (uint newActualBalance) {
        require(msg.sender == campaignRegistry, "This function can only be called by the campaign registry contract");
        campaignSpendPending[campaign] -= amount;
        campaignSpendRemaining[campaign] -= amount;
        integratorRevenueUncollected[integrator] += amount;
        if (integratorRevenueBySource[integrator][campaign] > 0) {
            integratorRevenueBySource[integrator][campaign] += amount;
        } else {
            integratorRevenueBySource[integrator][campaign] += amount;
            integratorSourceCount[integrator] += 1;
            integratorRevenueSources[integrator][integratorSourceCount[integrator]] = campaign;
        }
        return campaignSpendRemaining[campaign];
    }

    function getAvailableAdSpend() external view returns (uint) {
        return (campaignSpendRemaining[msg.sender] - campaignSpendPending[msg.sender]);
    }

    function cumulativeIntegratorRevenue() public view returns (uint) {
        return integratorRevenueUncollected[msg.sender] + integratorRevenueWithdrawn[msg.sender];
    }

    function integratorRevenueUncollectedForUser() public view returns (uint) {
        return integratorRevenueUncollected[msg.sender];
    }
}

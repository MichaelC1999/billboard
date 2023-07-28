pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/// @title Treasury
/// @author Michael Manzano
/// @notice This contract is for handling protocol level revenues
contract Treasury {
    address public protocolToken;
    address public campaignRegistry; 

    constructor(address tokenAddress, address campaignRegistryAddress) {
        protocolToken = tokenAddress;
        campaignRegistry = campaignRegistryAddress;
    }

    mapping(address => uint) campaignSpendPending;
    mapping(address => uint) campaignSpendRemaining;
    mapping(address => uint) integratorRevenueUncollected;
    mapping(address => uint) integratorSourceCount;
    mapping(address => mapping(uint => address)) integratorRevenueSources;
    mapping(address => mapping(address => uint)) integratorRevenueBySource;
    
    function newPendingSpend(uint amount, address campaign) external returns (uint newPendingBalance) {
        require(msg.sender == campaignRegistry, "This function can only be called by the campaign registry contract");
        return campaignSpendPending[campaign] += amount;
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

    function clearRevenueSources(address integrator) internal {
        uint count = integratorSourceCount[integrator];

        for (uint256 i = 0; i < count; i++) {
            address source = integratorRevenueSources[integrator][count];
            integratorRevenueBySource[integrator][source] = 0;
            integratorRevenueSources[integrator][count] = address(0);
        }

        integratorSourceCount[integrator] = 0;
    }

    function getAvailableAdSpend() external view returns (uint) {
        return (campaignSpendRemaining[msg.sender] - campaignSpendPending[msg.sender]);
    }
}

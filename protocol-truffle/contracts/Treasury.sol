pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/// @title Treasury
/// @author Michael Manzano
/// @notice This contract is for handling protocol level revenues
contract Treasury {
    address public protocolToken;
    address public factoryAddress; 

    mapping(address => uint) campaignSpendPending;
    mapping(address => uint) campaignSpendRemaining;
    mapping(address => uint) integratorRevenueUncollected;
    mapping(address => uint) integratorRevenueWithdrawn;
    mapping(address => uint) integratorSourceCount;
    mapping(address => mapping(uint => address)) integratorRevenueSources;
    mapping(address => mapping(address => uint)) integratorRevenueBySource;
    mapping(address => address) public integratorWithdrawAddresses;
    mapping(address => address) public campaignWithdrawAddresses;
    
    /// @notice Initializes the Treasury for the Billboard protocol
    /// @param tokenAddress The address of the protocol token.
    constructor(address tokenAddress) {
        protocolToken = tokenAddress;
        factoryAddress = msg.sender;
    }
    
    /// @notice Deposits a certain amount to the Treasury for a campaign.
    /// @param amount The amount to be deposited.
    /// @param initiator The address initiating the deposit.
    function depositSpend(uint amount, address initiator) public {
        campaignSpendRemaining[msg.sender] += amount;
        IERC20(protocolToken).transferFrom(initiator, address(this), amount);
    }
    
    /// @notice Registers a pending spend amount for a campaign.
    /// @dev A pending spend occurs when an ad is queued but has not been displayed yet
    /// @dev Pending spend is held in escrow. Neither the campaign nor the integrator can withdraw it
    /// @param amount The amount to be allocated as pending.
    /// @param campaign The address of the campaign.
    /// @return The new pending balance for the campaign.
    function newPendingSpend(uint amount, address campaign) external returns (uint) {
        require(msg.sender == factoryAddress, "This function can only be called by the campaign factory contract");
        return campaignSpendPending[campaign] += amount;
    }

    /// @notice Sets the withdrawal address for a campaign.
    /// @param campaignAddress The address of the campaign.
    /// @param withdrawAddress The address to receive withdrawals.
    function setCampaignWithdrawAddress(address campaignAddress, address withdrawAddress) external {
        require(msg.sender == factoryAddress, "This function can only be called by the factoryAddress");
        campaignWithdrawAddresses[campaignAddress] = withdrawAddress;
    }

    /// @notice Executes a campaign funding withdraw, transfering tokens to the assigned campaign withdraw address.
    /// @param amount The amount to withdraw.
    function campaignWithdraw(uint amount) external {
        require((campaignSpendRemaining[msg.sender] - campaignSpendPending[msg.sender]) >= amount, "Cannot withdraw more than remaining spend");
        campaignSpendRemaining[msg.sender] -= amount;
        IERC20(protocolToken).transfer(campaignWithdrawAddresses[msg.sender], amount);
    }

    /// @notice Sets the withdrawal address for an integrator.
    /// @param integratorAddress The address of the integrator.
    /// @param withdrawAddress The address to receive withdrawals.
    function setIntegratorWithdrawAddress(address integratorAddress, address withdrawAddress) external {
        require(msg.sender == factoryAddress, "This function can only be called by the factoryAddress");
        integratorWithdrawAddresses[integratorAddress] = withdrawAddress;
    }

    /// @notice Allows an integrator to withdraw funds.
    /// @param amount The amount to withdraw.
    function integratorWithdraw(uint amount) external {
        require(integratorRevenueUncollected[msg.sender] >= amount, "Cannot withdraw more than uncollected revenues allocated to integrator");
        integratorRevenueUncollected[msg.sender] -= amount;
        integratorRevenueWithdrawn[msg.sender] += amount;
        IERC20(protocolToken).transfer(integratorWithdrawAddresses[msg.sender], amount);
    }

    /// @notice Marks the completion of a spend for an integrator.
    /// @dev Reallocate pending funds held in escrow to available for withdraw by the integrator
    /// @param amount The completed spend amount.
    /// @param integrator The address of the integrator.
    /// @param campaign The address of the campaign.
    /// @return The new actual balance for the campaign.
    function spendCompleted(uint amount, address integrator, address campaign) external returns (uint) {
        require(msg.sender == factoryAddress, "This function can only be called by the campaign factory contract");
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

    /// @notice Retrieves the available ad spend for a campaign, not including pending spend.
    /// @return The available ad spend.
    function getAvailableAdSpend() external view returns (uint) {
        return (campaignSpendRemaining[msg.sender] - campaignSpendPending[msg.sender]);
    }

    /// @notice Retrieves the cumulative revenue for an integrator.
    /// @return The cumulative revenue.
    function cumulativeIntegratorRevenue() public view returns (uint) {
        return integratorRevenueUncollected[msg.sender] + integratorRevenueWithdrawn[msg.sender];
    }

    /// @notice Retrieves the uncollected revenue for an integrator.
    /// @return The uncollected revenue.
    function integratorRevenueUncollectedForUser() public view returns (uint) {
        return integratorRevenueUncollected[msg.sender];
    }
}

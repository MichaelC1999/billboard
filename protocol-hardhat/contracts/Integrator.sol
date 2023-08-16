pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./Factory.sol";
import "./Campaign.sol";
import "./Treasury.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

/// @title Integrator
/// @author Michael Manzano
/// @notice This contract is for handling ad revenues for platforms integrating the Billboard protocol to their interaction flow
contract Integrator {

    address factory;
    address protocolTokenAddress;
    address public protocol;
    string category;
    uint protocolAdPriceBucket;
    uint public servedAdCounter;

    bytes4[] public validFunctionSignatures;

    /// userToInteractionNonce holds the counter for number of times a user has interacted with the integrated protocol's campaign functions
    mapping(address => uint) userToInteractionNonce;
    mapping(address => address) private userToCurrentAdSelected; /// userToCurrentAdSelected holds the current campaign to be displayed to a given user for this nonce
    mapping(address => uint) userToCampaignCountAtSelection;
    mapping(address => uint) userToPendingAmount;
    mapping(bytes4 => bool) public validFunctions;

    /// @notice Initializes a new Integrator contract.
    /// @param integratingProtocol The address of the contract whose functions will be routed through the integrator.
    /// @param integratorCategory The category of the integrator.
    /// @param functionSignatures The function signatures on the contract that will be routed through the integrator
    /// @dev functionSignatures should not be in bytes format. Example of a correct function signature argument: "mintNFT(address)"
    constructor(address integratingProtocol, string memory integratorCategory, string[] memory functionSignatures) {
        category = integratorCategory;
        factory = msg.sender;
        Factory factoryInstance = Factory(factory);
        protocolTokenAddress = factoryInstance.protocolToken();
        protocol = integratingProtocol;
        for (uint i = 0; i < functionSignatures.length; i++) {
            bytes4 functionSelector = bytes4(keccak256(bytes(functionSignatures[i])));
            validFunctions[functionSelector] = true;
            validFunctionSignatures.push(functionSelector);
        }
    }

    /// @notice Retrieves the list of function signatures.
    /// @return An array of function signatures in the hashed bytes4 format
    function getFunctionSignatures() public view returns (bytes4[] memory) {
        uint functionCount = validFunctionSignatures.length;
        bytes4[] memory signatures = new bytes4[](functionCount);
        for(uint i = 0; i < functionCount; i++) {
            signatures[i] = validFunctionSignatures[i];
        }
        return signatures;
    }

    /// @notice Triggers an interaction on the integrated protocol.
    /// @param signature The signed message from the frontend, confirming that the user viewed this campaign content in the metamask snap
    /// @param functionSignature The hashed bytes4 signature of the function to be called.
    /// @param functionParams The parameter bytes to pass as call data to the function to be called.
    /// @dev There is no 'require(success == true)' after protocol.call() because even if external call is unsuccessful, we can confirm that the user was served the ad and can be registered as such 
    /// @return The result of the interaction.
    function routeInteraction(bytes memory signature, bytes4 functionSignature, bytes memory functionParams) external returns (bytes memory) {
        bool signatureValid = validateUserSignature(msg.sender, signature);
        require(signatureValid == true, "The signature passed into this interaction is invalid. The user must sign a message with the displayed ad campaign.");
        require(validFunctions[functionSignature] == true, "Function has not been included as a revenue generating function");
        Factory factoryInstance = Factory(factory);
        address completedCampaignAddress = userToCurrentAdSelected[msg.sender];
        if (completedCampaignAddress != address(0) && completedCampaignAddress != factoryInstance.fallbackAddress()) {
            Campaign(completedCampaignAddress).incCumulativeAdViews();
            factoryInstance.spendCompleted(completedCampaignAddress);
            servedAdCounter += 1;
        }
        address campaignQueuedAddress = setUserAdToDisplay(msg.sender);
        require(campaignQueuedAddress != address(0), "No Campaign selected");
        factoryInstance.newPendingSpend(campaignQueuedAddress);
        Campaign(campaignQueuedAddress).incCumulativeAdQueued();
        (bool success, bytes memory data) = protocol.call(abi.encodePacked(functionSignature, functionParams));
        return data;
    }

    /// @notice Displays the current ad for the caller.
    /// @return The address of the current ad campaign.
    function displayCurrentAd() public view returns (address) {
        if (userToCurrentAdSelected[msg.sender] == address(0)) {
            Factory factoryInstance = Factory(factory);
            return factoryInstance.fallbackAddress();
        }
        return userToCurrentAdSelected[msg.sender];
    }
    
    /// @notice Validates that a signature was made by a user and that it signed over the current campaign address assignd to that user.
    /// @notice This is for verifying that an ad was served in the snap
    /// @param sender The address of the sender.
    /// @param signature The signature to validate.
    /// @return A boolean indicating the validity of the signature.
    function validateUserSignature(address sender, bytes memory signature) public view returns (bool) {
        bytes memory combinedMessageNoHash = abi.encodePacked(userToCurrentAdSelected[msg.sender]);
        bytes32 message = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n", combinedMessageNoHash.length, combinedMessageNoHash));
        address signerAddress = ECDSA.recover(message, signature);
        ///IMPORTANT - Currently assumed that signature was made by msg.sender
        signerAddress = msg.sender;
        return (signerAddress == sender);
    }

    /// @notice Sets all of the state values when a new campaign is assigned to a user
    /// @param sender The address of the user.
    /// @return The address of the campaign to display, selected from calling getCampaignForUser on the factory contract.
    function setUserAdToDisplay(address sender) internal returns (address) {
        Factory factoryInstance = Factory(factory);
        (address newAdCampaign, uint campaignCount) = factoryInstance.getCampaignForUser(category, sender, userToInteractionNonce[sender], userToCampaignCountAtSelection[sender]);
        userToCampaignCountAtSelection[sender] = campaignCount;
        userToCurrentAdSelected[sender] = newAdCampaign;
        userToInteractionNonce[sender] += 1;
        require(newAdCampaign != address(0), "No Campaign selected for user");
        return newAdCampaign;
    }

    /// @notice Retrieves the cumulative ad revenue.
    /// @return The total cumulative ad revenue since integrator deployment.
    function cumulativeAdRevenue() public view returns (uint) {
        Factory factoryInstance = Factory(factory);
        Treasury treasury = Treasury(factoryInstance.treasuryAddress());
        return treasury.cumulativeIntegratorRevenue();
    }

    /// @notice Retrieves the available ad revenue that can be withdrawn.
    /// @return The available ad revenue.
    function currentAvailableAdRevenue() public view returns (uint) {
        Factory factoryInstance = Factory(factory);
        Treasury treasury = Treasury(factoryInstance.treasuryAddress());
        return treasury.integratorRevenueUncollectedForUser();
    }

    /// @notice Executes the withdrawal transfer of revenues from treasury to the integrator.
    /// @dev After UMA/Kleros implementation, this function can only be called after judgement is reached that the guidelines/rules have been followed
    /// @param amount The amount to withdraw.
    function integratorWithdraw(uint amount) public {
        Factory factoryInstance = Factory(factory);
        Treasury treasury = Treasury(factoryInstance.treasuryAddress());
        require (msg.sender == treasury.integratorWithdrawAddresses(address(this)), "Withdraw function can only be called by the approved integrator withdraw address");
        treasury.integratorWithdraw(amount);
    }

}

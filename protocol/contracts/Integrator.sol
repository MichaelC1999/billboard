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
    address withdrawTargetAddress;
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

    constructor(address integratingProtocol, address withdrawAddress, string memory integratorCategory, string[] memory functionSignatures) {
        factory = msg.sender;
        category = integratorCategory;
        withdrawTargetAddress = withdrawAddress;
        Factory factoryInstance = Factory(factory);
        protocolTokenAddress = factoryInstance.protocolToken();
        protocol = integratingProtocol;
        for (uint i = 0; i < functionSignatures.length; i++) {
            bytes4 functionSelector = bytes4(keccak256(bytes(functionSignatures[i])));
            validFunctions[functionSelector] = true;
            validFunctionSignatures.push(functionSelector);
        }
    }

    function getFunctionSignatures() public view returns (bytes4[] memory) {
        uint functionCount = validFunctionSignatures.length;
        bytes4[] memory signatures = new bytes4[](functionCount);
        for(uint i = 0; i < functionCount; i++) {
            signatures[i] = validFunctionSignatures[i];
        }
        return signatures;
    }

    /// signature is a signed message from the frontend that confirms the current ad campaign was read from the front end
    /// functionSignature is the function to be called on ExampleIntegrator
    /// functionParams holds the params to be called on the ExampleIntegrator
    function interactionTriggered(bytes memory signature, bytes4 functionSignature, bytes memory functionParams) external returns (bytes memory) {
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

    ///Called by snap before making signature to get the current ad to display
    function displayCurrentAd() public view returns (address) {
        /// check if userToCurrentAdSelected[msg.sender] instantiates as a campaign contract
        if (userToCurrentAdSelected[msg.sender] == address(0)) {
            Factory factoryInstance = Factory(factory);
            return factoryInstance.fallbackAddress();
        }
        return userToCurrentAdSelected[msg.sender];
    }
    
    ///Called to make sure the campaign ad was signed over by user in frontend
    function validateUserSignature(address sender, bytes memory signature) public view returns (bool) {
        ///Signature gets passed in
        ///Decoder gets the address who signed

        bytes memory combinedMessageNoHash = abi.encodePacked(address(this), userToCurrentAdSelected[msg.sender]);
        bytes32 message = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n", combinedMessageNoHash.length, combinedMessageNoHash));
        address signerAddress = ECDSA.recover(message, signature);
        ///IMPORTANT - was having issues with ecrecover getting the correct signer address. Currently assumed that signature was made by msg.sender
        signerAddress = msg.sender;

        ///When called externally, it doesnt matter if someone calls it with some random signature or sender addr
        ///When called internally, the sender address will always be enforced as msg.sender

        return (signerAddress == sender);
    }

    /// Should only be called from function that records an interaction has been made on the integrator protocol
    function setUserAdToDisplay(address sender) internal returns (address) {
        Factory factory = Factory(factory);
        (address newAdCampaign, uint campaignCount) = factory.getCampaignForUser(category, sender, userToInteractionNonce[sender], userToCampaignCountAtSelection[sender]);
        userToCampaignCountAtSelection[sender] = campaignCount;
        userToCurrentAdSelected[sender] = newAdCampaign;
        userToInteractionNonce[sender] += 1;
        require(newAdCampaign != address(0), "No Campaign selected for user");
        return newAdCampaign;
    }

    function cumulativeAdRevenue() public view returns (uint) {
        Factory factory = Factory(factory);
        Treasury treasury = Treasury(factory.treasuryAddress());
        return treasury.cumulativeIntegratorRevenue();
    }

    function currentAvailableAdRevenue() public view returns (uint) {
        Factory factory = Factory(factory);
        Treasury treasury = Treasury(factory.treasuryAddress());
        return treasury.integratorRevenueUncollectedForUser();
    }

    function initiateWithdrawProfit() public {
        /// check assertion on UMA/Kleros that integrator protocol transactions that constituted the profit are not fraudelent
    }

    function integratorWithdraw(uint amount) public {
        ///After UMA/Kleros implementation, this function can only be called after judgement is reached that the guidelines/rules have been followed
        Factory factory = Factory(factory);
        Treasury treasury = Treasury(factory.treasuryAddress());
        treasury.integratorWithdraw(amount, withdrawTargetAddress);
    }

}
